-- Políticas básicas para Cuaderno de Aula PWA
-- Opción simple para uso personal / un solo usuario autenticado
-- Requiere usar Supabase Auth si quieres endurecerlo después.

alter table groups enable row level security;
alter table modules enable row level security;
alter table students enable row level security;
alter table learningOutcomes enable row level security;
alter table criteria enable row level security;
alter table instruments enable row level security;
alter table instrument_criteria enable row level security;
alter table grades enable row level security;
alter table attendance enable row level security;
alter table sessions enable row level security;
alter table units enable row level security;
alter table suggestions enable row level security;
alter table workplace_logs enable row level security;
alter table settings enable row level security;

create policy "auth read groups" on groups for select to authenticated using (true);
create policy "auth write groups" on groups for all to authenticated using (true) with check (true);

create policy "auth read modules" on modules for select to authenticated using (true);
create policy "auth write modules" on modules for all to authenticated using (true) with check (true);

create policy "auth read students" on students for select to authenticated using (true);
create policy "auth write students" on students for all to authenticated using (true) with check (true);

create policy "auth read learningOutcomes" on learningOutcomes for select to authenticated using (true);
create policy "auth write learningOutcomes" on learningOutcomes for all to authenticated using (true) with check (true);

create policy "auth read criteria" on criteria for select to authenticated using (true);
create policy "auth write criteria" on criteria for all to authenticated using (true) with check (true);

create policy "auth read instruments" on instruments for select to authenticated using (true);
create policy "auth write instruments" on instruments for all to authenticated using (true) with check (true);

create policy "auth read instrument_criteria" on instrument_criteria for select to authenticated using (true);
create policy "auth write instrument_criteria" on instrument_criteria for all to authenticated using (true) with check (true);

create policy "auth read grades" on grades for select to authenticated using (true);
create policy "auth write grades" on grades for all to authenticated using (true) with check (true);

create policy "auth read attendance" on attendance for select to authenticated using (true);
create policy "auth write attendance" on attendance for all to authenticated using (true) with check (true);

create policy "auth read sessions" on sessions for select to authenticated using (true);
create policy "auth write sessions" on sessions for all to authenticated using (true) with check (true);

create policy "auth read units" on units for select to authenticated using (true);
create policy "auth write units" on units for all to authenticated using (true) with check (true);

create policy "auth read suggestions" on suggestions for select to authenticated using (true);
create policy "auth write suggestions" on suggestions for all to authenticated using (true) with check (true);

create policy "auth read workplace_logs" on workplace_logs for select to authenticated using (true);
create policy "auth write workplace_logs" on workplace_logs for all to authenticated using (true) with check (true);

create policy "auth read settings" on settings for select to authenticated using (true);
create policy "auth write settings" on settings for all to authenticated using (true) with check (true);
