import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
});

export const appointmentSchema = z.object({
  service_id: z.string().min(1, { message: 'Please select a service' }),
  date: z.date({ required_error: 'Please select a date' }),
  time: z.string().min(1, { message: 'Please select a time' }),
  notes: z.string().optional(),
  deposit: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});
