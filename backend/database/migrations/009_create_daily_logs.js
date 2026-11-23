exports.up = function(knex) {
  return knex.schema.createTable('daily_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.date('date').notNullable();
    t.timestamp('check_in_time');
    t.timestamp('check_out_time');
    t.enum('work_mode',['IN_OFFICE','WORK_FROM_HOME','CLIENT_SITE','FIELD']).defaultTo('IN_OFFICE');
    t.string('day_type');
    t.specificType('clients', 'text[]');
    t.string('priority_client');
    t.text('top_goals');
    t.text('blockers');
    t.integer('mood_score');
    t.text('accomplishments');
    t.text('pending_work');
    t.float('productive_hours');
    t.integer('day_rating');
    t.text('challenges');
    t.text('tomorrow_plan');
    t.text('flag_to_manager');
    t.enum('submission_status',['PENDING','PARTIAL','COMPLETE','MISSED']).defaultTo('PENDING');
    t.timestamps(true, true);
    t.unique(['user_id','date']);
    t.index('user_id');
    t.index('date');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('daily_logs');
