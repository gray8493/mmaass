/**
 * Bổ sung khai báo kiểu cho `getReactNativePersistence`.
 *
 * SDK `firebase/auth` có cung cấp helper này trong bản build dành cho React
 * Native (điều kiện "react-native" trong package exports), nhưng phần typings
 * công khai (web) lại không khai báo nó. Khối augmentation dưới đây giúp
 * TypeScript nhận diện đúng hàm này.
 */
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
