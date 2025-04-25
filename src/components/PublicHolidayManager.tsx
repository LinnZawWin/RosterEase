'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useId } from 'react';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface PublicHolidayManagerProps {
  dateRange: DateRange;
  calendarData: { name: string; date: string; days?: string[] }[];
  setCalendarData: React.Dispatch<React.SetStateAction<{ name: string; date: string; days?: string[] }[]>>;
  daysOfWeekOptions: { value: string; label: string }[];
}

export default function PublicHolidayManager({ 
  dateRange, 
  calendarData, 
  setCalendarData,
  daysOfWeekOptions 
}: PublicHolidayManagerProps) {
  // Generate a stable ID for select components
  const selectId = useId();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Public Holiday Configuration</CardTitle>
        <CardDescription>
          Automatically retrieve public holidays in New South Wales, Australia within the selected date range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          onClick={async () => {
            if (dateRange.from && dateRange.to) {
              const startDate = format(dateRange.from, 'yyyy-MM-dd');
              const endDate = format(dateRange.to, 'yyyy-MM-dd');

              try {
                const response = await fetch(
                  `https://date.nager.at/api/v3/PublicHolidays/${new Date(dateRange.from).getFullYear()}/AU`
                );
                if (!response.ok) {
                  throw new Error('Failed to fetch public holidays');
                }
                const holidays = await response.json();

                const filteredHolidays = holidays.filter(
                  (holiday: { localName: string; date: string; counties?: string[] }) =>
                    holiday.localName &&
                    holiday.date &&
                    new Date(holiday.date) >= new Date(startDate) &&
                    new Date(holiday.date) <= new Date(endDate) &&
                    holiday.counties?.includes('AU-NSW')
                );

                const updatedHolidays = filteredHolidays.map((holiday: { localName: string; date: string }) => ({
                  name: holiday.localName,
                  date: holiday.date,
                }));

                setCalendarData(updatedHolidays);
              } catch (error) {
                console.error('Error fetching public holidays:', error);
                alert('Failed to retrieve public holidays. Please try again later.');
              }
            } else {
              alert('Please select a valid date range first.');
            }
          }}
        >
          Retrieve Public Holidays
        </Button>
        
        {calendarData.map((holiday, index) => (
          <div key={index} className="mb-4 border rounded p-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Holiday Name</label>
                <Input
                  type="text"
                  value={holiday.name}
                  onChange={(e) => {
                    const updatedHolidays = [...calendarData];
                    updatedHolidays[index].name = e.target.value;
                    setCalendarData(updatedHolidays);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={holiday.date}
                  onChange={(e) => {
                    const updatedHolidays = [...calendarData];
                    updatedHolidays[index].date = e.target.value;
                    setCalendarData(updatedHolidays);
                  }}
                  min={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                  max={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const updatedHolidays = [...calendarData];
                updatedHolidays.splice(index, 1);
                setCalendarData(updatedHolidays);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ))}
        
        <Button
          variant="secondary"
          onClick={() => setCalendarData([...calendarData, { name: '', date: '' }])}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Public Holiday
        </Button>
      </CardContent>
    </Card>
  );
}