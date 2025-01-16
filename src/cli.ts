import { prismaDiffToKnexMigration } from './index.js';

/**
 * Executes the migration generation from the command line
 *
 * This intercepts the knex migration piped output and extracts the migration path,
 * then, it pulls the SQL diff from Prisma and writes it to the migration file as a starting point.
 *
 * Example usage: `npx knex migrate:make EXAMPLE_NAME | npx prisma-diff-to-knex-migration`
 */
function executeFromCommandLine() {
  const args = process.argv.slice(2);

  const timeoutTimer = setTimeout(() => {
    console.error(
      '> Timeout: Could not extract migration path from Knex output. Are you piping the output from `knex migrate:make SOME_MIGRATION_NAME`?',
    );
    process.exit(1);
  }, 5000);

  let stdinData = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', (chunk) => {
    stdinData += chunk;
  });

  process.stdin.on('end', async () => {
    clearTimeout(timeoutTimer);

    const migrationPathMatch = stdinData.match(/Created Migration: (.+)/);

    if (!migrationPathMatch) {
      console.error(
        '> Could not extract migration path from Knex output. Maybe the knex migration failed?. Are you piping the output from `knex migrate:make SOME_MIGRATION_NAME`',
      );
      throw new Error('Migration path not found');
    }

    const migrationPath = migrationPathMatch[1].trim();
    console.log('> Migration path:', migrationPath);

    const output = args.indexOf('--console-output') !== -1 ? 'console' : 'file';

    await prismaDiffToKnexMigration({ output, migrationPath });
    process.exit(0);
  });
}

executeFromCommandLine();
