import 'dotenv/config';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';

async function main() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl:
      process.env.TIDB_ENABLE_SSL === 'true'
        ? { minVersion: 'TLSv1.2' }
        : undefined,
  });
  const db = drizzle(connection, { mode: 'default' });
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations aplicadas com sucesso');
  await connection.end();
}

main().catch((error) => {
  console.error('Erro na migration:', error);
  process.exit(1);
});
