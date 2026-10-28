# Contrato da API — tea-cuidar

Documento para o time do front. Gerado a partir do **código real** da API (`apps/api`), não de memória. Dúvida ou divergência com o comportamento real: avisar, que o erro é da API ou deste documento.

> Status de validação: tudo abaixo foi testado manualmente via Postman, **exceto** as seções 9 (documentos) e 10 (assistente de IA), implementadas mas ainda em validação.

## 1. Como falar com a API

- **Base URL (dev):** `http://localhost:3001`
- **Formato:** JSON (`Content-Type: application/json`). Única exceção: upload de documento, que é `multipart/form-data`.
- **Autenticação:** `POST /auth/login` devolve `accessToken` (JWT, vale **7 dias**). Em toda rota marcada 🔒 enviar o header `Authorization: Bearer <accessToken>`.
- **CORS:** a API aceita requisições da origem `http://localhost:3000` (o front). Outra origem → configurar `WEB_ORIGIN` na API.
- **Datas:** a API devolve strings **ISO 8601 em UTC** (`"2026-11-10T14:00:00.000Z"`). Pode enviar tanto `"2018-05-10"` (só data) quanto ISO completo.
- **Papéis:** `user` (padrão) e `admin` (= moderador, mesmo nível). A `role` vem no login e fica gravada no token: **se mudar no banco, só vale depois de um novo login**.
- **Campos desconhecidos no body são rejeitados** (`400`), não ignorados. Mande só o que o DTO pede.

### Formato dos erros

```json
{ "statusCode": 400, "message": ["email must be an email", "senha must be longer than or equal to 8 characters"], "error": "Bad Request" }
```
Em `400` de validação, `message` é uma **lista** de textos (um por campo inválido); nos demais, é um texto. Erro inesperado: `{ "statusCode": 500, "message": "Internal server error" }`.

| Status | Quando acontece |
|---|---|
| `200` / `201` | sucesso (`201` em criação por `POST`; login e `DELETE` respondem `200`) |
| `400` | corpo inválido / campo obrigatório ausente / regra de negócio (ex.: limite diário da IA, criança sem prontuário) |
| `401` | sem token, token inválido/expirado, ou login com credenciais erradas |
| `403` | logado, mas sem permissão (rota de admin; fórum sem acesso; janela de edição de comentário expirada) |
| `404` | não existe **ou pertence a outro usuário** (a API não diferencia, de propósito) |
| `409` | conflito (e-mail repetido, já curtiu, criança já tem prontuário, conta com dados vinculados) |
| `500` | erro inesperado no servidor |

### Convenções importantes

- **Dono dos dados:** o usuário vem do token. Nunca existe `userIdUser` no body, e o front não consegue ler/alterar dados de outra pessoa (resposta `404`).
- **`qtt` nos catálogos** é um contador de uso mantido pelo servidor. **Nunca enviar.**
- **Ordem de criação (dependências):** `usuário → login → criança → prontuário → (consultas | prescrições)`. Consulta e prescrição exigem que a criança já tenha prontuário.
- **Acesso ao fórum:** depende do **diagnóstico** da criança. O usuário vê e comenta nos fóruns dos diagnósticos que algum filho dele tem.


## 2. Modelos (campos devolvidos pela API)

Nomes exatamente como chegam no JSON. "pode ser nulo" = campo opcional que vem `null` quando vazio.

### Usuário

| Campo | Tipo | Observação |
|---|---|---|
| `idUser` | número |  |
| `name` | texto |  |
| `email` | texto |  |
| `status` | número |  |
| `role` | texto (enum) |  |
| `dateCreate` | data/hora ISO 8601 |  |

> `senha` **nunca** é devolvida.

### Configuração do usuário

| Campo | Tipo | Observação |
|---|---|---|
| `userIdUser` | número |  |
| `notify` | número |  |
| `theme` | número |  |
| `privacity` | número |  |
| `updateDate` | data/hora ISO 8601 |  |

### Criança

| Campo | Tipo | Observação |
|---|---|---|
| `idChildren` | número |  |
| `name` | texto |  |
| `dob` | data/hora ISO 8601 |  |
| `dateCreate` | data/hora ISO 8601 |  |
| `relationshipIdRelationship` | número |  |
| `userIdUser` | número |  |
| `diagnosesIdDiagnoses` | número | pode ser nulo |
| `clinicalDataIdClinicalData` | número | pode ser nulo |

### Parentesco

| Campo | Tipo | Observação |
|---|---|---|
| `idRelationship` | número |  |
| `relationship` | texto |  |
| `qtt` | número |  |

### Diagnóstico

| Campo | Tipo | Observação |
|---|---|---|
| `idDiagnoses` | número |  |
| `nameDiagnosis` | texto |  |
| `stage` | número |  |
| `qtt` | número |  |

### Terapia

| Campo | Tipo | Observação |
|---|---|---|
| `idTherapy` | número |  |
| `nameTherapy` | texto |  |
| `type` | texto |  |
| `qtt` | número |  |

### Alergia

| Campo | Tipo | Observação |
|---|---|---|
| `idAllergies` | número |  |
| `allergenName` | texto |  |
| `severity` | número |  |
| `qtt` | número |  |

### Medicamento

| Campo | Tipo | Observação |
|---|---|---|
| `idCurrentMedications` | número |  |
| `medicineName` | texto |  |
| `route` | texto |  |
| `instructions` | texto |  |
| `qtt` | número |  |

### Categoria de documento (library)

