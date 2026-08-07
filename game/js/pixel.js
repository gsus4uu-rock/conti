/* ===========================================================
   pixel.js — 도트 렌더러
   -----------------------------------------------------------
   160x144(게임보이 해상도) 논리 캔버스에 픽셀을 직접 찍습니다.
   이미지 파일이 하나도 필요 없습니다. 전부 코드로 그립니다.
   =========================================================== */
(function (G) {
  'use strict';

  var W = 480, H = 270;   // 16:9 — 고해상도 도트 그림을 담을 수 있는 크기

  var Pixel = {
    W: W,
    H: H,
    ctx: null,
    scale: 3,

    init: function (canvas) {
      this.canvas = canvas;
      canvas.width = W;
      canvas.height = H;
      this.ctx = canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
      var self = this;
      var relayout = function () { self.resize(); };
      this.resize();
      window.addEventListener('resize', relayout);
      window.addEventListener('orientationchange', function () {
        // 회전 직후에는 크기가 아직 안 잡혀 있어서 한 박자 늦게 다시 잰다
        relayout(); setTimeout(relayout, 120); setTimeout(relayout, 400);
      });
    },

    /* 화면을 빈틈없이 채운다 (cover). 비율이 안 맞는 부분은 잘라 낸다.
       그래서 캐릭터는 위아래 26px 안쪽(SAFE)에만 그린다 — scene.js 참조.
       확대될 때는 픽셀을 그대로 보여 주고(도트 느낌 유지),
       축소될 때는 부드럽게 처리한다(고해상도 그림이 자글거리지 않게). */
    resize: function () {
      var host = this.canvas.parentElement;
      if (!host) return;

      var boxW = host.clientWidth || window.innerWidth;
      var boxH = host.clientHeight || window.innerHeight;
      var s = Math.max(boxW / W, boxH / H);
      if (!(s > 0)) s = 1;

      this.scale = s;
      this.canvas.style.width = Math.round(W * s) + 'px';
      this.canvas.style.height = Math.round(H * s) + 'px';
      this.canvas.style.imageRendering = s >= 1 ? 'pixelated' : 'auto';
    },

    clear: function (color) {
      this.ctx.fillStyle = color || '#000';
      this.ctx.fillRect(0, 0, W, H);
    },

    rect: function (x, y, w, h, color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
    },

    px: function (x, y, color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x | 0, y | 0, 1, 1);
    },

    /* 스프라이트 그리기
       name : SPRITES 키
       x,y  : 좌상단 좌표
       s    : 확대 배율 (기본 1)
       opt  : { flip:true, tint:'#색', alpha:0~1 } */
    sprite: function (name, x, y, s, opt) {
      var sp = G.SPRITES[name];
      if (!sp) return;
      s = s || 1;
      opt = opt || {};
      var ctx = this.ctx;
      var oldA = ctx.globalAlpha;
      if (opt.alpha != null) ctx.globalAlpha = opt.alpha;

      var d = sp.d, pal = sp.p;
      var maxW = 0;
      for (var i = 0; i < d.length; i++) if (d[i].length > maxW) maxW = d[i].length;

      for (var row = 0; row < d.length; row++) {
        var line = d[row];
        for (var col = 0; col < line.length; col++) {
          var c = line.charAt(col);
          if (c === '.' || c === ' ' || c === '0') continue;
          var idx = parseInt(c, 16);
          var color = opt.tint || pal[idx];
          if (!color) continue;
          var dx = opt.flip ? (maxW - 1 - col) : col;
          ctx.fillStyle = color;
          ctx.fillRect((x + dx * s) | 0, (y + row * s) | 0, s, s);
        }
      }
      ctx.globalAlpha = oldA;
    },

    spriteSize: function (name) {
      var sp = G.SPRITES[name];
      if (!sp) return { w: 0, h: 0 };
      var maxW = 0;
      for (var i = 0; i < sp.d.length; i++) if (sp.d[i].length > maxW) maxW = sp.d[i].length;
      return { w: maxW, h: sp.d.length };
    },

    /* 실제로 색이 칠해진 부분만의 범위.
       스프라이트 위아래에 빈 줄이 있어도 발판 위에 딱 놓이게 하려고 쓴다.
       (새 몬스터를 그려 넣어도 위치가 자동으로 맞는다) */
    bounds: function (name) {
      this._bcache = this._bcache || {};
      if (this._bcache[name]) return this._bcache[name];
      var sp = G.SPRITES[name];
      if (!sp) return { x0: 0, y0: 0, w: 0, h: 0 };
      var x0 = 999, y0 = 999, x1 = -1, y1 = -1;
      for (var r = 0; r < sp.d.length; r++) {
        var line = sp.d[r];
        for (var c = 0; c < line.length; c++) {
          var ch = line.charAt(c);
          if (ch === '.' || ch === ' ' || ch === '0') continue;
          if (c < x0) x0 = c;
          if (c > x1) x1 = c;
          if (r < y0) y0 = r;
          if (r > y1) y1 = r;
        }
      }
      if (x1 < 0) { x0 = y0 = 0; x1 = y1 = 0; }
      var b = { x0: x0, y0: y0, x1: x1, y1: y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
      this._bcache[name] = b;
      return b;
    },

    /* 게임보이풍 이중선 박스 */
    box: function (x, y, w, h, fill, line) {
      fill = fill || '#f8f8f0';
      line = line || '#181820';
      this.rect(x, y, w, h, line);
      this.rect(x + 1, y + 1, w - 2, h - 2, fill);
      this.rect(x + 2, y + 2, w - 4, h - 4, line);
      this.rect(x + 3, y + 3, w - 6, h - 6, fill);
    },

    /* HP / EXP 바 */
    bar: function (x, y, w, ratio, colors) {
      ratio = Math.max(0, Math.min(1, ratio));
      colors = colors || ['#2a5a2a', '#40d040', '#88f088'];
      this.rect(x - 1, y - 1, w + 2, 5, '#181820');
      this.rect(x, y, w, 3, '#585868');
      var fw = Math.round(w * ratio);
      if (fw > 0) {
        this.rect(x, y, fw, 3, colors[1]);
        this.rect(x, y, fw, 1, colors[2]);
        this.rect(x, y + 2, fw, 1, colors[0]);
      }
    },

    /* 5x7 미니 숫자/영문 폰트 — 레벨·수치 표기용
       (한글은 캔버스가 아니라 아래 HTML 대사창에서 처리합니다) */
    text: function (str, x, y, color, scale) {
      color = color || '#181820';
      scale = scale || 1;
      str = String(str).toUpperCase();
      for (var i = 0; i < str.length; i++) {
        this._glyph(str.charAt(i), x + i * 6 * scale, y, color, scale);
      }
    },

    textW: function (str, scale) { return String(str).length * 6 * (scale || 1) - (scale || 1); },

    _glyph: function (ch, x, y, color, scale) {
      var g = FONT[ch];
      if (!g) return;
      scale = scale || 1;
      this.ctx.fillStyle = color;
      for (var r = 0; r < g.length; r++) {
        var row = g[r];
        for (var c = 0; c < row.length; c++) {
          if (row.charAt(c) === '#') {
            this.ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
          }
        }
      }
    },

    /* 그림 파일(있으면)로 그리기 — 내용 기준 (cx, baseY) 에 세운다 */
    image: function (art, cx, baseY, offsetY, opt) {
      opt = opt || {};
      var ctx = this.ctx;
      var oldA = ctx.globalAlpha;
      if (opt.alpha != null) ctx.globalAlpha = opt.alpha;
      var x = Math.round(cx - art.w / 2);
      var y = Math.round(baseY - art.h + (offsetY || 0));
      if (opt.tint) {
        // 피격 번쩍임: 실루엣을 흰색으로
        ctx.save();
        ctx.drawImage(art.canvas, x, y);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = opt.tint;
        ctx.fillRect(x, y, art.w, art.h);
        ctx.restore();
      } else {
        ctx.drawImage(art.canvas, x, y);
      }
      ctx.globalAlpha = oldA;
    }
  };

  /* 5x7 비트맵 폰트 (숫자 + 필요한 기호/영문) */
  var FONT = {
    '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
    '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
    '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
    '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
    '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
    '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
    '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
    '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
    '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
    '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
    ':': ['.....', '..#..', '.....', '.....', '.....', '..#..', '.....'],
    '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
    '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
    '%': ['##..#', '##..#', '...#.', '..#..', '.#...', '#..##', '#..##'],
    ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
    'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    'V': ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    'M': ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
    'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
    'G': ['.###.', '#...#', '#....', '#..##', '#...#', '#...#', '.###.'],
    'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
    'D': ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
    'F': ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    'S': ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    'N': ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
    'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    'C': ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    'I': ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
    'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
    'B': ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
    'J': ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
    'Q': ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
    'Z': ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####']
  };

  G.Pixel = Pixel;
})(window.RPG = window.RPG || {});
