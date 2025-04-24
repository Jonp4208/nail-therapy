import { Resend } from 'resend';
import { format } from 'date-fns';
import { renderAsync } from '@react-email/render';
import AppointmentConfirmation from '@/emails/AppointmentConfirmation';
import AppointmentReminder from '@/emails/AppointmentReminder';
import AppointmentUpdate from '@/emails/AppointmentUpdate';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.SENDER_EMAIL || 'noreply@example.com';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Salon information
const salonInfo = {
  name: 'Nail Salon',
  address: '123 Nail Avenue, Beauty Town, BT 12345',
  phone: '(555) 123-4567',
};

export interface AppointmentEmailData {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  appointmentDate: string; // ISO format
  appointmentTime: string; // 24-hour format (HH:MM)
  appointmentId: string;
  oldDate?: string; // For rescheduling
  oldTime?: string; // For rescheduling
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmationEmail(data: AppointmentEmailData) {
  try {
    const { customerName, customerEmail, serviceName, appointmentDate, appointmentTime, appointmentId } = data;
    
    // Format date and time for display
    const formattedDate = format(new Date(appointmentDate), 'EEEE, MMMM d, yyyy');
    const formattedTime = format(new Date(`${appointmentDate}T${appointmentTime}`), 'h:mm a');
    
    // Generate dashboard URL
    const dashboardUrl = `${appUrl}/dashboard`;
    
    // Render email HTML
    const html = await renderAsync(
      AppointmentConfirmation({
        customerName,
        serviceName,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        salonName: salonInfo.name,
        salonAddress: salonInfo.address,
        salonPhone: salonInfo.phone,
        appointmentId,
        dashboardUrl,
      })
    );
    
    // Send email
    const { data: emailData, error } = await resend.emails.send({
      from: `${salonInfo.name} <${senderEmail}>`,
      to: customerEmail,
      subject: `Appointment Confirmation - ${salonInfo.name}`,
      html,
    });
    
    if (error) {
      console.error('Error sending confirmation email:', error);
      return { success: false, error };
    }
    
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminderEmail(data: AppointmentEmailData) {
  try {
    const { customerName, customerEmail, serviceName, appointmentDate, appointmentTime, appointmentId } = data;
    
    // Format date and time for display
    const formattedDate = format(new Date(appointmentDate), 'EEEE, MMMM d, yyyy');
    const formattedTime = format(new Date(`${appointmentDate}T${appointmentTime}`), 'h:mm a');
    
    // Generate dashboard URL
    const dashboardUrl = `${appUrl}/dashboard`;
    
    // Render email HTML
    const html = await renderAsync(
      AppointmentReminder({
        customerName,
        serviceName,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        salonName: salonInfo.name,
        salonAddress: salonInfo.address,
        salonPhone: salonInfo.phone,
        appointmentId,
        dashboardUrl,
      })
    );
    
    // Send email
    const { data: emailData, error } = await resend.emails.send({
      from: `${salonInfo.name} <${senderEmail}>`,
      to: customerEmail,
      subject: `Reminder: Your Appointment Tomorrow - ${salonInfo.name}`,
      html,
    });
    
    if (error) {
      console.error('Error sending reminder email:', error);
      return { success: false, error };
    }
    
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { success: false, error };
  }
}

/**
 * Send appointment update email (reschedule, cancel, service change)
 */
export async function sendAppointmentUpdateEmail(
  data: AppointmentEmailData,
  updateType: 'reschedule' | 'cancel' | 'service-change'
) {
  try {
    const { 
      customerName, 
      customerEmail, 
      serviceName, 
      appointmentDate, 
      appointmentTime, 
      appointmentId,
      oldDate,
      oldTime
    } = data;
    
    // Format date and time for display
    const formattedDate = format(new Date(appointmentDate), 'EEEE, MMMM d, yyyy');
    const formattedTime = format(new Date(`${appointmentDate}T${appointmentTime}`), 'h:mm a');
    
    // Format old date and time for display (if provided)
    let formattedOldDate;
    let formattedOldTime;
    
    if (oldDate && oldTime) {
      formattedOldDate = format(new Date(oldDate), 'EEEE, MMMM d, yyyy');
      formattedOldTime = format(new Date(`${oldDate}T${oldTime}`), 'h:mm a');
    }
    
    // Generate dashboard URL
    const dashboardUrl = `${appUrl}/dashboard`;
    
    // Render email HTML
    const html = await renderAsync(
      AppointmentUpdate({
        customerName,
        serviceName,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        oldDate: formattedOldDate,
        oldTime: formattedOldTime,
        updateType,
        salonName: salonInfo.name,
        salonPhone: salonInfo.phone,
        appointmentId,
        dashboardUrl,
      })
    );
    
    // Determine subject based on update type
    let subject = '';
    if (updateType === 'reschedule') {
      subject = `Your Appointment Has Been Rescheduled - ${salonInfo.name}`;
    } else if (updateType === 'cancel') {
      subject = `Your Appointment Has Been Cancelled - ${salonInfo.name}`;
    } else if (updateType === 'service-change') {
      subject = `Your Appointment Has Been Updated - ${salonInfo.name}`;
    }
    
    // Send email
    const { data: emailData, error } = await resend.emails.send({
      from: `${salonInfo.name} <${senderEmail}>`,
      to: customerEmail,
      subject,
      html,
    });
    
    if (error) {
      console.error('Error sending update email:', error);
      return { success: false, error };
    }
    
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending update email:', error);
    return { success: false, error };
  }
}
