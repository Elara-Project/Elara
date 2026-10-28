import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { clinicalData, children } from '../db/schema';
import { ChildrenService } from '../children/children.service';
import { TherapyService } from '../therapy/therapy.service';
import { AllergiesService } from '../allergies/allergies.service';
import { CreateClinicalDataDto } from './dto/create-clinical-data.dto';
import { UpdateClinicalDataDto } from './dto/update-clinical-data.dto';

@Injectable()
export class ClinicalDataService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly childrenService: ChildrenService,
    private readonly therapyService: TherapyService,
    private readonly allergiesService: AllergiesService,
  ) {}

  // ClinicalData nunca existe "solto" — nasce já vinculado a uma Children.
  // childrenService.findOne() já lança 404 se a criança não existir ou não
  // pertencer ao usuário logado, então a checagem de ownership acontece ali.
  async createForChild(userIdUser: number, idChildren: number, dto: CreateClinicalDataDto) {
    const child = await this.childrenService.findOne(userIdUser, idChildren);

    if (child.clinicalDataIdClinicalData) {
      throw new ConflictException('Essa criança já tem um prontuário clínico');
    }

    const idClinicalData = await this.db.transaction(async (tx) => {
      const result = await tx.insert(clinicalData).values({
        familyHistory: dto.familyHistory,
        observations: dto.observations,
        lastUpdate: new Date(),
        therapyIdTherapy: dto.therapyIdTherapy,
        allergiesIdAllergies: dto.allergiesIdAllergies,
      });

      const newIdClinicalData = result[0].insertId;

      await tx
        .update(children)
        .set({ clinicalDataIdClinicalData: newIdClinicalData })
        .where(eq(children.idChildren, idChildren));

      // Mesma lógica de contador de uso que já aplicamos em ChildrenService
      // pra Relationship/Diagnoses — aqui é Therapy/Allergies, e ambos são
      // opcionais (prontuário pode nascer sem terapia/alergia definida).
      if (dto.therapyIdTherapy) {
        await this.therapyService.incrementUsage(dto.therapyIdTherapy, tx);
      }
      if (dto.allergiesIdAllergies) {
        await this.allergiesService.incrementUsage(dto.allergiesIdAllergies, tx);
      }

      return newIdClinicalData;
    });

    return this.findOne(idClinicalData);
  }

  async findOne(idClinicalData: number) {
    const [found] = await this.db
      .select()
      .from(clinicalData)
      .where(eq(clinicalData.idClinicalData, idClinicalData));
    if (!found) {
      throw new NotFoundException(`ClinicalData ${idClinicalData} não encontrado`);
    }
    return found;
  }

  // Não existe FK ClinicalData -> User, então "esse prontuário é seu?" só
  // dá pra responder passando pela Children primeiro.
  async findOneForChild(userIdUser: number, idChildren: number) {
    const child = await this.childrenService.findOne(userIdUser, idChildren);
    if (!child.clinicalDataIdClinicalData) {
      throw new NotFoundException('Essa criança ainda não tem prontuário clínico');
    }
    return this.findOne(child.clinicalDataIdClinicalData);
  }

  async updateForChild(userIdUser: number, idChildren: number, dto: UpdateClinicalDataDto) {
    const current = await this.findOneForChild(userIdUser, idChildren); // valida ownership em cascata

    await this.db.transaction(async (tx) => {
      await tx
        .update(clinicalData)
        .set({ ...dto, lastUpdate: new Date() })
        .where(eq(clinicalData.idClinicalData, current.idClinicalData));

      if (dto.therapyIdTherapy && dto.therapyIdTherapy !== current.therapyIdTherapy) {
        if (current.therapyIdTherapy) {
          await this.therapyService.decrementUsage(current.therapyIdTherapy, tx);
        }
        await this.therapyService.incrementUsage(dto.therapyIdTherapy, tx);
      }

      if (dto.allergiesIdAllergies && dto.allergiesIdAllergies !== current.allergiesIdAllergies) {
        if (current.allergiesIdAllergies) {
          await this.allergiesService.decrementUsage(current.allergiesIdAllergies, tx);
        }
        await this.allergiesService.incrementUsage(dto.allergiesIdAllergies, tx);
      }
    });

    return this.findOne(current.idClinicalData);
  }
}
