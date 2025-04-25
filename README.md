# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.


I want to build a web-based Roster App for Duty Roster & Staff Shift Planning.

Here's the current sample data but I need the app to allow configuration of staffs, their category, their FTE (how many hours per specific duration), the duration of the shifts for each day of the week and the working hours for each duration, type of shifts and which category of the staff can work on those, the preferences of the staffs (e.g. would like to work on specific day of the week/specific shift), the request by the staff (e.g. on leave from specific date range, prefer not to take night shifts, prefer to take 3 consecutive shifts and consecutive day off, etc.)
The app should evenly distribute the shifts and hours and make sure the shifts are not too close (e.g. no regular day or evening shift on the day after the night shift). If there is any change in the situation on a specific date (e.g. number of staff change, FTE of the staff change, clinic open days or hours change), the app should be able to pick up from that specific date and re-generate with the consideration of the previous shifts (total number of working hours, not being too close to the last shift, etc.) without a lot of major change to the existing shifts as much as possible.

There are only 7 staff at the moment.
AT-1
AT-2
AT-3
AT-C (clinic mainly, but can do a few day shifts)
BT-1
BT-2 (0.5 FTE)
BT-3 (0.5 FTE)

AT-1, AT-2 and AT-3 can do other clinics that AT-C don’t.

Shifts-ward on weekdays
Regular day (8:00-16:00) - 8 working hours
Evening (14:00- 22:00) - 8 working hours
Night (21:30-8:30) - 11 working hours

Shifts-ward on weekends
Day (8:00-20:30) - 12.5 working hours
Night (8:00- 8:30) - 12.5 working hours

Clinic shifts (8:00-16:30) - 8.5 working hours

Full time (1 FTE) must work at least 80 hours per fortnight
0.5 FTE must work at least 40 hours per fortnight

AT-C- mainly clinic duty, a few ward shifts. Fixed clinic days- every Monday, Wednesday, Thursday, 
Other clinics for other ATs- Fortnightly Tuesday, every Friday, 
BT-1, BT-2 are 0.5 FTE each, no clinic duty



AT- C can’t do night
BT can’t do clinics




Remove the Generate Roster section and add the Generate Roster button at the end below the Reset Button.
Move the "Select Date Range" between the Reset button and that Generate Roster button .
Change the "Reset" button to "Reset Configuration" and clicking it will remove all Configuration data (Category, Staff, Shift).



FTE and category options should be pre-selected with the data provide in the sample data. Categories are AT, AT-C and BT only. Shift configuration should allow to enter the start and end hours of the shifts and days of the week (pre populated from sample data). Eligible Categories for shift is multi-select drop down (pre-selected with the sample data);
Time selection part of the time picker should only allow 00 and 30 minutes only.




Move the "Category Configuration" button at the top




        
      <div className="mt-8">
        <h3 className="text-lg font-bold">Calendar Data (JSON)</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(calendarData, null, 2)}
        </pre>
      </div>




The other thing is for night shifts,  normally keep 3/4 nights group together and then they get a few days off after (2-4 days)

the only remaining is to consider FTE during the shift assignment based on the hours


add special rule for night shifts. If the name of the shift contains "Night", once it is assigned to one particular staff, assign night shifts for 3 or 4 days consecutively. Once they have completed consecutive days of night shifts, make sure not to assign night shift 



In the attached code, I want the consecutiveStaff to be assigned to the applicable shifts for the specified consecutive Days and make sure not to assign to the applicable shifts for the specified gap Days 

e.g. Applicable shifts are Night and Night (Weekend)

Once staff AT-1 is assigned to Night shift on 1 May 2025, assign staff AT-1 to Night shift on 2 May 2025, Night (Weekend) shift on 3 May 2025.

And make sure not to assign staff AT-1 for Night (Weekend) shift on 4 May 2025, Night shift on 5 May 2025 and Night shift on 6 May 2025,

In the attached code from .tsx file, I want the consecutiveStaff to be assigned to the applicable shifts for the specified consecutive Days and make sure not to assign to the applicable shifts for the specified gap Days 
e.g. Applicable shifts are Night and Night (Weekend)
Once staff AT-1 is assigned to Night shift on 1 May 2025, assign staff AT-1 to Night shift on 2 May 2025, Night (Weekend) shift on 3 May 2025.
And make sure not to assign staff AT-1 for Night (Weekend) shift on 4 May 2025, Night shift on 5 May 2025 and Night shift on 6 May 2025,


these are the default values. Can you try to simulate the generateRoster function with the values provided for date range of 1 May 2025 - 31 May 2025. and show the Night
and Night (Weekend) assignment for that date range?

const defaultStaff = [
  { name: 'AT-1', category: 'AT', fte: 1 },
  { name: 'AT-2', category: 'AT', fte: 1 },
  { name: 'AT-3', category: 'AT', fte: 1 },
  { name: 'AT-C', category: 'AT-C', fte: 1 },
  { name: 'BT-1', category: 'BT', fte: 1 },
  { name: 'BT-2', category: 'BT', fte: 0.5 },
  { name: 'BT-3', category: 'BT', fte: 0.5 },
];

