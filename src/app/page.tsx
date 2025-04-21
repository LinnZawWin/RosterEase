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
import {Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuButton, SidebarProvider, SidebarSeparator, SidebarTrigger} from '@/components/ui/sidebar';
import {Settings} from 'lucide-react';

export default function Home() {
  const [date, setDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined,
  });

  const formattedDateRange = dateRange.from && dateRange.to
    ? `${format(dateRange.from, 'yyyy-MM-dd')} - ${format(dateRange.to, 'yyyy-MM-dd')}`
    : 'Select Date Range';

  const isValidDateRange = dateRange.from && dateRange.to && dateRange.to > dateRange.from;

  return (
    <SidebarProvider>
      <div className="container flex h-screen mx-auto py-10">
        <Sidebar className="w-80">
          <SidebarHeader>
            <h4 className="font-semibold leading-tight">Settings</h4>
            <p className="text-sm text-muted-foreground">Manage Roster Configuration</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuButton>
                  <Settings className="mr-2 h-4 w-4"/>
                  <span>Staff</span>
                </SidebarMenuButton>
                <SidebarMenuButton>
                  <Settings className="mr-2 h-4 w-4"/>
                  <span>Shifts</span>
                </SidebarMenuButton>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarSeparator/>
            <p className="text-xs text-muted-foreground">RosterEase Configuration</p>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 p-4">
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
                            !dateRange.from || !dateRange.to && 'text-muted-foreground'
                          )}
                        >
                          {formattedDateRange === 'Select Date Range' ? (
                            <span>Select Date Range</span>
                          ) : (
                            <span>{formattedDateRange}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={date ? new Date(date) : new Date()}
                          selected={dateRange}
                          onSelect={setDateRange}
                          disabled={(date) => date > new Date(new Date().setDate(new Date().getDate() + 365)) || date < new Date()}
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
                        <Button disabled={!isValidDateRange} variant="primary">
                          Generate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to generate a roster for {formattedDateRange}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <Button
                            type="submit"
                            onClick={async () => {
                              if (dateRange.from && dateRange.to) {
                                const startDate = format(dateRange.from, 'yyyy-MM-dd');
                                const endDate = format(dateRange.to, 'yyyy-MM-dd');

                                const roster = await generateRoster({
                                  startDate: startDate,
                                  endDate: endDate,
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
      </div>
    </SidebarProvider>
  );
}
