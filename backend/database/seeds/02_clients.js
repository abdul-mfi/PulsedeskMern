exports.seed = async function(knex) {
  await knex('clients').del();
  await knex('clients').insert([
    { id: knex.raw('gen_random_uuid()'), name: 'Afia Younus',        email: 'afia@client.com' },
    { id: knex.raw('gen_random_uuid()'), name: 'myJmart',            email: 'contact@myjmart.com' },
    { id: knex.raw('gen_random_uuid()'), name: 'Pickleball Kingdom', email: 'pk@pickleball.in' },
    { id: knex.raw('gen_random_uuid()'), name: 'Signature Global',   email: 'marketing@signatureglobal.in' },
    { id: knex.raw('gen_random_uuid()'), name: "WORK In's",          email: 'hello@workins.app' },
    { id: knex.raw('gen_random_uuid()'), name: 'Last Rodeo',         email: 'brand@lastrodeo.com' },
    { id: knex.raw('gen_random_uuid()'), name: 'Mind Frame India',   email: 'internal@mindframeindia.com' },
    { id: knex.raw('gen_random_uuid()'), name: 'ARSH-e-SADA',        email: 'arsh@sada.com' },
  ]);
};