const defaultShifts = [
  { name: 'Regular day', startTime: '08:00', endTime: '16:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'AT-C', 'BT'] },
  { name: 'Evening', startTime: '14:00', endTime: '22:00', duration: 8, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'AT-C', 'BT'] },
  { name: 'Night', startTime: '21:30', endTime: '08:30', duration: 11, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'BT'] },
  { name: 'Clinic', startTime: '08:00', endTime: '16:30', duration: 8.5, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], categories: ['AT', 'AT-C'] },
  { name: 'Day (Weekend)', startTime: '08:00', endTime: '20:30', duration: 12.5, days: ['Sat', 'Sun'], categories: ['AT', 'AT-C', 'BT'] },
  { name: 'Night (Weekend)', startTime: '20:00', endTime: '08:30', duration: 12.5, days: ['Sat', 'Sun'], categories: ['AT', 'BT'] },
];

const defaultFixedShifts = [
  {
    staff: 'AT-C',
    shift: 'Clinic',
    days: ['Mon', 'Wed', 'Thu'],
  },
];
const defaultShiftExceptions = [
  {
    staff: 'AT-C',
    shift: 'Clinic',
    days: ['Tue', 'Fri'],
  },
];

const defaultSpecialRules = [
  {
    shifts: ['Night', 'Night (Weekend)'],
    consecutiveDays: 3,
    gapDays: 3,
  },
];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = (i % 2 === 0) ? '00' : '30';
  return ${hour}:${minute};
});

const daysOfWeekOptions = [
  { value: 'Sun', label: 'Sunday' },
  { value: 'Mon', label: 'Monday' },
  { value: 'Tue', label: 'Tuesday' },
  { value: 'Wed', label: 'Wednesday' },
  { value: 'Thu', label: 'Thursday' },
  { value: 'Fri', label: 'Friday' },
  { value: 'Sat', label: 'Saturday' },
];




in your simulation, I am expecting 2025-05-05 and 2025-05-06 to be BT-1 because that staff was assigned for "2025-05-04 (Sun): Night (Weekend)" and night shifts for next x2 consecutive days should be assigned to the same staff BT-1.  update the generateRoster code to achieve that expected result.


update the logic of assigning for special rule.
1. For the shift assignment of the first date on the date range, don't apply any special rule and just assign as normal.
2. At the end of the normal assignment, check if any of the assigned shifts match the Applicable Shifts, start the Consecutive Days tracking and for the x number of Consecutive Days (including the current day), make sure the same staff is assigned to the Applicable Shift on that date (start that logic and assign before the normal assignment).
3. Once the Consecutive Days tracking is over, start the Gap Days tracking and for the x number of Gap Days (including the current day), make sure that staff is not assigned to the Applicable Shift on those date (check that Gap Days tracking before any normal assignment happen).
4. At the same time, the Consecutive Days tracking is over, don't apply any special rule for the Applicable Shifts and just assign as normal as in the rule 1.



split the into different methods
0. Get the number of working hours for each staff by adding up all the "Working Hours" of the Shifts that the staff was assigned in the last 14 days (2 weeks) and store against each staff. When the "Working Hours" of the Shifts are calculated, divide the Working Hours of the shift type with the Staff's FTE. (e.g. Staff AT-1 with 1 FTE work on the Regular day shift with 8 working hours = 8 hrs. Staff BT-2 with 0.5 FTE work on the Regular day shift with 8 working hours = 16 hrs)
1. main generateRoster method which loops through all the dates within the date range parameter and call the following sub methods for each day
2. Get the Shift Types for current date's Day of the Week based on the Shift Configuration and loop through each Shift Type for the following sub methods
3. Process Fixed Shift: if it matches the shift in the Fixed Shift Configuration and the current date's Day of the Week match, assign to that Staff. Else, go to method 4.
4. Process Special Rule Consecutive Days: if it matches the shift in the Applicable Shifts of the Special Rule and the Consecutive Day Tracking has started (from the method 5), assign to that Staff and decrease the remaining Consecutive Day Tracking until it is 0 (Once the Consecutive Day Tracking is completed, start the Gay Day Tracking). Else, go to method 5.
5. Assign Normally: Based on the Applicable Categories of the Shift, get all the staff from Staff Configuration with that category to Available Staff list. Remove the staff who has already been assigned to the shift for the same day. Remove the staff from the list using Method 11 and Method 12. Sort the staff in the Available Staff list based on the last 2 weeks working hours (from the method 0). If there is only 1 staff with lowest working hours, assign the shift to that staff. If there are more than one with the same number of lowest working hours (or 0), randomise from that subset and assign. If that shift type matches the shift in the Applicable Shifts of the Special Rule and the Consecutive Day Tracking has not started, start the Consecutive Day Tracking.

11. Remove Staff based on Shift Exception: If the shift is in the Shift Exception Configuration and the current date's Day of the Week match, remove that staff from the Available Staff list
12. Remove Staff based on Special Rule Gap Days: If it matches the shift in the Applicable Shifts of the Special Rule and the Gap Day Tracking has started (from the method 4), remove that Staff from the available Staff list and decrease the remaining Gap Day Tracking until it is 0

remove the "Retrieve Public Holidays" button and automatically add the public holidays on change of the daterangeFrom and daterangeTo when both of those have a value. (as well as the default dates are being populated initially)


extract out the Category Configuration section to a new code file just like PublicHolidayManager