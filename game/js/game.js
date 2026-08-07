/* ===========================================================
   game.js — 게임 엔진 (상태 / 전투 / 성장 / 운명 이벤트 / 저장)
   =========================================================== */
(function (G) {
  'use strict';

  var SAVE_KEY = 'eldria_save_v1';

  var Game = {
    p: null,
    battle: null,

    /* ================= 새 게임 ================= */
    newGame: function (name) {
      this.p = {
        name: name || '용사',
        lv: 1, exp: 0,
        job: 'novice', title: '아직 아무것도 아닌 자',
        base: { hp: 55, mp: 12, atk: 8, def: 6, spd: 5, luk: 5 },
        bonus: { hp: 0, mp: 0, atk: 0, def: 0, spd: 0, luk: 0 },
        hp: 55, mp: 12,
        gold: 50,
        equip: { weapon: 'stick', armor: 'cloth', acc: null },
        inv: { herb: 5 },
        skills: ['slash'],
        kills: {}, collected: {}, flags: {},
        quests: {}, seenEvents: {},
        pity1: 0, pity2: 0, pity3: 0,
        region: 'meadow',
        unlocked: { village: true, meadow: true },
        titles: [],
        log: [],
        stats: { battles: 0, wins: 0, faints: 0, events: 0, started: Date.now() }
      };
      this.recalc();
      this.p.hp = this.p.maxHp;
      this.p.mp = this.p.maxMp;
      return this.p;
    },

    /* ================= 파생 스탯 ================= */
    recalc: function () {
      var p = this.p, i;
      var s = { hp: 0, mp: 0, atk: 0, def: 0, spd: 0, luk: 0 };
      for (i in s) s[i] = p.base[i] + p.bonus[i];

      var pct = { atk: 0 };
      var slots = ['weapon', 'armor', 'acc'];
      for (var k = 0; k < slots.length; k++) {
        var id = p.equip[slots[k]];
        if (!id) continue;
        var it = G.ITEMS[id];
        if (!it) continue;
        for (var st in s) if (it[st]) s[st] += it[st];
        if (it.atkPct) pct.atk += it.atkPct;
      }
      s.atk = Math.round(s.atk * (1 + pct.atk / 100));

      p.maxHp = Math.max(1, s.hp);
      p.maxMp = Math.max(0, s.mp);
      p.atk = Math.max(1, s.atk);
      p.def = Math.max(0, s.def);
      p.spd = Math.max(1, s.spd);
      p.luk = Math.max(0, s.luk);
      if (p.hp > p.maxHp) p.hp = p.maxHp;
      if (p.mp > p.maxMp) p.mp = p.maxMp;
    },

    expNeeded: function (lv) {
      return Math.round(18 + Math.pow(lv, 2.15) * 5);
    },

    /* ================= 성장 ================= */
    addExp: function (n) {
      var p = this.p, ups = [];
      p.exp += n;
      while (p.exp >= this.expNeeded(p.lv)) {
        p.exp -= this.expNeeded(p.lv);
        p.lv++;
        var g = G.JOBS[p.job].grow;
        for (var k in g) p.base[k] += g[k];
        this.recalc();
        p.hp = p.maxHp; p.mp = p.maxMp;
        ups.push(p.lv);
        // 직업 스킬 습득
        var sk = G.JOBS[p.job].skills || {};
        if (sk[p.lv] && p.skills.indexOf(sk[p.lv]) < 0) {
          p.skills.push(sk[p.lv]);
          ups.push({ skill: sk[p.lv] });
        }
      }
      return ups;
    },

    /* 새로 열린 지역 확인 */
    checkUnlocks: function () {
      var p = this.p, opened = [];
      for (var i = 0; i < G.REGIONS.length; i++) {
        var r = G.REGIONS[i];
        if (r.locked) continue;
        if (p.lv >= r.unlockLv && !p.unlocked[r.id]) {
          p.unlocked[r.id] = true;
          opened.push(r);
        }
      }
      return opened;
    },

    /* ================= 인벤토리 ================= */
    addItem: function (id, n) {
      n = n || 1;
      if (!G.ITEMS[id]) return;
      this.p.inv[id] = (this.p.inv[id] || 0) + n;
      this.p.collected[id] = (this.p.collected[id] || 0) + n;
      this.questProgressCollect(id, n);
    },
    removeItem: function (id, n) {
      n = n || 1;
      var p = this.p;
      if (!p.inv[id]) return false;
      p.inv[id] -= n;
      if (p.inv[id] <= 0) delete p.inv[id];
      return true;
    },
    countItem: function (id) { return this.p.inv[id] || 0; },

    equip: function (id) {
      var it = G.ITEMS[id];
      if (!it) return null;
      var slot = it.type === 'weapon' ? 'weapon' : it.type === 'armor' ? 'armor' : it.type === 'acc' ? 'acc' : null;
      if (!slot) return null;
      var old = this.p.equip[slot];
      this.p.equip[slot] = id;
      this.removeItem(id, 1);
      if (old) this.addItem(old, 1);
      this.recalc();
      return old;
    },

    /* ================= 전투 ================= */
    /* 지역 안에서 몬스터를 고른다.
       내 레벨보다 높은 몬스터일수록 덜 나오게 가중치를 준다.
       (Lv.1인데 Lv.4짜리를 첫판부터 만나면 아이가 좌절한다) */
    randomMonster: function (regionId) {
      var r = this.region(regionId);
      if (!r || !r.monsters || !r.monsters.length) return null;
      var list = r.monsters, lv = this.p.lv;
      var w = [], total = 0;
      for (var i = 0; i < list.length; i++) {
        var diff = G.MONSTERS[list[i]].lv - lv;
        var weight = diff <= 0 ? 1 : Math.pow(0.5, diff);
        w.push(weight); total += weight;
      }
      var roll = Math.random() * total;
      for (var k = 0; k < list.length; k++) {
        roll -= w[k];
        if (roll <= 0) return list[k];
      }
      return list[list.length - 1];
    },

    region: function (id) {
      for (var i = 0; i < G.REGIONS.length; i++) if (G.REGIONS[i].id === id) return G.REGIONS[i];
      return null;
    },

    startBattle: function (monsterId) {
      var m = G.MONSTERS[monsterId];
      if (!m) return null;
      // 레벨 스케일: 플레이어가 훨씬 강하면 약간 보정 (지루함 방지)
      var e = {
        id: m.id, name: m.name, sprite: m.sprite, lv: m.lv,
        maxHp: m.hp, hp: m.hp, atk: m.atk, def: m.def, spd: m.spd,
        exp: m.exp, gold: m.gold, drops: m.drops || [], boss: !!m.boss,
        flavor: m.flavor, intro: m.intro
      };
      this.battle = { e: e, turn: 0, buffs: {}, over: false, fled: false };
      this.p.stats.battles++;
      return this.battle;
    },

    buffVal: function (stat) {
      var b = this.battle.buffs[stat];
      return b && b.turns > 0 ? b.amt : 0;
    },

    tickBuffs: function () {
      var b = this.battle.buffs;
      for (var k in b) { if (b[k].turns > 0) b[k].turns--; }
    },

    pAtk: function () { return Math.round(this.p.atk * (1 + this.buffVal('atk'))); },
    pDef: function () { return Math.round(this.p.def * (1 + this.buffVal('def'))); },
    pSpd: function () { return Math.round(this.p.spd * (1 + this.buffVal('spd'))); },

    calcDamage: function (atk, def, power, critBonus) {
      var base = atk * (power || 1);
      var red = def / (def + 70);
      var dmg = base * (1 - red);
      dmg *= 0.9 + Math.random() * 0.2;
      var critChance = 5 + this.p.luk / 3 + (critBonus || 0);
      var crit = Math.random() * 100 < critChance;
      if (crit) dmg *= 1.8;
      return { dmg: Math.max(1, Math.round(dmg)), crit: crit };
    },

    // 플레이어 행동 → 로그 배열 반환
    playerAct: function (action, arg) {
      var b = this.battle, p = this.p, e = b.e, out = [];
      if (b.over) return out;

      if (action === 'attack') {
        var r = this.calcDamage(this.pAtk(), e.def, 1);
        e.hp -= r.dmg;
        out.push({ t: (r.crit ? '★ 급소에 정확히 들어갔다!  ' : '') + p.name + '의 공격! ' + e.name + '에게 ' + r.dmg + '의 피해.', flashE: true });

      } else if (action === 'skill') {
        var sk = G.SKILLS[arg];
        if (!sk) return out;
        if (p.mp < sk.mp) { out.push({ t: '마나가 부족하다.' }); return out; }
        p.mp -= sk.mp;

        if (sk.kind === 'heal') {
          var amt = Math.round(p.maxHp * sk.power);
          p.hp = Math.min(p.maxHp, p.hp + amt);
          out.push({ t: p.name + '은(는) 【' + sk.name + '】! HP를 ' + amt + ' 회복했다.' });
        } else if (sk.kind === 'buff') {
          b.buffs[sk.stat] = { amt: sk.amt, turns: sk.turns };
          out.push({ t: p.name + '은(는) 【' + sk.name + '】! ' + sk.desc });
        } else {
          var hits = sk.hits || 1, total = 0, anyCrit = false;
          for (var i = 0; i < hits; i++) {
            var rr = this.calcDamage(this.pAtk(), e.def, sk.power, sk.critBonus);
            total += rr.dmg; anyCrit = anyCrit || rr.crit;
          }
          e.hp -= total;
          var line = p.name + '의 【' + sk.name + '】! ' + (hits > 1 ? hits + '연격, ' : '') + '총 ' + total + '의 피해!';
          if (anyCrit) line = '★ 치명타!  ' + line;
          out.push({ t: line, flashE: true });
          if (sk.kind === 'drain') {
            var hv = Math.round(total * 0.5);
            p.hp = Math.min(p.maxHp, p.hp + hv);
            out.push({ t: '흡수한 생명력으로 HP를 ' + hv + ' 회복했다.' });
          }
          if (sk.steal) {
            var g = Math.round(e.gold * 0.6);
            p.gold += g;
            out.push({ t: '슬쩍 ' + g + " G를 챙겼다." });
          }
        }

      } else if (action === 'item') {
        var it = G.ITEMS[arg];
        if (!it || !this.countItem(arg)) return out;
        this.removeItem(arg, 1);
        if (it.full) { p.hp = p.maxHp; p.mp = p.maxMp; out.push({ t: it.name + '을(를) 사용했다. 전부 회복!' }); }
        else if (it.heal) { var h = Math.min(it.heal, p.maxHp - p.hp); p.hp += h; out.push({ t: it.name + '을(를) 사용했다. HP +' + h }); }
        else if (it.healMp) { var mm = Math.min(it.healMp, p.maxMp - p.mp); p.mp += mm; out.push({ t: it.name + '을(를) 사용했다. MP +' + mm }); }
        else if (it.escape) { b.over = true; b.fled = true; out.push({ t: '연막이 퍼졌다. 무사히 빠져나왔다.' }); return out; }

      } else if (action === 'flee') {
        if (e.boss) { out.push({ t: '도망칠 수 없다! 등 뒤는 막다른 길이다.' }); }
        else {
          var chance = 0.45 + (this.pSpd() - e.spd) * 0.03;
          if (Math.random() < chance) {
            b.over = true; b.fled = true;
            out.push({ t: '전력으로 달렸다. 어떻게든 따돌렸다.' });
            return out;
          }
          out.push({ t: '도망치지 못했다!' });
        }
      }

      if (e.hp <= 0) { e.hp = 0; b.over = true; }
      return out;
    },

    enemyAct: function () {
      var b = this.battle, p = this.p, e = b.e, out = [];
      if (b.over) return out;
      var r = this.calcDamage(e.atk, this.pDef(), 1 + (e.boss && Math.random() < 0.25 ? 0.8 : 0));
      // 회피
      var dodge = Math.max(0, Math.min(0.25, (this.pSpd() - e.spd) * 0.012));
      if (Math.random() < dodge) {
        out.push({ t: e.name + '의 공격! 하지만 아슬아슬하게 피했다.' });
        return out;
      }
      p.hp -= r.dmg;
      out.push({ t: e.name + '의 공격! ' + r.dmg + '의 피해를 입었다.' + (r.crit ? '  아프다!' : ''), flashP: true });
      if (p.hp <= 0) { p.hp = 0; b.over = true; }
      return out;
    },

    /* 전투 종료 처리 */
    finishBattle: function () {
      var b = this.battle, p = this.p, e = b.e;
      var res = { win: false, faint: false, fled: b.fled, exp: 0, gold: 0, items: [], levelUps: [], opened: [] };
      if (b.fled) return res;

      if (p.hp <= 0) {
        res.faint = true;
        p.stats.faints++;
        var lost = Math.floor(p.gold * 0.1);
        p.gold -= lost;
        res.goldLost = lost;
        p.hp = Math.max(1, Math.floor(p.maxHp * 0.3));
        return res;
      }

      res.win = true;
      p.stats.wins++;
      p.kills[e.id] = (p.kills[e.id] || 0) + 1;
      this.questProgressKill(e.id);

      res.exp = e.exp;
      res.gold = e.gold + Math.floor(Math.random() * Math.max(1, e.gold * 0.3));
      p.gold += res.gold;

      for (var i = 0; i < e.drops.length; i++) {
        var d = e.drops[i];
        var chance = d[1] * (1 + p.luk / 200);
        if (Math.random() < chance) { this.addItem(d[0], 1); res.items.push(d[0]); }
      }

      res.levelUps = this.addExp(res.exp);
      res.opened = this.checkUnlocks();
      return res;
    },

    /* ================= 운명 이벤트 ================= */
    rollFate: function () {
      var p = this.p;
      p.pity1++; p.pity2++; p.pity3++;

      // 각성(T3)은 정말 드물어야 한다. 대신 오래 안 뜨면 조금씩 확률이 오른다.
      var c3 = 0.004 + p.pity3 * 0.00025;   // 최대 3%
      var c2 = 0.045 + p.pity2 * 0.004;     // 최대 22%
      var c1 = 0.15;

      var tier = 0;
      if (Math.random() < Math.min(0.03, c3)) tier = 3;
      else if (Math.random() < Math.min(0.22, c2)) tier = 2;
      else if (Math.random() < c1) tier = 1;
      if (!tier) return null;

      var ev = this.pickEvent(tier);
      // 해당 티어에 남은 이야기가 없으면 한 단계 낮춰 시도
      while (!ev && tier > 1) { tier--; ev = this.pickEvent(tier); }
      if (!ev) return null;

      if (tier >= 3) p.pity3 = 0;
      if (tier >= 2) p.pity2 = 0;
      p.pity1 = 0;
      p.stats.events++;
      // 본 이벤트는 여기서 바로 기록한다 (중간에 창을 닫아도 중복되지 않도록)
      p.seenEvents[ev.id] = true;
      return ev;
    },

    // 히든 직업을 이미 얻었는지
    hasHiddenJob: function () {
      var j = G.JOBS[this.p.job];
      return !!(j && j.hidden);
    },

    pickEvent: function (tier) {
      var p = this.p, pool = [];
      for (var i = 0; i < G.EVENTS.length; i++) {
        var ev = G.EVENTS[i];
        if (ev.tier !== tier) continue;
        if (ev.once && p.seenEvents[ev.id]) continue;
        // 히든 직업은 평생 하나뿐. 이미 얻었으면 다른 각성 이벤트는 뜨지 않는다.
        if (ev.givesJob && this.hasHiddenJob()) continue;
        if (ev.cond) { try { if (!ev.cond(p)) continue; } catch (err) { continue; } }
        pool.push(ev);
      }
      if (!pool.length) return null;
      return pool[Math.floor(Math.random() * pool.length)];
    },

    /* 이벤트 보상 적용 → 사람이 읽을 요약 문자열 배열 반환 */
    applyGain: function (g) {
      if (!g) return [];
      var p = this.p, lines = [];

      if (g.gold) { p.gold += g.gold; lines.push('+' + g.gold + ' G'); }
      if (g.goldByLv) { var gg = g.goldByLv * p.lv + Math.floor(Math.random() * 20); p.gold += gg; lines.push('+' + gg + ' G'); }
      if (g.goldHalf) { var h = Math.floor(p.gold / 2); p.gold -= h; lines.push('-' + h + ' G'); }
      if (g.useItem && this.countItem(g.useItem)) {
        this.removeItem(g.useItem, 1);
        lines.push('- ' + G.ITEMS[g.useItem].name + ' ×1');
      }
      if (g.exp) { lines.push('+' + g.exp + ' EXP'); this._pendingExp = (this._pendingExp || 0) + g.exp; }
      if (g.expByLv) {
        var ex = Math.round(g.expByLv * Math.pow(p.lv, 1.3));
        lines.push('+' + ex + ' EXP'); this._pendingExp = (this._pendingExp || 0) + ex;
      }
      if (g.items) {
        for (var i = 0; i < g.items.length; i++) {
          this.addItem(g.items[i], 1);
          var it = G.ITEMS[g.items[i]];
          if (it) lines.push('【' + G.TIERS[it.tier].name + '】 ' + it.name + ' 획득!');
        }
      }
      if (g.stat) {
        var parts = [];
        var LB = { hp: '최대HP', mp: '최대MP', atk: '공격', def: '방어', spd: '속도', luk: '행운' };
        for (var k in g.stat) { p.bonus[k] += g.stat[k]; parts.push(LB[k] + ' +' + g.stat[k]); }
        lines.push(parts.join(' / '));
      }
      if (g.skill && p.skills.indexOf(g.skill) < 0) {
        p.skills.push(g.skill);
        lines.push('새 스킬 【' + G.SKILLS[g.skill].name + '】 습득!');
      }
      if (g.job && G.JOBS[g.job]) {
        p.job = g.job;
        var jb = G.JOBS[g.job];
        lines.push('직업이 【' + jb.name + '】(으)로 바뀌었다!');
        var sk = jb.skills || {};
        for (var lvk in sk) {
          if (p.lv >= parseInt(lvk, 10) && p.skills.indexOf(sk[lvk]) < 0) {
            p.skills.push(sk[lvk]);
            lines.push('새 스킬 【' + G.SKILLS[sk[lvk]].name + '】 습득!');
          }
        }
      }
      if (g.titleGet) {
        p.title = g.titleGet;
        if (p.titles.indexOf(g.titleGet) < 0) p.titles.push(g.titleGet);
        lines.push('칭호 획득: 「' + g.titleGet + '」');
      }
      if (g.flag) p.flags[g.flag] = true;
      if (g.damage) {
        this.recalc();
        p.hp = Math.max(1, Math.round(p.maxHp * (1 - g.damage)));
        lines.push('큰 상처를 입었다. (HP ' + p.hp + ')');
      }

      this.recalc();
      if (g.full || g.heal) { p.hp = p.maxHp; p.mp = p.maxMp; lines.push('HP와 MP가 전부 회복되었다.'); }
      return lines;
    },

    // applyGain에서 모인 경험치를 실제로 반영 (레벨업 연출을 위해 분리)
    flushExp: function () {
      var n = this._pendingExp || 0;
      this._pendingExp = 0;
      if (!n) return { ups: [], opened: [] };
      var ups = this.addExp(n);
      return { ups: ups, opened: this.checkUnlocks() };
    },

    /* ================= 의뢰 ================= */
    availableQuests: function () {
      var p = this.p, out = [];
      for (var i = 0; i < G.QUESTS.length; i++) {
        var q = G.QUESTS[i];
        var st = p.quests[q.id];
        if (st && st.state === 'done') continue;
        if (!st && p.lv < q.lvReq) continue;
        out.push(q);
      }
      return out;
    },
    acceptQuest: function (id) {
      var q = this.questById(id);
      if (!q) return;
      this.p.quests[id] = { state: 'active', prog: 0 };
      // 이미 갖고 있는 재료는 즉시 반영
      if (q.goal.collect) this.p.quests[id].prog = Math.min(q.goal.n, this.countItem(q.goal.collect));
    },
    questById: function (id) {
      for (var i = 0; i < G.QUESTS.length; i++) if (G.QUESTS[i].id === id) return G.QUESTS[i];
      return null;
    },
    questProgressKill: function (mid) {
      var p = this.p;
      for (var id in p.quests) {
        var st = p.quests[id]; if (st.state !== 'active') continue;
        var q = this.questById(id); if (!q || !q.goal.kill) continue;
        if (q.goal.kill === mid) st.prog = Math.min(q.goal.n, st.prog + 1);
      }
    },
    questProgressCollect: function (iid) {
      var p = this.p;
      if (!p.quests) return;
      for (var id in p.quests) {
        var st = p.quests[id]; if (st.state !== 'active') continue;
        var q = this.questById(id); if (!q || !q.goal.collect) continue;
        if (q.goal.collect === iid) st.prog = Math.min(q.goal.n, this.countItem(iid));
      }
    },
    questComplete: function (id) {
      var q = this.questById(id), p = this.p;
      var st = p.quests[id];
      if (!q || !st || st.prog < q.goal.n) return null;
      if (q.goal.collect) this.removeItem(q.goal.collect, q.goal.n);
      st.state = 'done';
      var lines = this.applyGain({ gold: q.reward.gold, exp: q.reward.exp, items: q.reward.items });
      return lines;
    },

    /* ================= 상점 ================= */
    shopStock: function () {
      var p = this.p;
      var base = ['herb', 'potion', 'smoke', 'leather', 'rusty_dagger'];
      if (p.lv >= 5) base.push('hunter_sword', 'ether');
      if (p.lv >= 9) base.push('chain', 'hi_potion', 'forest_axe');
      if (p.lv >= 14) base.push('steel_sword', 'steel_plate', 'amulet_moon');
      if (p.lv >= 22) base.push('silver_saber', 'elixir');
      return base;
    },
    buy: function (id) {
      var it = G.ITEMS[id];
      if (!it || this.p.gold < it.price) return false;
      this.p.gold -= it.price;
      this.addItem(id, 1);
      return true;
    },
    sell: function (id) {
      var it = G.ITEMS[id];
      if (!it || it.noSell || !this.countItem(id)) return false;
      this.removeItem(id, 1);
      this.p.gold += Math.max(1, Math.floor(it.price * 0.5));
      return true;
    },

    /* 여관 */
    innCost: function () { return 10 + this.p.lv * 6; },
    rest: function () {
      var c = this.innCost();
      if (this.p.gold < c) return false;
      this.p.gold -= c;
      this.p.hp = this.p.maxHp; this.p.mp = this.p.maxMp;
      return true;
    },

    /* ================= 저장 ================= */
    save: function () {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.p));
        return true;
      } catch (e) { return false; }
    },
    hasSave: function () {
      try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
    },
    load: function () {
      try {
        var raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        var d = JSON.parse(raw);
        this.p = d;
        // 구버전 세이브 보정
        if (!this.p.titles) this.p.titles = [];
        if (!this.p.stats) this.p.stats = { battles: 0, wins: 0, faints: 0, events: 0, started: Date.now() };
        if (!this.p.bonus) this.p.bonus = { hp: 0, mp: 0, atk: 0, def: 0, spd: 0, luk: 0 };
        this.recalc();
        return true;
      } catch (e) { return false; }
    },
    wipe: function () {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    },
    exportSave: function () {
      return btoa(unescape(encodeURIComponent(JSON.stringify(this.p))));
    },
    importSave: function (str) {
      try {
        var d = JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
        if (!d || !d.name || !d.base) return false;
        this.p = d;
        if (!this.p.titles) this.p.titles = [];
        if (!this.p.bonus) this.p.bonus = { hp: 0, mp: 0, atk: 0, def: 0, spd: 0, luk: 0 };
        this.recalc();
        this.save();
        return true;
      } catch (e) { return false; }
    }
  };

  G.Game = Game;
})(window.RPG = window.RPG || {});
