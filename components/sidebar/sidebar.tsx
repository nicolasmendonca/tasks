import Link from "next/link";
import {
  CalendarIcon,
  CheckIcon,
  ClipboardListIcon,
  ListIcon,
  SettingsIcon,
} from "lucide-react";
import ProjectsList from "./projects-list";

export default function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-r-black bg-card p-4 md:flex bg-neutral-800 text-white">
      <div className="mb-6 flex items-center gap-2">
        <ClipboardListIcon className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Task Manager</h2>
      </div>
      <nav className="flex flex-col gap-2">
        <Link
          href="#"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          prefetch={false}>
          <ListIcon className="h-5 w-5" />
          My Tasks
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          prefetch={false}>
          <CalendarIcon className="h-5 w-5" />
          Upcoming
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          prefetch={false}>
          <CheckIcon className="h-5 w-5" />
          Completed
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          prefetch={false}>
          <SettingsIcon className="h-5 w-5" />
          Settings
        </Link>
      </nav>
      <ProjectsList />
    </aside>
  );
}