| Campo | Tipo | Observação |
|---|---|---|
| `idlibrary` | número |  |
| `name` | texto |  |
| `descript` | texto |  |
| `icon` | texto |  |

### Prontuário clínico

| Campo | Tipo | Observação |
|---|---|---|
| `idClinicalData` | número |  |
| `familyHistory` | texto |  |
| `observations` | texto |  |
| `lastUpdate` | data/hora ISO 8601 |  |
| `therapyIdTherapy` | número | pode ser nulo |
| `allergiesIdAllergies` | número | pode ser nulo |

### Prescrição

| Campo | Tipo | Observação |
|---|---|---|
| `clinicalDataIdClinicalData` | número |  |
| `medicationsIdCurrentMedications` | número |  |
| `frequency` | texto |  |
| `status` | número |  |
| `startDate` | data/hora ISO 8601 |  |
| `endDate` | data/hora ISO 8601 |  |

### Consulta (appointment)

| Campo | Tipo | Observação |
|---|---|---|
| `idAppointments` | número |  |
| `appointmentDateTime` | data/hora ISO 8601 |  |
| `status` | texto (enum) |  |
| `reason` | texto |  |
| `local` | texto |  |
| `notes` | texto |  |
| `clinicalDataIdClinicalData` | número |  |

### Item do calendário

| Campo | Tipo | Observação |
|---|---|---|
| `idCalendar` | número |  |
| `appointmentsIdAppointments` | número |  |
| `date` | data/hora ISO 8601 |  |
| `status` | texto (enum) |  |
| `descript` | texto |  |

### Lembrete (notify)

| Campo | Tipo | Observação |
|---|---|---|
| `idNotify` | número |  |
| `calendarIdCalendar` | número |  |
| `notifyDate` | data/hora ISO 8601 |  |
| `sent` | número |  |
| `descript` | texto |  |

> `sent` = `0` até existir o envio real (job ainda não implementado).

### Direito/benefício

| Campo | Tipo | Observação |
|---|---|---|
| `idRightsAndBenefits` | número |  |
| `userIdUser` | número |  |
| `title` | texto |  |
| `category` | texto (enum) |  |
| `type` | texto (enum) |  |
| `descript` | texto |  |
| `status` | número |  |

### Sub-fórum

| Campo | Tipo | Observação |
|---|---|---|
| `idForum` | número |  |
| `title` | texto |  |
| `diagnosesIdDiagnoses` | número |  |
| `descript` | texto |  |
| `createDate` | data/hora ISO 8601 |  |

### Comentário

| Campo | Tipo | Observação |
|---|---|---|
| `idComments` | número |  |
| `content` | texto |  |
| `status` | texto (enum) |  |
| `createAt` | data/hora ISO 8601 |  |
| `updateAt` | data/hora ISO 8601 |  |
| `forumIdForum` | número |  |
| `userIdUser` | número |  |
| `editedByAdminId` | número | pode ser nulo |
| `previousContent` | texto | pode ser nulo |
| `editedAt` | data/hora ISO 8601 | pode ser nulo |

> Marca d'água de moderação: `previousContent`, `editedByAdminId` e `editedAt` só vêm preenchidos se um **admin** já editou o comentário (guarda apenas a última edição).

### Documento (media)

| Campo | Tipo | Observação |
|---|---|---|
| `idmedia` | número |  |
| `userIdUser` | número |  |
| `libraryIdlibrary` | número |  |
| `childrenIdChildren` | número |  |
| `title` | texto |  |
| `descript` | texto |  |
| `date` | data/hora ISO 8601 |  |
| `status` | número |  |

> `imageUrl` guarda só o nome interno do arquivo no servidor — **não é uma URL**. Pra obter o arquivo use `GET /media/:id/file` (com token).

### Pergunta ao assistente

| Campo | Tipo | Observação |
|---|---|---|
| `idChat` | número |  |
| `userIdUser` | número |  |
| `questions` | texto |  |
| `answer` | texto |  |
| `dateTime` | data/hora ISO 8601 |  |

### Valores permitidos (enums)

| Campo | Valores |
|---|---|
| Consulta/Calendário `status` | `agendado`, `confirmado`, `concluido`, `cancelado`, `remarcado` |
| Direito `category` | `saude`, `educacao`, `financeiro`, `tributario`, `transporte`, `trabalho`, `lazer_acessibilidade` |
| Direito `type` | `bpc_loas`, `isencao_fiscal`, `passe_livre`, `aee`, `prioridade_atendimento`, `cotas_trabalhistas`, `carteira_estacionamento`, `outro` |
| Comentário `status` | `visivel`, `oculto`, `denunciado`, `removido` (hoje todo comentário nasce `visivel`; o cliente não define) |
| Usuário `role` | `user`, `admin` |
| `status` de usuário/prescrição/direito | `0` ou `1` (`1` = ativo/em uso) |

## 3. Endpoints

### 1. Conta e login

Cadastro e login são as únicas rotas realmente públicas junto com a leitura dos catálogos. Todo o resto exige o header `Authorization: Bearer <accessToken>`.

#### `POST /users` — Cadastrar usuário

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateUserDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | **sim** | texto; mín. 2 caracteres |
| `email` | **sim** | e-mail válido |
| `senha` | **sim** | texto; mín. 8 caracteres |
| `status` | **sim** | um de: 0, 1 |

