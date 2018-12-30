const fs = require('fs')
const $ = require('cheerio')

const htmlString = fs.readFileSync('Student Detail Schedule.html').toString()
const parsedHTML = $.load(htmlString)

var courses = []

parsedHTML('.datadisplaytable').map((i, table) => {
    table = $(table) 
    tableLines = table.text().split('\n')

    if (i % 2 == 0) {
        course = {}
        course.courseDesc = tableLines[0]
        course.status = tableLines[11]
    } else {
        course.timeSpan = tableLines[12]
        course.daysOfWeek = tableLines[13]
        course.location = tableLines[14]
        course.activeDates = tableLines[15]

        courses.push(course)
    }
});

fs.writeFileSync("courses.json", JSON.stringify(courses, null, 2))
