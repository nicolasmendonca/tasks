import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDaysIcon, FlagIcon, TrashIcon } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function TaskCard() {
  return <Card>
    <CardContent className="grid gap-2 pt-6">
      <div className="flex items-center gap-3">
        <Checkbox id="task-1" />
        <div className="flex-1">
          <h3 className="font-medium pl-2" contentEditable>
            Finish weekly report
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="w-fit px-2 h-3 text-xs font-normal">
                  <CalendarDaysIcon className='size-4 stroke-muted-foreground mr-1' />
                  Due: April 15, 2023
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" />
              </PopoverContent>
            </Popover>
            <Select>
              <SelectTrigger className="h-3 group w-fit px-2 text-xs border-none hover:bg-muted">
                <FlagIcon className='stroke-muted-foreground group-hover:stroke-accent-foreground size-4 mr-1' />
                <SelectValue placeholder="Project A" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project-a">Project A</SelectItem>
                <SelectItem value="project-b">Project B</SelectItem>
                <SelectItem value="project-c">Project C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <TrashIcon className="h-5 w-5" />
          <span className="sr-only">Delete task</span>
        </Button>
      </div>
    </CardContent>
  </Card>
}
