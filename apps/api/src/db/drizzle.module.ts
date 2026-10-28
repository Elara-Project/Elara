import { Global, Module } from '@nestjs/common';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Token de injeção — como não dá pra usar uma classe como provider aqui
// (drizzle() retorna um objeto, não uma classe), usamos um Symbol único.
export const DRIZZLE = Symbol('DRIZZLE');

// @Global() evita ter que importar DrizzleModule em cada módulo de feature
// (users, children, forum...). Basta importar uma vez no AppModule.
@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: async () => {
        const pool = mysql.createPool({
          uri: process.env.DATABASE_URL,
        });
        return drizzle(pool, { schema, mode: 'default' });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}

// Tipo utilitário pra tipar a injeção nos services, ex:
// constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}
export type DrizzleDb = MySql2Database<typeof schema>;
