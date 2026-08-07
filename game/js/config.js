/* ===========================================================
   config.js — 운영자 설정
   -----------------------------------------------------------
   ★ 여기 두 줄만 채우면 서버 동기화가 켜집니다.
     비워 두면 게임은 그대로 잘 돌아가고, 저장은 기기 안에만 됩니다.
     (그 경우 운영자 페이지에서는 "코드 주고받기" 방식을 쓰면 됩니다)

   값 찾는 곳:
     Supabase 대시보드 → Project Settings → API
       Project URL      →  SUPABASE_URL
       Project API keys → anon public  →  SUPABASE_ANON_KEY

   설정 방법 전체는 game/SETUP.md 를 보세요.
   =========================================================== */
(function (G) {
  'use strict';

  G.CONFIG = {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',

    // 우리 가족 구분용. 다른 사람이 같은 서버를 써도 섞이지 않게 합니다.
    FAMILY: 'gsus4uu',

    // 자동 저장을 서버에 올리는 최소 간격(초). 너무 자주 올리지 않게.
    SYNC_EVERY: 30
  };

  G.CONFIG.enabled = function () {
    return !!(this.SUPABASE_URL && this.SUPABASE_ANON_KEY);
  };
})(window.RPG = window.RPG || {});
