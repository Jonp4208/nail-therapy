'use client'

import React, { useState, useEffect } from 'react'
import Calendar, { CalendarProps } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { cn } from '@/lib/utils'
import { useSupabaseContext } from '@/context/SupabaseProvider'
import { format, parseISO, isSameDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import Button from '@/components/ui/Button'
import { Database } from '@/types/database.types'

type AppointmentWithDetails = Database['public']['Tables']['appointments']['Row'] & {
  services: {
    name: string
    price: number
  } | null
  profiles?: {
    full_name: string
    phone: string
  } | null
}

interface AdminCalendarViewProps {
  className?: string
}

const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({ className }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabaseContext()

  useEffect(() => {
    fetchAppointments()
  }, [supabase])

  const fetchAppointments = async () => {
    try {
      if (!supabase) return

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            price
          )
        `)
        .order('appointment_date')
        .order('appointment_time')

      if (error) throw error

      // Fetch client information for each appointment
      const appointmentsWithProfiles = await Promise.all(
        (data || []).map(async (appointment) => {
          if (appointment.user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', appointment.user_id)
              .single()

            if (!profileError && profileData) {
              return {
                ...appointment,
                profiles: profileData,
              }
            }
          }

          // If we have guest information, use that
          if (appointment.guest_name) {
            return {
              ...appointment,
              profiles: {
                full_name: appointment.guest_name,
                phone: appointment.guest_phone || 'N/A',
              },
            }
          }

          return {
            ...appointment,
            profiles: { full_name: 'Unknown', phone: 'N/A' },
          }
        })
      )

      setAppointments(appointmentsWithProfiles)
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(parseISO(appointment.appointment_date), date)
    )
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const dateAppointments = getAppointmentsForDate(date)
    if (dateAppointments.length === 0) return null

    return (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-b" />
    )
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const dateAppointments = getAppointmentsForDate(date)
    if (dateAppointments.length > 0) {
      return 'has-appointments'
    }
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Appointment Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <style jsx global>{`
          .react-calendar {
            width: 100%;
            max-width: 100%;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            font-family: inherit;
            line-height: 1.5;
          }

          .react-calendar button {
            border-radius: 0.25rem;
            position: relative;
          }

          .react-calendar__tile--active {
            background: #334155;
            color: white;
          }

          .react-calendar__tile--active:enabled:hover,
          .react-calendar__tile--active:enabled:focus {
            background: #1e293b;
          }

          .has-appointments {
            background-color: #f0f9ff;
          }

          .has-appointments:hover {
            background-color: #e0f2fe;
          }
        `}</style>
        <Calendar
          value={selectedDate}
          onChange={(date) => setSelectedDate(date as Date)}
          className="react-calendar"
          locale="en-US"
          tileContent={tileContent}
          tileClassName={tileClassName}
        />
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">
            Appointments for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <div className="space-y-2">
            {getAppointmentsForDate(selectedDate).map((appointment) => (
              <Popover key={appointment.id}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mr-2 ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    {format(parseISO(appointment.appointment_time), 'h:mm a')} -{' '}
                    {appointment.services?.name}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <p className="font-medium">{appointment.profiles?.full_name}</p>
                    <p className="text-sm text-gray-500">{appointment.profiles?.phone}</p>
                    <p className="text-sm">
                      Service: {appointment.services?.name}
                    </p>
                    <p className="text-sm">
                      Status: {appointment.status}
                    </p>
                    <p className="text-sm">
                      Price: ${appointment.services?.price}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
            {getAppointmentsForDate(selectedDate).length === 0 && (
              <p className="text-gray-500">No appointments scheduled for this day</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AdminCalendarView 