/* ===========================================================
   sync.js — 서버 동기화 + 우편함
   -----------------------------------------------------------
   config.js 에 Supabase 값이 있으면 켜지고, 없으면 조용히 꺼집니다.
   네트워크가 끊겨도 게임은 그대로 돌아갑니다. (전부 실패해도 무시)

   서버에는 두 개의 표만 씁니다.
     game_saves : 아이별 진행 상황 (아빠가 들여다보는 곳)
     game_mail  : 아빠가 보낸 선물 (아이가 우편함에서 받는 곳)
   =========================================================== */
(function (G) {
  'use strict';

  var ID_KEY = 'eldria_player_id';

  var Sync = {
    lastPush: 0,
    online: false,

    cfg: function () { return G.CONFIG; },
    on: function () { return G.CONFIG && G.CONFIG.enabled(); },

    /* 이 기기의 고유 플레이어 ID (한 번 만들면 계속 씁니다) */
    playerId: function () {
      try {
        var id = localStorage.getItem(ID_KEY);
        if (!id) {
          id = 'p_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
          localStorage.setItem(ID_KEY, id);
        }
        return id;
      } catch (e) {
        return 'p_local';
      }
    },

    _headers: function (extra) {
      var c = this.cfg();
      var h = {
        'apikey': c.SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + c.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      };
      for (var k in (extra || {})) h[k] = extra[k];
      return h;
    },

    _url: function (path) {
      return this.cfg().SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/' + path;
    },

    /* 아빠가 목록에서 한눈에 보는 요약 */
    summary: function (p) {
      var jb = G.JOBS[p.job] || {};
      var bond = p.bond && p.bond.owned ? G.bondStage(p.bond.lv) : null;
      return {
        name: p.name,
        lv: p.lv,
        job: jb.name || p.job,
        title: p.title,
        gold: p.gold,
        hp: p.hp, maxHp: p.maxHp,
        region: p.region,
        chapter: G.CHAPTER_NO,
        battles: p.stats.battles,
        wins: p.stats.wins,
        faints: p.stats.faints,
        events: p.stats.events,
        titles: p.titles || [],
        bond: bond ? { lv: p.bond.lv, exp: p.bond.exp, name: bond.name } : null,
        quests: p.quests || {},
        seenEvents: Object.keys(p.seenEvents || {}),
        equip: {
          weapon: nameOf(p.equip.weapon, p),
          armor: nameOf(p.equip.armor, p),
          acc: nameOf(p.equip.acc, p)
        },
        items: itemList(p),
        updatedAt: new Date().toISOString()
      };

      function nameOf(id, pp) {
        if (!id) return null;
        if (id === '__bond') return pp.bond.owned ? G.bondStage(pp.bond.lv).name : null;
        return G.ITEMS[id] ? G.ITEMS[id].name : id;
      }
      function itemList(pp) {
        var out = [];
        for (var id in pp.inv) {
          var it = G.ITEMS[id];
          if (it) out.push({ id: id, name: it.name, tier: it.tier, n: pp.inv[id] });
        }
        return out;
      }
    },

    /* 진행 상황을 서버에 올린다 (실패해도 무시) */
    push: function (p, force) {
      if (!this.on() || !p) return Promise.resolve(false);
      var now = Date.now();
      if (!force && now - this.lastPush < this.cfg().SYNC_EVERY * 1000) return Promise.resolve(false);
      this.lastPush = now;

      var self = this;
      var row = {
        id: this.playerId(),
        family: this.cfg().FAMILY,
        name: p.name,
        summary: this.summary(p),
        data: p,
        updated_at: new Date().toISOString()
      };

      return fetch(this._url('game_saves'), {
        method: 'POST',
        headers: this._headers({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify(row)
      }).then(function (r) {
        self.online = r.ok;
        return r.ok;
      }).catch(function () {
        self.online = false;
        return false;
      });
    },

    /* 아직 안 받은 선물을 가져온다 */
    fetchMail: function () {
      if (!this.on()) return Promise.resolve([]);
      var q = 'game_mail?to_player=in.(' + this.playerId() + ',*)&claimed=eq.false&select=*&order=created_at.asc';
      return fetch(this._url(q), { headers: this._headers() })
        .then(function (r) { return r.ok ? r.json() : []; })
        .catch(function () { return []; });
    },

    /* 받은 선물을 "받음" 처리 */
    markClaimed: function (rowId) {
      if (!this.on()) return Promise.resolve(false);
      return fetch(this._url('game_mail?id=eq.' + rowId), {
        method: 'PATCH',
        headers: this._headers({ 'Prefer': 'return=minimal' }),
        body: JSON.stringify({ claimed: true, claimed_at: new Date().toISOString() })
      }).then(function (r) { return r.ok; }).catch(function () { return false; });
    },

    /* ---------- 오프라인 대체 수단: 코드 주고받기 ---------- */

    // 아이가 아빠에게 보낼 "진행 코드"
    progressCode: function (p) {
      var payload = { t: 'progress', id: this.playerId(), s: this.summary(p) };
      return encode(payload);
    },

    // 아빠가 보낸 "선물 코드" 해석
    readGiftCode: function (code) {
      var o = decode(code);
      if (!o || o.t !== 'gift' || !o.g) return null;
      return o.g;
    }
  };

  /* ---------- 한글까지 안전한 base64 ---------- */
  function encode(obj) {
    try {
      var json = JSON.stringify(obj);
      var bytes = new TextEncoder().encode(json);
      var bin = '';
      for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) { return ''; }
  }

  function decode(str) {
    try {
      var b = String(str).trim().replace(/-/g, '+').replace(/_/g, '/');
      while (b.length % 4) b += '=';
      var bin = atob(b);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { return null; }
  }

  Sync.encode = encode;
  Sync.decode = decode;

  G.Sync = Sync;
})(window.RPG = window.RPG || {});
