export type Role = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isAdmin: boolean;
  stemios: number;
  streak: number;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'Video' | 'Document' | 'Link' | 'Spreadsheet' | 'Cheat Sheet';
  url: string;
  lessonId: string;
  description: string;
}

export interface ActivityLog {
  id?: string;
  userId: string;
  unitId: string;
  reward: number;
  timestamp: unknown;
}

export interface Quest {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  progress?: number;
  maxProgress?: number;
}

// Admin Live-Editing Runtime Engine Config
export const CONFIG_FLAGS = {
  enableRedditAvatars: false,
  enableMultiplayerBreakroom: false,
  adminBetaOverride: true,
};

// Mock Auth States for UI Demonstration
export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'Alex (Student)', 
    email: 'alex@student.edu', 
    role: 'student', 
    isAdmin: false, 
    stemios: 450, 
    streak: 12 
  },
  { 
    id: '2', 
    name: 'Ms. Sarah (Teacher)', 
    email: 'sarah@school.edu', 
    role: 'teacher', 
    isAdmin: false, 
    stemios: 0, 
    streak: 0 
  },
  { 
    id: '3', 
    name: 'Admin Live-Editor (Student View)', 
    email: 'admin@system.edu', 
    role: 'student', 
    isAdmin: true, 
    stemios: 9999, 
    streak: 365 
  },
];
