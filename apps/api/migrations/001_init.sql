-- 001_init: unified resource model, tags, relationships, settings.
-- Later milestones add: embeddings (M4), chat_* (M3), planner_* (M5), FTS5 (M2).

CREATE TABLE resources (
  id                TEXT PRIMARY KEY,
  type              TEXT NOT NULL CHECK (type IN
                      ('task','note','idea','project','goal','reminder','bookmark','habit')),
  title             TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description       TEXT,
  category          TEXT,
  -- task-oriented fields: nullable so notes/ideas are never forced to have them
  priority          TEXT CHECK (priority IN ('critical','high','medium','low','none')),
  status            TEXT CHECK (status IN
                      ('inbox','not_started','in_progress','blocked','completed','archived')),
  deadline          TEXT,
  start_date        TEXT,
  estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  actual_minutes    INTEGER CHECK (actual_minutes IS NULL OR actual_minutes >= 0),
  energy            TEXT CHECK (energy IN ('low','medium','high')),
  postpone_count    INTEGER NOT NULL DEFAULT 0,
  completed_at      TEXT,
  -- bookmarks
  url               TEXT,
  -- structure
  project_id        TEXT REFERENCES resources(id) ON DELETE SET NULL,
  parent_id         TEXT REFERENCES resources(id) ON DELETE CASCADE,
  -- lifecycle
  archived          INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0,1)),
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX idx_resources_type        ON resources(type);
CREATE INDEX idx_resources_status      ON resources(status) WHERE archived = 0;
CREATE INDEX idx_resources_deadline    ON resources(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_resources_project     ON resources(project_id);
CREATE INDEX idx_resources_parent      ON resources(parent_id);
CREATE INDEX idx_resources_updated     ON resources(updated_at);

CREATE TABLE tags (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE
);

CREATE TABLE resource_tags (
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  tag_id      TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);
CREATE INDEX idx_resource_tags_tag ON resource_tags(tag_id);

-- Generic typed links: dependency (blocks), related, goal_project, etc.
CREATE TABLE resource_relationships (
  id          TEXT PRIMARY KEY,
  from_id     TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  to_id       TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('depends_on','related','supports')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (from_id <> to_id),
  UNIQUE (from_id, to_id, kind)
);
CREATE INDEX idx_relationships_to ON resource_relationships(to_id);

CREATE TABLE user_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
