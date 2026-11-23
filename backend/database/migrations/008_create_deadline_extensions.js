exports.up = function(knex) {
  return knex.schema.createTable('deadline_extensions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('job_id').notNullable().references('id').inTable('jobs').onDelete('CASCADE');
    t.uuid('requested_by').references('id').inTable('users').onDelete('SET NULL');
    t.text('reason').notNullable();
    t.timestamp('original_due_date').notNullable();
    t.timestamp('proposed_due_date').notNullable();
    t.enum('status',['PENDING','APPROVED','REJECTED']).defaultTo('PENDING');
    t.timestamp('approved_at');
    t.timestamps(true, true);
    t.index('job_id');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('deadline_extensions');
