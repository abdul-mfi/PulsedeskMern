exports.seed = async function(knex) {
  await knex('departments').del();
  await knex('departments').insert([
    { id: knex.raw('gen_random_uuid()'), name: 'Management',      color: '#4F46E5' },
    { id: knex.raw('gen_random_uuid()'), name: 'Technology',      color: '#0EA5E9' },
    { id: knex.raw('gen_random_uuid()'), name: 'Creative',        color: '#7C3AED' },
    { id: knex.raw('gen_random_uuid()'), name: 'Marketing',       color: '#059669' },
    { id: knex.raw('gen_random_uuid()'), name: 'Client Services', color: '#16A34A' },
    { id: knex.raw('gen_random_uuid()'), name: 'Human Resources', color: '#BE123C' },
  ]);
};
