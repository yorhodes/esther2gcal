const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const date = require('date-and-time');


const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.settings.readonly']
const TOKEN_PATH = 'token.json'

const courses = require('./courses.json')

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  authorize(JSON.parse(content), fillCalendar);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:\n', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to ', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function fillCalendar(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    
    calendar.colors.get((err, res) => {
        if (err)
            return console.log('The API returned an error: ' + err)
        else
            return insertAllCourseEvents(auth, Object.keys(res.data.event))
    })
}

function insertAllCourseEvents(auth, colorIDs) {
    var colors = colorIDs
    courses.map((course, i) => {
        // ignore waitlist courses
        if (course.status.includes("Web Registered")) {
            const idx = Math.floor(Math.random() * colors.length)
            const events = createEventsFromCourse(course, colors[idx])
            events.map((e, j) => insertEvent(auth, e))
            colors.splice(idx, 1)
        }
    })
}

function insertEvent(auth, eventContents) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.insert({
      calendarId: 'primary',
      resource: eventContents
    }, (err, res) => {
        if (err) 
            return console.log('The API returned an error: ' + err);
    });
}

function formatMeridiem(original) {
    const result1 = original.replace("pm", "p.m.")
    const result2 = result1.replace("am", "a.m.")
    return result2
}

function getDateTime(dateStr, timeStr) {
    ogDate = date.parse(dateStr + formatMeridiem(timeStr), "MMM D, YYYYh:mm A")
    return date.addHours(ogDate, 1)
}

function createEventsFromCourse(course, colorIdStr) {
    const timezone = "America/Chicago"
    var events = []

    course.meets.map((meet) => {
        var event = {
            start: {
                timeZone: timezone
            },
            end: {
                timeZone: timezone
            },
            colorId: colorIdStr
        }
    
        const delim = ' - '
    
        const [startDate, endDate] = meet.activeDates.split(delim)
        const [startTime, endTime] = meet.timeSpan.split(delim)
    
        const startDateStartTime = getDateTime(startDate, startTime)
        const startDateEndTime = getDateTime(startDate, endTime)
    
        event.start.dateTime = startDateStartTime.toJSON()
        event.end.dateTime = startDateEndTime.toJSON()
    
        if (startDate != endDate) {
            const bydayStr = convertDaysOfWeekToBYDAY(meet.daysOfWeek)
            const untilStr = getDateTime(endDate, endTime)

            event.recurrence = [
                "RRULE:" //recurrence rule 
                + "FREQ=WEEKLY;" // weekly frequency
                + "WKST=SU;"     // sunday weekday start
                + "BYDAY=" + bydayStr // dynamic weekdays
                // + "UNTIL=" + untilStr       // stop recurrence upon semester end
            ]
        }   
    
        const len = course.courseDesc.length
        const section = course.courseDesc.substring(len - 3)
        const code = course.courseDesc.substring(len - 14, len - 6)
        const name = course.courseDesc.substring(0, len - 17)
    
        event.summary = code 
        event.description = name + " " + section
        event.location = meet.location
        event.reminders = {
            useDefault: true
        }

        events.push(event)
    })

    return events
}

function convertDaysOfWeekToBYDAY(daysOfWeek) {
    const dayMap = {
        'M': "MO",
        'T': "TU",
        'W': "WE",
        'R': "TH",
        'F': "FR"
    }

    var bydays = []

    daysOfWeek.split('').map(dayChar => bydays.push(dayMap[dayChar]))

    return bydays.join(',')
}

