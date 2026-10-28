import {
  mysqlTable,
  int,
  varchar,
  text,
  datetime,
  tinyint,
  mysqlEnum,
  primaryKey,
  unique,
  foreignKey,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Vocabulário de status compartilhado entre Appointments e Calendar —
// Calendar representa consultas, terapias e eventos médicos em geral,
// então reaproveita o mesmo domínio de status.
export const rightsAndBenefitsCategoryValues = [
  'saude',
  'educacao',
  'financeiro',
  'tributario',
  'transporte',
  'trabalho',
  'lazer_acessibilidade',
] as const;

export const rightsAndBenefitsTypeValues = [
  'bpc_loas',
  'isencao_fiscal',
  'passe_livre',
  'aee',
  'prioridade_atendimento',
  'cotas_trabalhistas',
  'carteira_estacionamento',
  'outro',
] as const;

export const appointmentStatusValues = [
  'agendado',
  'confirmado',
  'concluido',
  'cancelado',
  'remarcado',
] as const;

// ==========================================
// USER
// ==========================================
export const user = mysqlTable('User', {
  idUser: int('idUser').autoincrement().primaryKey(),
  name: varchar('Name', { length: 200 }).notNull(),
  email: varchar('Email', { length: 200 }).notNull().unique(),
  senha: varchar('Senha', { length: 255 }).notNull(), // hash (bcrypt/argon2), não a senha em texto puro
  status: tinyint('Status').notNull(),
  role: mysqlEnum('role', ['user', 'admin']).notNull().default('user'), // admin = moderador, mesmo nível
  dateCreate: datetime('DateCreate').notNull(),
});

// ==========================================
// USER CONFIG (1:1 com User)
// ==========================================
export const userConfig = mysqlTable('UserConfig', {
  userIdUser: int('User_idUser')
    .primaryKey()
    .references(() => user.idUser),
  notify: tinyint('notify').notNull(),
  theme: tinyint('theme').notNull(),
  privacity: tinyint('privacity').notNull(),
  updateDate: datetime('updateDate').notNull(),
});

// ==========================================
// RIGHTS AND BENEFITS
// Direitos que o usuário (responsável) pode ter por conta da criança.
// Assumindo vínculo com User — avisa se precisar trocar para Children.
// ==========================================
export const rightsAndBenefits = mysqlTable('RightsAndBenefits', {
  idRightsAndBenefits: int('idRightsAndBenefits').autoincrement().primaryKey(),
  userIdUser: int('User_idUser')
    .notNull()
    .references(() => user.idUser),
  title: varchar('title', { length: 45 }).notNull(),
  category: mysqlEnum('category', rightsAndBenefitsCategoryValues).notNull(),
  type: mysqlEnum('type', rightsAndBenefitsTypeValues).notNull(),
  descript: varchar('descript', { length: 200 }).notNull(),
  status: tinyint('status').notNull(),
});

// ==========================================
// RELATIONSHIP (grau de parentesco)
// ==========================================
export const relationship = mysqlTable('Relationship', {
  idRelationship: int('idRelationship').autoincrement().primaryKey(),
  relationship: varchar('Relationship', { length: 45 }).notNull(),
  qtt: int('Qtt').notNull().default(0), // contador de uso — nunca vem do client, só o backend incrementa/decrementa
});

// ==========================================
// DIAGNOSES
// ==========================================
export const diagnoses = mysqlTable('Diagnoses', {
  idDiagnoses: int('idDiagnoses').autoincrement().primaryKey(),
  nameDiagnosis: varchar('NameDiagnosis', { length: 150 }).notNull(),
  stage: int('Stage').notNull(),
  qtt: int('Qtt').notNull().default(0), // contador de uso
});

// ==========================================
// THERAPY
// ==========================================
export const therapy = mysqlTable('Therapy', {
  idTherapy: int('idTherapy').autoincrement().primaryKey(),
  nameTherapy: varchar('nameTherapy', { length: 100 }).notNull(), // TODO confirmar tamanho
  type: varchar('type', { length: 45 }).notNull(),
  qtt: int('Qtt').notNull().default(0), // contador de uso
});

// ==========================================
// ALLERGIES
// ==========================================
export const allergies = mysqlTable('Allergies', {
  idAllergies: int('idAllergies').autoincrement().primaryKey(),
  allergenName: varchar('allergenName', { length: 150 }).notNull(), // TODO confirmar tamanho
  severity: int('severity').notNull(),
  qtt: int('Qtt').notNull().default(0), // contador de uso
});

// ==========================================
// CLINICAL DATA
// ClinicalData -> Therapy e ClinicalData -> Allergies: linhas tracejadas no
// diagrama (relacionamento não-identificador) — FK comum, cada tabela mantém
// PK própria. Já modelado corretamente abaixo.
// ==========================================
export const clinicalData = mysqlTable('ClinicalData', {
  idClinicalData: int('idClinicalData').autoincrement().primaryKey(),
  familyHistory: varchar('FamilyHistory', { length: 100 }).notNull(), // TODO confirmar tamanho
  observations: varchar('observations', { length: 300 }).notNull(),
  lastUpdate: datetime('lastUpdate').notNull(),
  therapyIdTherapy: int('Therapy_idTherapy').references(() => therapy.idTherapy),
  allergiesIdAllergies: int('Allergies_idAllergies').references(
    () => allergies.idAllergies,
  ),
});

// ==========================================
// CHILDREN
// ==========================================
export const children = mysqlTable('Children', {
  idChildren: int('idChildren').autoincrement().primaryKey(),
  name: varchar('Name', { length: 200 }).notNull(),
  dob: datetime('Dob').notNull(),
  dateCreate: datetime('DateCreate').notNull(),
  relationshipIdRelationship: int('Relationship_idRelationship').notNull(),
  userIdUser: int('User_idUser')
    .notNull()
    .references(() => user.idUser),
  diagnosesIdDiagnoses: int('Diagnoses_idDiagnoses').references(
    () => diagnoses.idDiagnoses,
  ),
  clinicalDataIdClinicalData: int('ClinicalData_idClinicalData'),
}, (table) => ({
  // Nomes manuais: o nome automático do Drizzle passa de 64 caracteres
  // (limite de identificador do MySQL) e a migration quebra.
  fkRelationship: foreignKey({
    name: 'fk_children_relationship',
    columns: [table.relationshipIdRelationship],
    foreignColumns: [relationship.idRelationship],
  }),
  fkClinicalData: foreignKey({
    name: 'fk_children_clinicaldata',
    columns: [table.clinicalDataIdClinicalData],
    foreignColumns: [clinicalData.idClinicalData],
  }),
}));

// ==========================================
// CURRENT MEDICATIONS
// ==========================================
export const medications = mysqlTable('CurrentMedications', {
  idCurrentMedications: int('idCurrentMedications').autoincrement().primaryKey(),
  medicineName: varchar('medicineName', { length: 100 }).notNull(), // TODO confirmar tamanho
  route: varchar('route', { length: 45 }).notNull(),
  instructions: varchar('instructions', { length: 300 }).notNull(),
  qtt: int('qtt').notNull().default(0), // contador de uso (CurrentMedications ainda sem module — fica pronto pra quando construirmos)
});

// ==========================================
// PRESCRIPTIONS
// Histórico de medicamentos prescritos — uma criança (via ClinicalData) pode
// tomar vários medicamentos ao longo do tempo. Relacionamento identificador
// (linha contínua): a PK é composta pelas duas FKs, sem idPrescriptions próprio.
// ==========================================
export const prescriptions = mysqlTable(
  'Prescriptions',
  {
    clinicalDataIdClinicalData: int('ClinicalData_idClinicalData').notNull(),
    medicationsIdCurrentMedications: int('Medications_idCurrentMedications').notNull(),
    frequency: varchar('frequency', { length: 45 }).notNull(),
    status: tinyint('Status').notNull(),
    startDate: datetime('startDate').notNull(),
    endDate: datetime('endDate').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: 'pk_prescriptions',
      columns: [table.clinicalDataIdClinicalData, table.medicationsIdCurrentMedications],
    }),
    // Nomes manuais pelo mesmo motivo de Children (limite de 64 caracteres).
    fkClinicalData: foreignKey({
      name: 'fk_prescriptions_clinicaldata',
      columns: [table.clinicalDataIdClinicalData],
      foreignColumns: [clinicalData.idClinicalData],
    }),
    fkMedications: foreignKey({
      name: 'fk_prescriptions_medications',
      columns: [table.medicationsIdCurrentMedications],
      foreignColumns: [medications.idCurrentMedications],
    }),
  }),
);

