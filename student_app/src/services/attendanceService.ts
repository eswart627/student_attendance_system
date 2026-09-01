import { apiRequest } from './api';

export type AttendanceResponse = {
  success: boolean;
  message?: string;
  sessionId?: string | number;
  sessionEndTime?: number;
};

export type StudentAttendance = {
  courseId: string | number;
  courseName: string;
  courseCode: string;
  present: number;
  total: number;
  percentage: number;
};

export type StudentAttendanceResponse = {
  success: boolean;
  message?: string;
  attendance?: StudentAttendance[];
};

export async function markAttendance(
  token: string,
  qrToken: string,
  scannedAt: number,
): Promise<AttendanceResponse> {
  return apiRequest<AttendanceResponse>('/student/scan', {
    method: 'POST',
    token,
    body: JSON.stringify({
      qrToken,
      scannedAt,
    }),
  });
}

export async function getStudentAttendance(
  token: string,
  studentId: string | number,
): Promise<StudentAttendanceResponse> {
  return apiRequest<StudentAttendanceResponse>(`/report/student/${studentId}`, {
    method: 'GET',
    token,
  });
}
