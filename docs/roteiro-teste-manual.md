# Roteiro de teste manual — tea-cuidar API

Ordem pensada pra respeitar as dependências entre os dados (não dá pra
criar uma criança sem ter um `Relationship` antes, por exemplo). Testa
nessa sequência, no Postman/Insomnia/Thunder Client.

Base URL: `http://localhost:3001`

Convenção: depois do login, toda rota marcada 🔒 precisa do header
`Authorization: Bearer <accessToken>`.

---

## Fase 0 — Pré-requisito

- [ ] Todos os zips extraídos em `apps/api/src/` (o mais recente
      sobrescreve os anteriores quando o arquivo se repete).
- [ ] Node na versão **22.12 ou maior** (`node -v`).
- [ ] Schema do banco em dia. O schema mudou várias vezes (coluna `role`
      em `User`, colunas de auditoria em `Comments`, `childrenIdChildren`
      em `media`, `DEFAULT 0` nos `qtt`), então rode:
      ```bash
      npx drizzle-kit generate
      npx drizzle-kit migrate
      ```
      Se o `generate` disser que não há mudanças, tudo bem, já estava em dia.
- [ ] `.env` com `DATABASE_URL`, `JWT_SECRET` e `GEMINI_API_KEY`.
- [ ] API no ar: `npm run start:dev` mostrando
      `API rodando em http://localhost:3001`.
- [ ] Rodar `npx tsx src/db/seed.ts` e confirmar as 6 mensagens
      `✓ ... semeada` (Relationship, Diagnoses, Therapy, Allergies,
      Library, CurrentMedications).

---

## Fase 1 — Conta e autenticação

- [ ] **`POST /users`** — registro
  ```json
  { "name": "Guilherme Teste", "email": "teste@teste.com", "senha": "senha12345", "status": 1 }
  ```
  Espera: `201`, objeto sem `senha`, com `role: "user"`.

- [ ] **`POST /auth/login`**
  ```json
  { "email": "teste@teste.com", "senha": "senha12345" }
  ```
  Espera: `200`, `{ accessToken, user }`. **Guarda o `accessToken`** — todo
  passo daqui pra frente usa ele.

- [ ] 🔒 **`GET /user-config`** — confirma que nasceu sozinho no registro
  (sem precisar criar nada à parte). Espera `notify: 1`, `theme: 0`.

- [ ] 🔒 **`PATCH /user-config`** com `{ "theme": 1 }` — confirma que
  salva e `updateDate` muda.

---

## Fase 2 — Catálogos (confirma que o seed rodou certo)

- [ ] 🔒 `GET /relationships` → 6 linhas, anota o `idRelationship` de "Mãe"
- [ ] 🔒 `GET /diagnoses` → 5 linhas, anota o `idDiagnoses` de "TEA - Nível de suporte 2"
- [ ] 🔒 `GET /therapies` → 5 linhas, anota 1 `idTherapy`
- [ ] 🔒 `GET /allergies` → 4 linhas, anota 1 `idAllergies`
- [ ] 🔒 `GET /medications` → 3 linhas, anota 1 `idCurrentMedications`
- [ ] 🔒 `GET /library` → 5 linhas, anota 1 `idlibrary`

Todos devem vir com `qtt: 0` nessa fase — ninguém usou ainda.

---

## Fase 3 — Criança e prontuário

- [ ] 🔒 **`POST /children`** usando os ids anotados acima:
  ```json
  {
    "name": "Filho Teste",
    "dob": "2018-05-10",
    "relationshipIdRelationship": <id da Mãe>,
    "diagnosesIdDiagnoses": <id do TEA nível 2>
  }
  ```
  Espera `201`. **Anota o `idChildren`.**

- [ ] 🔒 **Verificação de efeito colateral**: `GET /relationships/:id` (o
  mesmo id da Mãe) → `qtt` deve ter subido pra `1`. Mesma checagem em
  `GET /diagnoses/:id` do diagnóstico usado.

- [ ] 🔒 `GET /children` → deve listar só essa criança.

- [ ] 🔒 **`POST /children/:childId/clinical-data`**:
  ```json
  {
    "familyHistory": "Sem histórico relevante",
    "observations": "Acompanhamento desde os 3 anos",
    "therapyIdTherapy": <id anotado>,
    "allergiesIdAllergies": <id anotado>
  }
  ```
  Espera `201`. Confirma em `GET /therapies/:id` e `GET /allergies/:id`
  que os `qtt` subiram pra `1`.

- [ ] 🔒 `GET /children/:childId/clinical-data` → confirma os dados salvos.

- [ ] 🔒 Tenta **`POST /children/:childId/clinical-data` de novo** (mesma
  criança) → espera `409 Conflict` ("já tem prontuário").

---

## Fase 4 — Medicamentos e prescrições

- [ ] 🔒 **`POST /children/:childId/prescriptions`**:
  ```json
  {
    "medicationsIdCurrentMedications": <id anotado>,
    "frequency": "2x ao dia",
    "status": 1,
    "startDate": "2026-10-01",
    "endDate": "2026-12-01"
  }
  ```
  Espera `201`. Confirma em `GET /medications/:id` que `qtt` subiu.

- [ ] 🔒 `GET /children/:childId/prescriptions` → lista a prescrição.

- [ ] 🔒 `PATCH /children/:childId/prescriptions/:medicationId` com
  `{ "status": 0 }` → confirma que atualizou sem mexer no `qtt`.

---

## Fase 5 — Agenda (appointments → calendar → notify)

- [ ] 🔒 **`POST /children/:childId/appointments`**:
  ```json
  {
    "appointmentDateTime": "2026-11-10T14:00:00.000Z",
    "reason": "Consulta de rotina",
    "local": "Clínica X",
    "notes": "Levar exames anteriores"
  }
  ```
  Espera `201`, `status: "agendado"`. **Anota o `idAppointments`.**

