# 📅 Work Schedule Parser

Welcome to the Work Schedule Parser! This tool helps you import your work schedule from a text file into your Google Calendar. You can run the tool from your terminal to quickly set up your calendar with your upcoming shifts.

## 🚀 Features

- 📅 **Google Calendar Integration**: Automatically adds parsed shifts to your Google Calendar.
- 🕒 **Duration Parsing**: Converts work duration from `HH:MM` format to a more readable `Xh Ym` format.
- 📂 **Custom File Path**: Provide the path to your schedule text file directly via the command line.

## 🖥️ Usage

Run the tool from anywhere in your terminal:

```bash
wsp /path/to/schedule.txt
```

### Example

```bash
wsp ~/Desktop/schedule.txt
```

## 🛠️ Development & Maintenance

### 📦 Project Structure

- `src/`: Contains TypeScript source files.
- `dist/`: Contains compiled JavaScript files after building.
- `~/.config/wsp/token.json` - The location of the Google API token.
- `~/.config/wsp/credentials.json` - The location of the Google API credentials.

### 📝 Updating the Code

1. Make changes to the TypeScript files in the `src/` directory.
2. Rebuild the project:

```bash
pnpm run build
```

3. Test your changes locally:

```bash
wsp /path/to/schedule.txt
```

4. Update global installation:

```bash
pnpm install -g .
```

### 🔄 Updating Dependencies

1. Check for outdated packages:

```bash
pnpm outdated
```

2. Update packages:

```bash
pnpm update
```

3. Rebuild after updates:

```bash
pnpm run build
```

### 🧹 Cleaning Up

- To remove compiled files:

```bash
pnpm run clean
```

## 📝 Schedule File Format

The `schedule.txt` file should contain your work shifts, with each shift formatted on a new line. The expected format for each event is:

```sql
[Start Date & Time] - [End Date & Time] | [Duration (HH:MM)] | [Location] | [Status]
```

### Example

```yaml
2024-09-01T09:00:00 - 2024-09-01T17:00:00 | 08:00 | Office | Confirmed
2024-09-02T10:00:00 - 2024-09-02T15:00:00 | 05:00 | Remote | Tentative
```

## 🎉 Thank you for using Work Schedule Parser!

If you have any feedback or suggestions, please [open an issue](https://github.com/bartosz-skejcik/wsp/issues/new) or [open a pull request](https://github.com/bartosz-skejcik/wsp/pulls) on the project.
