# 운영자 설정 안내

게임은 **설정 없이도 바로 됩니다.** 아래는 "아이들 진행 상황을 자동으로 보고 싶을 때"만 하시면 됩니다.

---

## 지금 당장 쓰는 법 (설정 0단계)

서버 없이도 운영이 됩니다. 카톡을 한 번 주고받는 방식입니다.

1. 아이: 게임 → 마을 → **우편함 → 내 진행 코드 보기** → 코드 복사 → 아빠에게 카톡
2. 아빠: `game/admin.html` 열기 → **진행 코드 붙여넣기** → 아이 상태 전부 확인
3. 아빠: 선물 내용 채우고 → **선물 코드 만들기** → 카톡으로 전송 (300자 정도)
4. 아이: **우편함 → 선물 코드 입력** → 붙여넣기 → 수령

같은 코드는 두 번 못 받습니다.

---

## 서버 자동 동기화 켜기 (10분)

이걸 켜면 아이가 플레이하는 즉시 아빠 화면에 뜨고, 선물도 버튼 하나로 보내집니다.

### 1단계 — Supabase에서 표 두 개 만들기

Supabase 대시보드 → **SQL Editor** → 아래를 통째로 붙여넣고 실행하세요.

```sql
-- 아이들 진행 상황
create table if not exists game_saves (
  id          text primary key,
  family      text not null,
  name        text,
  summary     jsonb,
  data        jsonb,
  updated_at  timestamptz default now()
);

-- 아빠가 보내는 선물
create table if not exists game_mail (
  id          uuid primary key default gen_random_uuid(),
  family      text not null,
  to_player   text not null,          -- 특정 아이의 id, 또는 '*' (모두에게)
  payload     jsonb not null,
  claimed     boolean default false,
  claimed_at  timestamptz,
  created_at  timestamptz default now()
);

create index if not exists idx_saves_family on game_saves(family);
create index if not exists idx_mail_lookup  on game_mail(to_player, claimed);

-- 게임(브라우저)에서 접근할 수 있게 열어 둡니다
alter table game_saves enable row level security;
alter table game_mail  enable row level security;

create policy "game_saves_all" on game_saves for all
  using (true) with check (true);
create policy "game_mail_all" on game_mail for all
  using (true) with check (true);
```

### 2단계 — 키 두 개 복사

Supabase → **Project Settings → API**

| 화면에 있는 것 | 넣을 곳 |
|---|---|
| Project URL | `SUPABASE_URL` |
| Project API keys → `anon` `public` | `SUPABASE_ANON_KEY` |

### 3단계 — `game/js/config.js` 에 붙여넣기

```js
G.CONFIG = {
  SUPABASE_URL: 'https://xxxxxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOi....',
  FAMILY: 'gsus4uu',
  SYNC_EVERY: 30
};
```

커밋하고 배포하면 끝입니다. `game/admin.html` 을 열면 **● 서버 연결됨** 으로 바뀝니다.

---

### 보안에 대해 (읽어 주세요)

위 SQL은 **아무나 읽고 쓸 수 있게** 열어 둔 설정입니다. 가족용 게임이라 이렇게 했습니다.
`anon` 키는 브라우저에 그대로 노출되므로, 주소와 키를 아는 사람은 세이브를 보거나 고칠 수 있습니다.

- 저장되는 건 **게임 진행 데이터뿐**입니다. 이름(별명), 레벨, 아이템 정도이고 개인정보는 없습니다.
- 교회 앱과 **같은 Supabase 프로젝트를 쓰신다면**, 위 두 표만 열려 있고 교회 데이터 표는 영향을 받지 않습니다.
  그래도 걱정되시면 게임용 프로젝트를 새로 하나 만드시는 편이 깔끔합니다. (무료 플랜으로 충분합니다)

---

## 다음 장(챕터) 열어 주기

두 가지 방법이 있습니다.

**① 제대로 여는 법** — `game/js/data/world.js` 맨 위

```js
G.CHAPTER      = ['village', 'meadow', 'forest', 'mine'];   // ← 'mine' 추가
G.CHAPTER_NO   = 2;
G.CHAPTER_NAME = '제2장 — 무너진 광산';
G.CHAPTER_GOAL = 'boss_golem';        // 이걸 잡으면 2장 완결
G.CHAPTER_END  = [ '...완결 문구...' ];
```

커밋 → 배포하면 아이들 화면에 **"◆◆ 새로운 지역이 열렸습니다"** 가 뜹니다.

**② 급할 때** — 운영자 페이지에서 「지역 열어주기」 선물을 보내면 그 아이만 바로 열립니다.

---

## 운영자가 자주 쓸 선물 예시

| 상황 | 이렇게 |
|---|---|
| 숙제·심부름 보상 | 골드 3000 + 상급 회복 물약 3개 |
| 오래 막혀 있을 때 | 경험치 2000 + 능력치 공격 +5 |
| 특별한 날 | 「전설」 등급 아이템 + 편지 |
| 성장형 검 주기 | ☑ 성장형 검 주기 (아직 못 얻었을 때만) |
| 다음 장 미리 열기 | 지역 열어주기 → 무너진 광산 |

편지 내용은 게임 안에서 아이가 그대로 읽습니다. 여기가 제일 중요한 칸입니다.
