import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { user, userConfig } from '../db/schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(dto: CreateUserDto) {
    const existing = await this.db
      .select({ idUser: user.idUser })
      .from(user)
      .where(eq(user.email, dto.email));

    if (existing.length > 0) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, SALT_ROUNDS);

    // UserConfig nasce junto, na mesma transação — é 1:1 com User (mesma
    // PK), não faz sentido um User existir sem config. Se o insert do
    // UserConfig falhasse sozinho (fora de transação), você teria um
    // usuário "incompleto" que quebraria o primeiro GET /user-config.
    const insertId = await this.db.transaction(async (tx) => {
      const result = await tx.insert(user).values({
        name: dto.name,
        email: dto.email,
        senha: senhaHash,
        status: dto.status,
        dateCreate: new Date(),
      });

      const newUserId = result[0].insertId;

      await tx.insert(userConfig).values({
        userIdUser: newUserId,
        notify: 1, // notificações ligadas por padrão
        theme: 0, // 0 = tema claro
        privacity: 0, // 0 = perfil não-restrito por padrão
        updateDate: new Date(),
      });

      return newUserId;
    });

    return this.findOne(insertId);
  }

  findAll() {
    // nunca devolve a coluna senha, nem em hash, pra fora da API
    return this.db
      .select({
        idUser: user.idUser,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
        dateCreate: user.dateCreate,
      })
      .from(user);
  }

  async findOne(idUser: number) {
    const [found] = await this.db
      .select({
        idUser: user.idUser,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
        dateCreate: user.dateCreate,
      })
      .from(user)
      .where(eq(user.idUser, idUser));

    if (!found) {
      throw new NotFoundException(`Usuário ${idUser} não encontrado`);
    }
    return found;
  }

  // Uso exclusivo do AuthService pra validar login — por isso é o único
  // método da classe que devolve a coluna senha (hash). Nunca chamar isso
  // a partir de um controller.
  async findByEmailForAuth(email: string) {
    const [found] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email));
    return found ?? null;
  }

  async update(idUser: number, dto: UpdateUserDto) {
    await this.findOne(idUser); // garante 404 se não existir

    await this.db.update(user).set(dto).where(eq(user.idUser, idUser));

    return this.findOne(idUser);
  }

  async remove(idUser: number) {
    await this.findOne(idUser);

    // UserConfig aponta pro User (FK), então precisa sair primeiro — sem
    // isso nem uma conta recém-criada, sem nenhum outro dado, conseguiria
    // ser excluída. A transação garante que, se o delete do User falhar,
    // o do UserConfig é desfeito junto.
    try {
      await this.db.transaction(async (tx) => {
        await tx.delete(userConfig).where(eq(userConfig.userIdUser, idUser));
        await tx.delete(user).where(eq(user.idUser, idUser));
      });
    } catch (error) {
      const code = (error as { cause?: { code?: string } })?.cause?.code;
      if (code === 'ER_ROW_IS_REFERENCED_2') {
        // Conta com crianças, comentários, documentos etc. vinculados.
        throw new ConflictException(
          'Não é possível excluir: a conta possui dados vinculados (crianças, comentários, documentos...)',
        );
      }
      throw error;
    }
    return { deleted: true };
  }
}
