import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

interface BaseModel {
    id: string;
    created_at: string;
    updated_at: string;
  }
  
  // Нагадування
  export interface Reminder extends BaseModel {
    task_id: string;
    remind_at: string; // Або Date, якщо використовуєте трансформацію
    created_at: string;
    updated_at: string;
    task?: { // Опціонально, якщо API включає завдання у відповідь
      id: string;
      title: string;
    };
  }
  
  // Форма для створення/редагування
  export type ReminderFormData = {
    task_id: string;
    remind_at: string;
  };