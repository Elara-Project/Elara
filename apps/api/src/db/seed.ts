import 'dotenv/config';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { relationship, diagnoses, therapy, allergies, library, medications } from './schema';

// Script standalone — roda FORA do NestJS (sem Nest.create, sem DI), só
// abre uma conexão direta e insere. Rode com: npx tsx src/db/seed.ts
//
// Idempotente: cada tabela só recebe os dados de exemplo se estiver
// VAZIA — rodar de novo não duplica linhas.
async function seed() {
  const pool = mysql.createPool({ uri: process.env.DATABASE_URL });
  const db = drizzle(pool, { mode: 'default' });

  // ---------- Relationship ----------
  const existingRelationships = await db.select().from(relationship);
  if (existingRelationships.length === 0) {
    await db.insert(relationship).values([
      { relationship: 'Mãe' },
      { relationship: 'Pai' },
      { relationship: 'Avó' },
      { relationship: 'Avô' },
      { relationship: 'Tio/Tia' },
      { relationship: 'Responsável legal' },
    ]);
    console.log('✓ Relationship semeada (6 linhas)');
  } else {
    console.log('- Relationship já tinha dados, pulei');
  }

  // ---------- Diagnoses ----------
  // qtt não entra mais aqui — é contador de uso mantido pelo backend
  // (ChildrenService incrementa via Diagnoses), o banco já aplica
  // default(0) sozinho. stage ainda é placeholder (1/2/3 = nível de
  // suporte), ajuste se tiver escala diferente em mente.
  const existingDiagnoses = await db.select().from(diagnoses);
  if (existingDiagnoses.length === 0) {
    await db.insert(diagnoses).values([
      { nameDiagnosis: 'TEA - Nível de suporte 1', stage: 1 },
      { nameDiagnosis: 'TEA - Nível de suporte 2', stage: 2 },
      { nameDiagnosis: 'TEA - Nível de suporte 3', stage: 3 },
      { nameDiagnosis: 'TDAH', stage: 1 },
      { nameDiagnosis: 'Síndrome de Down', stage: 1 },
    ]);
    console.log('✓ Diagnoses semeada (5 linhas)');
  } else {
    console.log('- Diagnoses já tinha dados, pulei');
  }

  // ---------- Therapy ----------
  // type: ainda placeholder genérico ('individual') — qtt não entra
  // mais aqui, é mantido pelo backend (ClinicalDataService).
  const existingTherapies = await db.select().from(therapy);
  if (existingTherapies.length === 0) {
    await db.insert(therapy).values([
      { nameTherapy: 'Terapia Ocupacional', type: 'individual' },
      { nameTherapy: 'Fonoaudiologia', type: 'individual' },
      { nameTherapy: 'Psicologia', type: 'individual' },
      { nameTherapy: 'Fisioterapia', type: 'individual' },
      { nameTherapy: 'Psicopedagogia', type: 'individual' },
    ]);
    console.log('✓ Therapy semeada (5 linhas)');
  } else {
    console.log('- Therapy já tinha dados, pulei');
  }

  // ---------- Allergies ----------
  // severity: escala não definida ainda — usei 1 (baixa) a 3 (alta) como
  // placeholder de 3 níveis, ajuste se tiver escala diferente em mente.
  const existingAllergies = await db.select().from(allergies);
  if (existingAllergies.length === 0) {
    await db.insert(allergies).values([
      { allergenName: 'Lactose', severity: 1 },
      { allergenName: 'Glúten', severity: 1 },
      { allergenName: 'Amendoim', severity: 3 },
      { allergenName: 'Poeira', severity: 2 },
    ]);
    console.log('✓ Allergies semeada (4 linhas)');
  } else {
    console.log('- Allergies já tinha dados, pulei');
  }

  // ---------- Library ----------
  const existingLibrary = await db.select().from(library);
  if (existingLibrary.length === 0) {
    await db.insert(library).values([
      { name: 'Receitas', descript: 'Receitas médicas e prescrições', icon: 'pill' },
      { name: 'Laudos', descript: 'Laudos médicos e psicológicos', icon: 'file-text' },
      { name: 'Exames', descript: 'Resultados de exames', icon: 'flask' },
      { name: 'Fotos', descript: 'Fotos e registros visuais', icon: 'image' },
      { name: 'Documentos Gerais', descript: 'Outros documentos relevantes', icon: 'folder' },
    ]);
    console.log('✓ Library semeada (5 linhas)');
  } else {
    console.log('- Library já tinha dados, pulei');
  }

  // ---------- CurrentMedications ----------
  const existingMedications = await db.select().from(medications);
  if (existingMedications.length === 0) {
    await db.insert(medications).values([
      { medicineName: 'Risperidona', route: 'oral', instructions: 'Tomar conforme orientação médica' },
      { medicineName: 'Melatonina', route: 'oral', instructions: 'Tomar 30 min antes de dormir' },
      { medicineName: 'Metilfenidato', route: 'oral', instructions: 'Tomar pela manhã, com alimento' },
    ]);
    console.log('✓ CurrentMedications semeada (3 linhas)');
  } else {
    console.log('- CurrentMedications já tinha dados, pulei');
  }

  await pool.end();
  console.log('Seed finalizado.');
}

seed().catch((error) => {
  console.error('Erro ao rodar o seed:', error);
  process.exit(1);
});
