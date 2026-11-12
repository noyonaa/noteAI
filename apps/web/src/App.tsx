import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import {
  faBookOpen,
  faCalendarDays,
  faComments,
  faFolderOpen,
  faInbox,
  faListCheck,
  faSun,
} from './lib/icons';
import { Dashboard } from './routes/Dashboard';
import { Placeholder } from './routes/Placeholder';
import { Settings } from './routes/Settings';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route
          path="inbox"
          element={<Placeholder title="Inbox" icon={faInbox} milestone={2} description="Quick capture and everything you haven't sorted yet will live here." />}
        />
        <Route
          path="today"
          element={<Placeholder title="Today" icon={faSun} milestone={2} description="Tasks due or planned for today." />}
        />
        <Route
          path="upcoming"
          element={<Placeholder title="Upcoming" icon={faCalendarDays} milestone={2} description="What's coming up in the next days and weeks." />}
        />
        <Route
          path="tasks"
          element={<Placeholder title="All tasks" icon={faListCheck} milestone={2} description="Every task with filters, search and subtasks." />}
        />
        <Route
          path="projects"
          element={<Placeholder title="Projects" icon={faFolderOpen} milestone={2} description="Group related tasks, notes and ideas, and link them to goals." />}
        />
        <Route
          path="notes"
          element={<Placeholder title="Notes" icon={faBookOpen} milestone={2} description="Markdown notes, ideas and bookmarks." />}
        />
        <Route
          path="knowledge"
          element={<Placeholder title="Knowledge base" icon={faBookOpen} milestone={4} description="Search everything you've saved by meaning, not just keywords." />}
        />
        <Route
          path="assistant"
          element={<Placeholder title="AI assistant" icon={faComments} milestone={3} description="Ask what to do today, once an AI provider is configured. The rest of the app never depends on it." />}
        />
        <Route path="settings" element={<Settings />} />
        <Route
          path="*"
          element={<Placeholder title="Page not found" icon={faInbox} milestone={1} description="That page doesn't exist." />}
        />
      </Route>
    </Routes>
  );
}
