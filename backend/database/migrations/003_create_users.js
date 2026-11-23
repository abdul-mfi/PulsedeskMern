exports.up = function(knex) {
  return knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable();
    t.string('email').notNullable().unique();
    t.string('password').notNullable();
    t.enum('role', ['ADMIN','MANAGER','EMPLOYEE','HR']).defaultTo('EMPLOYEE');
    t.string('designation');
    t.uuid('department_id')
  .nullable()
  .references('id')
  .inTable('departments')
  .onDelete('SET NULL');
    t.string('color').defaultTo('#4F46E5');
    t.string('initials').notNullable();
    t.string('photo_url');
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
    t.index('email');
    t.index('role');
  });
};
exports.down = (knex) => knex.schema.dropTableIfExists('users');
