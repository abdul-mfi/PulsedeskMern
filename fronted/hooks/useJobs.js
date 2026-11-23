'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs, fetchStats, setFilter } from '../store/slices/jobsSlice';

export const useJobs = (filters = {}) => {
  const dispatch = useDispatch();
  const { list, stats, loading, filter } = useSelector(s => s.jobs);

  useEffect(() => { dispatch(fetchJobs(filters)); dispatch(fetchStats()); }, []);

  const filtered = filter === 'all' ? list : list.filter(j => j.status === filter);

  return { jobs: filtered, allJobs: list, stats, loading, filter, setFilter: (f) => dispatch(setFilter(f)) };
};
