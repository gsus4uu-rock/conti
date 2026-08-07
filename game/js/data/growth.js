/* ===========================================================
   growth.js — 성장형 히든 무기 「이름 없는 검」
   -----------------------------------------------------------
   겉보기엔 형편없는 고철인데, 주인과 함께 싸우면서 스스로 자란다.
   - 전투에서 이길 때마다 검도 경험치를 얻는다
   - 단계가 오르면 이름·모습·능력이 전부 바뀐다
   - 상점에서 살 수 없고, 팔 수도 없다

   ★ 새 단계를 추가하려면 아래 배열 끝에 한 칸 더 넣으면 됩니다.
     (스프라이트는 sprites.js 의 bond1~bond4 를 재활용해도 됩니다)
   =========================================================== */
(function (G) {
  'use strict';

  var STAGES = [
    {
      lv: 1, need: 0,
      name: '이 빠진 낡은 검', sprite: 'bond1', tier: 'common',
      atk: 4, desc: '날이 다 나갔다. 고물상도 안 받을 것 같다.',
      awaken: null
    },
    {
      lv: 2, need: 300,
      name: '손에 익은 검', sprite: 'bond1', tier: 'uncommon',
      atk: 14, spd: 2, desc: '이상하게 손에 붙는다. 날도 조금 돌아온 것 같다.',
      awaken: [
        '검을 손질하다가 이상한 것을 봤다.',
        '분명 이가 나갔던 자리가… 메워져 있었다.',
        '기분 탓이라고 하기엔 날이 너무 잘 든다.'
      ]
    },
    {
      lv: 3, need: 1200,
      name: '녹을 벗은 검', sprite: 'bond2', tier: 'rare',
      atk: 32, spd: 3, luk: 4, desc: '녹이 다 벗겨졌다. 아래에서 은빛 무늬가 나왔다.',
      awaken: [
        '아침에 일어나 보니 검이 달라져 있었다.',
        '겹겹이 앉았던 녹이 통째로 떨어져 나가고, 그 밑에서 은빛 무늬가 드러났다.',
        '무늬는 어디서 본 것 같았다. …봉인석의 별 문양과 닮았다.'
      ]
    },
    {
      lv: 4, need: 4000,
      name: '이름을 되찾은 검 「여명」', sprite: 'bond3', tier: 'epic',
      atk: 58, spd: 5, luk: 8, mp: 20,
      desc: '검신에 글자가 떠올랐다. — 여명(黎明).',
      awaken: [
        '싸움이 끝나고 숨을 고르는데, 검신에 희미하게 글자가 떠올랐다.',
        '「여명」',
        '읽을 수 있는 글자가 아니었는데, 뜻은 그냥 알 수 있었다.',
        '',
        '"…네 이름이었구나."',
        '검이 아주 작게 떨렸다. 대답 같았다.'
      ]
    },
    {
      lv: 5, need: 12000,
      name: '여명 · 각성', sprite: 'bond4', tier: 'legend',
      atk: 92, spd: 8, luk: 14, mp: 40, atkPct: 10,
      desc: '휘두를 때마다 빛이 한 박자 늦게 따라온다.',
      awaken: [
        '검을 뽑는 순간, 주변이 잠깐 밝아졌다.',
        '빛이 검을 따라 한 박자 늦게 움직였다.',
        '',
        '500년 전, 일곱 영웅 중 한 사람이 이런 검을 들고 있었다는 이야기가 있다.',
        '그 사람의 검은 마지막 싸움에서 부러졌다고 했다.',
        '',
        '…부러진 검이 500년 동안 어디에 있었을까.'
      ]
    },
    {
      lv: 6, need: 40000,
      name: '여명 · 완성', sprite: 'bond4', tier: 'myth',
      atk: 150, spd: 12, luk: 22, mp: 70, atkPct: 20,
      desc: '이제 이 검은 주인을 고르지 않는다. 이미 골랐기 때문이다.',
      awaken: [
        '더 이상 무겁지 않았다.',
        '팔의 연장이 아니라, 처음부터 몸의 일부였던 것처럼 움직였다.',
        '',
        '"…같이 가자."',
        '검은 대답하지 않았다. 대답할 필요가 없었다.'
      ]
    }
  ];

  /* 검이 얻는 경험치 = 쓰러뜨린 적의 경험치 (같은 값) */
  G.BOND_STAGES = STAGES;

  G.bondStage = function (lv) {
    return STAGES[Math.max(0, Math.min(STAGES.length - 1, lv - 1))];
  };

  /* 현재 단계의 능력치를 아이템처럼 생긴 객체로 돌려준다 */
  G.bondAsItem = function (bond) {
    var st = G.bondStage(bond.lv);
    return {
      id: '__bond', name: st.name, type: 'weapon', tier: st.tier,
      atk: st.atk, def: st.def || 0, spd: st.spd || 0,
      luk: st.luk || 0, hp: st.hp || 0, mp: st.mp || 0,
      atkPct: st.atkPct || 0,
      price: 0, noSell: true, bond: true,
      sprite: st.sprite, desc: st.desc
    };
  };
})(window.RPG = window.RPG || {});
