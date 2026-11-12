import { z } from 'zod';

/** Resource types. Adding a type = add it here + a row in RESOURCE_TYPE_META (web). */
export const RESOURCE_TYPES = [
  'task',
  'note',
  'idea',
  'project',
  'goal',
  'reminder',
  'bookmark',
  'habit',
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const PRIORITIES = ['critical', 'high', 'medium', 'low', 'none'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_STATUSES = [
  'inbox',
  'not_started',
  'in_progress',
  'blocked',
  'completed',
  'archived',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const ENERGY_LEVELS = ['low', 'medium', 'high'] as const;
export type EnergyLevel = (typeof ENERGY_LEVELS)[number];

const isoDate = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));

/**
 * Only the title is required: capture first, organize later.
 * Task-specific fields are optional and ignored for non-task types.
 */
export const createResourceSchema = z.object({
  type: z.enum(RESOURCE_TYPES).default('task'),
  title: z.string().trim().min(1, 'A title is enough to save something').max(300),
  description: z.string().max(20000).optional(),
  category: z.string().trim().max(80).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  deadline: isoDate.optional(),
  startDate: isoDate.optional(),
  estimatedMinutes: z.number().int().min(1).max(60 * 24).optional(),
  energy: z.enum(ENERGY_LEVELS).optional(),
  projectId: z.string().optional(),
  parentId: z.string().optional(),
  url: z.string().url().optional(),
});
export type CreateResourceInput = z.infer<typeof createResourceSchema>;

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  priority: Priority | null;
  status: TaskStatus | null;
  deadline: string | null;
  startDate: string | null;
  estimatedMinutes: number | null;
  energy: EnergyLevel | null;
  projectId: string | null;
  parentId: string | null;
  url: string | null;
  archived: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
