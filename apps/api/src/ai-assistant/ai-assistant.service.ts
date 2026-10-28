import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { and, desc, eq, gte } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module';
import type { DrizzleDb } from '../db/drizzle.module';
import { aiAssistant } from '../db/schema';

const DAILY_QUESTION_LIMIT = 10;

// Prompt fixo — não vem do client, nunca é editável por request. Isso é
// de propósito: é o que garante que TODA pergunta passe pelo mesmo aviso
// de "não substitui profissional de saúde", mesmo que o front tenha um
// bug ou alguém tente contornar isso manipulando a chamada da API.
const SYSTEM_PROMPT = `Você é um assistente de apoio a pais e responsáveis por
crianças com deficiência, incluindo autismo. Seu papel é oferecer
informações gerais, acolhimento e orientação prática do dia a dia.

Você NUNCA substitui uma avaliação, diagnóstico ou tratamento de um
profissional de saúde (médico, terapeuta, psicólogo, fonoaudiólogo etc).
Sempre que a pergunta envolver decisão clínica, ajuste de medicação, ou
qualquer sintoma preocupante, oriente claramente a buscar um profissional
qualificado antes de agir.

Seja empático, direto e evite jargão técnico desnecessário.`;

@Injectable()
export class AiAssistantService {
  private readonly client: GoogleGenAI;

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {
    // Falha rápido na inicialização se a chave não existir, em vez de
    // deixar todo POST /ai-assistant/ask quebrar silenciosamente depois.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não definida no .env');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async ask(userIdUser: number, question: string) {
    await this.assertUnderDailyLimit(userIdUser);

    let answerText: string;
    try {
      const response = await this.client.models.generateContent({
        // Flash-Lite não-preview: modelo estável do tier grátis, sem risco
        // de ser descontinuado no meio do semestre como um "preview" pode.
        model: 'gemini-2.5-flash-lite',
        contents: question,
        config: { systemInstruction: SYSTEM_PROMPT },
      });
      answerText = response.text ?? '';
    } catch (error) {
      // Nunca gravamos linha nenhuma se a chamada de IA falhou — não faz
      // sentido salvar "pergunta sem resposta" no histórico do usuário.
      throw new InternalServerErrorException('Não foi possível consultar o assistente agora');
    }

    const result = await this.db.insert(aiAssistant).values({
      userIdUser,
      questions: question,
      answer: answerText,
      dateTime: new Date(),
    });

    return this.findOne(result[0].insertId);
  }

  async findHistory(userIdUser: number) {
    return this.db
      .select()
      .from(aiAssistant)
      .where(eq(aiAssistant.userIdUser, userIdUser))
      .orderBy(desc(aiAssistant.dateTime));
  }

  private async findOne(idChat: number) {
    const [found] = await this.db.select().from(aiAssistant).where(eq(aiAssistant.idChat, idChat));
    return found;
  }

  private async assertUnderDailyLimit(userIdUser: number) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysQuestions = await this.db
      .select({ idChat: aiAssistant.idChat })
      .from(aiAssistant)
      .where(and(eq(aiAssistant.userIdUser, userIdUser), gte(aiAssistant.dateTime, startOfDay)));

    if (todaysQuestions.length >= DAILY_QUESTION_LIMIT) {
      throw new BadRequestException(
        `Limite de ${DAILY_QUESTION_LIMIT} perguntas por dia atingido. Tente novamente amanhã.`,
      );
    }
  }
}
