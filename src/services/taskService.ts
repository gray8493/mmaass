import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';

const COLLECTION_NAME = 'tasks';

const mapTask = (id: string, data: Record<string, unknown>): Task => ({
  id,
  title: (data.title as string) || '',
  description: (data.description as string) || '',
  status: (data.status as Task['status']) || 'To Do',
  priority: (data.priority as Task['priority']) || 'Medium',
  dueDate: (data.dueDate as string) || '',
  createdAt: (data.createdAt as string) || new Date().toISOString(),
  teamId: (data.teamId as string) ?? null,
  teamName: (data.teamName as string) || '',
  assigneeId: (data.assigneeId as string) ?? null,
  assigneeName: (data.assigneeName as string) || '',
  createdBy: (data.createdBy as string) ?? null,
});

const sortByCreatedAtDesc = (tasks: Task[]): Task[] =>
  [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/**
 * Lắng nghe thay đổi dữ liệu công việc theo thời gian thực (Real-time listener).
 * Chỉ trả về công việc thuộc các nhóm mà người dùng đang tham gia.
 */
export const subscribeTasks = (
  teamIds: string[],
  onSuccess: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  if (teamIds.length === 0) {
    onSuccess([]);
    return () => {};
  }

  const tasksQuery = query(
    collection(db, COLLECTION_NAME),
    where('teamId', 'in', teamIds.slice(0, 30))
  );

  return onSnapshot(
    tasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => mapTask(d.id, d.data()));
      onSuccess(sortByCreatedAtDesc(tasks));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

/**
 * Lấy danh sách công việc 1 lần (hỗ trợ Pull to refresh).
 */
export const getTasks = async (teamIds: string[]): Promise<Task[]> => {
  if (teamIds.length === 0) return [];

  const tasksQuery = query(
    collection(db, COLLECTION_NAME),
    where('teamId', 'in', teamIds.slice(0, 30))
  );
  const snapshot = await getDocs(tasksQuery);
  const tasks = snapshot.docs.map((d) => mapTask(d.id, d.data()));
  return sortByCreatedAtDesc(tasks);
};

/**
 * Tạo mới một công việc, gắn với nhóm và người được giao việc.
 */
export const createTask = async (taskInput: CreateTaskInput): Promise<Task> => {
  const newTaskData = {
    title: taskInput.title.trim(),
    description: taskInput.description ? taskInput.description.trim() : '',
    status: taskInput.status || 'To Do',
    priority: taskInput.priority || 'Medium',
    dueDate: taskInput.dueDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    teamId: taskInput.teamId ?? null,
    teamName: taskInput.teamName ?? '',
    assigneeId: taskInput.assigneeId ?? null,
    assigneeName: taskInput.assigneeName ?? '',
    createdBy: taskInput.createdBy ?? null,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newTaskData);
  return { id: docRef.id, ...newTaskData };
};

/**
 * Cập nhật thông tin công việc.
 */
export const updateTask = async (
  id: string,
  updateInput: UpdateTaskInput
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION_NAME, id), { ...updateInput });
};

/**
 * Xóa công việc.
 */
export const deleteTask = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
