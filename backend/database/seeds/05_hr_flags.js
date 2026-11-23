exports.seed = async function(knex) {
  await knex('award_nominations').del();
  await knex('hr_flags').del();
  const admin = await knex('users').where('email','admin@mindframeindia.com').first();
  const anil  = await knex('users').where('email','anil@mindframeindia.com').first();
  const raza  = await knex('users').where('email','raza@mindframeindia.com').first();
  if (admin && anil) {
    await knex('hr_flags').insert({ flagged_person_id: anil.id, flagged_by_id: admin.id, reason: 'Repeated non-submission of daily reports', severity: 'ADVISORY', details: 'Missed 3 of 5 days in Week 2 of September.', recommended_action: 'One-on-one with manager', month: '2026-09', status: 'ACTIVE' });
  }
  if (admin && raza) {
    await knex('award_nominations').insert({ nominated_id: raza.id, nominated_by_id: admin.id, category: 'STAR_PERFORMER', reason: '3 jobs delivered on time. Zero deadline breaches.', month: '2026-09', status: 'APPROVED', approved_at: new Date() });
  }
  await knex('workspace_settings').del();
  await knex('workspace_settings').insert([
    { key: 'appName',    value: 'PulseDesk' },
    { key: 'brandColor', value: '#4F46E5' },
    { key: 'logoUrl',    value: '' },
  ]);
  console.log('✅ HR flags, awards, workspace settings seeded');
};
