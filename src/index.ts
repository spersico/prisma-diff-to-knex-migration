import { buildSqlFromPrismaSchema } from './prismaSchemaSqlDiffGenerator.js';
import {
  knexMigrationWriter,
  generateKnexMigrationContent,
} from './knexMigrationWriter.js';

/**
 * This command creates/updates a knex migration file based on the Prisma schema diff and a knex migration file path
 * @returns the SQL diff
 */
async function prismaDiffToKnexMigration(params: {
  output: 'console' | 'file';
  migrationPath: string;
}): Promise<string> {
  try {
    const sql = await buildSqlFromPrismaSchema();

    if (params.output === 'console') {
      console.log(sql);
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