```json
{
  "name": "Guilherme Teste",
  "email": "teste@teste.com",
  "senha": "senha12345",
  "status": 1
}
```
- **Resposta de sucesso:** `201` — modelo **Usuário**
- Rota pública (cadastro).
- A resposta **nunca** traz `senha`. `role` nasce sempre como `"user"` — não existe campo no body pra mudar isso.
- `409` se o e-mail já estiver cadastrado.
- O `UserConfig` do usuário é criado automaticamente junto.

#### `POST /auth/login` — Login

- **Acesso:** 🌐 público (sem login)
- **Body:** `LoginDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `email` | **sim** | e-mail válido |
| `senha` | **sim** | texto; mín. 8 caracteres |

```json
{
  "email": "teste@teste.com",
  "senha": "senha12345"
}
```
- **Resposta de sucesso:** `200` — `{ accessToken, user: { idUser, name, email, role } }`
- Resposta: `{ "accessToken": "...", "user": { "idUser", "name", "email", "role" } }`.
- `401` com a mesma mensagem ("Credenciais inválidas") para e-mail inexistente OU senha errada; `401` também para usuário inativo (`status: 0`).
- O token vale **7 dias**. A `role` fica gravada dentro do token: se um usuário virar admin, só vale a partir do próximo login dele.

#### `GET /users/me` — Meu perfil

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Usuário**
- Retorna `idUser, name, email, status, role, dateCreate`.

#### `PATCH /users/:id` — Atualizar meu perfil

- **Acesso:** 🔒 login
- **Body:** `UpdateUserDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | não | texto; mín. 2 caracteres |
| `email` | não | e-mail válido |
| `status` | não | um de: 0, 1 |

```json
{
  "name": "Guilherme Atualizado"
}
```
- **Resposta de sucesso:** `200` — modelo **Usuário**
- Só dá pra editar a **própria** conta (outro id → `404`). Admin edita qualquer uma.
- Senha não é alterada por aqui (não existe troca de senha ainda).

#### `GET /users` — Listar todos os usuários (admin)

- **Acesso:** 🔒👑 login **admin**
- **Resposta de sucesso:** `200` — lista de **Usuário**
- Só admin. Usuário comum recebe `403`; sem token, `401`.

#### `GET /users/:id` — Ver usuário por id

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Usuário**
- Só a própria conta (ou admin); senão `404`.

#### `DELETE /users/:id` — Excluir conta

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — `{ "deleted": true }`
- Só a própria conta (ou admin).
- `409` se a conta já tem dados vinculados (crianças, comentários, documentos...). Conta recém-criada sem dados é excluída normalmente.

#### `GET /user-config` — Minhas configurações

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Configuração do usuário**
- Retorna `notify`, `theme`, `privacity` (todos `0` ou `1`) e `updateDate`. Nasce no cadastro, valores iniciais: `notify: 1`, `theme: 0` (claro), `privacity: 0`.

#### `PATCH /user-config` — Atualizar minhas configurações

- **Acesso:** 🔒 login
- **Body:** `UpdateUserConfigDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `notify` | não | um de: 0, 1 |
| `theme` | não | um de: 0, 1 |
| `privacity` | não | um de: 0, 1 |

```json
{
  "theme": 1
}
```
- **Resposta de sucesso:** `200` — modelo **Configuração do usuário**
- Todos os campos são opcionais. Não existe `:id` — é sempre a configuração de quem está logado.

### 2. Catálogos

Listas pra popular dropdowns (parentesco, diagnóstico, terapia, alergia, medicamento, categoria de documento). Vêm do seed. **`qtt` é contador de uso mantido pelo servidor — nunca é enviado pelo cliente.**

#### `GET /relationships` — Parentesco — listar

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — lista de **Parentesco**
- Catálogo compartilhado, **sem login**. Cada item tem `qtt` (contador de uso mantido pelo servidor).

#### `GET /diagnoses` — Diagnósticos — listar

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — lista de **Diagnóstico**

#### `GET /therapies` — Terapias — listar

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — lista de **Terapia**

#### `GET /allergies` — Alergias — listar

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — lista de **Alergia**

#### `GET /medications` — Medicamentos — listar

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — lista de **Medicamento**

#### `GET /library` — Categorias de documento — listar

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — lista de **Categoria de documento (library)**

#### `POST /relationships` — Parentesco — criar

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateRelationshipDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `relationship` | **sim** | texto; mín. 2 caracteres |

```json
{
  "relationship": "Madrinha"
}
```
- **Resposta de sucesso:** `201` — modelo **Parentesco**
- **Hoje esta rota é aberta (sem login).** Não deveria ser usada pelo app: o cadastro dos itens do catálogo é feito pelo time (seed/admin).

#### `GET /relationships/:id` — Parentesco — ver um

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — modelo **Parentesco**

#### `PATCH /relationships/:id` — Parentesco — atualizar

- **Acesso:** 🌐 público (sem login)
- **Body:** `UpdateRelationshipDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `relationship` | não | texto; mín. 2 caracteres |

```json
{
  "relationship": "Madrinha"
}
```
- **Resposta de sucesso:** `200` — modelo **Parentesco**

#### `DELETE /relationships/:id` — Parentesco — excluir

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — `{ "deleted": true }`
- Se o item estiver em uso por alguma criança/prontuário, o banco recusa e a API responde `500` (ainda não tratado — evite excluir itens em uso).

#### `POST /diagnoses` — Diagnósticos — criar

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateDiagnosisDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `nameDiagnosis` | **sim** | texto; mín. 2 caracteres |
| `stage` | **sim** | inteiro |

```json
{
  "nameDiagnosis": "Dislexia",
  "stage": 1
}
```
- **Resposta de sucesso:** `201` — modelo **Diagnóstico**

