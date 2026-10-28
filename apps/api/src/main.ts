import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // SEM ISSO, todo @IsString()/@IsEmail()/@IsInt() dos DTOs não faz nada —
  // é o pipe que de fato executa a validação em cada request.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta qualquer campo no body que não esteja no DTO
      forbidNonWhitelisted: true, // e dá erro 400 se vier campo estranho, em vez de ignorar em silêncio
      transform: true, // converte string->number/Date automaticamente (ex: query params, @Param com ParseIntPipe já cobre isso, mas isso ajuda em outros casos)
    }),
  );

  // apps/web fica na porta padrão do Next.js (3000) — por isso a api
  // NÃO pode usar 3000 também (ver PORT abaixo). Ajuste WEB_ORIGIN no
  // .env se o front um dia rodar em outra porta/domínio.
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  // 3001 por padrão — nunca 3000, porque essa já é a porta do apps/web.
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API rodando em http://localhost:${port}`);
}
bootstrap();
