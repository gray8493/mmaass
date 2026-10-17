export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
