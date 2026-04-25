export interface User {
  id: string;
  username: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR' | 'PROBLEM_SETTER' | 'CONTEST_MANAGER';
  rating: number;
  rank: number;
  problemsSolved: number;
  totalSubmissions: number;
  createdAt: string;
  updatedAt: string;
}

export type ContestStatus = 'Upcoming' | 'Active' | 'Ended';

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
