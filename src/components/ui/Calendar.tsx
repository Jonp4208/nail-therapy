import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
// Import Button and create buttonVariants function
import Button from "@/components/ui/Button"

// Define buttonVariants function since it's not exported from Button
const buttonVariants = ({ variant }: { variant?: string }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    primary: 'bg-slate-700 text-white hover:bg-slate-800 focus-visible:ring-slate-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500',
    outline: 'border border-slate-300 bg-transparent hover:bg-slate-100 focus-visible:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-100 focus-visible:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  };

  return `${baseStyles} ${variants[variant || 'primary']}`;
}

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 pb-4 relative items-center",
        caption_label: "text-base font-semibold text-slate-800",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white border border-slate-200 rounded-full p-0 hover:bg-slate-100 hover:border-slate-300 transition-colors"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-2",
        head_row: "flex",
        head_cell:
          "text-slate-500 font-medium rounded-md w-10 h-10 flex items-center justify-center text-[0.9rem]",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal rounded-full hover:bg-slate-100 aria-selected:opacity-100 transition-colors"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-slate-700 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-700 focus:text-white rounded-full",
        day_today: "bg-slate-100 text-slate-900 font-semibold",
        day_outside:
          "day-outside text-slate-400 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-400 aria-selected:opacity-30",
        day_disabled: "text-slate-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5 text-slate-600" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5 text-slate-600" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
