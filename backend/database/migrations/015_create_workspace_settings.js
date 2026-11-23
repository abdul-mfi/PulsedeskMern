exports.up = function(knex) {
  return knex.schema.createTable('workspace_settings', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('key').notNullable().unique();
    t.text('value');
    t.timestamps(true, true);
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('workspace_settings');
