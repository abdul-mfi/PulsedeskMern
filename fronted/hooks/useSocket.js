'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSocket } from '../lib/socket';
import { upsertJob, removeJob, updateStatus } from '../store/slices/jobsSlice';
import { addNotif } from '../store/slices/notificationsSlice';

export const useSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('job:created',       (job) => dispatch(upsertJob(job)));
    socket.on('job:updated',       (job) => dispatch(upsertJob(job)));
    socket.on('job:accepted',      (job) => dispatch(upsertJob(job)));
    socket.on('job:completed',     (job) => dispatch(upsertJob(job)));
    socket.on('job:deleted',       ({id}) => dispatch(removeJob(id)));
    socket.on('job:status:change', (data) => dispatch(updateStatus(data)));
    socket.on('notification:new',  (n) => dispatch(addNotif(n)));

    return () => {
      socket.off('job:created');
      socket.off('job:updated');
      socket.off('job:accepted');
      socket.off('job:completed');
      socket.off('job:deleted');
      socket.off('job:status:change');
      socket.off('notification:new');
    };
  }, [dispatch]);
};
