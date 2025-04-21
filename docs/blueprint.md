# **App Name**: RosterEase

## Core Features:

- Staff Configuration: Define staff members with attributes like category (AT-1, AT-2, AT-C, BT-1, BT-2, BT-3), FTE, and availability. This can be adjusted for specific date ranges.
- Shift Configuration: Configure shift types (Regular day, Evening, Night, Clinic) with their durations and staff categories eligible for each shift.
- Preference Input: Input staff preferences (preferred days/shifts, leave requests, consecutive shift preferences).
- Roster Generation: Use an AI tool to automatically generate a balanced roster, distributing shifts evenly, respecting FTE constraints, staff preferences, and constraints around shifts being too close together (e.g., no day shift after a night shift).
- Roster Display: Display the generated roster in a clear, calendar-like view with staff names, shift types, and times. Allow for manual adjustments and display any violations of rules or constraints.

## Style Guidelines:

- Primary color: A calm blue (#3498db) to convey reliability and professionalism.
- Secondary color: A light gray (#f2f2f2) for backgrounds and content containers to ensure readability.
- Accent: A warm orange (#e67e22) to highlight important actions and interactive elements.
- Clean and readable sans-serif fonts for all text elements.
- Simple, modern icons to represent different shift types and staff categories.
- A clear and intuitive grid-based layout for easy navigation and data presentation.
- Subtle transitions and animations to provide feedback on user interactions and enhance the overall experience.

## Original User Request:
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
  