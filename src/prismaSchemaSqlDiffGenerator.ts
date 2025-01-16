import { exec } from 'child_process';
import { identify } from 'sql-query-identifier';
import type { IdentifyResult } from 'sql-query-identifier/lib/defines.js';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function buildSqlFromPrismaSchema(
  schemaPath: string = './prisma/schema.prisma',
): Promise<IdentifyResult[]> {
  console.log('> Fetching SQL from Prisma...');
  const script = `npx prisma migrate diff --from-schema-datasource ${schemaPath} --to-schema-datamodel ${schemaPath} --script`;

  const { stderr: prismaStderr, stdout: prismaStdout } =
    await execPromise(script);

  if (prismaStderr) {
    console.error('> Error fetching SQL from Prisma:', prismaStderr);
    return;
  }
  const sql: IdentifyResult[] = identify(prismaStdout);
  return sql;
}
