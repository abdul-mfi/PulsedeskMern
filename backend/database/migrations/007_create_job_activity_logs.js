exports.up = function(knex) {
  return knex.schema.createTable('job_activity_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('job_id').references('id').inTable('jobs').onDelete('CASCADE');
    t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('action').notNullable();
    t.jsonb('details');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index('job_id');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('job_activity_logs');
