import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Get request data
    const { email, fromAddress, subject, html } = await request.json();

    if (!email || !fromAddress || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the request for debugging
    console.log('Email diagnostics request:', {
      to: email,
      from: fromAddress,
      subject,
      htmlLength: html.length
    });

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json(
        { 
          error: error.message,
          details: {
            errorName: error.name,
            errorMessage: error.message,
            apiKey: process.env.RESEND_API_KEY ? 'API key is set' : 'API key is missing',
            fromAddress,
            toAddress: email
          }
        },
        { status: 500 }
      );
    }

    // Log success for debugging
    console.log('Email sent successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      id: data?.id,
      details: {
        fromAddress,
        toAddress: email,
        emailId: data?.id
      }
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to send test email',
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
          apiKey: process.env.RESEND_API_KEY ? 'API key is set' : 'API key is missing'
        }
      },
      { status: 500 }
    );
  }
}
