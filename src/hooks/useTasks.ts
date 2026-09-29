import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types/task';
import {
  subscribeTasks,
  getTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isRealtime, setIsRealtime] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeTasks((fetchedTasks, realtimeStatus) => {
      setTasks(fetchedTasks);
      setIsRealtime(realtimeStatus);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshTasks = useCallback(async () => {
    setRefreshing(true);
    const { tasks: fetchedTasks, isRealtime: realtimeStatus } = await getTasks();
    setTasks(fetchedTasks);
    setIsRealtime(realtimeStatus);
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
