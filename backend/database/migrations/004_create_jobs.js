exports.up = function(knex) {
  return knex.schema.createTable('jobs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('title').notNullable();
    t.text('description');
    t.enum('type',['DESIGN','DEVELOPMENT','ANIMATION','COPYWRITING','VIDEO_EDITING','PERFORMANCE_MARKETING','SMM','STRATEGY','RESEARCH','REPORTING','OTHER']).defaultTo('OTHER');
    t.enum('status',['PENDING','ACTIVE','AT_RISK','OVERDUE','PAUSED','IN_REVIEW','COMPLETE']).defaultTo('PENDING');
    t.enum('priority',['HIGH','MEDIUM','LOW']).defaultTo('MEDIUM');
    t.integer('scope_hours').notNullable();
    t.integer('working_days').notNullable();
    t.integer('story_points');
    t.integer('progress').defaultTo(0);
    t.uuid('client_id').references('id').inTable('clients').onDelete('SET NULL');
    t.uuid('assignee_id').references('id').inTable('users').onDelete('SET NULL');
    t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    t.string('milestones');
    t.timestamp('start_date');
    t.timestamp('due_date').notNullable();
    t.timestamp('accepted_at');
    t.timestamp('completed_at');
    t.timestamps(true, true);
    t.index('status');
    t.index('assignee_id');
    t.index('client_id');
    t.index('due_date');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('jobs');
