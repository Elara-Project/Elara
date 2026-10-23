import 'dotenv/config';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { mode: 'default' });
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations aplicadas com sucesso');
  await connection.end();
}

main().catch((error) => {
  console.error('Erro na migration:', error);
  process.exit(1);
});