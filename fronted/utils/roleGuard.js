export const ROLE_PAGES = {
  ADMIN:    ['dashboard','jobs','kanban','timeline','workload','daily-closure','weekly-closure','monthly-performance','team','clients','departments','settings'],
  MANAGER:  ['dashboard','jobs','kanban','timeline','workload','daily-closure','weekly-closure','monthly-performance','team','clients','settings'],
  EMPLOYEE: ['dashboard','jobs'],
  HR:       ['dashboard','monthly-performance','daily-closure','weekly-closure'],
};

export const canAccess = (role, page) => ROLE_PAGES[role]?.includes(page) ?? false;
export const isAdmin   = (role) => role === 'ADMIN';
export const isManager = (role) => ['ADMIN','MANAGER'].includes(role);
export const isHR      = (role) => ['ADMIN','MANAGER','HR'].includes(role);
