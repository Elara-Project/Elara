import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { and, eq } from 'drizzle-orm';
import { user, userConfig, diagnoses, forum } from './schema';

// Seed de DEMONSTRAÇÃO — separado do seed.ts de propósito:
//  - seed.ts  = catálogos (seguro em qualquer ambiente)
//  - este     = cria um admin com senha CONHECIDA + sub-fóruns de exemplo
//               (só faz sentido em dev/demo; nunca em produção com a senha padrão)
//
// Pré-requisito: rodar antes `npx tsx src/db/seed.ts` (precisa dos diagnósticos).
// Rodar com:     npx tsx src/db/seed-demo.ts
//
// Idempotente: pode rodar várias vezes sem duplicar nada.

const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Administrador';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@tea.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin12345';

// Sub-fóruns por diagnóstico. O nome do diagnóstico precisa bater EXATAMENTE
// com o que o seed.ts cadastrou. Limites do schema: title ≤ 45, descript ≤ 200.
const FORUMS: { diagnosis: string; title: string; descript: string }[] = [
  ...[
    'TEA - Nível de suporte 1',
    'TEA - Nível de suporte 2',
    'TEA - Nível de suporte 3',
  ].flatMap((diagnosis) => [
    {
      diagnosis,
      title: 'Dúvidas e apoio geral',
      descript: 'Espaço para tirar dúvidas e trocar experiências com outros responsáveis.',
    },
    {
      diagnosis,
      title: 'Escola e inclusão',
      descript: 'Conversas sobre adaptação escolar, professores e direitos na educação.',
    },
    {
      diagnosis,
      title: 'Terapias e rotina',
      descript: 'Dicas sobre organização da rotina e experiências com terapias.',
    },
  ]),
  ...['TDAH', 'Síndrome de Down'].flatMap((diagnosis) => [
    {
      diagnosis,
      title: 'Dúvidas e apoio geral',
      descript: 'Espaço para tirar dúvidas e trocar experiências com outros responsáveis.',
    },
    {
      diagnosis,
      title: 'Escola e inclusão',
      descript: 'Conversas sobre adaptação escolar, professores e direitos na educação.',
    },
  ]),
];

async function seedDemo() {
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error(
      'Em produção defina SEED_ADMIN_PASSWORD; a senha padrão de demonstração é pública.',
    );
  }

  const pool = mysql.createPool({ uri: process.env.DATABASE_URL });
  const db = drizzle(pool, { mode: 'default' });

  try {
    // ---------- Admin ----------
    const [existing] = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL));

    if (!existing) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const now = new Date();
      // Transação: User + UserConfig juntos, igual ao cadastro normal.
      await db.transaction(async (tx) => {
        const [result] = await tx.insert(user).values({
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          senha: hash,
          status: 1,
          role: 'admin',
          dateCreate: now,
        });
        await tx.insert(userConfig).values({
          userIdUser: result.insertId,
          notify: 1,
          theme: 0,
          privacity: 0,
          updateDate: now,
        });
      });
      console.log(`✓ Admin criado: ${ADMIN_EMAIL}`);
    } else if (existing.role !== 'admin') {
      await db.update(user).set({ role: 'admin' }).where(eq(user.idUser, existing.idUser));
      console.log(`✓ ${ADMIN_EMAIL} já existia e foi promovido a admin (senha não alterada)`);
    } else {
      console.log(`- Admin ${ADMIN_EMAIL} já existe, pulei`);
    }

    // ---------- Sub-fóruns ----------
    let criados = 0;
    for (const f of FORUMS) {
      const [diag] = await db
        .select()
        .from(diagnoses)
        .where(eq(diagnoses.nameDiagnosis, f.diagnosis));
      if (!diag) {
        throw new Error(
          `Diagnóstico "${f.diagnosis}" não encontrado. Rode antes: npx tsx src/db/seed.ts`,
        );
      }

      const [jaExiste] = await db
        .select()
        .from(forum)
        .where(and(eq(forum.diagnosesIdDiagnoses, diag.idDiagnoses), eq(forum.title, f.title)));
      if (jaExiste) continue;

      await db.insert(forum).values({
        title: f.title,
        diagnosesIdDiagnoses: diag.idDiagnoses,
        descript: f.descript,
        createDate: new Date(),
      });
      criados++;
    }
    console.log(`✓ Fóruns: ${criados} criados, ${FORUMS.length - criados} já existiam`);
  } finally {
    await pool.end();
  }

  console.log('Seed de demonstração finalizado.');
}

seedDemo().catch((error) => {
  console.error('Erro ao rodar o seed de demonstração:', error);
  process.exit(1);
});