#### `GET /diagnoses/:id` — Diagnósticos — ver um

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — modelo **Diagnóstico**

#### `PATCH /diagnoses/:id` — Diagnósticos — atualizar

- **Acesso:** 🌐 público (sem login)
- **Body:** `UpdateDiagnosisDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `nameDiagnosis` | não | texto; mín. 2 caracteres |
| `stage` | não | inteiro |

```json
{
  "nameDiagnosis": "Dislexia"
}
```
- **Resposta de sucesso:** `200` — modelo **Diagnóstico**

#### `DELETE /diagnoses/:id` — Diagnósticos — excluir

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — `{ "deleted": true }`

#### `POST /therapies` — Terapias — criar

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateTherapyDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `nameTherapy` | **sim** | texto; mín. 2 caracteres |
| `type` | **sim** | texto; mín. 2 caracteres |

```json
{
  "nameTherapy": "Musicoterapia",
  "type": "grupo"
}
```
- **Resposta de sucesso:** `201` — modelo **Terapia**

#### `GET /therapies/:id` — Terapias — ver um

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — modelo **Terapia**

#### `PATCH /therapies/:id` — Terapias — atualizar

- **Acesso:** 🌐 público (sem login)
- **Body:** `UpdateTherapyDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `nameTherapy` | não | texto; mín. 2 caracteres |
| `type` | não | texto; mín. 2 caracteres |

```json
{
  "nameTherapy": "Musicoterapia",
}
```
- **Resposta de sucesso:** `200` — modelo **Terapia**

#### `DELETE /therapies/:id` — Terapias — excluir

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — `{ "deleted": true }`

#### `POST /allergies` — Alergias — criar

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateAllergyDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `allergenName` | **sim** | texto; mín. 2 caracteres |
| `severity` | **sim** | inteiro |

```json
{
  "allergenName": "Ovo",
  "severity": 2
}
```
- **Resposta de sucesso:** `201` — modelo **Alergia**

#### `GET /allergies/:id` — Alergias — ver um

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — modelo **Alergia**

#### `PATCH /allergies/:id` — Alergias — atualizar

- **Acesso:** 🌐 público (sem login)
- **Body:** `UpdateAllergyDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `allergenName` | não | texto; mín. 2 caracteres |
| `severity` | não | inteiro |

```json
{
  "allergenName": "Ovo",
  "severity": 2
}
```
- **Resposta de sucesso:** `200` — modelo **Alergia**

#### `DELETE /allergies/:id` — Alergias — excluir

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — `{ "deleted": true }`

#### `POST /medications` — Medicamentos — criar

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateMedicationDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `medicineName` | **sim** | texto; mín. 2 caracteres |
| `route` | **sim** | texto; mín. 2 caracteres |
| `instructions` | **sim** | texto; mín. 2 caracteres |

```json
{
  "medicineName": "Fluoxetina",
  "route": "oral",
  "instructions": "Tomar pela manhã"
}
```
- **Resposta de sucesso:** `201` — modelo **Medicamento**

#### `GET /medications/:id` — Medicamentos — ver um

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — modelo **Medicamento**

#### `PATCH /medications/:id` — Medicamentos — atualizar

- **Acesso:** 🌐 público (sem login)
- **Body:** `UpdateMedicationDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `medicineName` | não | texto; mín. 2 caracteres |
| `route` | não | texto; mín. 2 caracteres |
| `instructions` | não | texto; mín. 2 caracteres |

```json
{
  "medicineName": "Fluoxetina",
  "route": "oral",
  "instructions": "Tomar pela manhã"
}
```
- **Resposta de sucesso:** `200` — modelo **Medicamento**

#### `DELETE /medications/:id` — Medicamentos — excluir

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — `{ "deleted": true }`

#### `POST /library` — Categorias de documento — criar

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateLibraryDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | **sim** | texto; mín. 2 caracteres |
| `descript` | **sim** | texto; mín. 2 caracteres |
| `icon` | **sim** | texto |

```json
{
  "name": "Vacinas",
  "descript": "Cartão de vacinação",
  "icon": "syringe"
}
```
- **Resposta de sucesso:** `201` — modelo **Categoria de documento (library)**

#### `GET /library/:id` — Categorias de documento — ver um

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — modelo **Categoria de documento (library)**

#### `PATCH /library/:id` — Categorias de documento — atualizar

- **Acesso:** 🌐 público (sem login)
- **Body:** `UpdateLibraryDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | não | texto; mín. 2 caracteres |
| `descript` | não | texto; mín. 2 caracteres |
| `icon` | não | texto |

```json
{
  "name": "Vacinas",
  "descript": "Cartão de vacinação",
  "icon": "syringe"
}
```
- **Resposta de sucesso:** `200` — modelo **Categoria de documento (library)**

#### `DELETE /library/:id` — Categorias de documento — excluir

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — `{ "deleted": true }`

### 3. Crianças

Dono da criança = usuário do token. O `userIdUser` nunca vem do body. Criança de outro usuário responde sempre `404` (não `403`), pra não confirmar que o id existe.

#### `POST /children` — Cadastrar criança

- **Acesso:** 🔒 login
- **Body:** `CreateChildDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | **sim** | texto; mín. 2 caracteres |
| `dob` | **sim** | data ISO 8601 |
| `relationshipIdRelationship` | **sim** | inteiro |
| `diagnosesIdDiagnoses` | não | inteiro |
| `clinicalDataIdClinicalData` | não | inteiro |

