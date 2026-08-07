/* ===========================================================
   scene.js — 화면 구성 (전투 화면 / 마을 / 필드 / 이벤트)
   -----------------------------------------------------------
   해상도 480x270 (16:9).

   그림 파일이 art/ 에 있으면 그걸 쓰고, 없으면 코드로 그린 도트를 씁니다.
   두 방식이 같은 자리에 놓이도록 좌표를 한 곳에서 관리합니다.
   =========================================================== */
(function (G) {
  'use strict';

  var P, A;
  var t = 0;                 // 애니메이션 프레임 카운터
  var W = 480, H = 270;

  /* ---------- 화면 배치 (여기만 고치면 전체가 따라옵니다) ---------- */
  /* 세로 270px 예산 배분 (겹치지 않도록 계산해 둔 값)
       적 이름표   16 ~  70
       적 스프라이트  ~ 180  (제일 큰 마왕이 176px 이므로 y=4 부터)
       아군 이름표  186 ~ 260
       아군 스프라이트 150 ~ 262 (왼쪽이라 이름표와 안 겹침)          */
  var L = {
    horizon: 168,                                // 하늘과 땅의 경계
    enemy:  { cx: 340, base: 180, pad: 170 },    // 적이 서는 자리 / 발판 폭
    hero:   { cx: 118, base: 262, pad: 200 },    // 아군이 서는 자리
    plate:  { e: { x: 14,  y: 16,  w: 226 },     // 이름표
              p: { x: 242, y: 186, w: 226 } },
    townRoad: 196
  };

  // 고정 시드 난수 (배경 디테일이 매 프레임 흔들리지 않게)
  function srand(seed) {
    var s = seed;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  /* ---------- 지역별 배경 색 (그림이 없을 때 쓰는 색) ---------- */
  var THEMES = {
    plains: { sky: '#8fd8f0', far: '#a8d888', mid: '#78c060', ground: '#5aa848', dark: '#3a7a30' },
    forest: { sky: '#4a6a58', far: '#2e5040', mid: '#3a6248', ground: '#2a4a38', dark: '#1a3226' },
    mine:   { sky: '#2a2430', far: '#3a3244', mid: '#4a4058', ground: '#38304a', dark: '#201c2c' },
    town:   { sky: '#a8dcf0', far: '#c8b898', mid: '#d8c8a8', ground: '#c0a880', dark: '#8a7050' },
    night:  { sky: '#141a34', far: '#20284a', mid: '#2a3458', ground: '#1a2040', dark: '#0e1226' },
    ruin:   { sky: '#6a5a7a', far: '#5a4a68', mid: '#4a3c58', ground: '#3a2e46', dark: '#241c2c' }
  };

  function theme(name) { return THEMES[name] || THEMES.plains; }

  /* ---------- 배경 ---------- */
  function drawBg(themeName, seed) {
    // 1순위: 그림 파일
    var img = A.bg(themeName);
    if (img) { P.ctx.drawImage(img, 0, 0, W, H); return; }

    // 2순위: 코드로 그리기
    var c = theme(themeName);
    var r = srand(seed || 7);
    var hz = L.horizon;

    P.rect(0, 0, W, hz, c.sky);

    if (themeName === 'night') {
      for (var i = 0; i < 110; i++) {
        P.rect(Math.floor(r() * W), Math.floor(r() * (hz - 20)), 2, 2, r() > 0.7 ? '#ffffff' : '#c0c8f0');
      }
      P.rect(358, 24, 40, 40, '#f0e8c0');
      P.rect(352, 30, 52, 28, '#f0e8c0');
      P.rect(376, 18, 30, 40, c.sky);
    } else if (themeName === 'mine') {
      for (var k = 0; k < 26; k++) {
        var gx = Math.floor(r() * W), gh = 16 + Math.floor(r() * 54);
        for (var yy = 0; yy < gh; yy++) {
          var half = Math.max(0, Math.round((gh - yy) / 3));
          P.rect(gx - half, yy, half * 2 + 2, 2, c.far);
        }
      }
      P.rect(0, 0, W, 16, c.dark);
    } else if (themeName === 'forest') {
      for (var j = 0; j < 13; j++) {
        var tx = j * 40 + Math.floor(r() * 18);
        var th = 70 + Math.floor(r() * 60);
        P.rect(tx + 14, hz - th, 10, th, c.dark);
        for (var b = 0; b < 5; b++) {
          var bw = 52 - b * 8;
          P.rect(tx + 19 - bw / 2, hz - th - 12 + b * 18, bw, 24, b % 2 ? c.mid : c.far);
        }
      }
    } else {
      for (var m = 0; m < 6; m++) {
        var cx = Math.floor(r() * (W - 60)), cy = 20 + Math.floor(r() * 60);
        P.rect(cx, cy, 60, 12, '#ffffff');
        P.rect(cx + 12, cy - 8, 38, 14, '#ffffff');
        P.rect(cx + 22, cy - 14, 22, 10, '#ffffff');
      }
      for (var n = 0; n < 6; n++) {
        var mx = n * 92 - 24, mh = 46 + Math.floor(r() * 40);
        for (var y2 = 0; y2 < mh; y2++) {
          var ww = Math.round((y2 + 1) * 1.7);
          P.rect(mx + 46 - ww, hz - mh + y2, ww * 2, 1, c.far);
        }
      }
    }

    P.rect(0, hz, W, H - hz, c.ground);
    P.rect(0, hz, W, 6, c.mid);
    for (var g = 0; g < 220; g++) {
      P.rect(Math.floor(r() * W), hz + 8 + Math.floor(r() * (H - hz - 8)), 2, 2, r() > 0.5 ? c.mid : c.dark);
    }
  }

  /* ---------- 발판 ---------- */
  function platform(cx, cy, w, colTop, colBot) {
    var h = Math.round(w * 0.3);
    for (var y = 0; y < h; y++) {
      var k = 1 - Math.abs((y - h / 2) / (h / 2));
      var ww = Math.round(w * Math.sqrt(Math.max(0, k)) / 2);
      P.rect(cx - ww, cy - h / 2 + y, ww * 2, 1, y < h / 2 ? colTop : colBot);
    }
  }

  /* ---------- 캐릭터 세우기 (그림 우선, 없으면 도트) ---------- */
  function place(name, cx, baseY, offsetY, opt) {
    var art = A.sprite(name);
    if (art) { P.image(art, cx, baseY, offsetY, opt); return; }

    // 코드 도트: 종류에 맞는 크기가 되도록 배율을 계산
    var b = P.bounds(name);
    if (!b.h) return;
    var target = A.SIZE[A.KIND[name] || 'mob'];
    var scale = Math.max(1, Math.round(target / b.h));
    var x = Math.round(cx - (b.w * scale) / 2) - b.x0 * scale;
    var y = baseY - (b.y1 + 1) * scale + (offsetY || 0);
    P.sprite(name, x, y, scale, opt);
  }

  /* ---------- 이름표 ---------- */
  function nameplate(x, y, w, lvl, hpRatio, showNums, hp, maxHp) {
    var h = showNums ? 74 : 54;
    P.box(x, y, w, h);
    P.text('LV' + lvl, x + 12, y + 10, '#181820', 2);
    P.text('HP', x + 12, y + 30, '#e08020', 2);
    var barX = x + 44, barW = w - 56;
    P.bar(barX, y + 34, barW, hpRatio);
    if (showNums) {
      var s = hp + '/' + maxHp;
      P.text(s, x + w - 12 - P.textW(s, 2), y + 50, '#181820', 2);
    }
  }

  var Scene = {
    init: function () { P = G.Pixel; A = G.Assets; },
    tick: function () { t++; },
    layout: L,

    /* ---- 전투 ---- */
    battle: function (st) {
      var e = st.enemy;
      drawBg(st.bgTheme || 'plains', st.bgSeed || 7);

      // 그림 배경을 쓸 땐 발판을 그리지 않는다 (배경에 이미 지형이 있으므로)
      if (!A.bg(st.bgTheme)) {
        var c = theme(st.bgTheme);
        platform(L.enemy.cx, L.enemy.base + 4, L.enemy.pad, c.mid, c.dark);
        platform(L.hero.cx, L.hero.base + 4, L.hero.pad, c.mid, c.dark);
      }

      var bob = Math.round(Math.sin(t / 22) * 3);
      place(e.sprite, L.enemy.cx, L.enemy.base, bob, e.flash ? { tint: '#ffffff' } : null);

      var hb = Math.round(Math.sin(t / 26 + 1) * 2);
      place('hero_back', L.hero.cx, L.hero.base, hb, st.heroFlash ? { tint: '#ffffff' } : null);

      nameplate(L.plate.e.x, L.plate.e.y, L.plate.e.w, e.lv, e.hp / e.maxHp, false);
      nameplate(L.plate.p.x, L.plate.p.y, L.plate.p.w, st.p.lv, st.p.hp / st.p.maxHp, true, st.p.hp, st.p.maxHp);
    },

    /* ---- 마을 ---- */
    town: function () {
      var img = A.bg('town');
      if (img) {
        P.ctx.drawImage(img, 0, 0, W, H);
      } else {
        drawBg('town', 3);
        var houses = [[24, 62, 120, 100, '#c05040'], [174, 48, 132, 116, '#5070c0'], [336, 66, 120, 96, '#c09040']];
        for (var i = 0; i < houses.length; i++) {
          var h = houses[i];
          P.rect(h[0], h[1] + 28, h[2], h[3] - 28, '#e8d8b8');
          P.rect(h[0] - 6, h[1] + 12, h[2] + 12, 22, h[4]);
          for (var r2 = 0; r2 < 6; r2++) {
            P.rect(h[0] + r2 * 6, h[1] + 12 - r2 * 5, h[2] + 12 - r2 * 12, 8, h[4]);
          }
          P.rect(h[0] + h[2] / 2 - 15, h[1] + h[3] - 34, 30, 34, '#8a5a2a');
          P.rect(h[0] + 16, h[1] + 46, 24, 24, '#80c8e0');
          P.rect(h[0] + h[2] - 40, h[1] + 46, 24, 24, '#80c8e0');
        }
        P.rect(0, L.townRoad, W, 46, '#d8c8a0');
        for (var s = 0; s < 70; s++) P.rect((s * 47) % W, L.townRoad + 4 + (s * 19) % 38, 3, 3, '#b8a880');
      }
      place('hero_front', 240, 262);
      place('elder', 74, 254);
      place('merchant', 406, 254);
    },

    /* ---- 필드 ---- */
    field: function (st) {
      drawBg(st.bgTheme || 'plains', st.bgSeed || 11);
      place('hero_front', 240, 260);
    },

    /* ---- 이벤트 컷 ---- */
    event: function (st) {
      drawBg(st.bgTheme || 'night', st.bgSeed || 21);
      if (st.eventSprite) place(st.eventSprite, 240, 246);

      var r = srand(31);
      for (var i = 0; i < 26; i++) {
        var sx = Math.floor(r() * W), sy = Math.floor(r() * (H - 40));
        if ((t / 8 + i * 2) % 12 < 6) P.rect(sx, sy, 2, 2, '#fff0a0');
      }
    },

    /* ---- 타이틀 ---- */
    title: function () {
      drawBg('night', 5);
      // 하늘의 상처
      for (var y = 0; y < 110; y++) {
        var w = Math.round(Math.sin(y / 110 * Math.PI) * 70) + 4;
        P.rect(240 - w / 2, 16 + y, w, 1, y % 3 === 0 ? '#e060a0' : '#8040a0');
      }
      var pulse = (t / 10) % 20 < 10;
      if (pulse) {
        for (var k = 0; k < 90; k++) P.rect(240 + Math.round(Math.sin(k / 2) * 60), 16 + k, 2, 2, '#ffc0e0');
      }
      place('hero_front', 240, 262);
    }
  };

  G.Scene = Scene;
})(window.RPG = window.RPG || {});
