import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import jobsReducer from "./slices/jobsSlice";
import usersReducer from "./slices/usersSlice";
import clientsReducer from "./slices/clientsSlice";
import reportsReducer from "./slices/reportsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import uiReducer from "./slices/uiSlice";
import dailyLogsReducer from "./slices/dailyLogsSlice"; // ADD THIS
import hrReducer from "./slices/hrSlice"; // ADD THIS

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    users: usersReducer,
    clients: clientsReducer,
    reports: reportsReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
    dailyLogs: dailyLogsReducer, // ADD
    hr: hrReducer, // ADD
  },
});
