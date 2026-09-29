export const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyDNkGEfE2_8JNMDdBpoKtPax-CFhGvmTE4',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'task-manager-22a46.firebaseapp.com',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'task-manager-22a46',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'task-manager-22a46.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '132491488074',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:132491488074:web:bdb72480d2789996e3afb3',
};
