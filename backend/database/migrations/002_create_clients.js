exports.up = function(knex) {
  return knex.schema.createTable('clients', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable();
    t.string('email').unique();
    t.string('phone');
    t.string('logo_url');
    t.text('notes');
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('clients');
