# Habit Cron Job Setup

This directory contains scripts for running scheduled tasks in a Node.js environment.

## Reminder Notifications

The `check-reminders.ts` script is designed to run as a cron job to send push notifications to users for their habits.

### How it works

The script:
1. Finds all habits that have reminders enabled
2. Checks if the reminder time matches the current time
3. Skips habits that are already completed for the day
4. Sends push notifications to users for incomplete habits

### Setting up in Coolify

1. In your Coolify dashboard, go to the Habbit app settings
2. Go to the "Scheduled Tasks" section
3. Add a new scheduled task with the following:
   - **Command**: `node --loader ts-node/esm src/scripts/check-reminders.ts`
   - **Schedule**: Use a cron expression for your desired frequency (e.g., `*/30 * * * *` to run every 30 minutes)

### Environment Variables

The script requires the same environment variables as the main application:
- `DATABASE_URL`: Connection string for the database
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: VAPID public key for web push notifications
- `VAPID_PRIVATE_KEY`: VAPID private key for web push notifications

### Troubleshooting

If you encounter the "cache" export error from React, the script is using a cron-specific modified version of the notification functions that doesn't rely on Next.js server components.

### Testing Locally

You can test the cron job locally by running:

```bash
NODE_ENV=production DATABASE_URL=your_db_url NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_key VAPID_PRIVATE_KEY=your_private_key node --loader ts-node/esm src/scripts/check-reminders.ts
```

Replace the environment variables with your actual values.