(function () {
  var WORDS = {tr: `kitap kalem bulut deniz çiçek araba balık çanta dolap ekran fidan güneş hayat lamba makas nehir orman paket radyo sabah tavuk bahçe bebek çorba elmas kazak kumaş limon nokta ördek pamuk saray şehir şeker tarla yatak yazar sokak sınıf sepet salon rakam kanat kapak kağıt kayık kemer mısır dünya kahve tilki aslan çilek bilgi roman şarkı müzik gitar keman davul resim kablo sevgi barış özgür komşu kavga akşam öğlen perde duvar tavan zemin sebze meyve şapka çorap börek pilav kasap manav tenis yüzme merak sevinç
kelime yaprak rüzgar defter zeytin yıldız mutfak sandık hediye kuzgun ceylan kartal kaplan balina yengeç makine hikaye piyano sinema klavye doktor çiftçi avukat tavşan karpuz salata peynir yoğurt elbise gömlek balkon koltuk yastık yorgan yağmur deprem şimşek futbol sporcu koşucu yüzücü berber korkunç üzüntü yazıcı
telefon okyanus pencere karınca domates patates pantolon eldiven arkadaş dostluk misafir öğrenci hemşire balıkçı yazılım program fırtına kasırga bulutlu tiyatro çalışma sorumlu kelebek papatya menekşe kuyumcu fırıncı tesisat heyecan güvenli gökyüzü yürüyüş gençlik seyahat masalcı okuyucu
basketbol voleybol marangoz elektrik mutluluk dağcılık öğretmen mühendis uygulama merdiven ayakkabı mercimek sonbahar ilkbahar yıldırım bahçıvan kemirgen özgürlük çocukluk yaşlılık bilimsel kitaplık kalemlik yolculuk kahvaltı`,
  en: `apple brave chair dream eagle flame ghost heart image jolly knife lemon money night ocean piano queen river stone tiger uncle voice water young zebra beach bread cloud dance earth field grape house juice light mouse plant quiet round smile table under video world pearl crown candy brick cabin charm cliff coast craft depth drift fairy flute frost glove grain happy honey ivory jewel kayak lunar maple noble olive pride quest radar sugar toast unity vivid wheat yield
planet garden bridge castle dragon forest guitar island jungle kitten ladder marble nature orange pencil rabbit silver tunnel window yellow butter cookie dinner finger flower golden hammer insect jacket knight market number people rocket school spirit thread travel winter wonder anchor bottle candle desert engine frozen gentle hunter magnet pirate puzzle sunset
balance captain diamond economy factory glimmer harvest imagine journey kingdom library machine natural orchard painter quality rainbow science teacher uniform village weather whisper chicken morning blanket cabinet dolphin freedom gallery holiday compass dessert fiction horizon lantern mystery network penguin quarter shelter thunder volcano
absolute birthday calendar daughter elephant favorite generous hospital internet keyboard language mountain notebook obstacle painting question reliable sandwich treasure umbrella vacation wildlife adventure baseball computer distance exercise firework hardware important lifetime magazine neighbor operator discover envelope festival graceful midnight postcard strength triangle`};

  var LOC = {tr: "tr-TR", en: "en-US"};
  var RE = {tr: /^[a-zçğıöşü]$/, en: /^[a-z]$/};
  var KB = {
    tr: ["ERTYUIOPĞÜ", "ASDFGHJKLŞİ", "ZCVBNMÖÇ"],
    en: ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]
  };
  // Scoring: every round starts at SCORE.max coins. Each guess after the first costs 1 coin,
  // and every SCORE.every seconds past a grace period costs 1 more. The floor is SCORE.min.
  // A round that is not solved earns 0. Change the numbers here to tune the game.
  var SCORE = {max: 10, min: 2, graceBase: 30, graceStep: 10, every: 20};
  function graceSeconds(len) { return SCORE.graceBase + (len - 5) * SCORE.graceStep; }
  function coinsFor(guessCount, seconds, len) {
    var late = Math.floor(Math.max(0, seconds - graceSeconds(len)) / SCORE.every);
    return Math.max(SCORE.min, SCORE.max - (Math.max(1, guessCount) - 1) - late);
  }
  function fmtTime(ms) {
    var s = Math.floor(ms / 1000), m = Math.floor(s / 60), r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }

  var T = {
    tr: {
      settings: "Ayarlar", close: "Kapat", lang: "Dil", length: "Kelime uzunluğu", tries: "Deneme hakkı",
      howto: "Nasıl oynanır", good: "Doğru harf, doğru yer", near: "Doğru harf, yanlış yer", miss: "Kelimede yok",
      stats: "İstatistik", played: "Tur", won: "Kazanılan", streak: "Seri",
      newWord: "Yeni kelime", next: "Sonraki kelime", short: "Yetersiz harf",
      notInList: "Kelime listede yok", loading: "Sözlük yükleniyor…", credit: "Sözlük: Vikisözlük ve wordfreq verileri (CC BY-SA)",
      enter: "GİR", del: "SİL",
      start: "Başla", roundCoin: "Bu tur", points: "Puanlama",
      hint: function (max) { return "Hızlı ve az tahminle bul, " + max + " coine kadar kazan."; },
      rules: function (grace) {
        return [
          "Her tur " + SCORE.max + " coinle başlar.",
          "İlk tahminden sonra her tahmin 1 coin düşürür.",
          grace + " saniyeden sonra her " + SCORE.every + " saniye 1 coin düşürür.",
          "En az " + SCORE.min + " coin kazanırsın. Bulamazsan 0 coin."
        ];
      },
      goal: function (n) { return n + " harfli kelimeyi bul"; },
      win: function (n, time, coins) { return "Buldun! " + n + ". denemede · " + time + " · +" + coins + " coin"; },
      lose: function (w) { return "Kelime: " + w; }
    },
    en: {
      settings: "Settings", close: "Close", lang: "Language", length: "Word length", tries: "Guesses",
      howto: "How to play", good: "Right letter, right spot", near: "Right letter, wrong spot", miss: "Not in the word",
      stats: "Stats", played: "Rounds", won: "Solved", streak: "Streak",
      newWord: "New word", next: "Next word", short: "Not enough letters",
      notInList: "Not in word list", loading: "Loading dictionary…", credit: "Dictionary: word-list (MIT), wordfreq",
      enter: "ENTER", del: "DEL",
      start: "Start", roundCoin: "Round", points: "Scoring",
      hint: function (max) { return "Solve it fast and in few guesses to earn up to " + max + " coins."; },
      rules: function (grace) {
        return [
          "Every round starts at " + SCORE.max + " coins.",
          "Each guess after the first costs 1 coin.",
          "After " + grace + " seconds, every " + SCORE.every + " seconds costs 1 coin.",
          "You earn at least " + SCORE.min + " coins for a solve. No solve earns 0."
        ];
      },
      goal: function (n) { return "Find the " + n + "-letter word"; },
      win: function (n, time, coins) { return "Found it in " + n + (n === 1 ? " guess" : " guesses") + " · " + time + " · +" + coins + " coins"; },
      lose: function (w) { return "The word was " + w; }
    }
  };

  // Word pools by language and length
  var pools = {};
  ["tr", "en"].forEach(function (lang) {
    pools[lang] = {};
    for (var n = 5; n <= 8; n++) pools[lang][n] = [];
    var seen = {};
    WORDS[lang].split(/\s+/).forEach(function (w) {
      w = w.toLocaleLowerCase(LOC[lang]);
      if (!w || seen[w]) return;
      seen[w] = true;
      if (!/^[a-zçğıöşü]+$/.test(w)) return;
      if (lang === "en" && /[çğıöşü]/.test(w)) return;
      var n = Array.from(w).length;
      if (n >= 5 && n <= 8) pools[lang][n].push(w);
    });
  });

  // Full dictionaries live in data/ (dict-tr.json, dict-en.json), built by tools/build_dictionaries.py.
  // "a" holds common words used as answers, "v" every word accepted as a guess.
  // The short lists above only serve as a fallback if the files cannot be fetched.
  var valid = {tr: null, en: null};
  var dictLoads = {};
  function loadDict(l) {
    if (dictLoads[l]) return dictLoads[l];
    dictLoads[l] = fetch("data/dict-" + l + ".json")
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (d) {
        var v = {};
        for (var n = 5; n <= 8; n++) {
          var e = d[String(n)];
          if (!e) continue;
          var a = e.a.split(" ").filter(Boolean);
          if (a.length) pools[l][n] = a;
          v[n] = new Set(e.v.split(" "));
        }
        valid[l] = v;
      })
      .catch(function () { /* keep the built-in fallback pool, no guess validation */ });
    return dictLoads[l];
  }

  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key) || "null"); return v || fallback; } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  var settings = {lang: "tr", len: 5, tries: 6};
  var saved = load("fmp-settings", null);
  if (saved) {
    if (saved.lang === "tr" || saved.lang === "en") settings.lang = saved.lang;
    if (saved.len >= 5 && saved.len <= 8) settings.len = saved.len;
    if (saved.tries === 5 || saved.tries === 6) settings.tries = saved.tries;
  }
  var stats = Object.assign({played: 0, won: 0, streak: 0}, load("fmp-stats", {}));
  var playedWords = load("fmp-played", {});
  var totalCoins = Number(load("fmp-coins", 0)) || 0;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var boardEl = document.getElementById("board");
  var msgEl = document.getElementById("msg");
  var nextBtn = document.getElementById("nextBtn");
  var kbEl = document.getElementById("kb");
  var clockEl = document.getElementById("clock");
  var nowEl = document.getElementById("nowCoins");
  var nowItem = document.getElementById("nowItem");
  var totalEl = document.getElementById("totalCoins");
  var startOverlay = document.getElementById("startOverlay");
  var startBtn = document.getElementById("startBtn");
  var startHint = document.getElementById("startHint");

  var target = [], cur = [], guesses = [], keyState = {};
  var over = false, busy = false, toastTimer = null;
  // started: the round is running (Start was pressed). ready: dictionary loaded and word picked.
  var started = false, ready = false, startTime = 0, elapsedMs = 0, clockTimer = null;

  function setLevel(c) { nowItem.dataset.level = c >= 8 ? "high" : c >= 5 ? "mid" : "low"; }
  function tick() {
    elapsedMs = Date.now() - startTime;
    clockEl.textContent = fmtTime(elapsedMs);
    // Coins you would earn if you solved the word with your next guess
    var c = coinsFor(guesses.length + 1, elapsedMs / 1000, settings.len);
    nowEl.textContent = c;
    setLevel(c);
  }
  function stopClock() {
    clearInterval(clockTimer);
    clockTimer = null;
    if (started) {
      elapsedMs = Date.now() - startTime;
      clockEl.textContent = fmtTime(elapsedMs);
    }
  }
  function resetHud() {
    stopClock();
    elapsedMs = 0;
    clockEl.textContent = "00:00";
    nowEl.textContent = SCORE.max;
    setLevel(SCORE.max);
    totalEl.textContent = totalCoins;
  }
  function startRound() {
    if (started || !ready) return;
    started = true;
    busy = false;
    startOverlay.hidden = true;
    kbEl.classList.remove("off");
    startTime = Date.now();
    tick();
    clockTimer = setInterval(tick, 250);
  }

  function lang() { return settings.lang; }
  function up(ch) { return ch.toLocaleUpperCase(LOC[lang()]); }

  function pickWord() {
    var key = lang() + "-" + settings.len;
    var pool = pools[lang()][settings.len];
    var done = playedWords[key] || [];
    var fresh = pool.filter(function (w) { return done.indexOf(w) === -1; });
    if (!fresh.length) { done = []; fresh = pool.slice(); }
    var w = fresh[Math.floor(Math.random() * fresh.length)];
    done.push(w);
    playedWords[key] = done;
    save("fmp-played", playedWords);
    return w;
  }

  function buildBoard() {
    boardEl.innerHTML = "";
    boardEl.style.setProperty("--len", settings.len);
    for (var r = 0; r < settings.tries; r++) {
      var row = document.createElement("div");
      row.className = "row";
      for (var c = 0; c < settings.len; c++) {
        var t = document.createElement("div");
        t.className = "tile";
        row.appendChild(t);
      }
      boardEl.appendChild(row);
    }
  }

  function buildKeyboard() {
    kbEl.innerHTML = "";
    var t = T[lang()];
    KB[lang()].forEach(function (letters, idx, arr) {
      var row = document.createElement("div");
      row.className = "kr";
      if (idx === arr.length - 1) row.appendChild(makeKey("ENTER", t.enter, true));
      Array.from(letters).forEach(function (l) { row.appendChild(makeKey(l, l, false)); });
      if (idx === arr.length - 1) row.appendChild(makeKey("DEL", t.del, true));
      kbEl.appendChild(row);
    });
    refreshKeys();
  }
  function makeKey(code, label, wide) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "key" + (wide ? " wide" : "");
    b.dataset.k = code;
    b.textContent = label;
    return b;
  }
  function refreshKeys() {
    kbEl.querySelectorAll(".key").forEach(function (b) {
      b.classList.remove("good", "near", "miss");
      var s = keyState[b.dataset.k];
      if (s) b.classList.add(s);
    });
  }

  function rowTiles(i) { return boardEl.children[i].children; }

  function renderCurrent() {
    var tiles = rowTiles(guesses.length);
    for (var i = 0; i < settings.len; i++) {
      tiles[i].textContent = cur[i] || "";
      tiles[i].classList.toggle("filled", !!cur[i]);
    }
  }

  function toast(text) {
    msgEl.textContent = text;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { if (!over) msgEl.textContent = ""; }, 1600);
  }

  function evaluate(guess, answer) {
    var n = answer.length, res = [], used = [], i, j;
    for (i = 0; i < n; i++) { res.push("miss"); used.push(false); }
    for (i = 0; i < n; i++) {
      if (guess[i] === answer[i]) { res[i] = "good"; used[i] = true; }
    }
    for (i = 0; i < n; i++) {
      if (res[i] === "good") continue;
      for (j = 0; j < n; j++) {
        if (!used[j] && answer[j] === guess[i]) { res[i] = "near"; used[j] = true; break; }
      }
    }
    return res;
  }

  function add(ch) {
    if (!started || over || busy || cur.length >= settings.len) return;
    cur.push(ch);
    renderCurrent();
  }
  function del() {
    if (!started || over || busy || !cur.length) return;
    cur.pop();
    renderCurrent();
  }

  function submit() {
    if (!started || over || busy) return;
    function shakeRow() {
      var row = boardEl.children[guesses.length];
      row.classList.remove("shake");
      void row.offsetWidth;
      row.classList.add("shake");
    }
    if (cur.length < settings.len) {
      shakeRow();
      toast(T[lang()].short);
      return;
    }
    var vset = valid[lang()] && valid[lang()][settings.len];
    var word = cur.join("").toLocaleLowerCase(LOC[lang()]);
    if (vset && !vset.has(word) && word !== target.join("").toLocaleLowerCase(LOC[lang()])) {
      shakeRow();
      toast(T[lang()].notInList);
      return;
    }
    var guess = cur.slice();
    var res = evaluate(guess, target);
    var rowIndex = guesses.length;
    guesses.push(guess.join(""));
    cur = [];
    busy = true;

    // The clock stops at the moment the last guess is sent, not after the tile animation.
    var won = res.every(function (r) { return r === "good"; });
    if (won || guesses.length >= settings.tries) stopClock();
    var token = gameToken;

    var tiles = rowTiles(rowIndex);
    for (var i = 0; i < settings.len; i++) {
      (function (i) {
        setTimeout(function () {
          tiles[i].classList.add("flip");
          setTimeout(function () {
            tiles[i].classList.remove("filled");
            tiles[i].classList.add(res[i]);
          }, reduce ? 0 : 210);
        }, reduce ? 0 : i * 230);
      })(i);
    }
    var total = reduce ? 0 : (settings.len - 1) * 230 + 460;
    setTimeout(function () {
      if (token !== gameToken) return; // a new game started while the tiles were flipping
      var rank = {miss: 1, near: 2, good: 3};
      for (var k = 0; k < guess.length; k++) {
        var prev = keyState[guess[k]];
        if (!prev || rank[res[k]] > rank[prev]) keyState[guess[k]] = res[k];
      }
      refreshKeys();
      busy = false;
      if (won) finish(true);
      else if (guesses.length >= settings.tries) finish(false);
    }, total);
  }

  function finish(won) {
    over = true;
    stats.played += 1;
    if (won) { stats.won += 1; stats.streak += 1; } else { stats.streak = 0; }
    save("fmp-stats", stats);
    renderStats();

    var earned = won ? coinsFor(guesses.length, elapsedMs / 1000, settings.len) : 0;
    totalCoins += earned;
    save("fmp-coins", totalCoins);
    totalEl.textContent = totalCoins;
    nowEl.textContent = earned;
    setLevel(earned);
    if (earned) {
      totalEl.classList.remove("bump");
      void totalEl.offsetWidth;
      totalEl.classList.add("bump");
    }

    var t = T[lang()];
    msgEl.textContent = won ? t.win(guesses.length, fmtTime(elapsedMs), earned) : t.lose(target.join(""));
    nextBtn.textContent = t.next;
    nextBtn.hidden = false;
    nextBtn.focus({preventScroll: true});
  }

  function renderStats() {
    document.getElementById("stPlayed").textContent = stats.played;
    document.getElementById("stWon").textContent = stats.won;
    document.getElementById("stStreak").textContent = stats.streak;
  }

  function applyLanguage() {
    var t = T[lang()];
    document.documentElement.lang = lang();
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll("[data-i18n-label]").forEach(function (el) { el.setAttribute("aria-label", t[el.dataset.i18nLabel]); });
    document.getElementById("panel").setAttribute("aria-label", t.settings);
    document.getElementById("goal").textContent = t.goal(settings.len);
    startHint.textContent = t.hint(SCORE.max);
    var rulesEl = document.getElementById("rules");
    rulesEl.innerHTML = "";
    t.rules(graceSeconds(settings.len)).forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      rulesEl.appendChild(li);
    });
    document.querySelectorAll(".seg").forEach(function (seg) {
      seg.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(String(settings[seg.dataset.group]) === b.dataset.val));
      });
    });
  }

  var gameToken = 0;
  // autostart: true when the player pressed "Next word" and the clock should run at once.
  // Otherwise the board waits behind the Start button (first visit, new settings, "New word").
  function newGame(autostart) {
    var token = ++gameToken, l = lang();
    cur = []; guesses = []; keyState = {}; target = [];
    over = false; busy = true; started = false; ready = false;
    nextBtn.hidden = true;
    msgEl.textContent = "";
    applyLanguage();
    buildBoard();
    buildKeyboard();
    resetHud();
    kbEl.classList.add("off");
    startOverlay.hidden = false;
    startBtn.disabled = true;
    startBtn.textContent = T[l].loading;
    loadDict(l).then(function () {
      if (token !== gameToken) return;
      target = Array.from(up(pickWord()));
      ready = true;
      startBtn.disabled = false;
      startBtn.textContent = T[l].start;
      if (autostart) startRound();
    });
  }

  // Panel
  function openPanel() { document.body.classList.add("open"); }
  function closePanel() { document.body.classList.remove("open"); }
  document.getElementById("openBtn").addEventListener("click", openPanel);
  document.getElementById("closeBtn").addEventListener("click", closePanel);
  document.getElementById("scrim").addEventListener("click", closePanel);

  document.querySelectorAll(".seg button").forEach(function (b) {
    b.addEventListener("click", function () {
      var group = b.parentElement.dataset.group;
      var val = group === "lang" ? b.dataset.val : Number(b.dataset.val);
      if (settings[group] === val) { b.blur(); return; }
      settings[group] = val;
      save("fmp-settings", settings);
      b.blur();
      newGame(false);
    });
  });
  document.getElementById("newBtn").addEventListener("click", function (e) { e.currentTarget.blur(); newGame(false); closePanel(); });
  nextBtn.addEventListener("click", function () { newGame(true); });
  startBtn.addEventListener("click", function () { startRound(); });

  kbEl.addEventListener("click", function (e) {
    var b = e.target.closest(".key");
    if (!b) return;
    b.blur();
    var k = b.dataset.k;
    if (k === "ENTER") { if (over) newGame(true); else if (!started) startRound(); else submit(); }
    else if (k === "DEL") del();
    else add(k);
  });

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") { closePanel(); return; }
    var tgt = e.target;
    if (tgt && tgt.closest && (tgt.closest("aside") || tgt.closest("header"))) return;
    if (e.key === "Enter") {
      if (tgt && tgt.tagName === "BUTTON") return;
      e.preventDefault();
      if (over) newGame(true); else if (!started) startRound(); else submit();
      return;
    }
    if (e.key === "Backspace") { e.preventDefault(); del(); return; }
    if (e.key.length === 1) {
      var l = e.key.toLocaleLowerCase(LOC[lang()]);
      if (RE[lang()].test(l)) add(up(l));
    }
  });

  renderStats();
  newGame();
})();