// ==========================================
// APPOINTMENTS
// ==========================================
export const appointments = mysqlTable('Appointments', {
  idAppointments: int('idAppointments').autoincrement().primaryKey(),
  appointmentDateTime: datetime('appointmentDateTime').notNull(),
  status: mysqlEnum('status', appointmentStatusValues).notNull(),
  reason: varchar('reason', { length: 50 }).notNull(),
  local: varchar('local', { length: 200 }).notNull(),
  notes: varchar('notes', { length: 100 }).notNull(),
  clinicalDataIdClinicalData: int('ClinicalData_idClinicalData').notNull(),
}, (table) => ({
  fkClinicalData: foreignKey({
    name: 'fk_appointments_clinicaldata',
    columns: [table.clinicalDataIdClinicalData],
    foreignColumns: [clinicalData.idClinicalData],
  }),
}));

// ==========================================
// CALENDAR
// ==========================================
export const calendar = mysqlTable('Calendar', {
  idCalendar: int('idCalendar').autoincrement().primaryKey(),
  appointmentsIdAppointments: int('Appointments_idAppointments').notNull(),
  date: datetime('date').notNull(),
  status: mysqlEnum('status', appointmentStatusValues).notNull(),
  descript: varchar('descript', { length: 45 }).notNull(),
}, (table) => ({
  fkAppointments: foreignKey({
    name: 'fk_calendar_appointments',
    columns: [table.appointmentsIdAppointments],
    foreignColumns: [appointments.idAppointments],
  }),
}));

