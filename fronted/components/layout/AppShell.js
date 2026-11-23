"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Provider, useDispatch } from "react-redux";
import { store } from "../../store";
import { fetchMe } from "../../store/slices/authSlice";
import Sidebar from "./Sidebar";
import Toast from "../ui/Toast";
import { useSocket } from "../../hooks/useSocket";
import { getUser } from "../../lib/auth";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return children;
}

function Inner({ children }) {
  useSocket();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-56 overflow-y-auto bg-gray-50">
        {children}
      </main>
      <Toast />
    </div>
  );
}

export default function AppShell({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <Inner>{children}</Inner>
      </AuthInitializer>
    </Provider>
  );
}
