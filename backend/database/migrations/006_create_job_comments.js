exports.up = function(knex) {
  return knex.schema.createTable('job_comments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('job_id').notNullable().references('id').inTable('jobs').onDelete('CASCADE');
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('content').notNullable();
    t.timestamps(true, true);
    t.index('job_id');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('job_comments');
