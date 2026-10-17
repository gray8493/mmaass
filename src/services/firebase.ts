import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, initializeAuth, Auth, Persistence } from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { firebaseConfig } from './firebaseConfig';

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

/**
 * Truy cập an toàn helper `getReactNativePersistence`.
 * Helper này chỉ tồn tại trong bản build React Native của firebase/auth,
 * không có trong bản build web, nên phải kiểm tra tồn tại trước khi dùng.
 */
const getReactNativePersistence = (
  FirebaseAuth as unknown as {
    getReactNativePersistence?: (storage: unknown) => Persistence;
  }
).getReactNativePersistence;

/**
 * Khởi tạo Firebase Authentication.
 * - Trên Web: dùng persistence mặc định (localStorage) của trình duyệt.
 * - Trên React Native (iOS/Android): dùng AsyncStorage để phiên đăng nhập
 *   được lưu lại, người dùng không phải đăng nhập lại sau khi mở app.
 */
let auth: Auth;
if (Platform.OS !== 'web' && getReactNativePersistence) {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

export { app, db, auth, storage };