```json
{
  "name": "Filho Teste",
  "dob": "2018-05-10",
  "relationshipIdRelationship": 1,
  "diagnosesIdDiagnoses": 1
}
```
- **Resposta de sucesso:** `201` — modelo **Criança**
- `relationshipIdRelationship` vem de `GET /relationships`; `diagnosesIdDiagnoses` (opcional) de `GET /diagnoses`.
- O diagnóstico da criança é o que libera o acesso aos fóruns daquele diagnóstico.
- Incrementa o `qtt` do parentesco e do diagnóstico usados.

#### `GET /children` — Listar minhas crianças

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Criança**
- Só as crianças do usuário logado.

#### `GET /children/:id` — Ver criança

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Criança**

#### `PATCH /children/:id` — Atualizar criança

- **Acesso:** 🔒 login
- **Body:** `UpdateChildDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | não | texto; mín. 2 caracteres |
| `dob` | não | data ISO 8601 |
| `relationshipIdRelationship` | não | inteiro |
| `diagnosesIdDiagnoses` | não | inteiro |
| `clinicalDataIdClinicalData` | não | inteiro |

```json
{
  "name": "Filho Teste Editado"
}
```
- **Resposta de sucesso:** `200` — modelo **Criança**
- Trocar parentesco/diagnóstico ajusta os contadores (`qtt`) automaticamente.

#### `GET /relationships/:id` — Conferir contador do parentesco

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `200` — modelo **Parentesco**

### 4. Prontuário clínico

Um prontuário por criança, aninhado em `/children/:childId`. **A criança precisa ter prontuário antes de ter consultas ou prescrições.**

#### `POST /children/:childId/clinical-data` — Criar prontuário

- **Acesso:** 🔒 login
- **Body:** `CreateClinicalDataDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `familyHistory` | **sim** | texto; mín. 2 caracteres |
| `observations` | **sim** | texto; mín. 2 caracteres |
| `therapyIdTherapy` | não | inteiro |
| `allergiesIdAllergies` | não | inteiro |

```json
{
  "familyHistory": "Sem histórico relevante",
  "observations": "Acompanhamento desde os 3 anos",
  "therapyIdTherapy": 1,
  "allergiesIdAllergies": 1
}
```
- **Resposta de sucesso:** `201` — modelo **Prontuário clínico**
- `therapyIdTherapy` e `allergiesIdAllergies` são opcionais.
- `409` se a criança já tem prontuário.

#### `POST /children/:childId/clinical-data` — Criar prontuário de novo (deve dar 409)

- **Acesso:** 🔒 login
- **Body:** `CreateClinicalDataDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `familyHistory` | **sim** | texto; mín. 2 caracteres |
| `observations` | **sim** | texto; mín. 2 caracteres |
| `therapyIdTherapy` | não | inteiro |
| `allergiesIdAllergies` | não | inteiro |

```json
{
  "familyHistory": "xx",
  "observations": "yy"
}
```
- **Resposta de sucesso:** `409` — modelo **Prontuário clínico**

#### `GET /children/:childId/clinical-data` — Ver prontuário

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Prontuário clínico**
- `404` se a criança ainda não tem prontuário.

#### `PATCH /children/:childId/clinical-data` — Atualizar prontuário

- **Acesso:** 🔒 login
- **Body:** `UpdateClinicalDataDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `familyHistory` | não | texto; mín. 2 caracteres |
| `observations` | não | texto; mín. 2 caracteres |
| `therapyIdTherapy` | não | inteiro |
| `allergiesIdAllergies` | não | inteiro |

```json
{
  "observations": "Atualizado após consulta"
}
```
- **Resposta de sucesso:** `200` — modelo **Prontuário clínico**
- Atualiza `lastUpdate` sozinho.

### 5. Prescrições

Uma prescrição é identificada pelo par **(criança, medicamento)** — não existe id próprio. Por isso o `medicationId` aparece na URL.

#### `POST /children/:childId/prescriptions` — Prescrever medicamento

- **Acesso:** 🔒 login
- **Body:** `CreatePrescriptionDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `medicationsIdCurrentMedications` | **sim** | inteiro |
| `frequency` | **sim** | texto; mín. 2 caracteres |
| `status` | **sim** | um de: 0, 1 |
| `startDate` | **sim** | data ISO 8601 |
| `endDate` | **sim** | data ISO 8601 |

```json
{
  "medicationsIdCurrentMedications": 1,
  "frequency": "2x ao dia",
  "status": 1,
  "startDate": "2026-10-01",
  "endDate": "2026-12-01"
}
```
- **Resposta de sucesso:** `201` — modelo **Prescrição**
- `status`: `1` = em uso, `0` = suspenso.
- Exige prontuário na criança.

#### `GET /children/:childId/prescriptions` — Listar prescrições da criança

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Prescrição**

#### `GET /children/:childId/prescriptions/:medicationId` — Ver uma prescrição

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Prescrição**

#### `PATCH /children/:childId/prescriptions/:medicationId` — Atualizar prescrição

- **Acesso:** 🔒 login
- **Body:** `UpdatePrescriptionDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `frequency` | não | texto; mín. 2 caracteres |
| `status` | não | um de: 0, 1 |
| `startDate` | não | data ISO 8601 |
| `endDate` | não | data ISO 8601 |

```json
{
  "status": 0
}
```
- **Resposta de sucesso:** `200` — modelo **Prescrição**
- Não dá pra trocar o medicamento (ele faz parte da identidade da linha). Pra trocar: `DELETE` + `POST`.

