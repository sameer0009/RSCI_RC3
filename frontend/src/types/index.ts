export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  rating: number;
  rank: number;
  problemsSolved: number;
  totalSubmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
