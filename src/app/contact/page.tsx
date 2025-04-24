'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function ContactPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Contact Us</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Have questions or need to get in touch? We'd love to hear from you!
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Get in Touch</h3>
            <p className="mt-4 text-base leading-7 text-gray-600">
              We're here to answer any questions you might have about our services, pricing, or availability.
            </p>

            <dl className="mt-10 space-y-6 text-base leading-7 text-gray-600">
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Address</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-6 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </dt>
                <dd>Calhoun, Georgia 30701</dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Telephone</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-6 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </dt>
                <dd>
                  <a className="hover:text-pink-600" href="tel:+1-555-123-4567">
                    +1 706-200-2663
                  </a>
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Email</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-6 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </dt>
                <dd>
                  <a className="hover:text-pink-600" href="mailto:nailtherapybyagustina@gmail.com">
                    nailtherapybyagustina@gmail.com
                  </a>
                </dd>
              </div>
            </dl>

            <h3 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">Hours of Operation</h3>
            <dl className="mt-6 space-y-2 text-base leading-7 text-gray-600">
              <div className="flex justify-between">
                <dt>Monday - Friday</dt>
                <dd>9:00 AM - 7:00 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Saturday</dt>
                <dd>9:00 AM - 6:00 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Sunday</dt>
                <dd>10:00 AM - 4:00 PM</dd>
              </div>
            </dl>

            <div className="mt-10">
              <Link href="/book">
                <Button>Book an Appointment</Button>
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <form className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Send us a Message</h3>

            <Input
              label="Name"
              type="text"
              placeholder="Your name"
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Your email"
              required
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="Your phone number"
            />

            <Textarea
              label="Message"
              placeholder="How can we help you?"
              rows={6}
              required
            />

            <div>
              <Button type="submit">Send Message</Button>
            </div>
          </form>
        </div>

        {/* Map */}
        <div className="mt-16 overflow-hidden rounded-lg h-96">
          <div className="h-full w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52626.203037387!2d-84.98248867832032!3d34.50290400000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8860753e6c469d49%3A0x1e3b0f3a3c48c4a!2sCalhoun%2C%20GA%2030701!5e0!3m2!1sen!2sus!4v1714073731066!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map of Calhoun, Georgia"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
