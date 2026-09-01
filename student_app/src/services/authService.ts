import {apiRequest} from './api';

export type StudentUser = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  MIS?: string;
  year?: number;
  semester?: number;
  department?: string;
  profilePic?: string | null;
  role: 'student' | 'teacher';
  class?: {
    classId: number | string;
    name: string;
    code: string;
    description?: string;
  } | null;
};

export type LoginResponse = {
  success: boolean;
  message?: string;
  serverTime?: number;
  data?: {
    token: string;
    user: StudentUser;
  };
};

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim(),
      password,
      role: 'student',
    }),
  });
}