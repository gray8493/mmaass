import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';

const COLLECTION_NAME = 'tasks';

// Dữ liệu mẫu khởi tạo ban đầu cho trường hợp offline hoặc demo
export const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: 'sample-task-1',
    title: 'Thiết kế giao diện Task Management',
    description: 'Xây dựng UI cho các màn hình Home, Teams, Profile với React Native',
    status: 'Done',
    priority: 'High',
    dueDate: '2026-10-05',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    teamId: null,
    assigneeId: null,
  },
  {
    id: 'sample-task-2',
    title: 'Kết nối Firebase Firestore Database',
    description: 'Cấu hình SDK và viết service CRUD thao tác với collection tasks',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-10-08',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    teamId: null,
    assigneeId: null,
  },
  {
    id: 'sample-task-3',
    title: 'Viết báo cáo nộp bài Practical Exam 1',
    description: 'Chụp ảnh màn hình CRUD và đính kèm link GitHub repository',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '2026-10-12',
    createdAt: new Date().toISOString(),
    teamId: null,
    assigneeId: null,
  },
];

let localTasks: Task[] = [...INITIAL_SAMPLE_TASKS];
let isFirestoreAvailable = true;

/**
 * Lắng nghe thay đổi dữ liệu công việc thời gian thực (Real-time listener)
 */
export const subscribeTasks = (
  onSuccess: (tasks: Task[], isRealtime: boolean) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const tasksQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        isFirestoreAvailable = true;
        const tasks: Task[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || '',
            description: data.description || '',
            status: data.status || 'To Do',
            priority: data.priority || 'Medium',
            dueDate: data.dueDate || '',
            createdAt: data.createdAt || new Date().toISOString(),
            teamId: data.teamId ?? null,
            assigneeId: data.assigneeId ?? null,
          };
        });

        // Nếu Firestore trống (mới khởi tạo project), trả về sample tasks hoặc rỗng
        if (tasks.length === 0 && localTasks.length > 0) {
          onSuccess(localTasks, false);
        } else {
          localTasks = tasks;
          onSuccess(tasks, true);
        }
      },
      (error) => {
        console.warn(
          'Lỗi Firestore Listener, chuyển sang chế độ dự phòng:',
          error.message
        );
        isFirestoreAvailable = false;
        onSuccess([...localTasks], false);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Không thể kết nối Firestore, sử dụng dữ liệu cục bộ:', err.message);
    isFirestoreAvailable = false;
    onSuccess([...localTasks], false);
    return () => {};
  }
};

/**
 * Lấy danh sách công việc 1 lần (hỗ trợ Pull to refresh)
 */
export const getTasks = async (): Promise<{ tasks: Task[]; isRealtime: boolean }> => {
  try {
    const tasksQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(tasksQuery);
    const tasks: Task[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'To Do',
        priority: data.priority || 'Medium',
        dueDate: data.dueDate || '',
        createdAt: data.createdAt || new Date().toISOString(),
        teamId: data.teamId ?? null,
        assigneeId: data.assigneeId ?? null,
      };
    });

    if (tasks.length > 0) {
      localTasks = tasks;
      isFirestoreAvailable = true;
      return { tasks, isRealtime: true };
    }
    return { tasks: [...localTasks], isRealtime: false };
  } catch (error) {
    return { tasks: [...localTasks], isRealtime: false };
  }
};

/**
 * Tạo mới một công việc
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
    assigneeId: taskInput.assigneeId ?? null,
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newTaskData);
    const createdTask: Task = { id: docRef.id, ...newTaskData };
    localTasks = [createdTask, ...localTasks];
    return createdTask;
  } catch (error) {
    console.warn('Ghi Firestore không thành công, lưu bộ nhớ cục bộ:', error);
    const fallbackId = 'task-' + Date.now();
    const createdTask: Task = { id: fallbackId, ...newTaskData };
    localTasks = [createdTask, ...localTasks];
    return createdTask;
  }
};

/**
 * Cập nhật thông tin công việc
 */
export const updateTask = async (
  id: string,
  updateInput: UpdateTaskInput
): Promise<void> => {
  try {
    const taskDocRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(taskDocRef, { ...updateInput });
  } catch (error) {
    console.warn('Cập nhật Firestore thất bại, cập nhật bộ nhớ cục bộ:', error);
  }

  // Cập nhật bộ nhớ cục bộ
  localTasks = localTasks.map((t) => (t.id === id ? { ...t, ...updateInput } : t));
};

/**
 * Xóa công việc
 */
export const deleteTask = async (id: string): Promise<void> => {
  try {
    const taskDocRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(taskDocRef);
  } catch (error) {
    console.warn('Xóa Firestore thất bại, cập nhật bộ nhớ cục bộ:', error);
  }

  // Xóa khỏi bộ nhớ cục bộ
  localTasks = localTasks.filter((t) => t.id !== id);
};
