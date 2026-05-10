-- Subtasks: soft-delete flag + explicit ordering column.
-- Idempotent: safe to re-run.

alter table public.subtasks
  add column if not exists is_deleted boolean not null default false;

alter table public.subtasks
  add column if not exists position integer;

-- Backfill position from created_at order, per task. Only rows with NULL get
-- touched, so re-running is a no-op.
with ranked as (
  select
    id,
    row_number() over (partition by task_id order by created_at, id) as rn
  from public.subtasks
  where position is null
)
update public.subtasks s
set position = ranked.rn
from ranked
where s.id = ranked.id;

alter table public.subtasks
  alter column position set not null;

create index if not exists subtasks_task_position_idx
  on public.subtasks (task_id, position);
