exports.up = function(knex) {
  return knex.schema.createTable('award_nominations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('nominated_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('nominated_by_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.enum('category',['STAR_PERFORMER','MOST_CONSISTENT','MOST_IMPROVED','BEST_CLIENT_DELIVERY','TEAM_PLAYER','ABOVE_AND_BEYOND']).notNullable();
    t.text('reason').notNullable();
    t.string('month').notNullable();
    t.enum('status',['PENDING','APPROVED','ANNOUNCED','REJECTED']).defaultTo('PENDING');
    t.timestamp('approved_at');
    t.timestamps(true, true);
    t.index('nominated_id');
    t.index('month');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('award_nominations');