#### `DELETE /children/:childId/prescriptions/:medicationId` — Remover prescrição

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — `{ "deleted": true }`

### 6. Agenda (consultas, calendário, lembretes)

`Calendar` é **gerado e mantido pelo servidor** junto com cada consulta (só leitura pro cliente). Lembretes (`notify`) são criados pelo usuário, com a data escolhida por ele.

#### `POST /children/:childId/appointments` — Agendar consulta

- **Acesso:** 🔒 login
- **Body:** `CreateAppointmentDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `appointmentDateTime` | **sim** | data ISO 8601 |
| `reason` | **sim** | texto; mín. 2 caracteres; máx. 50 caracteres |
| `local` | **sim** | texto; mín. 2 caracteres |
| `notes` | **sim** | texto |

```json
{
  "appointmentDateTime": "2026-11-10T14:00:00.000Z",
  "reason": "Consulta de rotina",
  "local": "Clínica X",
  "notes": "Levar exames anteriores"
}
```
- **Resposta de sucesso:** `201` — modelo **Consulta (appointment)**
- Nasce sempre com `status: "agendado"` (não é enviado pelo cliente).
- Cria automaticamente a entrada correspondente no calendário.
- `400` se a criança ainda não tem prontuário clínico.

#### `GET /children/:childId/appointments` — Listar consultas da criança

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Consulta (appointment)**

#### `GET /appointments/:id` — Ver consulta

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Consulta (appointment)**

#### `GET /calendar` — Minha agenda (todas as crianças)

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Item do calendário**
- Alimenta a tela de agenda: todos os compromissos de todas as crianças do usuário.

#### `GET /calendar/:calendarId` — Ver item do calendário

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Item do calendário**

#### `PATCH /appointments/:id` — Atualizar consulta (confirmar)

- **Acesso:** 🔒 login
- **Body:** `UpdateAppointmentDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `appointmentDateTime` | não | data ISO 8601 |
| `reason` | não | texto; mín. 2 caracteres; máx. 50 caracteres |
| `local` | não | texto; mín. 2 caracteres |
| `notes` | não | texto |
| `status` | não | um de: agendado, confirmado, concluido, cancelado, remarcado |

```json
{
  "status": "confirmado"
}
```
- **Resposta de sucesso:** `200` — modelo **Consulta (appointment)**
- Mudar `appointmentDateTime` ou `status` sincroniza o calendário automaticamente.

#### `POST /notify` — Criar lembrete

- **Acesso:** 🔒 login
- **Body:** `CreateNotifyDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `calendarIdCalendar` | **sim** | inteiro |
| `notifyDate` | **sim** | data ISO 8601 |
| `descript` | **sim** | texto; mín. 2 caracteres |

```json
{
  "calendarIdCalendar": 1,
  "notifyDate": "2026-11-09T14:00:00.000Z",
  "descript": "Lembrete 1 dia antes"
}
```
- **Resposta de sucesso:** `201` — modelo **Lembrete (notify)**
- A data do lembrete é escolhida pelo cliente (não há regra fixa de antecedência).
- `sent` nasce `0`. **Atenção:** o envio real da notificação (job que dispara no horário) ainda **não existe** — por ora só o cadastro.

#### `GET /notify/calendar/:calendarId` — Listar lembretes de um item do calendário

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Lembrete (notify)**

#### `DELETE /notify/:id` — Excluir lembrete

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — `{ "deleted": true }`

#### `DELETE /appointments/:id` — Excluir consulta

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — `{ "deleted": true }`
- Apaga também o item do calendário e os lembretes dele.

### 7. Direitos e benefícios

Direitos do **responsável** (pertencem ao usuário, não a uma criança).

#### `POST /rights-and-benefits` — Cadastrar direito/benefício

- **Acesso:** 🔒 login
- **Body:** `CreateRightsAndBenefitsDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `title` | **sim** | texto; mín. 2 caracteres; máx. 45 caracteres |
| `category` | **sim** | um de: saude, educacao, financeiro, tributario, transporte, trabalho, lazer_acessibilidade |
| `type` | **sim** | um de: bpc_loas, isencao_fiscal, passe_livre, aee, prioridade_atendimento, cotas_trabalhistas, carteira_estacionamento, outro |
| `descript` | **sim** | texto; mín. 2 caracteres |
| `status` | **sim** | um de: 0, 1 |

```json
{
  "title": "Passe livre",
  "category": "transporte",
  "type": "passe_livre",
  "descript": "Passe livre interestadual",
  "status": 1
}
```
- **Resposta de sucesso:** `201` — modelo **Direito/benefício**
- `category` e `type` só aceitam os valores listados na tabela abaixo (`400` caso contrário).

#### `GET /rights-and-benefits` — Listar meus direitos

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Direito/benefício**

#### `GET /rights-and-benefits/:id` — Ver direito

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Direito/benefício**

#### `PATCH /rights-and-benefits/:id` — Atualizar direito

