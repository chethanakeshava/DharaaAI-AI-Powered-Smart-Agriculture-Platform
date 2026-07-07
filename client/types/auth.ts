export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  farmName?: string;
  location: string;
  role?: 'user' | 'admin';
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    location?: string;
    farmName?: string;
  };
};

export type User = {
  id: string;
  username: string;
  email: string;
  location?: string;
  farmName?: string;
  createdAt: string;
  role?: 'admin' | 'user';
  blocked?: boolean;
};
