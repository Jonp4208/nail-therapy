# Nail Therapy by Agustina

A professional website and appointment booking system for Nail Therapy by Agustina, a home-based nail salon offering nail services, waxing, eyebrows, and special event services like weddings and proms.

## Features

- **Online Booking**: Clients can book appointments online
- **Service Management**: Admin can manage available services
- **Client Directory**: Keep track of client information
- **Email Confirmations**: Automatic email confirmations for appointments
- **Admin Dashboard**: Manage appointments, services, and clients
- **Responsive Design**: Works on mobile, tablet, and desktop
- **PWA Support**: Can be installed as a Progressive Web App

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Email**: Resend API
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- Resend account (for email functionality)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/nail-therapy.git
   cd nail-therapy
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure the environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js
- Database powered by Supabase
- Email functionality by Resend
- Icons from Heroicons
