import API from "./api";

export const login = async (email, password) => {
  const { data } = await API.post("/auth/login", { email, password });
  localStorage.setItem("accessToken", data.data.accessToken);
  localStorage.setItem("refreshToken", data.data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.data.user));
  return data.data;
};

export const logout = async () => {
  try {
    await API.post("/auth/logout", {
      refreshToken: localStorage.getItem("refreshToken"),
    });
  } catch (e) {}
  localStorage.clear();
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const isLoggedIn = () => !!getUser();
