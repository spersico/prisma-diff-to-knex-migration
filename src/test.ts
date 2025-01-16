import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function cleanupMigrationsFolder() {
  const migrationsPath = path.resolve('./migrations');
  try {
    await fs.rm(migrationsPath, { recursive: true, force: true });
    console.log('> Cleaned up previous test run.');
  } catch (error) {
    console.error('> Error cleaning up migrations folder:', error);
  }
}

async function runCommands() {
  try {
    const script = `npx knex migrate:make 'test' | npx tsx src/cli.ts`;
    console.log(`> About to run migration generator: ${script}`);
    const { stdout, stderr } = await execPromise(script);

    if (stderr) {
      console.error('> Error running Knex migration:', stderr);
      return null;
    }

    return stdout;
  } catch (error) {
    console.error('> Error running Knex migration:', error);
    return null;
  }
}

async function checkGeneratedMigrationFile(substring: string) {
  const migrationsPath = path.resolve('./migrations');
  try {
    const files = await fs.readdir(migrationsPath);
    const migrationFile = files.find((file) => file.includes('test'));

    if (!migrationFile) {
      console.error('> Migration file not found.');
      return false;
    }

    const migrationFilePath = path.join(migrationsPath, migrationFile);
    const migrationContent = await fs.readFile(migrationFilePath, 'utf-8');

    if (migrationContent.includes(substring)) {
      console.log('> Migration file contains the given substring.');
      return true;
    } else {
      console.error('> Migration file does not contain the given substring.');
      return false;
    }
  } catch (error) {
    console.error('> Error checking migration file:', error);
    return false;
  }
}

const expectedGeneratedSQL =
  'ALTER TABLE "Article" ADD COLUMN     "testField" TEXT;';

async function cliTest() {
  console.log('\n> Running CLI test...');
  await cleanupMigrationsFolder();
  await runCommands();
  const result = await checkGeneratedMigrationFile(expectedGeneratedSQL);

  if (result) {
    console.log('\x1b[32m%s\x1b[0m', '> Test passed.');
  } else {
    console.error('\x1b[31m%s\x1b[0m', '> Test failed.');
    process.exit(1);
  }
}

async function programaticTest() {
  console.log('\n> Running programatic test...');
  const library = await import('./index.js');
  const sql = await library.buildSqlFromPrismaSchema();
  const migrationContent = await library.generateKnexMigrationContent(sql);

  const result = migrationContent.includes(expectedGeneratedSQL);

  if (result) {
    console.log('\x1b[32m%s\x1b[0m', '> Test passed.');
  } else {
    console.error('\x1b[31m%s\x1b[0m', '> Test failed.');
    process.exit(1);
  }
}

async function executeTests() {
  await cliTest();
  await programaticTest();
  console.log('\x1b[32m%s\x1b[0m', '> All Tests passed.');
  process.exit(0);
}

executeTests();
