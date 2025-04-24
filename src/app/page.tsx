'use client';

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 lg:w-full lg:max-w-2xl">
            <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Nail Therapy <span className="text-sm font-dancing-script italic text-pink-600" style={{ fontSize: '2rem', marginLeft: '4px' }}>by Agustina</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Professional nail care, waxing, and eyebrow services in a relaxing environment.
                  Book your appointment today and treat yourself to the pampering you deserve.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link href="/book">
                    <Button size="lg">Book Appointment</Button>
                  </Link>
                  <Link href="/services" className="text-sm font-semibold leading-6 text-gray-900">
                    View Services <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <Image
            className="aspect-[3/2] object-cover lg:aspect-auto lg:h-full lg:w-full"
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800&q=80"
            alt="Nail salon services"
            width={1200}
            height={800}
            priority
          />
        </div>
      </div>

      {/* Services Preview Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-pink-600">Our Services</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for beautiful nails and more
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We offer a wide range of nail services, waxing, and eyebrow treatments to help you look and feel your best.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-pink-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  Nail Services
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    From classic manicures to gel extensions, we offer a variety of nail services to keep your hands and feet looking their best.
                  </p>
                  <p className="mt-6">
                    <Link href="/services" className="text-sm font-semibold leading-6 text-pink-600">
                      Learn more <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-pink-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                  </div>
                  Waxing
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Our gentle waxing services remove unwanted hair, leaving your skin smooth and beautiful for weeks.
                  </p>
                  <p className="mt-6">
                    <Link href="/services" className="text-sm font-semibold leading-6 text-pink-600">
                      Learn more <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-pink-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  Eyebrow Services
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Enhance your natural beauty with our eyebrow shaping, tinting, and lamination services.
                  </p>
                  <p className="mt-6">
                    <Link href="/services" className="text-sm font-semibold leading-6 text-pink-600">
                      Learn more <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Special Occasions Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-pink-600">Special Occasions</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Make your special day even more beautiful
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              From weddings and proms to special events, we provide personalized nail services to make your important moments perfect.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-start">
              <div className="rounded-lg bg-gray-50 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pink-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.38a48.474 48.474 0 0 0-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1 .53 0L12.5 3.5l.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Weddings</h3>
              <p className="mt-2 text-base leading-7 text-gray-600">
                Special packages for brides and bridal parties. Consultation available to match your wedding theme and colors.
              </p>
              <Link href="/services#weddings" className="mt-4 text-sm font-semibold leading-6 text-pink-600">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="flex flex-col items-start">
              <div className="rounded-lg bg-gray-50 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pink-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Proms & Formals</h3>
              <p className="mt-2 text-base leading-7 text-gray-600">
                Make a statement with stunning nail designs that complement your dress and accessories.
              </p>
              <Link href="/services#proms" className="mt-4 text-sm font-semibold leading-6 text-pink-600">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="flex flex-col items-start">
              <div className="rounded-lg bg-gray-50 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-pink-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-8 tracking-tight text-gray-900">Special Events</h3>
              <p className="mt-2 text-base leading-7 text-gray-600">
                From birthdays to anniversaries, get picture-perfect nails for any special occasion.
              </p>
              <Link href="/services#events" className="mt-4 text-sm font-semibold leading-6 text-pink-600">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-pink-600">About Agustina</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Personalized nail care in a comfortable setting</p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  With over 10 years of experience, Agustina provides professional nail services from her home studio. Her attention to detail and personalized approach ensure you get exactly the look you want.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-1 top-1 h-5 w-5 text-pink-600">
                        <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Professional Quality.
                    </dt>
                    <dd className="inline"> Using only premium products and the latest techniques for long-lasting, beautiful results.</dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-1 top-1 h-5 w-5 text-pink-600">
                        <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Personalized Service.
                    </dt>
                    <dd className="inline"> One-on-one attention in a comfortable home setting, never rushed or crowded.</dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-1 top-1 h-5 w-5 text-pink-600">
                        <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Flexible Scheduling.
                    </dt>
                    <dd className="inline"> Appointments available to fit your schedule, including evenings and weekends.</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Nail salon professional workspace"
                className="rounded-xl shadow-xl ring-1 ring-gray-400/10"
                width={500}
                height={500}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-pink-600">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What clients are saying
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-start">
              <div className="relative flex items-center gap-x-4">
                <div className="text-sm leading-6">
                  <p className="font-semibold text-gray-900">
                    <span className="absolute inset-0"></span>
                    Sarah J.
                  </p>
                  <p className="text-gray-600">Wedding Client</p>
                </div>
              </div>
              <div className="mt-4 text-sm italic leading-6 text-gray-600">
                "Agustina did my nails for my wedding and they were absolutely perfect! She took the time to understand exactly what I wanted and matched my color scheme perfectly. My bridesmaids loved their nails too!"
              </div>
              <div className="mt-4 flex">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <svg key={rating} className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="relative flex items-center gap-x-4">
                <div className="text-sm leading-6">
                  <p className="font-semibold text-gray-900">
                    <span className="absolute inset-0"></span>
                    Michael T.
                  </p>
                  <p className="text-gray-600">Regular Client</p>
                </div>
              </div>
              <div className="mt-4 text-sm italic leading-6 text-gray-600">
                "I've been going to Agustina for over a year now. The home setting is so much more relaxing than a busy salon, and the quality is top-notch. I love that I can get appointments that work with my schedule."
              </div>
              <div className="mt-4 flex">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <svg key={rating} className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="relative flex items-center gap-x-4">
                <div className="text-sm leading-6">
                  <p className="font-semibold text-gray-900">
                    <span className="absolute inset-0"></span>
                    Emma L.
                  </p>
                  <p className="text-gray-600">Prom Client</p>
                </div>
              </div>
              <div className="mt-4 text-sm italic leading-6 text-gray-600">
                "Agustina did my nails for prom and they were amazing! She created a custom design that matched my dress perfectly. Everyone was asking where I got them done. Will definitely be back!"
              </div>
              <div className="mt-4 flex">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <svg key={rating} className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-pink-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready for your special occasion?
              <br />
              Book your appointment today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-pink-100">
              Whether it's a wedding, prom, or just treating yourself, Nail Therapy by Agustina will make your nails look perfect for any occasion.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/book">
                <Button variant="secondary" size="lg">
                  Book Now
                </Button>
              </Link>
              <Link href="/contact" className="text-sm font-semibold leading-6 text-white">
                Contact Us <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
