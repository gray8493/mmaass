import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';
import {
  subscribeTasks,
  getTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../services/taskService';

export const useTasks = (teamIds: string[]) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isRealtime, setIsRealtime] = useState<boolean>(false);

  const key = teamIds.join(',');
  const teamIdsRef = useRef(teamIds);
  teamIdsRef.current = teamIds;

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeTasks(
      teamIdsRef.current,
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setIsRealtime(true);
        setLoading(false);
      },
      () => {
        setIsRealtime(false);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refreshTasks = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedTasks = await getTasks(teamIdsRef.current);
      setTasks(fetchedTasks);
      setIsRealtime(true);
    } catch (error) {
      setIsRealtime(false);
    }
    setRefreshing(false);
  }, []);

  const addTask = async (input: CreateTaskInput) => {
    const newTask = await apiCreateTask(input);
    setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);
    return newTask;
  };

  const editTask = async (id: string, input: UpdateTaskInput) => {
    await apiUpdateTask(id, input);
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...input } : item))
    );
  };

  const removeTask = async (id: string) => {
    await apiDeleteTask(id);
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'All') return true;
    return t.status === filterStatus;
  });

  return {
    tasks: filteredTasks,
    allTasksCount: tasks.length,
    loading,
    refreshing,
    filterStatus,
    setFilterStatus,
    isRealtime,
    refreshTasks,
    addTask,
    editTask,
    removeTask,
  };
};
