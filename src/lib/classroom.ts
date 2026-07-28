export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  courseState?: string;
  alternateLink?: string;
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  dueDate?: { year: number; month: number; day: number };
}

const CLASSROOM_BASE_URL = "https://classroom.googleapis.com/v1";

async function classroomFetch<T>(endpoint: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${CLASSROOM_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Classroom API Error (${response.status}): ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

export async function listCourses(accessToken: string): Promise<ClassroomCourse[]> {
  const data = await classroomFetch<{ courses?: ClassroomCourse[] }>("/courses?courseStates=ACTIVE", accessToken);
  return data.courses || [];
}

export async function getCourse(accessToken: string, courseId: string): Promise<ClassroomCourse> {
  return classroomFetch<ClassroomCourse>(`/courses/${courseId}`, accessToken);
}

export async function listCourseWork(accessToken: string, courseId: string): Promise<ClassroomCourseWork[]> {
  const data = await classroomFetch<{ courseWork?: ClassroomCourseWork[] }>(`/courses/${courseId}/courseWork`, accessToken);
  return data.courseWork || [];
}

export async function createCourseWork(
  accessToken: string,
  courseId: string,
  courseWork: { title: string; description?: string; workType?: string }
): Promise<ClassroomCourseWork> {
  return classroomFetch<ClassroomCourseWork>(`/courses/${courseId}/courseWork`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      workType: "ASSIGNMENT",
      state: "PUBLISHED",
      ...courseWork,
    }),
  });
}
