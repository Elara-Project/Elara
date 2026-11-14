// Erro de chave estrangeira ao EXCLUIR uma linha ainda referenciada por outra
// tabela (MySQL/MariaDB: errno 1451, code ER_ROW_IS_REFERENCED_2).
//
// Por que percorrer a cadeia `cause`: versões novas do drizzle-orm embrulham o
// erro do driver em um DrizzleQueryError, com o erro original em `.cause`;
// versões antigas lançam o erro do mysql2 direto. Aceitar os dois formatos
// evita que um `npm update` do drizzle quebre o 409 silenciosamente.
export function isForeignKeyViolation(error: unknown): boolean {
  let current: any = error;
  for (let depth = 0; current && depth < 5; depth++) {
    if (current.errno === 1451 || current.code === 'ER_ROW_IS_REFERENCED_2') {
      return true;
    }
    current = current.cause;
  }
  return false;
}
