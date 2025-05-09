import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, differenceInDays } from 'date-fns';
import { uk } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (range: { startDate: Date; endDate: Date }) => void;
}

export default function DateRangePicker({ 
  startDate = new Date(), 
  endDate = new Date(new Date().setDate(new Date().getDate() + 1)),
  onChange 
}: DateRangePickerProps) {
  const [tempStartDate, setTempStartDate] = useState<Date>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);
  const [month, setMonth] = useState<Date>(startDate);
  const [daysCount, setDaysCount] = useState<number>(differenceInDays(endDate, startDate) + 1);

  useEffect(() => {
    if (tempEndDate) {
      const count = differenceInDays(tempEndDate, tempStartDate) + 1;
      setDaysCount(count);
      onChange({ startDate: tempStartDate, endDate: tempEndDate });
    }
  }, [tempStartDate, tempEndDate, onChange]);

  const resetDates = () => {
    const today = new Date();
    setTempStartDate(today);
    setTempEndDate(new Date(today.setDate(today.getDate() + 1)));
    setMonth(today);
  };

  const getDayWord = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'день';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'дні';
    return 'днів';
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <span>{format(tempStartDate, 'd MMMM yyyy', { locale: uk })}</span>
            <span className="mx-1">-</span>
            <span>{tempEndDate ? format(tempEndDate, 'd MMMM yyyy', { locale: uk }) : '...'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-between p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMonth(subMonths(month, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {format(month, 'MMMM yyyy', { locale: uk })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Calendar
            mode="range"
            selected={{
              from: tempStartDate,
              to: tempEndDate || tempStartDate
            }}
            onSelect={(range) => {
              if (range?.from) setTempStartDate(range.from);
              if (range?.to) setTempEndDate(range.to);
            }}
            month={month}
            onMonthChange={setMonth}
            className="rounded-md border"
            locale={uk}
            defaultMonth={new Date()}
          />

          <div className="flex justify-end p-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              setTempStartDate(today);
              setTempEndDate(today);
              setMonth(today);
            }}
          >
            Скинути
          </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex items-baseline gap-1 px-2">
        <span className="text-blue-600 dark:text-blue-400 font-medium text-lg">
          {daysCount}
        </span>
        <span className="text-blue-600/80 dark:text-blue-400/80 text-sm">
          {getDayWord(daysCount)}
        </span>
      </div>
    </div>
  );
}