- [ ] 🔒 **`GET /calendar`** → deve aparecer 1 entrada criada
  automaticamente, mesma data/status do appointment. **Anota o
  `idCalendar`.**

- [ ] 🔒 **`PATCH /appointments/:id`** com `{ "status": "confirmado" }` →
  confirma em `GET /calendar/:idCalendar` que o status sincronizou.

- [ ] 🔒 **`POST /notify`**:
  ```json
  {
    "calendarIdCalendar": <id anotado>,
    "notifyDate": "2026-11-09T14:00:00.000Z",
    "descript": "Lembrete 1 dia antes"
  }
  ```
  Espera `201`.

- [ ] 🔒 `GET /notify/calendar/:calendarId` → lista o lembrete criado.

- [ ] 🔒 **`DELETE /appointments/:id`** → confirma (via `GET /calendar` e
  `GET /notify/calendar/:id`, que agora deve dar `404` porque o
  calendar sumiu) que a cascata de exclusão funcionou.

---

## Fase 6 — Direitos e benefícios

- [ ] 🔒 **`POST /rights-and-benefits`**:
  ```json
  {
    "title": "Passe livre",
    "category": "transporte",
    "type": "passe_livre",
    "descript": "Passe livre interestadual",
    "status": 1
  }
  ```
  Espera `201`.

- [ ] 🔒 `GET /rights-and-benefits` → lista o que criou.

- [ ] 🔒 Tenta `category: "categoria_invalida"` → espera `400` (confirma
  que o `ValidationPipe` + `@IsIn` estão funcionando de verdade).

---

## Fase 7 — Fórum (precisa de 1 promoção manual a admin)

- [ ] **Promove seu usuário a admin direto no banco** (sem endpoint pra
  isso, de propósito):
  ```sql
  UPDATE User SET role = 'admin' WHERE idUser = <seu id>;
  ```
- [ ] 🔒 **Faz login de novo** (o token antigo não tem o `role` novo).

- [ ] 🔒 **`POST /forum`** (agora como admin):
  ```json
  { "title": "Dicas do dia a dia", "diagnosesIdDiagnoses": <id do TEA nível 2>, "descript": "Trocas de experiência" }
  ```
  Espera `201`. **Anota o `idForum`.**

- [ ] 🔒 `GET /diagnoses/:id/forum` → deve listar esse fórum (seu usuário
  tem acesso porque seu filho tem esse diagnóstico).

- [ ] 🔒 **`POST /forum/:id/comments`** com `{ "content": "Primeiro comentário" }`
  → `201`. **Anota o `idComments`.**

- [ ] 🔒 **`POST /comments/:id/likes`** → `201`. Tenta de novo → `409`
  (já curtiu).

- [ ] 🔒 `GET /comments/:id/likes` → `{ "count": 1 }`.

- [ ] 🔒 `PATCH /comments/:id` com novo `content` → confirma que edita
  normalmente dentro da janela de 3h.

- [ ] **Teste negativo de acesso**: cria um segundo usuário (sem filho
  com esse diagnóstico) e tenta `GET /forum/:id` com o token dele →
  espera `403`.

---

## Fase 8 — Biblioteca de documentos

- [ ] 🔒 **`POST /children/:childId/media`** — no Postman, usar
  `form-data` (não JSON): campos `title`, `descript`,
  `libraryIdlibrary` como texto, e `file` como tipo "File" (sobe um PDF
  ou imagem de teste). Espera `201`.

- [ ] 🔒 `GET /children/:childId/media` → lista o documento.

- [ ] 🔒 `GET /media/:id/file` → deve baixar/exibir o arquivo (testa no
  navegador colando a URL com o token, ou no Postman clicando em "Send
  and Download").

- [ ] 🔒 `DELETE /media/:id` → confirma que o arquivo sumiu também da
  pasta `uploads/media` no disco, não só do banco.

---

## Fase 9 — Assistente de IA

- [ ] 🔒 **`POST /ai-assistant/ask`**:
  ```json
  { "question": "Quais atividades ajudam na rotina de uma criança com TEA?" }
  ```
  Espera `201`, com `answer` preenchido pela Gemini.

- [ ] 🔒 `GET /ai-assistant/history` → lista a pergunta/resposta.

- [ ] 🔒 **Teste do limite diário**: repete o `POST /ai-assistant/ask`
  mais 10 vezes (11 no total) → a 11ª deve dar `400` com a mensagem de
  limite atingido.

---

## Fase 10 — Segurança (testes negativos, os mais importantes)

- [ ] Qualquer rota 🔒 **sem** header `Authorization` → espera `401`.
- [ ] Rota `@Roles('admin')` (ex: `POST /forum`) com o token do usuário
  **sem** role admin → espera `403`.
- [ ] `GET /children/:id` usando o `id` de uma criança de **outro**
  usuário → espera `404` (não `403` — não confirma nem que existe).
- [ ] `POST /users` com `email` repetido → espera `409`.
- [ ] `POST /users` com body faltando `senha` → espera `400`
  (confirma `ValidationPipe` rejeitando corpo incompleto).
- [ ] `POST /users` com um campo extra que não existe no DTO (ex:
  `isAdmin: true`) → espera `400` (`forbidNonWhitelisted` em ação —
  prova que ninguém consegue se auto-promover a admin pelo body).

---

## Se algo quebrar

Copia e cola aqui pra mim: o endpoint exato, o body que mandou, e a
resposta completa (status + JSON de erro). Com isso eu já sei onde
olhar sem precisar pedir mais contexto.
