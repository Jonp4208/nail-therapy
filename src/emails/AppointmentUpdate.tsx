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

interface AppointmentUpdateProps {
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  oldDate?: string;
  oldTime?: string;
  updateType: 'reschedule' | 'cancel' | 'service-change';
  salonName: string;
  salonPhone: string;
  appointmentId: string;
  dashboardUrl: string;
}

export const AppointmentUpdate: React.FC<AppointmentUpdateProps> = ({
  customerName,
  serviceName,
  appointmentDate,
  appointmentTime,
  oldDate,
  oldTime,
  updateType,
  salonName = 'Nail Salon',
  salonPhone = '(555) 123-4567',
  appointmentId,
  dashboardUrl,
}) => {
  let previewText = '';
  let headingText = '';
  let mainText = '';

  if (updateType === 'reschedule') {
    previewText = `Your appointment has been rescheduled`;
    headingText = 'Appointment Rescheduled';
    mainText = `Your appointment for ${serviceName} has been rescheduled from ${oldDate} at ${oldTime} to ${appointmentDate} at ${appointmentTime}.`;
  } else if (updateType === 'cancel') {
    previewText = `Your appointment has been cancelled`;
    headingText = 'Appointment Cancelled';
    mainText = `Your appointment for ${serviceName} on ${appointmentDate} at ${appointmentTime} has been cancelled.`;
  } else if (updateType === 'service-change') {
    previewText = `Your appointment service has been updated`;
    headingText = 'Appointment Updated';
    mainText = `Your appointment on ${appointmentDate} at ${appointmentTime} has been updated to ${serviceName}.`;
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{headingText}</Heading>
          
          <Section style={section}>
            <Text style={text}>Hello {customerName},</Text>
            <Text style={text}>{mainText}</Text>
            
            {updateType !== 'cancel' && (
              <>
                <Text style={detailsHeading}>Updated Appointment Details:</Text>
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
              </>
            )}
            
            {updateType === 'cancel' ? (
              <Text style={text}>
                If you would like to book a new appointment, please visit our website or call us.
              </Text>
            ) : (
              <Text style={text}>
                If you need to make any changes to your appointment, please contact us at least 24 hours in advance.
              </Text>
            )}
            
            <Text style={text}>
              If you have any questions, please call us at {salonPhone}.
            </Text>
            
            {updateType !== 'cancel' && (
              <Section style={buttonContainer}>
                <Link href={dashboardUrl} style={button}>
                  View Appointment
                </Link>
              </Section>
            )}
            
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

export default AppointmentUpdate;
