exports.seed = async function(knex) {
  await knex('job_activity_logs').del();
  await knex('milestones').del();
  await knex('jobs').del();

  const admin  = await knex('users').where('email','admin@mindframeindia.com').first();
  const raza   = await knex('users').where('email','raza@mindframeindia.com').first();
  const priya  = await knex('users').where('email','priya@mindframeindia.com').first();
  const kiran  = await knex('users').where('email','kiran@mindframeindia.com').first();
  const fatima = await knex('users').where('email','fatima@mindframeindia.com').first();
  const sara   = await knex('users').where('email','sara@mindframeindia.com').first();
  const omar   = await knex('users').where('email','omar@mindframeindia.com').first();
  const arjun  = await knex('users').where('email','arjun@mindframeindia.com').first();
  const anil   = await knex('users').where('email','anil@mindframeindia.com').first();

  const afia    = await knex('clients').where('email','afia@client.com').first();
  const myjmart = await knex('clients').where('email','contact@myjmart.com').first();
  const pk      = await knex('clients').where('email','pk@pickleball.in').first();
  const sig     = await knex('clients').where('email','marketing@signatureglobal.in').first();
  const workins = await knex('clients').where('email','hello@workins.app').first();
  const lr      = await knex('clients').where('email','brand@lastrodeo.com').first();
  const mfi     = await knex('clients').where('email','internal@mindframeindia.com').first();
  const arsh    = await knex('clients').where('email','arsh@sada.com').first();

  const jobs = [
    { title:'Brand Identity – Afia',        client_id:afia?.id,    assignee_id:raza?.id,   type:'DESIGN',                status:'OVERDUE',    priority:'HIGH',   scope_hours:84,  working_days:14, progress:45,  due_date:new Date('2026-09-11'), start_date:new Date('2026-09-01'), milestones:'Research,Concepts,Final,Delivery' },
    { title:'Website Redesign',             client_id:sig?.id,     assignee_id:raza?.id,   type:'DEVELOPMENT',           status:'AT_RISK',    priority:'HIGH',   scope_hours:126, working_days:21, progress:72,  due_date:new Date('2026-09-13'), start_date:new Date('2026-08-25'), milestones:'Wireframe,Design,Development,QA' },
    { title:'App Animation Pack',           client_id:workins?.id, assignee_id:omar?.id,   type:'ANIMATION',             status:'PENDING',    priority:'HIGH',   scope_hours:60,  working_days:10, progress:0,   due_date:new Date('2026-09-22'), milestones:'Storyboard,Animate,Review' },
    { title:'Social Content – myJmart',     client_id:myjmart?.id, assignee_id:priya?.id,  type:'SMM',                   status:'ACTIVE',     priority:'MEDIUM', scope_hours:42,  working_days:7,  progress:85,  due_date:new Date('2026-09-15'), start_date:new Date('2026-09-06'), milestones:'Plan,Create,Schedule' },
    { title:'Google Ads – PK India',        client_id:pk?.id,      assignee_id:kiran?.id,  type:'PERFORMANCE_MARKETING', status:'ACTIVE',     priority:'HIGH',   scope_hours:84,  working_days:14, progress:60,  due_date:new Date('2026-09-17'), start_date:new Date('2026-09-01'), milestones:'Research,Setup,Launch,Optimise' },
    { title:'myJmart Refer-Earn Dev',       client_id:myjmart?.id, assignee_id:arjun?.id,  type:'DEVELOPMENT',           status:'IN_REVIEW',  priority:'HIGH',   scope_hours:72,  working_days:12, progress:90,  due_date:new Date('2026-09-14'), start_date:new Date('2026-09-01'), milestones:'API,Frontend,Testing,Deploy' },
    { title:'ARSH-e-SADA Channel Launch',   client_id:arsh?.id,    assignee_id:fatima?.id, type:'VIDEO_EDITING',         status:'ACTIVE',     priority:'MEDIUM', scope_hours:120, working_days:20, progress:40,  due_date:new Date('2026-09-25'), start_date:new Date('2026-09-05'), milestones:'Script,Record,Edit,Publish' },
    { title:'Email Campaign – PK India',    client_id:pk?.id,      assignee_id:priya?.id,  type:'COPYWRITING',           status:'ACTIVE',     priority:'LOW',    scope_hours:60,  working_days:10, progress:30,  due_date:new Date('2026-09-20'), start_date:new Date('2026-09-08'), milestones:'Copy,Design,Test,Send' },
    { title:'Daily Stories – MFI',          client_id:mfi?.id,     assignee_id:anil?.id,   type:'SMM',                   status:'ACTIVE',     priority:'MEDIUM', scope_hours:42,  working_days:7,  progress:100, due_date:new Date('2026-09-12'), start_date:new Date('2026-09-06'), milestones:'Plan,Create,Post' },
    { title:'Meta Ads – myJmart',           client_id:myjmart?.id, assignee_id:kiran?.id,  type:'PERFORMANCE_MARKETING', status:'ACTIVE',     priority:'MEDIUM', scope_hours:72,  working_days:12, progress:55,  due_date:new Date('2026-09-18'), start_date:new Date('2026-09-03'), milestones:'Strategy,Creative,Launch,Report' },
    { title:'PK India Brand Brief',         client_id:pk?.id,      assignee_id:sara?.id,   type:'STRATEGY',              status:'PENDING',    priority:'MEDIUM', scope_hours:42,  working_days:7,  progress:0,   due_date:new Date('2026-09-19'), milestones:'Research,Draft,Present' },
    { title:'Reels – Last Rodeo',           client_id:lr?.id,      assignee_id:omar?.id,   type:'VIDEO_EDITING',         status:'AT_RISK',    priority:'HIGH',   scope_hours:48,  working_days:8,  progress:65,  due_date:new Date('2026-09-13'), start_date:new Date('2026-09-05'), milestones:'Shoot,Edit,Review,Post' },
    { title:'Client Reports Q3',            client_id:mfi?.id,     assignee_id:sara?.id,   type:'REPORTING',             status:'IN_REVIEW',  priority:'LOW',    scope_hours:30,  working_days:5,  progress:80,  due_date:new Date('2026-09-14'), start_date:new Date('2026-09-09'), milestones:'Gather,Compile,Review,Send' },
    { title:"API Integration – WORK In's",  client_id:workins?.id, assignee_id:arjun?.id,  type:'DEVELOPMENT',           status:'PAUSED',     priority:'MEDIUM', scope_hours:120, working_days:20, progress:20,  due_date:new Date('2026-09-27'), start_date:new Date('2026-09-05'), milestones:'Spec,Build,Test,Deploy' },
  ];

  for (const j of jobs) {
    const [jobId] = await knex('jobs').insert({ ...j, created_by: admin?.id, accepted_at: j.start_date || null }, ['id']);
    if (j.milestones) {
      const ms = j.milestones.split(',');
      await knex('milestones').insert(ms.map((title, i) => ({
        job_id: jobId.id, title: title.trim(), order_index: i,
        status: i / ms.length < j.progress / 100 ? 'DONE' : 'PENDING',
      })));
    }
  }
  console.log('✅ 14 jobs seeded');
};
