exports.up = function(knex) {
  return knex.schema.createTable('hr_flags', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('flagged_person_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('flagged_by_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('reason').notNullable();
    t.enum('severity',['ADVISORY','WARNING','SERIOUS']).defaultTo('ADVISORY');
    t.text('details');
    t.string('recommended_action');
    t.enum('status',['ACTIVE','RESOLVED','ESCALATED']).defaultTo('ACTIVE');
    t.string('month').notNullable();
    t.timestamp('resolved_at');
    t.uuid('resolved_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamps(true, true);
    t.index('flagged_person_id');
    t.index('month');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('hr_flags');
