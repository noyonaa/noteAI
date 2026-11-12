import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBookOpen,
  faCalendarDays,
  faComments,
  faFolderOpen,
  faGear,
  faInbox,
  faListCheck,
  faSun,
  faTableCellsLarge,
} from '../../lib/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: IconDefinition;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: faTableCellsLarge },
  { to: '/inbox', label: 'Inbox', icon: faInbox },
  { to: '/today', label: 'Today', icon: faSun },
  { to: '/upcoming', label: 'Upcoming', icon: faCalendarDays },
  { to: '/tasks', label: 'All tasks', icon: faListCheck },
  { to: '/projects', label: 'Projects', icon: faFolderOpen },
  { to: '/notes', label: 'Notes', icon: faBookOpen },
  { to: '/knowledge', label: 'Knowledge base', icon: faBookOpen },
  { to: '/assistant', label: 'AI assistant', icon: faComments },
  { to: '/settings', label: 'Settings', icon: faGear },
];