// ==========================================
// NOTIFY
// ==========================================
export const notify = mysqlTable('Notify', {
  idNotify: int('idNotify').autoincrement().primaryKey(),
  calendarIdCalendar: int('Calendar_idCalendar')
    .notNull()
    .references(() => calendar.idCalendar),
  notifyDate: datetime('notifyDate').notNull(),
  sent: tinyint('sent').notNull(),
  descript: varchar('descript', { length: 45 }).notNull(),
});

// ==========================================
// FORUM
// Fórum organizado por diagnóstico — o post entra no fórum certo de acordo
// com o diagnóstico da criança, não por criança individual.
// ==========================================
export const forum = mysqlTable('Forum', {
  idForum: int('idForum').autoincrement().primaryKey(),
  title: varchar('title', { length: 45 }).notNull(),
  diagnosesIdDiagnoses: int('Diagnoses_idDiagnoses')
    .notNull()
    .references(() => diagnoses.idDiagnoses),
  descript: varchar('descript', { length: 200 }).notNull(),
  createDate: datetime('createDate').notNull(),
});

// ==========================================
// COMMENTS
// ==========================================
export const comments = mysqlTable('Comments', {
  idComments: int('idComments').autoincrement().primaryKey(),
  content: text('content').notNull(),
  status: mysqlEnum('status', ['visivel', 'oculto', 'denunciado', 'removido']).notNull(),
  createAt: datetime('createAt').notNull(),
  updateAt: datetime('updateAt').notNull(),
  forumIdForum: int('Forum_idForum')
    .notNull()
    .references(() => forum.idForum),
  userIdUser: int('User_idUser')
    .notNull()
    .references(() => user.idUser),
  // Marca d'água da edição de admin — só guarda a ÚLTIMA edição (versão
  // "simples" combinada), não um histórico completo. Ficam null enquanto
  // ninguém com papel admin tiver editado o comentário.
  editedByAdminId: int('editedByAdminId').references(() => user.idUser),
  previousContent: text('previousContent'),
  editedAt: datetime('editedAt'),
});

// ==========================================
// LIKES
// ==========================================
// Coluna de Forum removida: era redundante (dá pra chegar no forum via
// comments.forumIdForum). O userIdUser aqui NÃO é redundante — ele identifica
// quem deu o like, que é uma pessoa diferente de quem escreveu o comentário
// (comments.userIdUser). Unique impede curtir o mesmo comentário 2x.
export const likes = mysqlTable(
  'Likes',
  {
    idLikes: int('idLikes').autoincrement().primaryKey(),
    commentsIdComments: int('Comments_idComments')
      .notNull()
      .references(() => comments.idComments),
    userIdUser: int('User_idUser')
      .notNull()
      .references(() => user.idUser),
    date: datetime('date').notNull(),
  },
  (table) => ({
    uniqueLike: unique().on(table.commentsIdComments, table.userIdUser),
  }),
);

// ==========================================
// LIBRARY
// ==========================================
export const library = mysqlTable('library', {
  idlibrary: int('idlibrary').autoincrement().primaryKey(),
  name: varchar('name', { length: 45 }).notNull(),
  descript: varchar('descript', { length: 300 }).notNull(),
  icon: varchar('icon', { length: 300 }).notNull(),
});

// ==========================================
// MEDIA
// ==========================================
export const media = mysqlTable('media', {
  idmedia: int('idmedia').autoincrement().primaryKey(),
  userIdUser: int('User_idUser')
    .notNull()
    .references(() => user.idUser),
  libraryIdlibrary: int('library_idlibrary')
    .notNull()
    .references(() => library.idlibrary),
  childrenIdChildren: int('Children_idChildren')
    .notNull()
    .references(() => children.idChildren),
  title: varchar('title', { length: 50 }).notNull(),
  descript: varchar('descript', { length: 300 }).notNull(),
  imageUrl: varchar('imageUrl', { length: 500 }).notNull(),
  date: datetime('date').notNull(),
  status: tinyint('status').notNull(),
});

