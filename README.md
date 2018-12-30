# Guide to convert Esther Student Detail Schedule into Google Calendar Events 

## Features
- recurring events
- reminders
- course color-coding
- multiple meeting times/locations (including final exam) 

## Prerequisites
- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [git](https://git-scm.com/downloads)

## Installation

```
git clone https://github.com/yorhodes/esther2gcal.git
cd esther2gcal
npm install
```

## Retrieve Esther Schedule

Navigate to your Esther [Student Detail Schedule](https://esther.rice.edu/selfserve/bwskfshd.P_CrseSchdDetl). Select the desired semester. 

'Save As' the resulting web page to the 'esther2gcal' directory.

## Parse Schedule

```
node parseEsther.js
```

Output will be written to `courses.json`

## Populate Calendar

```
node populateCalendar.js
```

This will request email authorization. Choose the email account that you want the calendar events on. Follow the console instructions carefully to ensure GCal API token is generated properly.

## Contribution Ideas

- config file allowing for custom...
    - timezone
    - include waitlist flag
    - number of mins before class notification
    - color-coding
- integrate Rice academic calendar to exclude dates
- exclusion of holidays?
- fix end date in recurrence rule
- fix first day of classes glitch
