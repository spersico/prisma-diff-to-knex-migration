/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
ALTER TABLE "Article" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
`);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Add your down migration SQL here
}
