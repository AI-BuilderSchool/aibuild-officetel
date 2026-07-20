-- AI빌드 오피스텔: 온라인 상담(예약) 데이터 저장 + 본인 조회/취소
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.reservations enable row level security;

-- 익명 사용자는 신규 상담 신청(등록)만 가능. 테이블을 직접 select/update/delete 하는 것은 막아서
-- anon key로 전체 예약자 명단(이름/전화번호)이 조회되지 않도록 한다.
drop policy if exists "anyone can submit a reservation" on public.reservations;
create policy "anyone can submit a reservation"
  on public.reservations
  for insert
  to anon
  with check (true);

-- 본인 확인(이름+전화번호 일치) 후에만 본인의 예약만 조회하는 RPC.
-- security definer로 RLS를 우회하되, 함수 내부에서 name/phone이 정확히 일치하는 행만 반환한다.
create or replace function public.lookup_my_reservations(p_name text, p_phone text)
returns setof public.reservations
language sql
security definer
set search_path = public
as $$
  select *
  from public.reservations
  where name = p_name
    and phone = p_phone
    and status = 'active'
  order by created_at desc;
$$;

-- 본인 확인(이름+전화번호+예약 id 일치) 후에만 취소(soft delete) 처리하는 RPC.
create or replace function public.cancel_my_reservation(p_id uuid, p_name text, p_phone text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected int;
begin
  update public.reservations
  set status = 'cancelled'
  where id = p_id
    and name = p_name
    and phone = p_phone
    and status = 'active';

  get diagnostics affected = row_count;
  return affected > 0;
end;
$$;

revoke all on function public.lookup_my_reservations(text, text) from public;
revoke all on function public.cancel_my_reservation(uuid, text, text) from public;
grant execute on function public.lookup_my_reservations(text, text) to anon, authenticated;
grant execute on function public.cancel_my_reservation(uuid, text, text) to anon, authenticated;
