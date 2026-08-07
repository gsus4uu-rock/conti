/* ===========================================================
   items.js — 아이템 도감
   -----------------------------------------------------------
   등급: common(일반) uncommon(고급) rare(희귀)
         epic(영웅) legend(전설) myth(신화)
   종류: weapon(무기) armor(방어구) acc(장신구)
         use(소모품) mat(재료) tres(보물)

   새 아이템 추가는 아래 목록에 한 줄 넣으면 끝입니다.
   =========================================================== */
(function (G) {
  'use strict';

  var I = {

    /* ---------- 무기 ---------- */
    stick:        { name: '나무 막대기',      type: 'weapon', tier: 'common',   atk: 2,  price: 10,
                    desc: '마을 뒷마당에서 주운 막대기. 그래도 없는 것보단 낫다.' },
    rusty_dagger: { name: '녹슨 단검',        type: 'weapon', tier: 'common',   atk: 5,  spd: 1, price: 45,
                    desc: '누군가 오래전에 버리고 간 단검. 손잡이는 아직 쓸 만하다.' },
    hunter_sword: { name: '사냥꾼의 검',      type: 'weapon', tier: 'uncommon', atk: 11, price: 180,
                    desc: '벨라온 사냥꾼들이 쓰던 실용적인 검.' },
    forest_axe:   { name: '숲지기의 도끼',    type: 'weapon', tier: 'uncommon', atk: 15, spd: -2, price: 260,
                    desc: '무겁지만 한 방이 확실하다.' },
    steel_sword:  { name: '강철 장검',        type: 'weapon', tier: 'rare',     atk: 24, price: 700,
                    desc: '왕도 대장간의 표준 장검. 이제야 좀 검다운 검이다.' },
    mine_pick:    { name: '광부의 곡괭이',    type: 'weapon', tier: 'rare',     atk: 21, luk: 4, price: 640,
                    desc: '광석을 캐던 곡괭이. 이상하게 좋은 것이 잘 나온다.' },
    silver_saber: { name: '은빛 세이버',      type: 'weapon', tier: 'epic',     atk: 38, spd: 4, price: 2400,
                    desc: '은으로 벼린 곡검. 마물에게 특히 잘 든다.' },
    knight_blade: { name: '노기사의 검',      type: 'weapon', tier: 'epic',     atk: 42, def: 5, price: 0, noSell: true,
                    desc: '이름 모를 노기사가 마지막으로 건네준 검. 아직 따뜻하다.' },
    starfall:     { name: '별똥별의 파편',    type: 'weapon', tier: 'legend',   atk: 66, luk: 10, price: 0, noSell: true,
                    desc: '하늘에서 떨어진 금속 조각으로 벼린 검. 밤이면 희미하게 빛난다.' },
    dragon_fang:  { name: '용아검',           type: 'weapon', tier: 'legend',   atk: 72, atkPct: 8, price: 0, noSell: true,
                    desc: '늙은 용이 스스로 뽑아 준 이빨. 주인을 인정한 자에게만 무게가 가볍다.' },

    /* ---------- 방어구 ---------- */
    cloth:        { name: '허름한 옷',        type: 'armor', tier: 'common',   def: 1,  price: 10,
                    desc: '어머니가 기워 준 옷. 방어력은 없지만 마음이 든든하다.' },
    leather:      { name: '가죽 갑옷',        type: 'armor', tier: 'common',   def: 5,  price: 80,
                    desc: '초보 모험가의 기본.' },
    chain:        { name: '사슬 갑옷',        type: 'armor', tier: 'uncommon', def: 12, spd: -1, price: 320,
                    desc: '무겁지만 확실히 살아남게 해 준다.' },
    forest_robe:  { name: '숲의 로브',        type: 'armor', tier: 'rare',     def: 14, mp: 15, price: 620,
                    desc: '나뭇잎 무늬가 새겨진 로브. 숲에서는 기척이 옅어진다.' },
    steel_plate:  { name: '강철 판금갑옷',    type: 'armor', tier: 'rare',     def: 26, spd: -3, price: 980,
                    desc: '왕국 병사들의 표준 장비.' },
    guardian_mail:{ name: '수호자의 갑주',    type: 'armor', tier: 'epic',     def: 40, hp: 60, price: 2800,
                    desc: '광산 깊은 곳의 골렘에게서 떼어낸 돌판으로 만들었다.' },
    starcloak:    { name: '별빛 망토',        type: 'armor', tier: 'legend',   def: 44, luk: 12, price: 0, noSell: true,
                    desc: '밤하늘을 잘라 만든 듯한 망토. 운명이 이 사람을 비껴간다.' },

    /* ---------- 장신구 ---------- */
    ring_copper:  { name: '구리 반지',        type: 'acc', tier: 'common',   luk: 2,  price: 60,
                    desc: '슬라임 뱃속에서 나왔다. 누구 것이었을까.' },
    charm_rabbit: { name: '토끼발 부적',      type: 'acc', tier: 'uncommon', luk: 5,  spd: 2, price: 240,
                    desc: '행운을 부른다고들 한다. 토끼에게는 미안한 일이다.' },
    amulet_moon:  { name: '달빛 목걸이',      type: 'acc', tier: 'rare',     mp: 25, luk: 4, price: 700,
                    desc: '달이 뜬 밤에 미약하게 따뜻해진다.' },
    wolf_fang:    { name: '은빛 늑대 송곳니', type: 'acc', tier: 'epic',     atk: 10, spd: 6, price: 0, noSell: true,
                    desc: '무리의 왕이 시험을 통과한 자에게 남긴 것.' },
    seal_shard:   { name: '봉인석 조각',      type: 'acc', tier: 'legend',   atk: 8, def: 8, mp: 30, luk: 8, price: 0, noSell: true,
                    desc: '500년 전 일곱 영웅이 마왕을 봉인한 별인석의 파편. …일곱 개 중 하나다.' },
    father_ring:  { name: '아버지의 인장반지',type: 'acc', tier: 'legend',   atk: 6, def: 6, luk: 15, price: 0, noSell: true,
                    desc: '아버지가 늘 끼고 있던 반지. 안쪽에 작은 글씨가 새겨져 있다. "돌아가마."' },

    /* ---------- 소모품 ---------- */
    herb:         { name: '약초',             type: 'use', tier: 'common',   price: 20,  heal: 30,
                    desc: 'HP를 30 회복한다.' },
    potion:       { name: '회복 물약',        type: 'use', tier: 'common',   price: 60,  heal: 90,
                    desc: 'HP를 90 회복한다.' },
    hi_potion:    { name: '상급 회복 물약',   type: 'use', tier: 'uncommon', price: 220, heal: 300,
                    desc: 'HP를 300 회복한다.' },
    ether:        { name: '마나 물약',        type: 'use', tier: 'uncommon', price: 150, healMp: 40,
                    desc: 'MP를 40 회복한다.' },
    elixir:       { name: '엘릭서',           type: 'use', tier: 'epic',     price: 1500, full: true,
                    desc: 'HP와 MP를 전부 회복한다. 아까워서 못 쓰게 되는 물건.' },
    smoke:        { name: '연막탄',           type: 'use', tier: 'common',   price: 40,  escape: true,
                    desc: '전투에서 반드시 도망칠 수 있다.' },

    /* ---------- 재료 ---------- */
    jelly:        { name: '슬라임 젤리',      type: 'mat', tier: 'common', price: 8,  desc: '말랑하다. 상인이 사 간다.' },
    rat_tail:     { name: '들쥐 꼬리',        type: 'mat', tier: 'common', price: 12, desc: '길드에서 마리 수를 셀 때 쓴다.' },
    horn:         { name: '토끼 뿔',          type: 'mat', tier: 'common', price: 25, desc: '작지만 단단하다.' },
    gob_tooth:    { name: '고블린 이빨',      type: 'mat', tier: 'common', price: 30, desc: '고블린은 이걸 훈장처럼 여긴다.' },
    web:          { name: '질긴 거미줄',      type: 'mat', tier: 'uncommon', price: 55, desc: '밧줄보다 튼튼하다.' },
    wolf_pelt:    { name: '늑대 가죽',        type: 'mat', tier: 'uncommon', price: 90, desc: '겨울에 비싸게 팔린다.' },
    ore:          { name: '마력 광석',        type: 'mat', tier: 'rare',   price: 200, desc: '희미하게 진동한다.' },
    core:         { name: '골렘의 핵',        type: 'mat', tier: 'rare',   price: 420, desc: '아직도 따뜻하다.' },

    /* ---------- 보물 / 수집품 ---------- */
    old_map:      { name: '낡은 지도',        type: 'tres', tier: 'rare', price: 0, noSell: true,
                    desc: '누군가 손으로 그린 지도. 북쪽 어딘가에 표시가 되어 있다.' },
    swordbook:    { name: '낡은 검술서',      type: 'tres', tier: 'epic', price: 0, noSell: true,
                    desc: '노기사의 필체로 쓰인 검술서. 읽을 때마다 뭔가 배운 기분이 든다.' },
    slime_crown:  { name: '슬라임 왕관',      type: 'tres', tier: 'epic', price: 0, noSell: true,
                    desc: '슬라임 사회에도 왕이 있었다니. 아무도 안 믿어 줄 것이다.' },
    star_mark:    { name: '별의 각인',        type: 'tres', tier: 'myth', price: 0, noSell: true,
                    desc: '손등에 새겨진 빛. 이제 이 사람은 평범한 사람이 아니다.' },
    father_letter:{ name: '아버지의 편지',    type: 'tres', tier: 'myth', price: 0, noSell: true,
                    desc: '몇 번을 읽어도 마지막 줄에서 눈이 멈춘다.' }
  };

  // 등급별 색상 / 이름
  G.TIERS = {
    common:   { name: '일반', color: '#c8ccd8' },
    uncommon: { name: '고급', color: '#5ad06a' },
    rare:     { name: '희귀', color: '#4a9ae8' },
    epic:     { name: '영웅', color: '#b06ae8' },
    legend:   { name: '전설', color: '#f0a030' },
    myth:     { name: '신화', color: '#e8405a' }
  };

  // id를 각 아이템 안에도 넣어 둔다
  for (var k in I) if (I.hasOwnProperty(k)) I[k].id = k;

  G.ITEMS = I;
})(window.RPG = window.RPG || {});
