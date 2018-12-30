const fs = require('fs')
const $ = require('cheerio')

const htmlString = fs.readFileSync('Student Detail Schedule2.html').toString()
const parsedHTML = $.load(htmlString)

var courses = []

parsedHTML('.datadisplaytable').map((i, table) => {
    table = $(table) 

    if (i % 2 == 0) {
        course = {}
        const tableLines = table.text().split('\n')
        course.courseDesc = tableLines[0]
        course.status = tableLines[11]
    } else {
        const tableLines = table.text().split('\n\n\n')
        var meets = []
        tableLines.map((group, i) => {
            if (i > 0) {
                lines = group.split('\n')
                var meet = {}
                meet.timeSpan = lines[1]
                meet.daysOfWeek = lines[2]
                meet.location = lines[3]
                meet.activeDates = lines[4]
                meets.push(meet)
            }
        })
        course.meets = meets

        courses.push(course)
    }
});

fs.writeFileSync("courses.json", JSON.stringify(courses, null, 2))
