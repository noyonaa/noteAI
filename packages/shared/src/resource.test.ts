import { describe, expect, it } from 'vitest';
import { createResourceSchema } from './resource';

describe('createResourceSchema', () => {
  it('accepts a title alone and defaults to a task', () => {
    const parsed = createResourceSchema.parse({ title: 'Buy groceries' });
    expect(parsed.type).toBe('task');
  });

  it('rejects an empty title', () => {
    expect(createResourceSchema.safeParse({ title: '   ' }).success).toBe(false);
  });

  it('rejects unknown resource types', () => {
    expect(createResourceSchema.safeParse({ title: 'x', type: 'spaceship' }).success).toBe(false);
  });

  it('accepts a plain date deadline', () => {
    expect(createResourceSchema.safeParse({ title: 'x', deadline: '2026-11-10' }).success).toBe(true);
  });
});
