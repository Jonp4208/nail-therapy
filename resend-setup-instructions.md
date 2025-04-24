# Resend Email Setup Instructions

To enable email notifications for appointment confirmations using Resend, follow these steps:

## 1. Install Resend Package (if not already installed)

```bash
npm install resend
# or
yarn add resend
```

## 2. Set Up Resend API Key

1. **Create a Resend Account**:
   - Go to [resend.com](https://resend.com) and sign up for an account
   - Verify your email address

2. **Create an API Key**:
   - In the Resend dashboard, go to the API Keys section
   - Click "Create API Key"
   - Give it a name like "Nail Therapy App"
   - Copy the generated API key

3. **Add to Environment Variables**:
   - Create or edit the `.env.local` file in the root of your project
   - Add the following line:
   ```
   RESEND_API_KEY=your_api_key_here
   ```
   - Replace `your_api_key_here` with the API key you copied

## 3. Set Up a Sending Domain (Optional but Recommended)

For better deliverability and to avoid using the default Resend domain:

1. **Add Your Domain**:
   - In the Resend dashboard, go to the Domains section
   - Click "Add Domain"
   - Follow the instructions to verify your domain
   - This will allow you to send from `noreply@yourdomain.com`

2. **Update the From Address**:
   - Once your domain is verified, update the `from` address in the email sending code
   - For example: `from: 'Nail Therapy by Agustina <noreply@nailtherapybyagustina.com>'`

## 4. Restart Your Development Server

After updating the `.env.local` file, restart your Next.js development server.

## Testing Email Functionality

To test if your email setup is working:

1. Book a new appointment through the application
2. Check the email address you provided during booking
3. You should receive a confirmation email with your appointment details

If you don't receive an email, check the console logs for any error messages related to email sending.

## Monitoring Emails

Resend provides a dashboard where you can monitor all sent emails, track deliveries, opens, and clicks. This can be useful for troubleshooting and analytics.