// ==========================================
// AI ASSISTANT (CHAT)
// ==========================================
export const aiAssistant = mysqlTable('aIAssistent', {
  idChat: int('idChat').autoincrement().primaryKey(),
  userIdUser: int('User_idUser')
    .notNull()
    .references(() => user.idUser),
  questions: text('questions').notNull(),
  answer: text('answer').notNull(),
  dateTime: datetime('dateTime').notNull(),
});

// ==========================================
// RELATIONS (para queries com joins tipados)
// ==========================================
export const userRelations = relations(user, ({ one, many }) => ({
  config: one(userConfig, {
    fields: [user.idUser],
    references: [userConfig.userIdUser],
  }),
  children: many(children),
  comments: many(comments),
  media: many(media),
  aiChats: many(aiAssistant),
  rightsAndBenefits: many(rightsAndBenefits),
}));

export const rightsAndBenefitsRelations = relations(rightsAndBenefits, ({ one }) => ({
  user: one(user, {
    fields: [rightsAndBenefits.userIdUser],
    references: [user.idUser],
  }),
}));

export const childrenRelations = relations(children, ({ one }) => ({
  user: one(user, {
    fields: [children.userIdUser],
    references: [user.idUser],
  }),
  relationship: one(relationship, {
    fields: [children.relationshipIdRelationship],
    references: [relationship.idRelationship],
  }),
  diagnosis: one(diagnoses, {
    fields: [children.diagnosesIdDiagnoses],
    references: [diagnoses.idDiagnoses],
  }),
  clinicalData: one(clinicalData, {
    fields: [children.clinicalDataIdClinicalData],
    references: [clinicalData.idClinicalData],
  }),
}));

export const diagnosesRelations = relations(diagnoses, ({ many }) => ({
  children: many(children),
  forums: many(forum),
}));

export const clinicalDataRelations = relations(clinicalData, ({ one, many }) => ({
  therapy: one(therapy, {
    fields: [clinicalData.therapyIdTherapy],
    references: [therapy.idTherapy],
  }),
  allergy: one(allergies, {
    fields: [clinicalData.allergiesIdAllergies],
    references: [allergies.idAllergies],
  }),
  prescriptions: many(prescriptions),
  appointments: many(appointments),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  clinicalData: one(clinicalData, {
    fields: [prescriptions.clinicalDataIdClinicalData],
    references: [clinicalData.idClinicalData],
  }),
  medication: one(medications, {
    fields: [prescriptions.medicationsIdCurrentMedications],
    references: [medications.idCurrentMedications],
  }),
}));

export const forumRelations = relations(forum, ({ one, many }) => ({
  diagnosis: one(diagnoses, {
    fields: [forum.diagnosesIdDiagnoses],
    references: [diagnoses.idDiagnoses],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  forum: one(forum, {
    fields: [comments.forumIdForum],
    references: [forum.idForum],
  }),
  user: one(user, {
    fields: [comments.userIdUser],
    references: [user.idUser],
  }),
  likes: many(likes),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  comment: one(comments, {
    fields: [likes.commentsIdComments],
    references: [comments.idComments],
  }),
  user: one(user, {
    fields: [likes.userIdUser],
    references: [user.idUser],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  clinicalData: one(clinicalData, {
    fields: [appointments.clinicalDataIdClinicalData],
    references: [clinicalData.idClinicalData],
  }),
  calendarEntries: many(calendar),
}));

export const calendarRelations = relations(calendar, ({ one, many }) => ({
  appointment: one(appointments, {
    fields: [calendar.appointmentsIdAppointments],
    references: [appointments.idAppointments],
  }),
  notifications: many(notify),
}));

export const notifyRelations = relations(notify, ({ one }) => ({
  calendar: one(calendar, {
    fields: [notify.calendarIdCalendar],
    references: [calendar.idCalendar],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  user: one(user, {
    fields: [media.userIdUser],
    references: [user.idUser],
  }),
  library: one(library, {
    fields: [media.libraryIdlibrary],
    references: [library.idlibrary],
  }),
}));

export const libraryRelations = relations(library, ({ many }) => ({
  media: many(media),
}));

export const aiAssistantRelations = relations(aiAssistant, ({ one }) => ({
  user: one(user, {
    fields: [aiAssistant.userIdUser],
    references: [user.idUser],
  }),
}));
