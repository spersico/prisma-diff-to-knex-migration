import { writeFile } from 'node:fs/promises';
import type { IdentifyResult } from 'sql-query-identifier/lib/defines.js';

const knexMigrationTemplate = (style: 'mjs' | 'js' = 'mjs') => {
  const oldStyle = style === 'js';

  return `/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
${
  oldStyle
    ? 'exports.up = async function(knex) {'
    : 'export async function up(knex) {'
}
  // Add your up migration SQL here
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
${
  oldStyle
    ? 'exports.down = function(knex) {'
    : 'export async function down(knex) {'
}
  // Add your down migration SQL here
}
`;
};

export function generateKnexMigrationContent(
  parsedSQL: IdentifyResult[],
  knexMigrationStyle: 'mjs' | 'js' = 'mjs',
): string {
  if (!parsedSQL.length) return knexMigrationTemplate(knexMigrationStyle);

  const sentences = parsedSQL
    .map(
      (parsed) => `await knex.raw(\`
${parsed.text.replace(/`/g, '\\`')}
\`);`,
    )
    .join('\n\n  ');

  return knexMigrationTemplate(knexMigrationStyle).replace(
    '// Add your up migration SQL here',
    sentences,
  );
}

/**
 * Identifies the SQL queries and writes the knex migration file, in the final migration path
 * @param {MigrationData} prismaMigration - The migration data
 */
export async function knexMigrationWriter(
  prismaGeneratedSql: IdentifyResult[],
  filePath: string,
): Promise<string> {
  const style =
    filePath.endsWith('.mjs') || filePath.endsWith('.ts') ? 'mjs' : 'js';
  const knexMigration = generateKnexMigrationContent(prismaGeneratedSql, style);
  await writeFile(filePath, knexMigration);
  console.log(`> Updated migration file with Prisma's SQL:`, filePath);
  return knexMigration;
}
