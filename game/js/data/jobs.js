/* ===========================================================
   jobs.js — 직업 / 전직
   -----------------------------------------------------------
   grow : 레벨업 시 오르는 스탯
   hidden: true 면 상점·전직소에 안 보이고
           특정 이벤트로만 얻는 히든 직업
   =========================================================== */
(function (G) {
  'use strict';

  var J = {
    novice: {
      name: '견습생', title: '아직 아무것도 아닌 자',
      grow: { hp: 11, mp: 3, atk: 2, def: 2, spd: 1, luk: 1 },
      skills: { 1: 'slash', 4: 'focus', 7: 'firstaid' },
      desc: '검을 처음 쥔 사람. 여기서 시작하지 않은 영웅은 없다.'
    },

    warrior: {
      name: '전사', title: '앞에 서는 자',
      grow: { hp: 16, mp: 3, atk: 5, def: 4, spd: 1, luk: 1 },
      skills: { 10: 'powerhit', 14: 'guardup', 20: 'whirl', 30: 'berserk' },
      desc: 'HP와 공격력이 크게 오른다. 가장 단단하고, 가장 앞에 선다.'
    },

    rogue: {
      name: '도적', title: '보이지 않는 자',
      grow: { hp: 10, mp: 5, atk: 4, def: 2, spd: 5, luk: 4 },
      skills: { 10: 'backstab', 13: 'steal', 18: 'doubleslash', 26: 'shadowstep' },
      desc: '속도와 행운이 높다. 먼저 때리고, 좋은 것을 잘 줍는다.'
    },

    mage: {
      name: '마법사', title: '읽는 자',
      grow: { hp: 8, mp: 12, atk: 2, def: 2, spd: 2, luk: 3 },
      skills: { 10: 'firebolt', 13: 'heal', 17: 'icelance', 24: 'drainlife', 34: 'meteor' },
      desc: '마나가 폭발적으로 오른다. 한 방이 무겁고, 회복도 된다.'
    },

    /* ---------- 히든 직업 ---------- */
    starbrand: {
      name: '성흔검사', title: '별을 삼킨 자', hidden: true,
      grow: { hp: 18, mp: 8, atk: 7, def: 4, spd: 3, luk: 5 },
      skills: { 1: 'starslash', 22: 'guardup', 30: 'starfall_art' },
      desc: '별의 각인을 받은 자만이 걷는 길. 500년 만에 두 번째다.',
      lore: '첫 번째는 500년 전 마왕을 봉인한 일곱 영웅의 우두머리였다.'
    },

    shadowblade: {
      name: '그림자칼날', title: '이름을 지운 자', hidden: true,
      grow: { hp: 12, mp: 7, atk: 6, def: 3, spd: 8, luk: 7 },
      skills: { 1: 'voidblade', 20: 'shadowstep', 28: 'backstab' },
      desc: '기록에 남지 않는 자들의 검술. 스승도 제자도 서로의 얼굴을 모른다.'
    },

    dragonspeaker: {
      name: '용언술사', title: '용이 대답하는 자', hidden: true,
      grow: { hp: 14, mp: 16, atk: 4, def: 3, spd: 3, luk: 4 },
      skills: { 1: 'dragonword', 18: 'heal', 26: 'dragonword2', 36: 'meteor' },
      desc: '용의 언어를 배운 인간. 대륙에 몇 명 없고, 그중 누구도 자랑하지 않는다.'
    }
  };

  for (var k in J) if (J.hasOwnProperty(k)) J[k].id = k;

  // 일반 전직 목록 (Lv10 전직소에서 선택)
  G.JOB_CHOICES = ['warrior', 'rogue', 'mage'];

  G.JOBS = J;
})(window.RPG = window.RPG || {});
