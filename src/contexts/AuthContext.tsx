import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { User } from 'firebase/auth';
import { AppUser, SignUpInput, SignInInput } from '../types/user';
import {
  subscribeAuthState,
  signUpUser,
  signInUser,
  signOutUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
} from '../services/authService';

interface AuthContextValue {
  user: AppUser | null;
  firebaseUser: User | null;
  initializing: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
  updateAvatar: (base64DataUrl: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuthState(async (authUser) => {
      setFirebaseUser(authUser);

      if (authUser) {
        try {
          const profile = await getUserProfile(authUser);
          setUser(profile);
        } catch (error) {
          setUser({
            id: authUser.uid,
            name: authUser.displayName || '',
            email: authUser.email || '',
            avatarUrl: '',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
      }

      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const profile = await signUpUser(input);
    setUser(profile);
  }, []);

  const signIn = useCallback(async (input: SignInInput) => {
    await signInUser(input);
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setFirebaseUser(null);
  }, []);

  const updateAvatar = useCallback(
    async (base64DataUrl: string) => {
      if (!user) return;
      const url = await uploadAvatar(user.id, base64DataUrl);
      await updateUserProfile(user.id, { avatarUrl: url });
      setUser({ ...user, avatarUrl: url });
    },
    [user]
  );

  const updateName = useCallback(
    async (name: string) => {
      if (!user) return;
      await updateUserProfile(user.id, { name });
      setUser({ ...user, name });
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      firebaseUser,
      initializing,
      signUp,
      signIn,
      signOut,
      updateAvatar,
      updateName,
    }),
    [user, firebaseUser, initializing, signUp, signIn, signOut, updateAvatar, updateName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};
