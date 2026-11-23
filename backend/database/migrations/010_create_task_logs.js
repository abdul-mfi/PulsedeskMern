exports.up = function(knex) {
  return knex.schema.createTable('task_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('daily_log_id').notNullable().references('id').inTable('daily_logs').onDelete('CASCADE');
    t.string('task_name').notNullable();
    t.float('planned_hours').defaultTo(0);
    t.float('actual_hours').defaultTo(0);
    t.integer('completion').defaultTo(0);
    t.string('priority');
    t.text('notes');
    t.string('client_name');
    t.string('status');
    t.timestamps(true, true);
    t.index('daily_log_id');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('task_logs');
