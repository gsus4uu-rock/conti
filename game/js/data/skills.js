/* ===========================================================
   skills.js — 스킬 도감
   -----------------------------------------------------------
   power : 위력 배율 (1.0 = 평타)
   mp    : 소모 마나
   kind  : 'atk'(공격) 'heal'(회복) 'buff'(강화) 'drain'(흡수)
   hits  : 연타 횟수
   =========================================================== */
(function (G) {
  'use strict';

  var S = {
    /* 공용 */
    slash:     { name: '내려베기',   mp: 3,  kind: 'atk',  power: 1.5,  desc: '기본기에 충실한 한 방.' },
    focus:     { name: '집중',       mp: 4,  kind: 'buff', stat: 'atk', amt: 0.4, turns: 3, desc: '3턴 동안 공격력이 40% 오른다.' },
    firstaid:  { name: '응급처치',   mp: 6,  kind: 'heal', power: 0.35, desc: '최대 HP의 35%를 회복한다.' },

    /* 전사 */
    powerhit:  { name: '강타',       mp: 8,  kind: 'atk',  power: 2.3,  desc: '온몸의 체중을 실어 내리친다.' },
    guardup:   { name: '철벽',       mp: 7,  kind: 'buff', stat: 'def', amt: 0.8, turns: 3, desc: '3턴 동안 방어력이 80% 오른다.' },
    whirl:     { name: '회전베기',   mp: 14, kind: 'atk',  power: 1.1,  hits: 3, desc: '몸을 돌리며 3번 벤다.' },
    berserk:   { name: '광전사의 포효', mp: 22, kind: 'buff', stat: 'atk', amt: 1.2, turns: 3, desc: '3턴 동안 공격력이 120% 오른다. 무모하다.' },

    /* 도적 */
    backstab:  { name: '급소찌르기', mp: 7,  kind: 'atk',  power: 1.4, critBonus: 40, desc: '치명타가 아주 잘 터진다.' },
    doubleslash:{ name: '쌍격',      mp: 10, kind: 'atk',  power: 1.05, hits: 2, desc: '눈에 안 보이는 속도로 두 번.' },
    steal:     { name: '소매치기',   mp: 5,  kind: 'atk',  power: 0.6, steal: true, desc: '공격하면서 골드를 훔친다.' },
    shadowstep:{ name: '그림자 밟기', mp: 12, kind: 'buff', stat: 'spd', amt: 1.0, turns: 3, desc: '3턴 동안 속도가 두 배가 된다.' },

    /* 마법사 */
    firebolt:  { name: '화염탄',     mp: 8,  kind: 'atk',  power: 1.9, magic: true, desc: '손끝에서 불덩이를 쏜다.' },
    icelance:  { name: '얼음창',     mp: 12, kind: 'atk',  power: 2.4, magic: true, desc: '차가운 창이 관통한다.' },
    heal:      { name: '치유술',     mp: 10, kind: 'heal', power: 0.6, desc: '최대 HP의 60%를 회복한다.' },
    drainlife: { name: '생명 흡수',  mp: 14, kind: 'drain', power: 1.5, magic: true, desc: '피해를 준 만큼 절반을 회복한다.' },
    meteor:    { name: '유성 강타',  mp: 30, kind: 'atk',  power: 4.2, magic: true, desc: '하늘에서 불덩이를 떨어뜨린다.' },

    /* ---------- 히든 직업 전용 ---------- */
    starslash: { name: '성흔참',     mp: 18, kind: 'atk',  power: 3.2, critBonus: 20,
                 desc: '검이 지나간 자리에 별빛이 남는다.' },
    starfall_art:{ name: '별의 낙하', mp: 34, kind: 'atk', power: 5.0, critBonus: 15,
                 desc: '하늘의 상처가 잠시 열리고, 별 하나가 떨어진다.' },
    voidblade: { name: '무형검',     mp: 20, kind: 'atk',  power: 2.6, hits: 2, critBonus: 30,
                 desc: '베였다는 것을 나중에야 안다.' },
    dragonword:{ name: '용언 · 파(破)', mp: 28, kind: 'atk', power: 4.4, magic: true,
                 desc: '용의 언어로 한 마디. 세계가 그 말을 듣는다.' },
    dragonword2:{ name: '용언 · 생(生)', mp: 24, kind: 'heal', power: 1.0,
                 desc: '"살아라." HP를 전부 회복한다.' }
  };

  for (var k in S) if (S.hasOwnProperty(k)) S[k].id = k;

  G.SKILLS = S;
})(window.RPG = window.RPG || {});
