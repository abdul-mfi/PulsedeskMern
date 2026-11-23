exports.up = function(knex) {
  return knex.schema.createTable('departments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable().unique();
    t.string('description');
    t.string('color').defaultTo('#4F46E5');
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('departments');
