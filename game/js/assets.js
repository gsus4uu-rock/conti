/* ===========================================================
   assets.js — 그림 파일 불러오기
   -----------------------------------------------------------
   art/ 폴더에 PNG를 넣으면 자동으로 코드로 그린 도트를 대체합니다.
   파일이 없으면 아무 일도 없이 원래 도트로 그려집니다.
   → 한 장씩 만들어서 하나씩 넣으셔도 됩니다.

   하는 일:
     1) PNG를 불러온다
     2) 배경이 마젠타(#FF00FF)면 투명하게 지운다
     3) 그림이 실제로 그려진 부분만 잘라낸다 (여백 제거)
     4) 정해진 크기로 줄여서 캐시해 둔다

   ※ 파일을 그냥 더블클릭해서 열면(file://) 브라우저 보안 때문에
     2~3번을 못 합니다. 그때는 원본을 그대로 씁니다.
     GitHub Pages 주소로 열면 전부 정상 동작합니다.
   =========================================================== */
(function (G) {
  'use strict';

  /* ---------- 어떤 그림을 어디서 찾을지 ---------- */
  var BASE = 'art/';

  // 종류별 화면상 목표 높이(가상 픽셀). 그림 크기가 달라도 여기에 맞춰집니다.
  var SIZE = {
    bg: null,        // 배경은 화면 전체
    mob: 104,        // 일반 몬스터
    boss: 140,       // 보스
    huge: 148,       // 마왕 (화면이 잘려도 뿔이 안 잘리는 최대치)
    hero: 112,       // 주인공
    npc: 92          // 마을 사람
  };

  // 캐릭터 그림의 최대 가로 폭 (화면 480 중). 이름표와 안 겹치는 선.
  var MAX_W = 280;

  // 스프라이트 이름 → 크기 종류
  var KIND = {
    slime: 'mob', rat: 'mob', hornrabbit: 'mob', goblin: 'mob', spider: 'mob',
    wolf: 'mob', kobold: 'mob', bat: 'mob', golem: 'mob',
    boss_goblin: 'boss', boss_spider: 'boss', boss_golem: 'boss',
    neros: 'huge',
    hero_front: 'hero', hero_back: 'hero',
    elder: 'npc', merchant: 'npc', guard: 'npc',
    bond1: 'npc', bond2: 'npc', bond3: 'npc', bond4: 'npc'
  };

  var Assets = {
    ready: {},        // 이름 → {canvas, w, h}  (다 처리된 그림)
    tried: {},        // 이미 시도해 본 이름
    bgs: {},          // 배경
    count: 0,

    /* 스프라이트 그림 요청. 없으면 null 을 돌려주고 호출한 쪽이 도트로 그림. */
    sprite: function (name) {
      if (this.ready[name]) return this.ready[name];
      if (!this.tried[name]) { this.tried[name] = true; this._load(name); }
      return null;
    },

    /* 배경 그림 요청 */
    bg: function (theme) {
      var key = 'bg_' + theme;
      if (this.bgs[key] !== undefined) return this.bgs[key];
      if (!this.tried[key]) {
        this.tried[key] = true;
        var self = this;
        var img = new Image();
        img.onload = function () { self.bgs[key] = img; self.count++; };
        img.onerror = function () { self.bgs[key] = null; };
        img.src = BASE + 'bg/' + theme + '.png';
      }
      return null;
    },

    _load: function (name) {
      var self = this;
      var img = new Image();
      img.onload = function () {
        try {
          self.ready[name] = process(img, SIZE[KIND[name] || 'mob']);
        } catch (e) {
          // file:// 등으로 픽셀을 못 읽는 경우 → 원본을 그대로 쓴다
          self.ready[name] = fallback(img, SIZE[KIND[name] || 'mob']);
        }
        self.count++;
      };
      img.onerror = function () { /* 파일 없음 → 도트로 그림 */ };
      img.src = BASE + 'spr/' + name + '.png';
    },

    /* 지금까지 몇 장이 들어왔는지 (디버그용) */
    status: function () {
      return { sprites: Object.keys(this.ready).length, backgrounds: Object.keys(this.bgs).length };
    }
  };

  /* ---------- 마젠타 제거 + 여백 잘라내기 + 크기 맞추기 ---------- */
  function process(img, targetH) {
    var w = img.naturalWidth, h = img.naturalHeight;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);

    var d = x.getImageData(0, 0, w, h);   // file:// 이면 여기서 예외
    var px = d.data;

    // 이미 투명 배경이 있는 그림인지 확인
    var hasAlpha = false;
    for (var i = 3; i < px.length; i += 4) {
      if (px[i] < 250) { hasAlpha = true; break; }
    }

    // 마젠타 계열을 투명하게
    if (!hasAlpha) {
      for (var k = 0; k < px.length; k += 4) {
        var r = px[k], g = px[k + 1], b = px[k + 2];
        if (r > 180 && b > 180 && g < 90) px[k + 3] = 0;
      }
      x.putImageData(d, 0, 0);
      d = x.getImageData(0, 0, w, h);
      px = d.data;
    }

    // 실제로 그림이 있는 범위 찾기
    var x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (var yy = 0; yy < h; yy++) {
      for (var xx = 0; xx < w; xx++) {
        if (px[(yy * w + xx) * 4 + 3] > 16) {
          if (xx < x0) x0 = xx;
          if (xx > x1) x1 = xx;
          if (yy < y0) y0 = yy;
          if (yy > y1) y1 = yy;
        }
      }
    }
    if (x1 < 0) return fallback(img, targetH);

    var cw = x1 - x0 + 1, ch = y1 - y0 + 1;
    var scale = targetH / ch;
    // 가로로 아주 넓은 그림(날개 편 박쥐 등)이 화면 밖으로 나가지 않게 제한
    if (cw * scale > MAX_W) scale = MAX_W / cw;
    var ow = Math.max(1, Math.round(cw * scale));
    var oh = Math.max(1, Math.round(ch * scale));

    var out = document.createElement('canvas');
    out.width = ow; out.height = oh;
    var ox = out.getContext('2d');
    // 줄일 때는 부드럽게(도트가 뭉개지지 않고 오히려 깔끔해집니다)
    ox.imageSmoothingEnabled = scale < 1;
    ox.imageSmoothingQuality = 'high';
    ox.drawImage(c, x0, y0, cw, ch, 0, 0, ow, oh);

    return { canvas: out, w: ow, h: oh };
  }

  /* 픽셀을 못 읽을 때: 원본을 비율만 맞춰서 사용 */
  function fallback(img, targetH) {
    var scale = targetH / img.naturalHeight;
    if (img.naturalWidth * scale > MAX_W) scale = MAX_W / img.naturalWidth;
    var ow = Math.max(1, Math.round(img.naturalWidth * scale));
    var oh = Math.max(1, Math.round(img.naturalHeight * scale));
    var out = document.createElement('canvas');
    out.width = ow; out.height = oh;
    var ox = out.getContext('2d');
    ox.imageSmoothingEnabled = scale < 1;
    ox.imageSmoothingQuality = 'high';
    ox.drawImage(img, 0, 0, ow, oh);
    return { canvas: out, w: ow, h: oh };
  }

  Assets.SIZE = SIZE;
  Assets.KIND = KIND;
  G.Assets = Assets;
})(window.RPG = window.RPG || {});
