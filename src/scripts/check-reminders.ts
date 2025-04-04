import { checkAndSendHabitReminders } from '../app/actions'

async function main() {
  console.log('Starting habit reminder check...')

  try {
    // Run the habit reminder check
    // The false parameter means only check habits with matching reminder times
    const result = await checkAndSendHabitReminders(false)

    console.log('Habit reminder check completed:', result)
  } catch (error) {
    console.error('Error running habit reminders:', error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error in reminder script:', error)
    process.exit(1)
  })
