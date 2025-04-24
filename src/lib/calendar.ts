import { format } from 'date-fns';

// Salon information
const salonInfo = {
  name: 'Nail Salon',
  address: '123 Nail Avenue, Beauty Town, BT 12345',
  phone: '(555) 123-4567',
};

interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(data: CalendarEventData): string {
  const { title, description, location, startTime, endTime } = data;
  
  const startTimeISO = startTime.toISOString().replace(/-|:|\.\d+/g, '');
  const endTimeISO = endTime.toISOString().replace(/-|:|\.\d+/g, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    location,
    dates: `${startTimeISO}/${endTimeISO}`,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Apple Calendar URL (iCal format)
 */
export function generateAppleCalendarUrl(data: CalendarEventData): string {
  const { title, description, location, startTime, endTime } = data;
  
  // Format dates for iCal
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };
  
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');
  
  // Encode the iCal content for the URL
  const encodedContent = encodeURIComponent(icalContent);
  
  // Create a data URL
  return `data:text/calendar;charset=utf-8,${encodedContent}`;
}

/**
 * Generate Outlook Calendar URL
 */
export function generateOutlookCalendarUrl(data: CalendarEventData): string {
  const { title, description, location, startTime, endTime } = data;
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title,
    body: description,
    location,
    startdt: startTime.toISOString(),
    enddt: endTime.toISOString(),
  });
  
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate calendar links for an appointment
 */
export function generateCalendarLinks(
  serviceName: string,
  appointmentDate: string, // ISO format
  appointmentTime: string, // 24-hour format (HH:MM)
  durationMinutes: number = 60
) {
  // Create start and end times
  const startTime = new Date(`${appointmentDate}T${appointmentTime}`);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  
  // Format date and time for display
  const formattedDate = format(startTime, 'MMMM d, yyyy');
  const formattedTime = format(startTime, 'h:mm a');
  
  // Create event data
  const eventData: CalendarEventData = {
    title: `${serviceName} Appointment - ${salonInfo.name}`,
    description: `Your appointment for ${serviceName} at ${salonInfo.name}\n\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nLocation: ${salonInfo.address}\nPhone: ${salonInfo.phone}`,
    location: salonInfo.address,
    startTime,
    endTime,
  };
  
  // Generate calendar URLs
  return {
    google: generateGoogleCalendarUrl(eventData),
    apple: generateAppleCalendarUrl(eventData),
    outlook: generateOutlookCalendarUrl(eventData),
  };
}
