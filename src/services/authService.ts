import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
  Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { AppUser, SignUpInput, SignInInput } from '../types/user';

const USERS_COLLECTION = 'users';

/**
 * Chuyển đổi mã lỗi Firebase thành thông báo tiếng Việt dễ hiểu.
 */
export const getAuthErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string })?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.';
    case 'auth/invalid-email':
      return 'Email không hợp lệ. Vui lòng kiểm tra lại.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu. Vui lòng nhập tối thiểu 6 ký tự.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
    case 'auth/too-many-requests':
      return 'Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.';
    case 'auth/network-request-failed':
      return 'Không có kết nối mạng. Vui lòng kiểm tra Internet.';
    default:
      return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }
};

/**
 * Tạo tài khoản mới (Firebase Auth) + tạo document người dùng trong Firestore.
 */
export const signUpUser = async (input: SignUpInput): Promise<AppUser> => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password
  );

  const { user } = credential;
  const name = input.name.trim();

  await updateProfile(user, { displayName: name });

  const profile: AppUser = {
    id: user.uid,
    name,
    email: user.email || input.email.trim(),
    avatarUrl: '',
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, USERS_COLLECTION, user.uid), profile);

  return profile;
};

/**
 * Đăng nhập bằng email/mật khẩu.
 */
export const signInUser = async (input: SignInInput): Promise<User> => {
  const credential = await signInWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password
  );
  return credential.user;
};

/**
 * Đăng xuất khỏi phiên hiện tại.
 */
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Lấy thông tin hồ sơ người dùng từ Firestore.
 * Nếu document chưa tồn tại (trường hợp hiếm), tạo mới từ dữ liệu Auth.
 */
export const getUserProfile = async (user: User): Promise<AppUser> => {
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      id: user.uid,
      name: data.name || user.displayName || '',
      email: data.email || user.email || '',
      avatarUrl: data.avatarUrl || '',
      createdAt: data.createdAt || new Date().toISOString(),
    };
  }

  const profile: AppUser = {
    id: user.uid,
    name: user.displayName || (user.email ? user.email.split('@')[0] : 'Người dùng'),
    email: user.email || '',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
  };
  await setDoc(userRef, profile);
  return profile;
};

/**
 * Cập nhật hồ sơ người dùng trong Firestore.
 */
export const updateUserProfile = async (
  uid: string,
  data: Partial<Pick<AppUser, 'name' | 'avatarUrl'>>
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, uid), { ...data });
};

/**
 * Tải ảnh đại diện lên Firebase Storage (dạng data URL base64).
 * Trả về URL công khai để lưu vào hồ sơ người dùng.
 */
export const uploadAvatar = async (
  uid: string,
  base64DataUrl: string
): Promise<string> => {
  const avatarRef = ref(storage, `avatars/${uid}.jpg`);
  await uploadString(avatarRef, base64DataUrl, 'data_url');
  return getDownloadURL(avatarRef);
};

/**
 * Lắng nghe trạng thái đăng nhập (dùng để duy trì phiên qua các lần mở app).
 */
export const subscribeAuthState = (
  callback: (user: User | null) => void
): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};

export { serverTimestamp };
