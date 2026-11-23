exports.up = function(knex) {
  return knex.schema.createTable('refresh_tokens', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('token').notNullable().unique();
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('expires_at').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index('token');
    t.index('user_id');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('refresh_tokens');
