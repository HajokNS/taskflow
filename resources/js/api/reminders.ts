import axios from 'axios';
import { ReminderFormData, Reminder } from '@/types';

const API_URL = '/api/reminders';

// Отримати всі нагадування
export const fetchReminders = async (): Promise<Reminder[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Створити нагадування
export const createReminder = async (data: ReminderFormData): Promise<Reminder> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// Оновити нагадування
export const updateReminder = async (id: string, data: Partial<ReminderFormData>): Promise<Reminder> => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

// Видалити нагадування
export const deleteReminder = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};