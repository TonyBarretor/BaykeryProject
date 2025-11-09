'use client';

import { useState } from 'react';
import { format, addDays, isSaturday, isSunday, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WeekendDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
}

export function WeekendDatePicker({ value, onChange }: WeekendDatePickerProps) {
  // Get next 4 weekend dates
  const getNextWeekendDates = () => {
    const dates: Date[] = [];
    let current = addDays(new Date(), 1); // Start from tomorrow
    current = startOfDay(current);

    while (dates.length < 8) {
      // Get 8 weekend days
      if (isSaturday(current) || isSunday(current)) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
    }

    return dates;
  };

  const weekendDates = getNextWeekendDates();

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4" />
        Selecciona una fecha de entrega (solo fines de semana)
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {weekendDates.map((date) => {
          const isSelected = value && startOfDay(value).getTime() === startOfDay(date).getTime();
          const dayName = format(date, 'EEE', { locale: es });
          const dayNumber = format(date, 'd');
          const monthName = format(date, 'MMM', { locale: es });

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onChange(date)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all hover:border-primary',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background'
              )}
            >
              <span className="text-xs font-medium uppercase">{dayName}</span>
              <span className="text-2xl font-bold">{dayNumber}</span>
              <span className="text-xs uppercase">{monthName}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        📅 Solo realizamos entregas los sábados y domingos
      </p>
    </div>
  );
}
