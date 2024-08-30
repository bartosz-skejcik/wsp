"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEvent = addEvent;
const googleapis_1 = require("googleapis");
function addEvent(oAuth2Client, workShift) {
    const calendar = googleapis_1.google.calendar({ version: "v3", auth: oAuth2Client });
    const event = {
        summary: `${workShift.status}, Shift: ${workShift.duration}`,
        location: workShift.location,
        description: `Work shift: ${workShift.duration}`,
        start: {
            dateTime: new Date(workShift.startDateTime).toISOString(),
            timeZone: "Europe/Warsaw", // Adjust timezone accordingly
        },
        end: {
            dateTime: new Date(workShift.endDateTime).toISOString(),
            timeZone: "Europe/Warsaw", // Adjust timezone accordingly
        },
    };
    calendar.events.insert({
        calendarId: "c_c5256a74a7e9e77e1f4db1498ad813878c64e71bb35cceb4606e9cebf652ceba@group.calendar.google.com",
        // @ts-ignore
        resource: event,
    }, (err, res) => {
        if (err)
            return console.error("Error creating event:", err);
        console.log("Event created: %s", res === null || res === void 0 ? void 0 : res.data.htmlLink);
    });
}
