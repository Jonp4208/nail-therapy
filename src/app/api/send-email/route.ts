import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { format } from 'date-fns';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      to,
      subject,
      appointmentDetails
    } = await request.json();

    if (!to || !subject || !appointmentDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const {
      serviceName,
      servicePrice,
      appointmentDate,
      appointmentTime,
      clientName,
      notes
    } = appointmentDetails;

    // Format date and time
    const date = new Date(`${appointmentDate}T${appointmentTime}`);
    const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
    const formattedTime = format(date, 'h:mm a');

    // Create email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #d53f8c; margin: 0;">Nail Therapy <span style="font-size: 0.8em; font-style: italic;">by Agustina</span></h1>
          <p style="color: #666; font-size: 16px;">Your appointment has been confirmed!</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Appointment Details</h2>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Price:</strong> $${(servicePrice / 100).toFixed(2)}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          ${notes ? `<p><strong>Special Requests:</strong> ${notes}</p>` : ''}
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">What to Expect</h3>
          <p>Please arrive 5 minutes before your scheduled appointment time. If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
          <p>If you have any questions, please don't hesitate to contact us:</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: info@nailtherapybyagustina.com</p>
        </div>

        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e1e1e1; color: #999; font-size: 12px;">
          <p>Thank you for choosing Nail Therapy by Agustina!</p>
          <p>© ${new Date().getFullYear()} Nail Therapy by Agustina. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'noreply@nailtherapybyaugustina.com',
      to: [to],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data?.id
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
