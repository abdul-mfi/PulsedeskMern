exports.up = function(knex) {
  return knex.schema.createTable('notifications', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('title').notNullable();
    t.text('message').notNullable();
    t.enum('type',['INFO','WARNING','DANGER','SUCCESS']).defaultTo('INFO');
    t.boolean('is_read').defaultTo(false);
    t.string('link');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index('user_id');
    t.index('is_read');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('notifications');
