import { CompactButton } from './compact-button'
import { CreateHabitDrawer } from './create-habit-drawer'
import { Icons } from './icons'
import { Button } from './ui/button'

export function FloatingNavbar() {
  return (
    <div className="fixed bottom-6 max-w-fit space-x-2 rounded-xl border bg-white p-2 shadow-md">
      <CompactButton />
      <CreateHabitDrawer />
      <Button size={'icon'} disabled>
        <Icons.Kanban />
      </Button>
    </div>
  )
}
