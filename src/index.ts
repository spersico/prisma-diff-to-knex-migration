import { buildSqlFromPrismaSchema } from './prismaSchemaSqlDiffGenerator.js';
import {
  knexMigrationWriter,
  generateKnexMigrationContent,
} from './knexMigrationWriter.js';
import type { IdentifyResult } from 'sql-query-identifier/lib/defines.js';

/**
 * This command creates/updates a knex migration file based on the Prisma schema diff and a knex migration file path
 * @returns the SQL diff
 */
async function prismaDiffToKnexMigration(params: {
  output: 'console' | 'file';
  migrationPath: string;
}): Promise<IdentifyResult[]> {
  try {
    const sql = await buildSqlFromPrismaSchema();

    if (params.output === 'console') {
      console.log(sql.map((s) => s.text).join('\n'));
    } else {
      await await knexMigrationWriter(sql, params.migrationPath);
    }
    return sql;
  } catch (error) {
    console.error('> Error deploying migration:', error);
  }
}

export {
  prismaDiffToKnexMigration,
  buildSqlFromPrismaSchema,
  generateKnexMigrationContent,
  knexMigrationWriter,
};
