import { writeFile } from 'node:fs/promises';

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
  sql: string,
  knexMigrationStyle: 'mjs' | 'js' = 'mjs',
): string {
  if (!sql.length) return knexMigrationTemplate(knexMigrationStyle);

  return knexMigrationTemplate(knexMigrationStyle).replace(
    '// Add your up migration SQL here',
    `await knex.raw(\`
    ${sql.replace(/`/g, '\\`')}
    \`);`,
  );
}

/**
 * Identifies the SQL queries and writes the knex migration file, in the final migration path
 * @param {MigrationData} prismaMigration - The migration data
 */
export async function knexMigrationWriter(
  prismaGeneratedSql: string,
  filePath: string,
): Promise<string> {
  const style =
    filePath.endsWith('.mjs') || filePath.endsWith('.ts') ? 'mjs' : 'js';
  const knexMigration = generateKnexMigrationContent(prismaGeneratedSql, style);
  await writeFile(filePath, knexMigration);
  console.log(`> Updated migration file with Prisma's SQL:`, filePath);
  return knexMigration;
}
