const bcrypt = require('bcryptjs');
exports.seed = async function(knex) {
  await knex('users').del();
  const password = await bcrypt.hash('Welcome@123', 12);
  await knex('users').insert([
    { id: knex.raw('gen_random_uuid()'), name: 'Mir Shahnawaz Ali', email: 'admin@mindframeindia.com',  password, role: 'ADMIN',    designation: 'Admin · Owner',      color: '#4F46E5', initials: 'MS' },
    { id: knex.raw('gen_random_uuid()'), name: 'Zara Hussain',      email: 'zara@mindframeindia.com',   password, role: 'MANAGER',  designation: 'Project Manager',    color: '#7C3AED', initials: 'ZH' },
    { id: knex.raw('gen_random_uuid()'), name: 'Raza Ahmed',        email: 'raza@mindframeindia.com',   password, role: 'EMPLOYEE', designation: 'Senior Developer',   color: '#4F46E5', initials: 'RA' },
    { id: knex.raw('gen_random_uuid()'), name: 'Priya Sharma',      email: 'priya@mindframeindia.com',  password, role: 'EMPLOYEE', designation: 'Lead Designer',      color: '#7C3AED', initials: 'PS' },
    { id: knex.raw('gen_random_uuid()'), name: 'Kiran Mehta',       email: 'kiran@mindframeindia.com',  password, role: 'EMPLOYEE', designation: 'Perf. Marketer',     color: '#059669', initials: 'KM' },
    { id: knex.raw('gen_random_uuid()'), name: 'Fatima Noor',       email: 'fatima@mindframeindia.com', password, role: 'EMPLOYEE', designation: 'Animator',           color: '#CA8A04', initials: 'FN' },
    { id: knex.raw('gen_random_uuid()'), name: 'Sara Khan',         email: 'sara@mindframeindia.com',   password, role: 'EMPLOYEE', designation: 'CSE',                color: '#16A34A', initials: 'SK' },
    { id: knex.raw('gen_random_uuid()'), name: 'Omar Shaikh',       email: 'omar@mindframeindia.com',   password, role: 'EMPLOYEE', designation: 'Animator',           color: '#0EA5E9', initials: 'OS' },
    { id: knex.raw('gen_random_uuid()'), name: 'Arjun Patel',       email: 'arjun@mindframeindia.com',  password, role: 'EMPLOYEE', designation: 'Developer',          color: '#DC2626', initials: 'AP' },
    { id: knex.raw('gen_random_uuid()'), name: 'Anil Rao',          email: 'anil@mindframeindia.com',   password, role: 'EMPLOYEE', designation: 'SMM Specialist',     color: '#D946EF', initials: 'AR' },
    { id: knex.raw('gen_random_uuid()'), name: 'HR Manager',        email: 'hr@mindframeindia.com',     password, role: 'HR',       designation: 'HR Manager',         color: '#BE123C', initials: 'HR' },
  ]);
  console.log('✅ Users seeded — password: Welcome@123');
};
