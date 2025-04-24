import twilio from 'twilio';
import { format } from 'date-fns';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Create Twilio client if credentials are available
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Salon information
const salonInfo = {
  name: 'Nail Salon',
  phone: '(555) 123-4567',
};

export interface AppointmentSmsData {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  appointmentDate: string; // ISO format
  appointmentTime: string; // 24-hour format (HH:MM)
  appointmentId: string;
}

/**
 * Send appointment confirmation SMS
 */
export async function sendAppointmentConfirmationSms(data: AppointmentSmsData) {
  if (!client || !twilioPhoneNumber) {
    console.error('Twilio credentials not configured');
    return { success: false, error: 'SMS service not configured' };
  }
  
  try {
    const { customerName, customerPhone, serviceName, appointmentDate, appointmentTime } = data;
    
    // Format date and time for display
    const formattedDate = format(new Date(appointmentDate), 'MMM d, yyyy');
    const formattedTime = format(new Date(`${appointmentDate}T${appointmentTime}`), 'h:mm a');
    
    // Create message
    const message = `Hi ${customerName}, your appointment for ${serviceName} at ${salonInfo.name} has been confirmed for ${formattedDate} at ${formattedTime}. Questions? Call us at ${salonInfo.phone}.`;
    
    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: customerPhone,
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending confirmation SMS:', error);
    return { success: false, error };
  }
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminderSms(data: AppointmentSmsData) {
  if (!client || !twilioPhoneNumber) {
    console.error('Twilio credentials not configured');
    return { success: false, error: 'SMS service not configured' };
  }
  
  try {
    const { customerName, customerPhone, serviceName, appointmentDate, appointmentTime } = data;
    
    // Format date and time for display
    const formattedDate = format(new Date(appointmentDate), 'MMM d, yyyy');
    const formattedTime = format(new Date(`${appointmentDate}T${appointmentTime}`), 'h:mm a');
    
    // Create message
    const message = `Hi ${customerName}, this is a reminder about your appointment for ${serviceName} at ${salonInfo.name} tomorrow, ${formattedDate} at ${formattedTime}. Need to reschedule? Call us at ${salonInfo.phone}.`;
    
    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: customerPhone,
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending reminder SMS:', error);
    return { success: false, error };
  }
}

/**
 * Send appointment update SMS (reschedule, cancel)
 */
export async function sendAppointmentUpdateSms(
  data: AppointmentSmsData,
  updateType: 'reschedule' | 'cancel' | 'service-change'
) {
  if (!client || !twilioPhoneNumber) {
    console.error('Twilio credentials not configured');
    return { success: false, error: 'SMS service not configured' };
  }
  
  try {
    const { customerName, customerPhone, serviceName, appointmentDate, appointmentTime } = data;
    
    // Format date and time for display
    const formattedDate = format(new Date(appointmentDate), 'MMM d, yyyy');
    const formattedTime = format(new Date(`${appointmentDate}T${appointmentTime}`), 'h:mm a');
    
    // Create message based on update type
    let message = '';
    
    if (updateType === 'reschedule') {
      message = `Hi ${customerName}, your appointment at ${salonInfo.name} has been rescheduled to ${formattedDate} at ${formattedTime}. Questions? Call us at ${salonInfo.phone}.`;
    } else if (updateType === 'cancel') {
      message = `Hi ${customerName}, your appointment for ${serviceName} at ${salonInfo.name} on ${formattedDate} at ${formattedTime} has been cancelled. Questions? Call us at ${salonInfo.phone}.`;
    } else if (updateType === 'service-change') {
      message = `Hi ${customerName}, your appointment at ${salonInfo.name} on ${formattedDate} at ${formattedTime} has been updated to ${serviceName}. Questions? Call us at ${salonInfo.phone}.`;
    }
    
    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: customerPhone,
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending update SMS:', error);
    return { success: false, error };
  }
}
