# Email Setup Instructions

To enable email notifications for appointment confirmations, you need to add the following environment variables to your `.env.local` file:

```
# Email Configuration
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Gmail Setup Instructions

If you're using Gmail, follow these steps to set up your email:

1. **Create an App Password**:
   - Go to your Google Account settings: https://myaccount.google.com/
   - Select "Security" from the left menu
   - Under "Signing in to Google," select "2-Step Verification" (you need to have this enabled)
   - At the bottom of the page, select "App passwords"
   - Select "Mail" as the app and "Other" as the device (name it "Nail Therapy App")
   - Click "Generate"
   - Use the generated 16-character password as your `EMAIL_PASSWORD`

2. **Update Your .env.local File**:
   - Create or edit the `.env.local` file in the root of your project
   - Add the environment variables listed above
   - Replace `your-email@gmail.com` with your actual Gmail address
   - Replace `your-app-password` with the app password you generated

3. **Restart Your Development Server**:
   - After updating the `.env.local` file, restart your Next.js development server

## Testing Email Functionality

To test if your email setup is working:

1. Book a new appointment through the application
2. Check the email address you provided during booking
3. You should receive a confirmation email with your appointment details

If you don't receive an email, check the console logs for any error messages related to email sending.
