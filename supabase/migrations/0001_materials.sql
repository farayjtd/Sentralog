-- ============================================================
-- Tabel bahan baku / bahan mentah
-- Dipakai oleh fitur:
--   Teknik Sipil : Input bahan baku
--   Kepala WH    : Cek bahan baku
--   Owner/Mandor : Rekap bahan mentah
-- Jalankan SEKALI di Supabase > SQL Editor.
-- ============================================================

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  warehouse_id uuid references public.warehouses(id) on delete set null,
  name text not null,
  unit text default 'pcs',
  qty numeric not null default 0,
  category text not null default 'mentah', -- 'mentah' | 'baku'
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists materials_project_idx  on public.materials(project_id);
create index if not exists materials_wh_idx        on public.materials(warehouse_id);
create index if not exists materials_category_idx  on public.materials(category);

alter table public.materials enable row level security;

drop policy if exists "materials read"   on public.materials;
drop policy if exists "materials insert" on public.materials;
drop policy if exists "materials update" on public.materials;
drop policy if exists "materials delete" on public.materials;

create policy "materials read"   on public.materials for select to authenticated using (true);
create policy "materials insert" on public.materials for insert to authenticated with check (auth.uid() = created_by);
create policy "materials update" on public.materials for update to authenticated using (auth.uid() = created_by);
create policy "materials delete" on public.materials for delete to authenticated using (auth.uid() = created_by);
