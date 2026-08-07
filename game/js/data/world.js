/* ===========================================================
   world.js — 몬스터 / 지역 / 의뢰
   -----------------------------------------------------------
   ★ 지역을 새로 열려면:
     1) MONSTERS 에 몬스터 몇 마리 추가
     2) REGIONS 배열에 지역 하나 추가 (unlockLv 로 개방 레벨 지정)
     3) 끝. "새로운 지역이 열렸습니다!" 는 자동으로 뜹니다.
   =========================================================== */
(function (G) {
  'use strict';

  /* ================= 몬스터 ================= */
  var M = {
    slime:      { name: '슬라임',        sprite: 'slime',      lv: 1,  hp: 36,   atk: 7,   def: 2,   spd: 3,  exp: 7,    gold: 5,
                  drops: [['jelly', 0.6], ['herb', 0.15]],
                  flavor: '말랑말랑하다. 위협적이라기보단 그냥 귀찮다.' },
    rat:        { name: '들쥐',          sprite: 'rat',        lv: 2,  hp: 50,   atk: 9,   def: 3,   spd: 7,  exp: 11,   gold: 8,
                  drops: [['rat_tail', 0.6], ['herb', 0.12]],
                  flavor: '빠르다. 물리면 꽤 아프다.' },
    hornrabbit: { name: '뿔토끼',        sprite: 'hornrabbit', lv: 4,  hp: 65,   atk: 12,  def: 6,   spd: 10, exp: 19,   gold: 14,
                  drops: [['horn', 0.5], ['charm_rabbit', 0.02]],
                  flavor: '귀엽게 생겨서 방심하면 뿔에 받힌다.' },

    goblin:     { name: '고블린',        sprite: 'goblin',     lv: 6,  hp: 130,  atk: 26,  def: 10,  spd: 9,  exp: 42,   gold: 26,
                  drops: [['gob_tooth', 0.5], ['rusty_dagger', 0.06], ['herb', 0.2]],
                  flavor: '무리를 짓는다. 한 마리면 별거 아니다.' },
    spider:     { name: '숲거미',        sprite: 'spider',     lv: 8,  hp: 160,  atk: 30,  def: 12,  spd: 14, exp: 60,   gold: 33,
                  drops: [['web', 0.45], ['potion', 0.12]],
                  flavor: '나무 위에서 조용히 기다린다.' },
    wolf:       { name: '회색늑대',      sprite: 'wolf',       lv: 10, hp: 230,  atk: 44,  def: 15,  spd: 18, exp: 88,   gold: 48,
                  drops: [['wolf_pelt', 0.4], ['leather', 0.08]],
                  flavor: '눈이 마주치면 이미 늦었다.' },

    kobold:     { name: '코볼트',        sprite: 'kobold',     lv: 14, hp: 330,  atk: 68,  def: 24,  spd: 15, exp: 150,  gold: 82,
                  drops: [['ore', 0.25], ['gob_tooth', 0.3], ['potion', 0.15]],
                  flavor: '광산의 원래 주인. 곡괭이를 무기처럼 쓴다.' },
    bat:        { name: '동굴박쥐',      sprite: 'bat',        lv: 16, hp: 340,  atk: 80,  def: 18,  spd: 26, exp: 175,  gold: 70,
                  drops: [['ether', 0.2], ['web', 0.2]],
                  flavor: '떼로 몰려온다. 소리에 민감하다.' },
    golem:      { name: '돌골렘',        sprite: 'golem',      lv: 20, hp: 440,  atk: 108, def: 48,  spd: 6,  exp: 280,  gold: 160,
                  drops: [['core', 0.3], ['ore', 0.4], ['steel_plate', 0.04]],
                  flavor: '느리다. 대신 한 대만 맞아도 뼈가 울린다.' },

    /* ---- 보스 ---- */
    boss_goblin: { name: '고블린 두목 그로쉬', sprite: 'boss_goblin', lv: 12, hp: 570, atk: 46, def: 22, spd: 12,
                  exp: 500, gold: 350, boss: true,
                  drops: [['forest_axe', 1], ['gob_tooth', 1]],
                  flavor: '다른 고블린보다 머리 하나가 크다. 그리고 확실히 더 영리하다.',
                  intro: '숲 가장 깊은 곳, 뼈로 만든 의자에 앉은 것이 천천히 일어섰다.' },
    boss_spider: { name: '숲의 어미 아라크나', sprite: 'boss_spider', lv: 18, hp: 990, atk: 80, def: 30, spd: 22,
                  exp: 1200, gold: 720, boss: true,
                  drops: [['forest_robe', 1], ['web', 1], ['amulet_moon', 0.4]],
                  flavor: '숲의 나무들이 전부 그녀의 거미줄로 이어져 있었다.',
                  intro: '머리 위 나뭇가지가 흔들렸다. 올려다보지 말 걸 그랬다.' },
    boss_golem:  { name: '광산의 수호자',      sprite: 'boss_golem',  lv: 26, hp: 1600, atk: 150, def: 62, spd: 10,
                  exp: 3400, gold: 2200, boss: true,
                  drops: [['guardian_mail', 1], ['core', 1], ['seal_shard', 0.25]],
                  flavor: '가슴 한복판에 별 모양 문양이 새겨져 있다. 봉인석과 같은 문양이다.',
                  intro: '갱도 끝의 벽이 움직였다. 벽이 아니었다.' }
  };

  for (var k in M) if (M.hasOwnProperty(k)) M[k].id = k;

  /* ================= 지역 ================= */
  var R = [
    {
      id: 'village', name: '벨라온 마을', theme: 'town', unlockLv: 1, town: true,
      desc: '산 하나와 밀밭 하나가 전부인 작은 마을. 여기서 태어났고, 여기서 시작한다.'
    },
    {
      id: 'meadow', name: '마을 뒷들판', theme: 'plains', unlockLv: 1, seed: 11,
      monsters: ['slime', 'rat', 'hornrabbit'],
      desc: '마을 아이들도 놀러 오는 들판. 슬라임이 가끔 나온다.',
      enter: '풀 냄새가 났다. 저 멀리 밀밭 너머로 마을 굴뚝 연기가 보인다.'
    },
    {
      id: 'forest', name: '속삭이는 숲', theme: 'forest', unlockLv: 5, seed: 23,
      monsters: ['goblin', 'spider', 'wolf'],
      boss: 'boss_goblin', bossLv: 11,
      boss2: 'boss_spider', boss2Lv: 17,
      desc: '나무들이 바람 없이도 소리를 낸다고 해서 붙은 이름.',
      enter: '한 발 들여놓자 마을 소리가 뚝 끊겼다. 나무들이 서로 뭔가를 속삭인다.'
    },
    {
      id: 'mine', name: '무너진 광산', theme: 'mine', unlockLv: 13, seed: 37,
      monsters: ['kobold', 'bat', 'golem'],
      boss: 'boss_golem', bossLv: 25,
      desc: '30년 전 갱도가 무너지며 버려진 광산. 아직 안쪽에 무언가 있다.',
      enter: '갱도 입구에서 찬 바람이 불어나왔다. 사람이 아니라 산이 숨 쉬는 것 같았다.'
    },

    /* ★ 여기부터가 "아직 못 가는 곳" — 최종 목표를 보여 주는 장치 ★ */
    {
      id: 'kingdom', name: '왕도 아르카스', theme: 'town', unlockLv: 30, town: true, locked: true,
      desc: '대륙에서 가장 큰 도시. 모험가 길드 본부가 있다.',
      lockMsg: '왕도까지 가는 길목은 아직 마물로 막혀 있다. (Lv.30 필요)'
    },
    {
      id: 'skyscar', name: '천공의 상처', theme: 'ruin', unlockLv: 100, locked: true, final: true,
      desc: '하늘이 찢어진 곳. 500년 전 마왕 네로스가 봉인된 자리.',
      lockMsg: '올려다보기만 해도 다리가 떨린다. 지금은 근처에도 갈 수 없다. (Lv.100 필요)'
    }
  ];

  /* ================= 의뢰(퀘스트) ================= */
  var Q = [
    { id: 'q_slime', name: '슬라임 퇴치',       give: 'elder', lvReq: 1,
      goal: { kill: 'slime', n: 5 }, reward: { gold: 60, exp: 20, items: ['herb', 'herb'] },
      text: '"들판에 슬라임이 늘었다네. 다섯 마리만 정리해 주겠나?"',
      done: '"오, 벌써 다 잡았나? …자네, 생각보다 소질이 있는지도 모르겠군."' },

    { id: 'q_rat', name: '창고의 들쥐',         give: 'elder', lvReq: 3,
      goal: { kill: 'rat', n: 8 }, reward: { gold: 140, exp: 60, items: ['leather'] },
      text: '"밀 창고를 들쥐가 갉아먹고 있어. 여덟 마리쯤 잡아 주게."',
      done: '"고맙네. 이건 내 젊을 적 갑옷일세. 이제 나한텐 안 맞아."' },

    { id: 'q_horn', name: '뿔을 모아라',        give: 'merchant', lvReq: 4,
      goal: { collect: 'horn', n: 5 }, reward: { gold: 260, exp: 90, items: ['potion', 'potion'] },
      text: '"토끼 뿔 다섯 개만 구해 오면 값을 두 배로 쳐주지. 어때, 나쁘지 않지?"',
      done: '"좋아, 거래 성립. 자네 같은 애가 오래 살아남더라고."' },

    { id: 'q_goblin', name: '숲의 고블린',      give: 'elder', lvReq: 6,
      goal: { kill: 'goblin', n: 12 }, reward: { gold: 500, exp: 260, items: ['hunter_sword'] },
      text: '"숲의 고블린이 마을 쪽으로 내려오고 있네. 열두 마리… 부탁하네."',
      done: '"자네가 없었으면 마을이 어떻게 됐을지 모르겠어. 이 검을 받게."' },

    { id: 'q_boss1', name: '두목을 잡아라',     give: 'elder', lvReq: 11,
      goal: { kill: 'boss_goblin', n: 1 }, reward: { gold: 1200, exp: 800, items: ['hi_potion', 'hi_potion', 'chain'] },
      text: '"고블린들을 지휘하는 놈이 있어. 그놈만 없으면 숲이 조용해질 걸세. …위험한 일이야. 무리하지 말게."',
      done: '"…정말 해냈군. 자네 아버지도 딱 그 나이에 그랬지."' },

    { id: 'q_web', name: '질긴 실이 필요해',    give: 'merchant', lvReq: 9,
      goal: { collect: 'web', n: 6 }, reward: { gold: 700, exp: 320, items: ['charm_rabbit'] },
      text: '"거미줄 여섯 뭉치. 밧줄보다 튼튼해서 잘 팔리거든."',
      done: '"역시 자네야. 이 부적, 덤이야."' },

    { id: 'q_ore', name: '광석 채집',           give: 'merchant', lvReq: 14,
      goal: { collect: 'ore', n: 5 }, reward: { gold: 2000, exp: 1100, items: ['steel_sword'] },
      text: '"마력 광석 다섯 개. 광산은 위험하지만… 값은 확실히 쳐주지."',
      done: '"이건 왕도에서 들여온 물건이야. 자네한테 어울려."' },

    { id: 'q_boss3', name: '광산의 심장',       give: 'elder', lvReq: 25,
      goal: { kill: 'boss_golem', n: 1 }, reward: { gold: 6000, exp: 5000, items: ['elixir', 'silver_saber'] },
      text: '"광산 가장 깊은 곳에 무언가가 있네. 30년 전 갱도가 무너진 것도 그것 때문이었어. …이제 자네라면."',
      done: '"…가슴의 별 문양을 봤나? 그건 봉인석의 문양일세. 자네 아버지가 찾던 것이기도 하고."' }
  ];

  G.MONSTERS = M;
  G.REGIONS = R;
  G.QUESTS = Q;
})(window.RPG = window.RPG || {});