- **Acesso:** 🔒 login
- **Body:** `UpdateRightsAndBenefitsDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `title` | não | texto; mín. 2 caracteres; máx. 45 caracteres |
| `category` | não | um de: saude, educacao, financeiro, tributario, transporte, trabalho, lazer_acessibilidade |
| `type` | não | um de: bpc_loas, isencao_fiscal, passe_livre, aee, prioridade_atendimento, cotas_trabalhistas, carteira_estacionamento, outro |
| `descript` | não | texto; mín. 2 caracteres |
| `status` | não | um de: 0, 1 |

```json
{
  "status": 0
}
```
- **Resposta de sucesso:** `200` — modelo **Direito/benefício**

#### `DELETE /rights-and-benefits/:id` — Excluir direito

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — `{ "deleted": true }`

### 8. Fórum (precisa de um usuário admin)

O fórum é organizado por **diagnóstico**. O sub-fórum é criado por admin/moderador (mesmo papel); o usuário comum **vê e comenta** nos fóruns dos diagnósticos que algum filho dele tem. Quem tem filhos com diagnósticos diferentes acumula acesso a vários fóruns.

#### `POST /forum` — Criar sub-fórum (admin)

- **Acesso:** 🔒👑 login **admin**
- **Body:** `CreateForumDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `title` | **sim** | texto; mín. 2 caracteres; máx. 45 caracteres |
| `diagnosesIdDiagnoses` | **sim** | inteiro |
| `descript` | **sim** | texto; mín. 2 caracteres |

```json
{
  "title": "Dicas do dia a dia",
  "diagnosesIdDiagnoses": 1,
  "descript": "Troca de experiências"
}
```
- **Resposta de sucesso:** `201` — modelo **Sub-fórum**
- Só admin (`403` pra usuário comum).

#### `GET /diagnoses/:diagnosisId/forum` — Listar sub-fóruns de um diagnóstico

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Sub-fórum**
- `403` se o usuário não tem nenhum filho com esse diagnóstico.

#### `GET /forum/:id` — Ver sub-fórum

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Sub-fórum**
- `403` sem acesso ao diagnóstico do fórum.

#### `POST /forum/:forumId/comments` — Comentar

- **Acesso:** 🔒 login
- **Body:** `CreateCommentDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `content` | **sim** | texto; mín. 1 caracteres |

```json
{
  "content": "Primeiro comentário"
}
```
- **Resposta de sucesso:** `201` — modelo **Comentário**
- Nasce com `status: "visivel"`.

#### `GET /forum/:forumId/comments` — Listar comentários

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Comentário**

#### `POST /comments/:commentId/likes` — Curtir comentário

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `201` — `{ "liked": true }`
- Sem body. Exige acesso ao diagnóstico do fórum.

#### `POST /comments/:commentId/likes` — Curtir de novo (deve dar 409)

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `409` — `{ "liked": true }`

#### `GET /comments/:commentId/likes` — Contar curtidas

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — `{ "count": n }`
- Resposta: `{ "count": n }`.

#### `DELETE /comments/:commentId/likes` — Descurtir

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — `{ "liked": false }`
- `404` se o usuário não tinha curtido.

#### `PATCH /comments/:id` — Editar meu comentário

- **Acesso:** 🔒 login
- **Body:** `UpdateCommentDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `content` | **sim** | texto; mín. 1 caracteres |

```json
{
  "content": "Comentário editado"
}
```
- **Resposta de sucesso:** `200` — modelo **Comentário**
- Autor: só dentro de **3 horas** após criar (`403` depois disso) e só no próprio comentário.

#### `PATCH /comments/:id` — Editar como admin (deixa marca d'água)

- **Acesso:** 🔒👑 login **admin**
- **Body:** `UpdateCommentDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `content` | **sim** | texto; mín. 1 caracteres |

```json
{
  "content": "Conteúdo moderado"
}
```
- **Resposta de sucesso:** `200` — modelo **Comentário**
- Admin edita sem limite de tempo. A resposta passa a trazer `previousContent` (texto anterior), `editedByAdminId` e `editedAt` — o front deve exibir "editado por moderador". Só a **última** edição de admin é guardada.

#### `PATCH /forum/:id` — Atualizar sub-fórum (admin)

- **Acesso:** 🔒👑 login **admin**
- **Body:** `UpdateForumDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `title` | não | texto; mín. 2 caracteres; máx. 45 caracteres |
| `descript` | não | texto; mín. 2 caracteres |

```json
{
  "descript": "Descrição atualizada"
}
```
- **Resposta de sucesso:** `200` — modelo **Sub-fórum**

#### `DELETE /comments/:id` — Excluir meu comentário

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — `{ "deleted": true }`
- Mesma regra de 3 horas do autor; admin exclui sempre.

#### `DELETE /forum/:id` — Excluir sub-fórum (admin)

- **Acesso:** 🔒👑 login **admin**
- **Resposta de sucesso:** `200` — `{ "deleted": true }`

### 9. Documentos da criança (precisa do upload configurado)

Receitas, laudos, exames e fotos, por criança. Upload **multipart/form-data**; arquivos ficam no disco do servidor.

#### `POST /children/:childId/media` — Enviar documento

- **Acesso:** 🔒 login
- **Body:** `multipart/form-data` — campos de texto `title`, `descript`, `libraryIdlibrary` + arquivo no campo `file`
- **Resposta de sucesso:** `201` — modelo **Documento (media)**
- `multipart/form-data` com os campos de texto `title`, `descript`, `libraryIdlibrary` e o arquivo no campo **`file`**.
- Aceita **JPG, PNG, WEBP e PDF**, até **10 MB**. Outro tipo → `400`.
- `libraryIdlibrary` vem de `GET /library` (categoria do documento).

#### `GET /children/:childId/media` — Listar documentos da criança

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Documento (media)**

#### `GET /media/:id` — Ver metadados do documento

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — modelo **Documento (media)**

#### `GET /media/:id/file` — Baixar o arquivo

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — o **arquivo** (stream binário com o tipo original: PDF/JPG/PNG/WEBP)
- **Exige o header `Authorization`.** Por isso **não funciona** como `<img src="...">` nem `<a href="...">` direto: o front deve fazer `fetch` com o token, transformar a resposta em `blob` e usar `URL.createObjectURL(blob)`.

