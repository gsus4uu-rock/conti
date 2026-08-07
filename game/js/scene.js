/* ===========================================================
   scene.js — 화면 구성 (전투 화면 / 마을 / 필드 / 이벤트)
   전부 코드로 그리는 도트 배경입니다.
   =========================================================== */
(function (G) {
  'use strict';

  var P;
  var t = 0; // 애니메이션 프레임 카운터

  // 고정 시드 난수 (배경 디테일이 매 프레임 흔들리지 않게)
  function srand(seed) {
    var s = seed;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  /* ---------- 지역별 배경 테마 ---------- */
  var THEMES = {
    plains: { sky: '#8fd8f0', far: '#a8d888', mid: '#78c060', ground: '#5aa848', dark: '#3a7a30', accent: '#f0e8a0' },
    forest: { sky: '#4a6a58', far: '#2e5040', mid: '#3a6248', ground: '#2a4a38', dark: '#1a3226', accent: '#8fd45c' },
    mine:   { sky: '#2a2430', far: '#3a3244', mid: '#4a4058', ground: '#38304a', dark: '#201c2c', accent: '#f0a040' },
    town:   { sky: '#a8dcf0', far: '#c8b898', mid: '#d8c8a8', ground: '#c0a880', dark: '#8a7050', accent: '#e05050' },
    night:  { sky: '#141a34', far: '#20284a', mid: '#2a3458', ground: '#1a2040', dark: '#0e1226', accent: '#f0e0a0' },
    ruin:   { sky: '#6a5a7a', far: '#5a4a68', mid: '#4a3c58', ground: '#3a2e46', dark: '#241c2c', accent: '#c0a0e0' }
  };

  function theme(name) { return THEMES[name] || THEMES.plains; }

  /* ---------- 배경 그리기 ---------- */
  function drawBg(themeName, seed) {
    var c = theme(themeName);
    var r = srand(seed || 7);

    // 하늘
    P.rect(0, 0, 160, 90, c.sky);

    if (themeName === 'night') {
      // 별
      for (var i = 0; i < 40; i++) {
        var sx = Math.floor(r() * 160), sy = Math.floor(r() * 70);
        P.px(sx, sy, r() > 0.7 ? '#ffffff' : '#c0c8f0');
      }
      // 달
      P.rect(120, 12, 14, 14, '#f0e8c0');
      P.rect(118, 14, 18, 10, '#f0e8c0');
      P.rect(126, 10, 10, 14, c.sky);
    } else if (themeName === 'mine') {
      // 동굴 천장 종유석
      for (var k = 0; k < 12; k++) {
        var gx = Math.floor(r() * 160), gh = 6 + Math.floor(r() * 18);
        for (var yy = 0; yy < gh; yy++) {
          var half = Math.max(0, Math.round((gh - yy) / 3));
          P.rect(gx - half, yy, half * 2 + 1, 1, c.far);
        }
      }
      P.rect(0, 0, 160, 6, c.dark);
    } else if (themeName === 'forest') {
      // 나무 실루엣 (뒤)
      for (var j = 0; j < 9; j++) {
        var tx = j * 20 + Math.floor(r() * 8);
        var th = 30 + Math.floor(r() * 24);
        P.rect(tx + 5, 90 - th, 4, th, c.dark);
        for (var b = 0; b < 4; b++) {
          var bw = 18 - b * 3;
          P.rect(tx + 7 - bw / 2, 90 - th - 4 + b * 7, bw, 9, b % 2 ? c.mid : c.far);
        }
      }
    } else {
      // 구름
      for (var m = 0; m < 4; m++) {
        var cx = Math.floor(r() * 150), cy = 8 + Math.floor(r() * 26);
        P.rect(cx, cy, 22, 5, '#ffffff');
        P.rect(cx + 4, cy - 3, 14, 5, '#ffffff');
        P.rect(cx + 8, cy - 5, 8, 4, '#ffffff');
      }
      // 먼 산
      for (var n = 0; n < 5; n++) {
        var mx = n * 36 - 10, mh = 20 + Math.floor(r() * 16);
        for (var yy2 = 0; yy2 < mh; yy2++) {
          var w = Math.round((yy2 + 1) * 1.6);
          P.rect(mx + 18 - w, 90 - mh + yy2, w * 2, 1, c.far);
        }
      }
    }

    // 지면
    P.rect(0, 88, 160, 56, c.ground);
    P.rect(0, 88, 160, 3, c.mid);

    // 지면 텍스처
    for (var g = 0; g < 70; g++) {
      var px = Math.floor(r() * 160), py = 94 + Math.floor(r() * 48);
      P.px(px, py, r() > 0.5 ? c.mid : c.dark);
    }
  }

  /* ---------- 발판 (포켓몬식 타원) ---------- */
  function platform(cx, cy, w, colTop, colBot) {
    var h = Math.round(w * 0.32);
    for (var y = 0; y < h; y++) {
      var k = 1 - Math.abs((y - h / 2) / (h / 2));
      var ww = Math.round(w * Math.sqrt(Math.max(0, k)) / 2);
      P.rect(cx - ww, cy - h / 2 + y, ww * 2, 1, y < h / 2 ? colTop : colBot);
    }
  }

  /* ---------- 이름표 ---------- */
  /* 스프라이트를 (cx, baseY) 에 "세워" 놓는다.
     cx      : 그림 내용의 가로 중심
     baseY   : 그림 내용의 바닥이 닿을 y (발판 높이)
     빈 여백 줄이 있어도 알아서 무시한다. */
  function placeOn(name, cx, baseY, scale, offsetY, opt) {
    var b = P.bounds(name);
    var x = Math.round(cx - (b.w * scale) / 2) - b.x0 * scale;
    var y = baseY - (b.y1 + 1) * scale + (offsetY || 0);
    P.sprite(name, x, y, scale, opt);
  }

  /* 이름표
     P.box 는 테두리를 4px 쓰므로 실제로 쓸 수 있는 안쪽은 (x+3, y+3) 부터
     (w-6) x (h-6) 이다. 글자 높이는 7px. 이 계산에 맞춰 배치한다. */
  function nameplate(x, y, w, lvl, hpRatio, showNums, hp, maxHp) {
    var h = showNums ? 34 : 24;
    P.box(x, y, w, h);

    P.text('LV' + lvl, x + 5, y + 4);                 // y+4 ~ y+11

    P.text('HP', x + 5, y + 13, '#e08020');           // y+13 ~ y+20
    var barX = x + 20, barW = w - 24;
    P.bar(barX, y + 15, barW, hpRatio);               // y+14 ~ y+18

    if (showNums) {
      var s = hp + '/' + maxHp;
      var tw = s.length * 6 - 1;
      P.text(s, x + w - 5 - tw, y + 22);              // y+22 ~ y+29 (안쪽 끝 y+31)
    }
  }

  var Scene = {
    init: function () { P = G.Pixel; },
    tick: function () { t++; },

    /* ---- 전투 화면 ---- */
    battle: function (st) {
      var e = st.enemy;
      drawBg(st.bgTheme || 'plains', st.bgSeed || 7);

      // 적 발판
      var c = theme(st.bgTheme);
      platform(108, 74, 56, c.mid, c.dark);
      // 아군 발판
      platform(44, 122, 68, c.mid, c.dark);

      // 적 스프라이트 — 그림이 그려진 부분 기준으로 발판 위에 딱 놓는다
      var scl = 3;
      var bob = Math.floor(Math.sin(t / 22) * 1.5);
      placeOn(e.sprite, 112, 74, scl, bob, e.flash ? { tint: '#ffffff' } : null);

      // 주인공 뒷모습
      var hb = Math.floor(Math.sin(t / 26 + 1) * 1);
      placeOn('hero_back', 44, 122, 3, hb, st.heroFlash ? { tint: '#ffffff' } : null);

      // 이름표 (적: 좌상단 / 아군: 우하단 — 포켓몬 배치)
      nameplate(5, 6, 84, e.lv, e.hp / e.maxHp, false);
      nameplate(71, 78, 84, st.p.lv, st.p.hp / st.p.maxHp, true, st.p.hp, st.p.maxHp);
    },

    /* ---- 마을 ---- */
    town: function (st) {
      drawBg('town', 3);
      var c = theme('town');
      // 집 3채
      var houses = [[8, 40, 40, 34, '#c05040'], [58, 34, 44, 40, '#5070c0'], [112, 42, 40, 32, '#c09040']];
      for (var i = 0; i < houses.length; i++) {
        var h = houses[i];
        P.rect(h[0], h[1] + 10, h[2], h[3] - 10, '#e8d8b8');
        P.rect(h[0] - 2, h[1] + 4, h[2] + 4, 8, h[4]);
        for (var r2 = 0; r2 < 5; r2++) P.rect(h[0] + r2 * 2, h[1] + 4 - r2 * 2, h[2] + 4 - r2 * 4, 3, h[4]);
        P.rect(h[0] + h[2] / 2 - 5, h[1] + h[3] - 12, 10, 12, '#8a5a2a');
        P.rect(h[0] + 5, h[1] + 16, 8, 8, '#80c8e0');
        P.rect(h[0] + h[2] - 13, h[1] + 16, 8, 8, '#80c8e0');
      }
      // 길
      P.rect(0, 100, 160, 20, '#d8c8a0');
      for (var s = 0; s < 30; s++) P.px((s * 17) % 160, 102 + (s * 7) % 16, '#b8a880');
      // 주인공 / 촌장 / 상인
      placeOn('hero_front', 80, 130, 3);
      placeOn('elder', 26, 126, 2);
      placeOn('merchant', 136, 126, 2);
    },

    /* ---- 필드(사냥터 이동) ---- */
    field: function (st) {
      drawBg(st.bgTheme || 'plains', st.bgSeed || 11);
      placeOn('hero_front', 80, 132, 3);
    },

    /* ---- 이벤트 컷 ---- */
    event: function (st) {
      drawBg(st.bgTheme || 'night', st.bgSeed || 21);
      if (st.eventSprite && G.SPRITES[st.eventSprite]) {
        placeOn(st.eventSprite, 80, 108, 3);
      }
      // 반짝이는 별 연출
      var r = srand(31);
      for (var i = 0; i < 14; i++) {
        var sx = Math.floor(r() * 160), sy = Math.floor(r() * 120);
        var ph = (t / 8 + i * 2) % 12;
        if (ph < 6) P.px(sx, sy, '#fff0a0');
      }
    },

    /* ---- 타이틀 ---- */
    title: function () {
      drawBg('night', 5);
      // 하늘의 상처
      for (var y = 0; y < 40; y++) {
        var w = Math.round(Math.sin(y / 40 * Math.PI) * 26) + 2;
        P.rect(80 - w / 2, 8 + y, w, 1, y % 3 === 0 ? '#e060a0' : '#8040a0');
      }
      var pulse = (t / 10) % 20 < 10;
      if (pulse) for (var k = 0; k < 30; k++) P.px(80 + Math.floor(Math.sin(k) * 24), 8 + k, '#ffc0e0');
      placeOn('hero_front', 80, 132, 3);
      P.sprite('icon_star', 18, 58, 2, { alpha: pulse ? 1 : 0.6 });
      P.sprite('icon_star', 128, 68, 2, { alpha: pulse ? 0.6 : 1 });
    }
  };

  G.Scene = Scene;
})(window.RPG = window.RPG || {});
