/* ===========================================================
   ui.js — 화면 흐름 / 대사창 / 선택지
   =========================================================== */
(function (G) {
  'use strict';

  var Game, P, Scene;

  var UI = {
    mode: 'title',        // title / story / town / field / battle / menu
    scene: { bgTheme: 'plains', bgSeed: 7 },
    _pages: null, _pi: 0, _onDone: null,
    _typing: false, _typeTarget: '', _typeI: 0, _typeTimer: null,
    _choiceCb: null, _choices: [],

    el: {},

    init: function () {
      Game = G.Game; Scene = G.Scene;
      var $ = function (id) { return document.getElementById(id); };
      this.el = {
        msg: $('msg'), choices: $('choices'), hud: $('hud'),
        title: $('boxTitle'), cont: $('cont'), overlay: $('overlay')
      };

      var self = this;
      this.el.msg.parentElement.addEventListener('click', function () { self.advance(); });
      document.addEventListener('keydown', function (e) { self.onKey(e); });

      this.showTitle();
      this.loop();
    },

    /* ---------- 메인 루프 ---------- */
    loop: function () {
      var self = this;
      function frame() {
        Scene.tick();
        self.draw();
        requestAnimationFrame(frame);
      }
      frame();
    },

    draw: function () {
      var m = this.mode;
      if (m === 'title') Scene.title();
      else if (m === 'battle') Scene.battle({
        p: Game.p, enemy: Game.battle.e,
        bgTheme: this.scene.bgTheme, bgSeed: this.scene.bgSeed,
        heroFlash: this.scene.heroFlash
      });
      else if (m === 'town') Scene.town(this.scene);
      else if (m === 'event') Scene.event(this.scene);
      else Scene.field(this.scene);
    },

    /* ---------- HUD ---------- */
    updateHud: function () {
      var p = Game.p;
      if (!p) { this.el.hud.innerHTML = ''; return; }
      var need = Game.expNeeded(p.lv);
      var jb = G.JOBS[p.job];
      this.el.hud.innerHTML =
        '<div class="hrow">' +
          '<span class="hname">' + esc(p.name) + '</span>' +
          '<span class="hjob">' + jb.name + '</span>' +
          '<span class="hlv">Lv.' + p.lv + '</span>' +
          '<span class="hgold">' + p.gold.toLocaleString() + ' G</span>' +
        '</div>' +
        '<div class="hbars">' +
          bar('HP', p.hp, p.maxHp, 'hp') +
          bar('MP', p.mp, p.maxMp, 'mp') +
          bar('EXP', p.exp, need, 'ex') +
        '</div>' +
        '<div class="htitle">「' + esc(p.title) + '」</div>';

      function bar(label, v, mx, cls) {
        var r = mx > 0 ? Math.max(0, Math.min(1, v / mx)) * 100 : 0;
        return '<div class="bwrap"><span class="blab">' + label + '</span>' +
               '<span class="btrack"><span class="bfill ' + cls + '" style="width:' + r + '%"></span></span>' +
               '<span class="bnum">' + v + '/' + mx + '</span></div>';
      }
    },

    /* ---------- 대사창 ---------- */
    /* 페이지 정리:
       빈 문자열('')은 "줄바꿈하고 같은 장에 계속"이라는 뜻으로 취급한다.
       → 구분선·빈 줄 때문에 클릭을 여러 번 하게 되는 일이 없어진다. */
    normalizePages: function (pages) {
      var out = [], cur = null, afterBlank = false;
      for (var i = 0; i < pages.length; i++) {
        var line = pages[i];
        if (line === '') {
          if (cur !== null) { cur += '\n'; afterBlank = true; }
          continue;
        }
        if (cur !== null && afterBlank) { cur += '\n' + line; afterBlank = false; continue; }
        if (cur !== null) out.push(cur);
        cur = line; afterBlank = false;
      }
      if (cur !== null) out.push(cur);
      return out.length ? out : [''];
    },

    say: function (pages, onDone, titleText) {
      if (typeof pages === 'string') pages = [pages];
      this._pages = this.normalizePages(pages);
      this._pi = 0;
      this._onDone = onDone || null;
      this.el.title.textContent = titleText || '';
      this.el.title.style.display = titleText ? 'block' : 'none';
      this.clearChoices();
      this.renderPage();
    },

    renderPage: function () {
      var txt = this._pages[this._pi] || '';
      this.startType(txt);
      this.el.cont.style.display = 'none';
    },

    startType: function (txt) {
      var self = this;
      clearInterval(this._typeTimer);
      this._typeTarget = txt;
      this._typeI = 0;
      this._typing = true;
      this.el.msg.innerHTML = '';
      // 빈 줄은 즉시 통과
      if (!txt) { this.finishType(); return; }
      this._typeTimer = setInterval(function () {
        self._typeI += 2;
        self.el.msg.innerHTML = fmt(self._typeTarget.slice(0, self._typeI));
        if (self._typeI >= self._typeTarget.length) self.finishType();
      }, 18);
    },

    finishType: function () {
      clearInterval(this._typeTimer);
      this._typing = false;
      this.el.msg.innerHTML = fmt(this._typeTarget);
      var last = this._pi >= this._pages.length - 1;
      this.el.cont.style.display = 'block';
      this.el.cont.textContent = last ? '▶' : '▼';
    },

    advance: function () {
      if (this._choices.length) return;      // 선택지 대기 중엔 무시
      if (this._typing) { this.finishType(); return; }
      if (!this._pages) return;
      this._pi++;
      if (this._pi < this._pages.length) { this.renderPage(); return; }
      var cb = this._onDone;
      this._pages = null; this._onDone = null;
      this.el.cont.style.display = 'none';
      if (cb) cb();
    },

    /* ---------- 선택지 ---------- */
    choose: function (options, cb) {
      this._choices = options;
      this._choiceCb = cb;
      var html = '';
      for (var i = 0; i < options.length; i++) {
        var o = options[i];
        html += '<button class="ch' + (o.dim ? ' dim' : '') + '" data-i="' + i + '"' + (o.dim ? ' disabled' : '') + '>' +
                '<span class="num">' + (i + 1) + '</span>' +
                '<span class="txt">' + esc(o.t) + '</span>' +
                (o.d ? '<span class="sub">' + esc(o.d) + '</span>' : '') +
                '</button>';
      }
      this.el.choices.innerHTML = html;
      var self = this;
      var btns = this.el.choices.querySelectorAll('button');
      for (var k = 0; k < btns.length; k++) {
        btns[k].addEventListener('click', function (e) {
          e.stopPropagation();
          self.pick(parseInt(this.getAttribute('data-i'), 10));
        });
      }
    },

    clearChoices: function () {
      this._choices = []; this._choiceCb = null;
      this.el.choices.innerHTML = '';
    },

    pick: function (i) {
      var o = this._choices[i];
      if (!o || o.dim) return;
      var cb = this._choiceCb;
      this.clearChoices();
      if (cb) cb(i, o);
    },

    onKey: function (e) {
      if (this.el.overlay.style.display === 'flex') return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9 && this._choices.length) { this.pick(n - 1); return; }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this._choices.length) this.pick(0);
        else this.advance();
      }
    },

    /* =======================================================
       화면들
       ======================================================= */

    showTitle: function () {
      this.mode = 'title';
      this.el.hud.innerHTML = '';
      var self = this;
      this.say([
        '엘드리아 연대기',
        '하늘에 상처가 난 세계. 그리고 아직 아무것도 아닌 한 아이의 이야기.'
      ], function () {
        var opts = [{ t: '새로 시작한다', d: '처음부터' }];
        if (Game.hasSave()) opts.unshift({ t: '이어서 한다', d: '저장된 모험' });
        opts.push({ t: '세이브 코드 불러오기', d: '다른 기기에서 가져오기' });
        self.choose(opts, function (i, o) {
          if (o.t === '이어서 한다') { Game.load(); self.afterLoad(); }
          else if (o.t === '새로 시작한다') self.askName();
          else self.importDialog();
        });
      }, '★ ELDRIA ★');
    },

    importDialog: function () {
      var self = this;
      var code = prompt('세이브 코드를 붙여넣으세요:');
      if (!code) { this.showTitle(); return; }
      if (Game.importSave(code)) { this.say(['불러왔습니다.'], function () { self.afterLoad(); }); }
      else this.say(['코드를 읽을 수 없습니다.'], function () { self.showTitle(); });
    },

    afterLoad: function () {
      this.updateHud();
      this.toTown(['다시 돌아왔다. 마을은 그대로다.']);
    },

    askName: function () {
      var self = this;
      this.mode = 'title';
      this.say(G.STORY.opening.pages, function () {
        self.el.overlay.style.display = 'flex';
        var input = document.getElementById('nameInput');
        input.value = '';
        input.focus();
        document.getElementById('nameOk').onclick = function () {
          var v = (input.value || '').trim().slice(0, 8) || '용사';
          self.el.overlay.style.display = 'none';
          self.startNewGame(v);
        };
        input.onkeydown = function (e) {
          if (e.key === 'Enter') document.getElementById('nameOk').click();
        };
      }, G.STORY.opening.title);
    },

    startNewGame: function (name) {
      Game.newGame(name);
      this.updateHud();
      var self = this;
      this.mode = 'town';
      this.scene.bgTheme = 'town';

      // 아버지의 편지 (PLAYER_LETTER 자리에 편지 본문을 펼쳐 넣는다)
      var pages = [];
      var src = G.STORY.letter.pages;
      for (var i = 0; i < src.length; i++) {
        if (src[i] === 'PLAYER_LETTER') {
          // 편지는 한 장에 통째로 보여 준다 (한 줄씩 넘기면 읽는 맛이 없다)
          var L = G.STORY.fatherLetter.slice();
          L[0] = L[0].replace('아들에게', name + '에게');
          pages.push(L.join('\n'));
        } else pages.push(src[i]);
      }

      this.say(pages, function () {
        Game.addItem('father_letter', 1);
        Game.save();
        self.say([
          '아버지의 편지를 가방 깊숙이 넣었다.',
          '문을 열자 아침 햇살이 쏟아졌다. 검은 나무 막대기 하나뿐이다.',
          '그래도, 오늘부터 시작이다.'
        ], function () { self.toTown(); });
      }, G.STORY.letter.title);
    },

    /* ---------- 마을 ---------- */
    toTown: function (intro) {
      this.mode = 'town';
      this.scene.bgTheme = 'town';
      Game.p.region = 'village';
      this.updateHud();
      Game.save();
      var self = this;
      var go = function () { self.townMenu(); };
      if (intro) this.say(intro, go, '벨라온 마을');
      else go();
    },

    townMenu: function () {
      var self = this, p = Game.p;
      var canJob = p.lv >= 10 && p.job === 'novice';
      this.say(['마을 광장이다. 무엇을 할까?'], function () {
        var opts = [
          { t: '모험을 떠난다', d: '사냥터로' },
          { t: '상점', d: '사고 팔기' },
          { t: '여관에서 쉰다', d: Game.innCost() + ' G · HP/MP 전부 회복' },
          { t: '의뢰 게시판', d: '촌장님과 상인의 부탁' },
          { t: '가방 · 장비', d: '' },
          { t: '내 정보', d: '' },
          { t: '저장 / 설정', d: '' }
        ];
        if (canJob) opts.unshift({ t: '★ 전직한다', d: '길을 정할 때가 됐다' });
        self.choose(opts, function (i, o) {
          switch (o.t) {
            case '★ 전직한다': self.jobSelect(); break;
            case '모험을 떠난다': self.regionSelect(); break;
            case '상점': self.shopMenu(); break;
            case '여관에서 쉰다': self.inn(); break;
            case '의뢰 게시판': self.questMenu(); break;
            case '가방 · 장비': self.bagMenu(function () { self.townMenu(); }); break;
            case '내 정보': self.statusScreen(function () { self.townMenu(); }); break;
            case '저장 / 설정': self.settingsMenu(); break;
          }
        });
      }, '벨라온 마을');
    },

    inn: function () {
      var self = this;
      if (Game.rest()) {
        this.updateHud(); Game.save();
        this.say([
          '여관 침대에 눕자마자 잠들었다.',
          '눈을 떴을 때는 이미 아침이었다. 몸이 개운하다.'
        ], function () { self.townMenu(); }, '여관');
      } else {
        this.say(['돈이 모자란다. 여관 주인이 안됐다는 듯 웃었다.'], function () { self.townMenu(); });
      }
    },

    /* ---------- 전직 ---------- */
    jobSelect: function () {
      var self = this;
      this.say(G.STORY.jobChange.pages, function () {
        var opts = [];
        for (var i = 0; i < G.JOB_CHOICES.length; i++) {
          var j = G.JOBS[G.JOB_CHOICES[i]];
          opts.push({ t: j.name, d: j.desc });
        }
        opts.push({ t: '조금 더 생각해 본다', d: '나중에 다시 올 수 있다' });
        self.choose(opts, function (i, o) {
          if (i >= G.JOB_CHOICES.length) { self.townMenu(); return; }
          var id = G.JOB_CHOICES[i];
          var lines = Game.applyGain({ job: id });
          Game.flushExp();
          self.updateHud(); Game.save();
          self.say([
            '"…그래. 좋은 선택이야."',
            '촌장님이 어깨를 두드렸다. 뭔가가 확실히 달라진 기분이었다.\n\n' + lines.join('\n')
          ], function () { self.townMenu(); }, G.JOBS[id].name + ' 전직!');
        });
      }, G.STORY.jobChange.title);
    },

    /* ---------- 지역 선택 ---------- */
    regionSelect: function () {
      var self = this, p = Game.p;
      var opts = [], map = [];
      for (var i = 0; i < G.REGIONS.length; i++) {
        var r = G.REGIONS[i];
        // 우리 마을은 목록에서 뺀다. 다만 "아직 못 가는 도시"는 목표로 보여 준다.
        if (r.town && !r.locked) continue;
        var open = p.lv >= r.unlockLv && !r.locked;
        opts.push({
          t: r.name + (open ? '' : ' 🔒'),
          d: open ? r.desc : (r.lockMsg || ('Lv.' + r.unlockLv + ' 필요')),
          dim: !open
        });
        map.push(r);
      }
      opts.push({ t: '마을로 돌아간다', d: '' });
      this.say(['어디로 갈까?'], function () {
        self.choose(opts, function (i) {
          if (i >= map.length) { self.townMenu(); return; }
          self.enterRegion(map[i]);
        });
      }, '모험을 떠난다');
    },

    enterRegion: function (r) {
      var self = this;
      Game.p.region = r.id;
      this.scene.bgTheme = r.theme;
      this.scene.bgSeed = r.seed || 11;
      this.mode = 'field';
      Game.save();
      this.say([r.enter || r.desc], function () { self.fieldMenu(); }, r.name);
    },

    fieldMenu: function () {
      var self = this, p = Game.p;
      var r = Game.region(p.region);
      this.updateHud();
      var opts = [
        { t: '사냥한다', d: '마물을 찾아 나선다' },
        { t: '주변을 둘러본다', d: '뭔가 있을지도 모른다' }
      ];
      var bosses = [];
      if (r.boss) bosses.push({ id: r.boss, lv: r.bossLv || 1 });
      if (r.boss2) bosses.push({ id: r.boss2, lv: r.boss2Lv || 1 });
      for (var b = 0; b < bosses.length; b++) {
        var bm = G.MONSTERS[bosses[b].id];
        var ok = p.lv >= bosses[b].lv;
        opts.push({
          t: '☠ ' + bm.name + (ok ? '' : ' 🔒'),
          d: ok ? '보스에게 도전한다' : ('Lv.' + bosses[b].lv + ' 이상 권장'),
          dim: !ok, boss: bosses[b].id
        });
      }
      opts.push({ t: '가방 · 장비', d: '' });
      opts.push({ t: '마을로 돌아간다', d: '' });

      this.say([r.name + '. 어떻게 할까?'], function () {
        self.choose(opts, function (i, o) {
          if (o.boss) { self.goBattle(o.boss); return; }
          if (o.t === '사냥한다') self.goBattle(Game.randomMonster(p.region));
          else if (o.t === '주변을 둘러본다') self.explore();
          else if (o.t === '가방 · 장비') self.bagMenu(function () { self.fieldMenu(); });
          else self.toTown(['마을로 돌아왔다.']);
        });
      }, r.name);
    },

    explore: function () {
      var self = this;
      var ev = Game.rollFate();
      if (ev) { this.runEvent(ev, function () { self.backToField(); }); return; }
      var flavor = [
        '한참을 둘러봤지만 아무것도 없었다.',
        '바람 소리만 들렸다. 오늘은 조용하다.',
        '발자국을 몇 개 발견했지만 이미 오래된 것이었다.',
        '나뭇가지 부러지는 소리에 검을 뽑았다. …아무것도 없었다.'
      ];
      this.say([flavor[Math.floor(Math.random() * flavor.length)]], function () { self.backToField(); });
    },

    backToField: function () {
      this.mode = 'field';
      var r = Game.region(Game.p.region);
      this.scene.bgTheme = r.theme; this.scene.bgSeed = r.seed || 11;
      this.updateHud();
      Game.save();
      this.fieldMenu();
    },

    /* ---------- 운명 이벤트 진행 ---------- */
    runEvent: function (ev, done) {
      var self = this;
      Game.p.seenEvents[ev.id] = true;
      this.mode = 'event';
      this.scene.bgTheme = ev.bg || 'night';
      this.scene.eventSprite = ev.spr || null;
      this.scene.bgSeed = 21;

      var badge = ev.tier === 3 ? '✦✦✦ 운명이 움직였다 ✦✦✦'
                : ev.tier === 2 ? '✦✦ 운명의 갈림길 ✦✦'
                : '✦ 작은 행운 ✦';

      this.say([badge].concat(ev.pages), function () {
        if (!ev.choices || !ev.choices.length) {
          self.resolveGain(ev.gain, done, ev.title);
          return;
        }
        var opts = [];
        for (var i = 0; i < ev.choices.length; i++) {
          var c = ev.choices[i];
          // need 가 있으면 그 아이템이 없을 때 선택할 수 없다
          var lack = c.need && !Game.countItem(c.need);
          opts.push({
            t: c.t,
            d: lack ? '(' + G.ITEMS[c.need].name + '이(가) 없다)' : '',
            dim: !!lack
          });
        }
        self.choose(opts, function (i) {
          var c = ev.choices[i];
          self.say(c.pages || [], function () {
            self.resolveGain(c.gain, done, ev.title);
          });
        });
      }, ev.title);
    },

    resolveGain: function (gain, done, titleText) {
      var self = this;
      var lines = Game.applyGain(gain);
      var fx = Game.flushExp();
      for (var i = 0; i < fx.ups.length; i++) {
        var u = fx.ups[i];
        if (typeof u === 'number') lines.push('레벨 업! → Lv.' + u);
        else if (u.skill) lines.push('새 스킬 【' + G.SKILLS[u.skill].name + '】 습득!');
      }
      for (var k = 0; k < fx.opened.length; k++) {
        lines.push('');
        lines.push('◆ 새로운 지역이 열렸습니다 — 「' + fx.opened[k].name + '」');
      }
      this.updateHud();
      Game.save();
      if (!lines.length) { done(); return; }
      // 보상 목록은 한 장에 모아서 보여 준다
      this.say(['━━━ 획득 ━━━\n' + lines.join('\n')], done, titleText);
    },

    /* ---------- 전투 ---------- */
    goBattle: function (mid) {
      if (!mid) { this.fieldMenu(); return; }
      var self = this;
      var b = Game.startBattle(mid);
      this.mode = 'battle';
      var intro = [];
      if (b.e.intro) intro.push(b.e.intro);
      intro.push(b.e.name + '이(가) 나타났다!');
      if (b.e.flavor && Math.random() < 0.5) intro.push(b.e.flavor);
      this.say(intro, function () { self.battleMenu(); }, b.e.boss ? '☠ 보스 전투' : '전투');
    },

    battleMenu: function () {
      var self = this;
      this.updateHud();
      this.el.title.textContent = Game.battle.e.name + '  (HP ' + Game.battle.e.hp + '/' + Game.battle.e.maxHp + ')';
      this.el.title.style.display = 'block';
      this.el.msg.innerHTML = fmt('어떻게 할까?');
      this.el.cont.style.display = 'none';
      this._pages = null;
      this.choose([
        { t: '공격', d: '기본 공격' },
        { t: '스킬', d: 'MP ' + Game.p.mp + '/' + Game.p.maxMp },
        { t: '아이템', d: '' },
        { t: '도망친다', d: '' }
      ], function (i, o) {
        if (o.t === '공격') self.doTurn('attack');
        else if (o.t === '스킬') self.skillMenu();
        else if (o.t === '아이템') self.battleItemMenu();
        else self.doTurn('flee');
      });
    },

    skillMenu: function () {
      var self = this, p = Game.p;
      var opts = [], ids = [];
      for (var i = 0; i < p.skills.length; i++) {
        var s = G.SKILLS[p.skills[i]];
        if (!s) continue;
        opts.push({ t: s.name + '  (MP ' + s.mp + ')', d: s.desc, dim: p.mp < s.mp });
        ids.push(s.id);
      }
      opts.push({ t: '← 돌아간다', d: '' });
      this.choose(opts, function (i) {
        if (i >= ids.length) { self.battleMenu(); return; }
        self.doTurn('skill', ids[i]);
      });
    },

    battleItemMenu: function () {
      var self = this, p = Game.p;
      var opts = [], ids = [];
      for (var id in p.inv) {
        var it = G.ITEMS[id];
        if (!it || it.type !== 'use') continue;
        opts.push({ t: it.name + ' ×' + p.inv[id], d: it.desc });
        ids.push(id);
      }
      if (!ids.length) opts.push({ t: '쓸 만한 게 없다', d: '', dim: true });
      opts.push({ t: '← 돌아간다', d: '' });
      this.choose(opts, function (i) {
        if (i >= ids.length) { self.battleMenu(); return; }
        self.doTurn('item', ids[i]);
      });
    },

    doTurn: function (action, arg) {
      var self = this;
      var b = Game.battle;
      var lines = Game.playerAct(action, arg);
      var firstStrike = Game.pSpd() >= b.e.spd;

      var seq = [];
      for (var i = 0; i < lines.length; i++) seq.push(lines[i].t);

      var after = function () {
        if (b.over) { self.endBattle(); return; }
        var el = Game.enemyAct();
        var s2 = [];
        for (var k = 0; k < el.length; k++) s2.push(el[k].t);
        Game.tickBuffs();
        b.turn++;
        self.updateHud();
        self.say(s2, function () {
          if (b.over) self.endBattle();
          else self.battleMenu();
        });
      };

      this.updateHud();
      this.say(seq, after);
    },

    endBattle: function () {
      var self = this;
      var e = Game.battle.e;
      var res = Game.finishBattle();
      this.updateHud();

      if (res.fled) {
        this.say(['…한숨 돌렸다.'], function () { self.postBattle(false); });
        return;
      }
      if (res.faint) {
        this.say([
          '눈앞이 하얘졌다.',
          '정신을 차렸을 때는 마을 여관 침대였다. 누군가 업어다 준 모양이다.',
          '주머니에서 ' + res.goldLost + ' G가 비었다. 그래도 살아 있다.',
          '',
          '"…다음엔 무리하지 마." 여관 주인이 죽을 끓여 왔다.'
        ], function () {
          Game.save();
          self.toTown();
        }, '쓰러졌다…');
        return;
      }

      // 1장: 전리품 요약  /  2장 이후: 레벨업·지역개방처럼 "사건"인 것만 따로
      var loot = ['+' + res.exp + ' EXP    +' + res.gold + ' G'];
      for (var i = 0; i < res.items.length; i++) {
        var it = G.ITEMS[res.items[i]];
        loot.push('【' + G.TIERS[it.tier].name + '】 ' + it.name + ' 획득!');
      }
      var pages = [e.name + '을(를) 쓰러뜨렸다!\n\n' + loot.join('\n')];

      var ups = [];
      for (var k = 0; k < res.levelUps.length; k++) {
        var u = res.levelUps[k];
        if (typeof u === 'number') ups.push('◆ 레벨 업!  →  Lv.' + u);
        else if (u.skill) ups.push('◆ 새 스킬 【' + G.SKILLS[u.skill].name + '】 습득!');
      }
      if (ups.length) pages.push(ups.join('\n'));

      for (var m = 0; m < res.opened.length; m++) {
        pages.push('◆◆ 새로운 지역이 열렸습니다 ◆◆\n\n「' + res.opened[m].name + '」\n' + res.opened[m].desc);
      }
      var qd = this.checkQuestReady();
      if (qd.length) pages.push('※ 완료할 수 있는 의뢰가 있다.\n' + qd.join(', '));

      Game.save();
      this.say(pages, function () { self.postBattle(true); }, '승리');
    },

    checkQuestReady: function () {
      var p = Game.p, out = [];
      for (var id in p.quests) {
        var st = p.quests[id];
        if (st.state !== 'active') continue;
        var q = Game.questById(id);
        if (q && st.prog >= q.goal.n) out.push(q.name);
      }
      return out;
    },

    postBattle: function (won) {
      var self = this;
      if (won) {
        var ev = Game.rollFate();
        if (ev) { this.runEvent(ev, function () { self.backToField(); }); return; }
      }
      this.backToField();
    },

    /* ---------- 상점 ---------- */
    shopMenu: function () {
      var self = this;
      this.say(['"어서 오게. 뭘 찾나?"'], function () {
        self.choose([
          { t: '산다', d: '' },
          { t: '판다', d: '' },
          { t: '나간다', d: '' }
        ], function (i, o) {
          if (o.t === '산다') self.buyMenu();
          else if (o.t === '판다') self.sellMenu();
          else self.townMenu();
        });
      }, '상점');
    },

    buyMenu: function () {
      var self = this, p = Game.p;
      var stock = Game.shopStock();
      var opts = [];
      for (var i = 0; i < stock.length; i++) {
        var it = G.ITEMS[stock[i]];
        opts.push({
          t: it.name + '  ' + it.price + ' G',
          d: it.desc + statLine(it),
          dim: p.gold < it.price
        });
      }
      opts.push({ t: '← 그만둔다', d: '' });
      this.el.title.textContent = '상점 — 소지금 ' + p.gold.toLocaleString() + ' G';
      this.el.title.style.display = 'block';
      this.el.msg.innerHTML = fmt('무엇을 살까?');
      this._pages = null;
      this.choose(opts, function (i) {
        if (i >= stock.length) { self.shopMenu(); return; }
        if (Game.buy(stock[i])) {
          self.updateHud(); Game.save();
          self.say([G.ITEMS[stock[i]].name + '을(를) 샀다.'], function () { self.buyMenu(); });
        } else self.buyMenu();
      });
    },

    sellMenu: function () {
      var self = this, p = Game.p;
      var ids = [], opts = [];
      for (var id in p.inv) {
        var it = G.ITEMS[id];
        if (!it || it.noSell) continue;
        ids.push(id);
        opts.push({ t: it.name + ' ×' + p.inv[id], d: Math.floor(it.price * 0.5) + ' G에 팔 수 있다' });
      }
      if (!ids.length) opts.push({ t: '팔 게 없다', d: '', dim: true });
      opts.push({ t: '← 그만둔다', d: '' });
      this.el.title.textContent = '판다 — 소지금 ' + p.gold.toLocaleString() + ' G';
      this.el.msg.innerHTML = fmt('무엇을 팔까?');
      this._pages = null;
      this.choose(opts, function (i) {
        if (i >= ids.length) { self.shopMenu(); return; }
        Game.sell(ids[i]);
        self.updateHud(); Game.save();
        self.sellMenu();
      });
    },

    /* ---------- 의뢰 ---------- */
    questMenu: function () {
      var self = this, p = Game.p;
      var list = Game.availableQuests();
      var opts = [];
      for (var i = 0; i < list.length; i++) {
        var q = list[i], st = p.quests[q.id];
        var label, sub;
        if (!st) { label = '[새 의뢰] ' + q.name; sub = q.text; }
        else if (st.prog >= q.goal.n) { label = '[완료!] ' + q.name; sub = '보고하러 간다'; }
        else {
          label = '[진행중] ' + q.name;
          sub = progressText(q, st);
        }
        opts.push({ t: label, d: sub });
      }
      if (!list.length) opts.push({ t: '지금은 의뢰가 없다', d: '레벨을 더 올리면 새 의뢰가 붙는다', dim: true });
      opts.push({ t: '← 돌아간다', d: '' });

      this.say(['게시판에 종이가 몇 장 붙어 있다.'], function () {
        self.choose(opts, function (i) {
          if (i >= list.length) { self.townMenu(); return; }
          var q = list[i], st = p.quests[q.id];
          if (!st) {
            Game.acceptQuest(q.id); Game.save();
            self.say([q.text, '', '의뢰를 수락했다: ' + q.name], function () { self.questMenu(); }, q.name);
          } else if (st.prog >= q.goal.n) {
            var lines = Game.questComplete(q.id);
            var fx = Game.flushExp();
            for (var k = 0; k < fx.ups.length; k++) {
              var u = fx.ups[k];
              if (typeof u === 'number') lines.push('◆ 레벨 업! → Lv.' + u);
              else if (u.skill) lines.push('◆ 새 스킬 【' + G.SKILLS[u.skill].name + '】 습득!');
            }
            for (var m = 0; m < fx.opened.length; m++) lines.push('◆◆ 새로운 지역이 열렸습니다 — 「' + fx.opened[m].name + '」');
            self.updateHud(); Game.save();
            self.say([q.done, '━━━ 보상 ━━━\n' + lines.join('\n')], function () { self.questMenu(); }, q.name + ' 완료!');
          } else {
            self.say([progressText(q, st)], function () { self.questMenu(); });
          }
        });
      }, '의뢰 게시판');
    },

    /* ---------- 가방 / 장비 ---------- */
    bagMenu: function (back) {
      var self = this, p = Game.p;
      var ids = [], opts = [];
      for (var id in p.inv) {
        var it = G.ITEMS[id];
        if (!it) continue;
        ids.push(id);
        var t = G.TIERS[it.tier];
        opts.push({
          t: '[' + t.name + '] ' + it.name + ' ×' + p.inv[id],
          d: it.desc + statLine(it)
        });
      }
      if (!ids.length) opts.push({ t: '가방이 비어 있다', d: '', dim: true });
      opts.push({ t: '← 돌아간다', d: '' });

      var eq = p.equip;
      var eqTxt = '무기: ' + nm(eq.weapon) + '   방어구: ' + nm(eq.armor) + '   장신구: ' + nm(eq.acc);
      this.el.title.textContent = '가방';
      this.el.title.style.display = 'block';
      this.el.msg.innerHTML = fmt(eqTxt);
      this._pages = null;
      this.choose(opts, function (i) {
        if (i >= ids.length) { back(); return; }
        var id = ids[i], it = G.ITEMS[id];
        if (it.type === 'weapon' || it.type === 'armor' || it.type === 'acc') {
          Game.equip(id); self.updateHud(); Game.save();
          self.say([it.name + '을(를) 장착했다.'], function () { self.bagMenu(back); });
        } else if (it.type === 'use') {
          if (it.full) { Game.p.hp = Game.p.maxHp; Game.p.mp = Game.p.maxMp; }
          else if (it.heal) Game.p.hp = Math.min(Game.p.maxHp, Game.p.hp + it.heal);
          else if (it.healMp) Game.p.mp = Math.min(Game.p.maxMp, Game.p.mp + it.healMp);
          else { self.say([it.desc], function () { self.bagMenu(back); }); return; }
          Game.removeItem(id, 1); self.updateHud(); Game.save();
          self.say([it.name + '을(를) 사용했다.'], function () { self.bagMenu(back); });
        } else {
          self.say(['【' + it.name + '】', it.desc], function () { self.bagMenu(back); });
        }
      });
      function nm(id) { return id && G.ITEMS[id] ? G.ITEMS[id].name : '없음'; }
    },

    /* ---------- 상태 ---------- */
    statusScreen: function (back) {
      var p = Game.p, jb = G.JOBS[p.job];
      var self = this;
      var pages = [
        p.name + '  「' + p.title + '」\n' +
        jb.name + ' · Lv.' + p.lv + '   (' + jb.title + ')\n\n' +
        'HP ' + p.hp + '/' + p.maxHp + '    MP ' + p.mp + '/' + p.maxMp + '\n' +
        '공격 ' + p.atk + '   방어 ' + p.def + '   속도 ' + p.spd + '   행운 ' + p.luk + '\n' +
        'EXP ' + p.exp + ' / ' + Game.expNeeded(p.lv) + '\n' +
        '소지금 ' + p.gold.toLocaleString() + ' G',

        '무기: ' + inm(p.equip.weapon) + '\n' +
        '방어구: ' + inm(p.equip.armor) + '\n' +
        '장신구: ' + inm(p.equip.acc) + '\n\n' +
        '싸운 횟수 ' + p.stats.battles + '   쓰러뜨린 수 ' + p.stats.wins + '\n' +
        '쓰러진 횟수 ' + p.stats.faints + '   겪은 운명 이벤트 ' + p.stats.events + '회\n\n' +
        '얻은 칭호: ' + (p.titles.length ? p.titles.join(', ') : '아직 없음'),

        '━━━━━━━━━━━━━━━\n' +
        '최종 목표: 「천공의 상처」에 봉인된 마왕 네로스.\n' +
        '그리고 아버지를 찾는 것.\n\n' +
        '필요 레벨: 100   (현재 Lv.' + p.lv + ')\n' +
        '아직… 아주 멀다.'
      ];
      this.say(pages, back, '내 정보');
      function inm(id) { return id && G.ITEMS[id] ? G.ITEMS[id].name + statLine(G.ITEMS[id]) : '없음'; }
    },

    /* ---------- 설정 ---------- */
    settingsMenu: function () {
      var self = this;
      this.say(['저장은 자동으로 되고 있습니다.'], function () {
        self.choose([
          { t: '지금 저장한다', d: '' },
          { t: '세이브 코드 내보내기', d: '다른 기기로 옮길 때' },
          { t: '세이브 코드 불러오기', d: '' },
          { t: '처음부터 다시 시작', d: '⚠ 지금 기록이 사라집니다' },
          { t: '← 돌아간다', d: '' }
        ], function (i, o) {
          if (o.t === '지금 저장한다') {
            Game.save();
            self.say(['저장했습니다.'], function () { self.townMenu(); });
          } else if (o.t === '세이브 코드 내보내기') {
            var code = Game.exportSave();
            window.prompt('아래 코드를 복사해서 보관하세요:', code);
            self.townMenu();
          } else if (o.t === '세이브 코드 불러오기') {
            var c = window.prompt('세이브 코드를 붙여넣으세요:');
            if (c && Game.importSave(c)) { self.updateHud(); self.say(['불러왔습니다.'], function () { self.toTown(); }); }
            else self.say(['불러오지 못했습니다.'], function () { self.townMenu(); });
          } else if (o.t === '처음부터 다시 시작') {
            self.choose([
              { t: '아니요, 돌아갑니다', d: '' },
              { t: '네, 전부 지우고 새로 시작합니다', d: '되돌릴 수 없습니다' }
            ], function (k) {
              if (k === 1) { Game.wipe(); location.reload(); }
              else self.townMenu();
            });
          } else self.townMenu();
        });
      }, '저장 / 설정');
    }
  };

  /* ---------- 도우미 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmt(s) {
    return esc(s).replace(/\n/g, '<br>');
  }
  function statLine(it) {
    var LB = { atk: '공격', def: '방어', hp: 'HP', mp: 'MP', spd: '속도', luk: '행운' };
    var parts = [];
    for (var k in LB) if (it[k]) parts.push(LB[k] + (it[k] > 0 ? '+' : '') + it[k]);
    return parts.length ? '  (' + parts.join(' ') + ')' : '';
  }
  function progressText(q, st) {
    if (q.goal.kill) {
      var m = G.MONSTERS[q.goal.kill];
      return m.name + ' ' + st.prog + ' / ' + q.goal.n + ' 마리';
    }
    return G.ITEMS[q.goal.collect].name + ' ' + st.prog + ' / ' + q.goal.n + ' 개';
  }

  G.UI = UI;
})(window.RPG = window.RPG || {});
