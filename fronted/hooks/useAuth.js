'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginThunk, logoutThunk } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router   = useRouter();
  const { user, loading, error } = useSelector(s => s.auth);

  const login = async (email, password) => {
    const res = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(res)) router.push('/dashboard');
    return res;
  };

  const logout = async () => {
    await dispatch(logoutThunk());
    router.push('/login');
  };

  return { user, loading, error, login, logout };
};
