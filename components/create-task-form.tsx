import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDaysIcon, FlagIcon, PlusIcon, SquarePenIcon } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function CreateTaskForm() {
  return <form className="relative flex gap-2">
    <SquarePenIcon className='absolute stroke-muted-foreground size-4 top-[50%] translate-y-[-50%] left-4' />
    <Input placeholder="Add new task..." className='pl-10' />
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-32 justify-start font-normal">
          <CalendarDaysIcon className="stroke-muted-foreground size-4 mr-2" />
          Due date
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" />
      </PopoverContent>
    </Popover>
    <Select>
      <SelectTrigger className='min-w-40 w-fit'>
        <div className='flex gap-2 items-center'>
          <FlagIcon className='stroke-muted-foreground size-4' />
          <SelectValue placeholder="Select project" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="project-a">Project A</SelectItem>
        <SelectItem value="project-b">Project B</SelectItem>
        <SelectItem value="project-c">Project C</SelectItem>
      </SelectContent>
    </Select>
    <Button type="submit">
      <PlusIcon className="h-4 w-4 mr-2" />
      Add Task
    </Button>
  </form>
}
