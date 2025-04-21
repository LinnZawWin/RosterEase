"use client";

import {generateRoster} from '@/ai/flows/generate-roster';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {useState} from 'react';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>RosterEase</CardTitle>
          <CardDescription>
            Generate and manage your staff rosters with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Date Range</CardTitle>
                <CardDescription>Choose the start and end dates for roster generation.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      {date ? format(date, 'yyyy-MM-dd') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) =>
                        date > new Date() || date < new Date('2020-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate Roster</CardTitle>
                <CardDescription>Generate a roster based on selected dates.</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={!date} variant="primary">
                      Generate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to generate a roster for {formattedDate}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button
                        type="submit"
                        onClick={async () => {
                          if (date) {
                            const roster = await generateRoster({
                              startDate: formattedDate,
                              endDate: formattedDate,
                            });
                            console.log(roster);
                            alert('Roster generated successfully!');
                          }
                        }}
                      >
                        Generate
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
