import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'PPP'): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  return format(dateObj, formatStr);
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'h:mm a');
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'PPP p');
};