#### `DELETE /media/:id` — Excluir documento

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — `{ "deleted": true }`
- Apaga o registro e o arquivo no disco.

### 10. Assistente de IA (precisa de GEMINI_API_KEY)

Pergunta/resposta com a IA (Gemini). O servidor aplica um prompt fixo de apoio a pais, com aviso de que não substitui profissional de saúde.

#### `POST /ai-assistant/ask` — Perguntar ao assistente

- **Acesso:** 🔒 login
- **Body:** `AskAssistantDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `question` | **sim** | texto; mín. 3 caracteres |

```json
{
  "question": "Quais atividades ajudam na rotina de uma criança com TEA?"
}
```
- **Resposta de sucesso:** `201` — modelo **Pergunta ao assistente** (com `answer`)
- Limite de **10 perguntas por dia** por usuário (`400` depois disso).
- `500` com mensagem genérica se a IA estiver indisponível — nada é salvo nesse caso.

#### `GET /ai-assistant/history` — Histórico de perguntas

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `200` — lista de **Pergunta ao assistente**
- Mais recentes primeiro.

### 11. Segurança (testes negativos)

Pra rodar no Collection Runner: todos devem **passar** (cada um espera o erro certo).

#### `GET /children` — Sem token → 401

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `401` — lista de **Criança**

#### `GET /users` — Listar usuários sem token → 401

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `401` — lista de **Usuário**

#### `DELETE /users/:id` — Excluir usuário sem token → 401

- **Acesso:** 🌐 público (sem login)
- **Resposta de sucesso:** `401` — `{ "deleted": true }`

#### `GET /users` — Listar usuários com token comum → 403

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `403` — lista de **Usuário**

#### `POST /forum` — Criar fórum com token comum → 403

- **Acesso:** 🔒 login
- **Body:** `CreateForumDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `title` | **sim** | texto; mín. 2 caracteres; máx. 45 caracteres |
| `diagnosesIdDiagnoses` | **sim** | inteiro |
| `descript` | **sim** | texto; mín. 2 caracteres |

```json
{
  "title": "x",
  "diagnosesIdDiagnoses": 1,
  "descript": "y"
}
```
- **Resposta de sucesso:** `403` — modelo **Sub-fórum**

#### `GET /children/999999` — Criança inexistente/de outro usuário → 404

- **Acesso:** 🔒 login
- **Resposta de sucesso:** `404` — modelo **999999**

#### `POST /users` — E-mail repetido → 409

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateUserDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | **sim** | texto; mín. 2 caracteres |
| `email` | **sim** | e-mail válido |
| `senha` | **sim** | texto; mín. 8 caracteres |
| `status` | **sim** | um de: 0, 1 |

```json
{
  "name": "Repetido",
  "email": "teste@teste.com",
  "senha": "senha12345",
  "status": 1
}
```
- **Resposta de sucesso:** `409` — modelo **Usuário**

#### `POST /users` — Corpo incompleto (sem senha) → 400

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateUserDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | **sim** | texto; mín. 2 caracteres |
| `email` | **sim** | e-mail válido |
| `senha` | **sim** | texto; mín. 8 caracteres |
| `status` | **sim** | um de: 0, 1 |

```json
{
  "name": "Sem senha",
  "email": "x@teste.com",
  "status": 1
}
```
- **Resposta de sucesso:** `400` — modelo **Usuário**

#### `POST /users` — Campo extra (isAdmin) → 400

- **Acesso:** 🌐 público (sem login)
- **Body:** `CreateUserDto`

| Campo | Obrigatório | Regras |
|---|---|---|
| `name` | **sim** | texto; mín. 2 caracteres |
| `email` | **sim** | e-mail válido |
| `senha` | **sim** | texto; mín. 8 caracteres |
| `status` | **sim** | um de: 0, 1 |

```json
{
  "name": "Espertinho",
  "email": "y"teste@teste.com"",
  "senha": "senha12345",
  "status": 1,
  "isAdmin": true
}
```
- **Resposta de sucesso:** `400` — modelo **Usuário**
- Prova que ninguém consegue se promover a admin pelo body.

## 4. Pendências e limitações conhecidas

Pra ninguém se surpreender na hora de integrar ou apresentar:

1. **Notificações:** o lembrete (`notify`) é cadastrado, mas **ainda não existe o envio real** no horário. Falta o job agendado e a escolha do canal (push/e-mail).
2. **Documentos (`/media`) e assistente de IA (`/ai-assistant`)** estão implementados, mas **ainda em validação** — podem ter ajustes.
3. **Promover alguém a admin** é manual no banco (não há endpoint). Não existe tela de administração.
4. **Troca de senha / recuperação de senha:** não existe.
5. **Token:** 7 dias, sem renovação automática (refresh token). Passou disso, novo login.
6. **Catálogos** (`/relationships`, `/diagnoses`, `/therapies`, `/allergies`, `/medications`, `/library`): a leitura é pública, mas `POST/PATCH/DELETE` também estão **abertos sem login** hoje. O app não deve chamá-los; o cadastro dos itens é feito pelo time.
7. **Exclusão de conta** só funciona para conta sem dados vinculados (senão `409`).
8. **Privacidade (IA):** o assistente usa a camada gratuita do Gemini, em que o Google pode usar os textos enviados pra melhorar produtos. Orientar usuários a **não** colocar dados identificáveis da criança nas perguntas.
