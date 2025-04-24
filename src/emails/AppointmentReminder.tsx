import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface AppointmentReminderProps {
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  appointmentId: string;
  dashboardUrl: string;
}

export const AppointmentReminder: React.FC<AppointmentReminderProps> = ({
  customerName,
  serviceName,
  appointmentDate,
  appointmentTime,
  salonName = 'Nail Salon',
  salonAddress = '123 Nail Avenue, Beauty Town, BT 12345',
  salonPhone = '(555) 123-4567',
  appointmentId,
  dashboardUrl,
}) => {
  const previewText = `Reminder: Your appointment for ${serviceName} is tomorrow!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Appointment Reminder</Heading>
          
          <Section style={section}>
            <Text style={text}>Hello {customerName},</Text>
            <Text style={text}>
              This is a friendly reminder that your appointment for <strong>{serviceName}</strong> is scheduled for tomorrow.
            </Text>
            
            <Text style={detailsHeading}>Appointment Details:</Text>
            <Text style={detailsText}>
              <strong>Date:</strong> {appointmentDate}
            </Text>
            <Text style={detailsText}>
              <strong>Time:</strong> {appointmentTime}
            </Text>
            <Text style={detailsText}>
              <strong>Service:</strong> {serviceName}
            </Text>
            <Text style={detailsText}>
              <strong>Confirmation #:</strong> {appointmentId.substring(0, 8).toUpperCase()}
            </Text>
            
            <Text style={text}>
              Please arrive 5-10 minutes before your scheduled appointment time.
            </Text>
            
            <Text style={detailsHeading}>Salon Information:</Text>
            <Text style={detailsText}>
              <strong>Name:</strong> {salonName}
            </Text>
            <Text style={detailsText}>
              <strong>Address:</strong> {salonAddress}
            </Text>
            <Text style={detailsText}>
              <strong>Phone:</strong> {salonPhone}
            </Text>
            
            <Text style={text}>
              Need to reschedule or cancel? Please do so at least 24 hours in advance.
            </Text>
            
            <Section style={buttonContainer}>
              <Link href={dashboardUrl} style={button}>
                Manage Appointment
              </Link>
            </Section>
            
            <Text style={text}>
              We look forward to seeing you tomorrow!
            </Text>
            
            <Text style={text}>
              Best regards,<br />
              The {salonName} Team
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {salonName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#e91e63',
  margin: '30px 0',
};

const section = {
  backgroundColor: '#ffffff',
  padding: '30px',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  marginBottom: '20px',
};

const detailsHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333333',
  marginTop: '30px',
  marginBottom: '10px',
};

const detailsText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  marginBottom: '5px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#e91e63',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '4px',
  textDecoration: 'none',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const footer = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const footerText = {
  fontSize: '14px',
  color: '#666666',
};

export default AppointmentReminder;
