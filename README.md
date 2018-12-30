# Guide to convert Esther Student Detail Schedule into Recurring, Color-Coded, Google Calendar Events 

## Prerequisites
- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [git](https://git-scm.com/downloads)

## Installation

```
git clone <url here>
cd <dir>
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

<!-- ### Optional Config

Specify configuration options in `config.json` such as...
- include waitlisted courses
- custom timezone

  -->

## Populate Calendar

```
node populateCalendar.js
```

This will request email authorization. This is the email that your calendar events will be written to (Rice Email is a good choice). Follow the console instructions carefully to ensure API token is generated properly.



