#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("./utils/events");
const auth_1 = require("./utils/auth");
function parseDuration(duration) {
    // parse the duration to look like this for example: 8h 0m or 5h 15m
    // the passed duration is in this format 08:00 or 05:15
    const [hours, minutes] = duration.split(":");
    return `${parseInt(hours)}h ${parseInt(minutes)}m`;
}
function parseWorkSchedule(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    const workShifts = lines.map(line => {
        const [dateRange, d, location, status] = line.split(' | ').map(part => part.trim());
        const [startDateTime, endDateTime] = dateRange.split(' - ');
        const duration = parseDuration(d);
        return {
            startDateTime,
            endDateTime,
            duration,
            location,
            status
        };
    });
    return workShifts;
}
function main() {
    // Check if a file path is provided as a command-line argument
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Error: Please provide the path to the schedule.txt file.');
        process.exit(1);
    }
    const filePath = path.resolve(args[0]);
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found at ${filePath}`);
        process.exit(1);
    }
    console.log('File found:', filePath);
    // Parse the work schedule
    const workShifts = parseWorkSchedule(filePath);
    console.log('Parsed Work Shifts:', workShifts);
    // Authenticate and add events to Google Calendar
    (0, auth_1.getAuthenticatedClient)().then((auth) => {
        workShifts.forEach((shift) => {
            (0, events_1.addEvent)(auth, shift);
        });
    }).catch((error) => {
        console.error('Error creating events:', error);
    });
}
// Run the main function
main();
