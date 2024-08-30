#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { WorkShift } from "./types";
import { addEvent } from "./utils/events";
import { getAuthenticatedClient } from "./utils/auth";

function parseDuration(duration: string): string {
  // parse the duration to look like this for example: 8h 0m or 5h 15m
  // the passed duration is in this format 08:00 or 05:15
  const [hours, minutes] = duration.split(":")

  return `${parseInt(hours)}h ${parseInt(minutes)}m`;
}

function parseWorkSchedule(filePath: string): WorkShift[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');

  const workShifts: WorkShift[] = lines.map(line => {
    const [dateRange, d, location, status] = line.split(' | ').map(part => part.trim());

    const [startDateTime, endDateTime] = dateRange.split(' - ');

    const duration = parseDuration(d)

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

async function main() {
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

  // Check if the credentials.json file exists
  const credentialsPath = '/home/j5on/.config/wsp/credentials.json';
  if (!fs.existsSync(credentialsPath)) {
    console.error(`Error: Credentials file not found at ${credentialsPath}`);
    process.exit(1);
  }

  // Parse the work schedule
  const workShifts = parseWorkSchedule(filePath);
  console.log('Parsed Work Shifts:', workShifts);

  try {
    const auth = await getAuthenticatedClient();
    if (auth === null) {
      console.log("Authentication successful. Please rerun the command to add events.");
      process.exit(0);
    }
    for (const shift of workShifts) {
      await addEvent(auth, shift);
    }
    console.log("All events have been added successfully.");
  } catch (error) {
    console.error('Error creating events:', error);
  }
}

// Run the main function
main();
