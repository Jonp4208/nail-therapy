'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSupabaseContext } from '@/context/SupabaseProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { Database } from '@/types/database.types'

const STATUS_COLORS = {
  confirmed: 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-400',
  pending: 'bg-yellow-400',
  default: 'bg-gray-300'
}

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

function getStatusColor (status) {
  return STATUS_COLORS[status] || STATUS_COLORS.default
}

function getDaysMatrix (monthDate) {
  const startMonth = startOfMonth(monthDate)
  const endMonth = endOfMonth(monthDate)
  const start = startOfWeek(startMonth, { weekStartsOn: 0 })
  const end = endOfWeek(endMonth, { weekStartsOn: 0 })
  const days = []
  let day = start
  while (day <= end) {
    days.push(day)
    day = addDays(day, 1)
  }
  return days
}

function formatTime (timeStr) {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export default function AdminGoogleStyleCalendar () {
  const { supabase } = useSupabaseContext()
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [supabase])

  const fetchAppointments = async () => {
    try {
      if (!supabase) return
      const { data, error } = await supabase
        .from('appointments')
        .select(`*,services (name,price)`) // add more fields as needed
        .order('appointment_date')
        .order('appointment_time')
      if (error) throw error
      // Fetch client info
      const withProfiles = await Promise.all(
        (data || []).map(async (appt) => {
          if (appt.user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', appt.user_id)
              .single()
            if (!profileError && profileData) {
              return { ...appt, profiles: profileData }
            }
          }
          if (appt.guest_name) {
            return { ...appt, profiles: { full_name: appt.guest_name, phone: appt.guest_phone || 'N/A' } }
          }
          return { ...appt, profiles: { full_name: 'Unknown', phone: 'N/A' } }
        })
      )
      setAppointments(withProfiles)
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group appointments by date string
  const apptByDate = useMemo(() => {
    const map = {}
    for (const appt of appointments) {
      const dateStr = appt.appointment_date
      if (!map[dateStr]) map[dateStr] = []
      map[dateStr].push(appt)
    }
    return map
  }, [appointments])

  const days = useMemo(() => getDaysMatrix(currentMonth), [currentMonth])

  function handlePrevMonth () {
    setCurrentMonth(prev => subMonths(prev, 1))
  }
  function handleNextMonth () {
    setCurrentMonth(prev => addMonths(prev, 1))
  }
  function handleToday () {
    setCurrentMonth(startOfMonth(new Date()))
  }

  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <CardTitle>Appointment Calendar</CardTitle>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={handlePrevMonth}><ChevronLeft /></Button>
          <span className='font-semibold text-lg'>{format(currentMonth, 'MMMM yyyy')}</span>
          <Button variant='outline' size='sm' onClick={handleNextMonth}><ChevronRight /></Button>
          <Button variant='outline' size='sm' onClick={handleToday}>Today</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden'>
          {[ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ].map(d => (
            <div key={d} className='bg-slate-50 py-2 text-center font-medium text-slate-500 text-xs uppercase tracking-wide'>{d}</div>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-px bg-slate-200 rounded-b-lg overflow-hidden'>
          {days.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const appts = apptByDate[dateStr] || []
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())
            return (
              <div
                key={dateStr}
                className={
                  'min-h-[90px] bg-white px-1.5 pt-1.5 pb-2 flex flex-col border border-slate-100 relative ' +
                  (!isCurrentMonth ? 'bg-slate-50 text-slate-300' : '') +
                  (isToday ? 'ring-2 ring-blue-400 z-10' : '')
                }
              >
                <div className='text-xs font-semibold mb-1 text-right'>{day.getDate()}</div>
                <div className='flex flex-col gap-1 flex-1'>
                  {appts.slice(0, 2).map((appt, i) => (
                    <Popover key={appt.id}>
                      <PopoverTrigger asChild>
                        <button
                          className={`truncate text-xs text-white px-2 py-0.5 rounded font-medium shadow ${getStatusColor(appt.status)} w-full text-left`}
                          style={{ maxWidth: '100%' }}
                        >
                          {formatTime(appt.appointment_time)} {appt.services?.name || 'Appointment'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className='w-64'>
                        <div className='font-semibold'>{appt.services?.name}</div>
                        <div className='text-sm text-slate-500'>{appt.profiles?.full_name}</div>
                        <div className='text-sm'>
                          {format(parseISO(appt.appointment_date), 'MMM d, yyyy')}<br/>
                          {formatTime(appt.appointment_time)}
                        </div>
                        <div className='text-sm mt-2'>
                          Status: <span className={`font-semibold ${getStatusColor(appt.status)}`}>{appt.status}</span>
                        </div>
                        <div className='text-sm'>Price: ${appt.services?.price}</div>
                        <div className='text-sm'>Phone: {appt.profiles?.phone}</div>
                      </PopoverContent>
                    </Popover>
                  ))}
                  {appts.length > 2 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className='text-xs text-blue-600 hover:underline w-full text-left'>+{appts.length - 2} more</button>
                      </PopoverTrigger>
                      <PopoverContent className='w-64 max-h-60 overflow-y-auto'>
                        {appts.slice(2).map(appt => (
                          <div key={appt.id} className='mb-2 last:mb-0'>
                            <div className={`truncate text-xs text-white px-2 py-0.5 rounded font-medium shadow ${getStatusColor(appt.status)} mb-1`}>{formatTime(appt.appointment_time)} {appt.services?.name || 'Appointment'}</div>
                            <div className='text-xs text-slate-500'>{appt.profiles?.full_name}</div>
                            <div className='text-xs'>{formatTime(appt.appointment_time)}</div>
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 