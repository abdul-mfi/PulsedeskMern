exports.up = function(knex) {
  return knex.schema.createTable('milestones', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('job_id').notNullable().references('id').inTable('jobs').onDelete('CASCADE');
    t.string('title').notNullable();
    t.enum('status',['PENDING','IN_PROGRESS','DONE']).defaultTo('PENDING');
    t.timestamp('due_date');
    t.integer('order_index').defaultTo(0);
    t.timestamps(true, true);
    t.index('job_id');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('milestones');
