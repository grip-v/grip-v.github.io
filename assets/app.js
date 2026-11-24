(function () {
  "use strict";
  var D = window.GRIPV;
  var FAM = {
    "Mechanics & motion": { c: "var(--mech)", d: "Collisions, bounces, gears, springs, balances, ramps, and stacks that topple." },
    "Fluids & optics": { c: "var(--fluid)", d: "Pouring, draining, floating, flooding, and light bouncing off mirrors." },
    "Spatial & 3D geometry": { c: "var(--spat)", d: "Spinning solids, turntables, moving shadows, and symmetric patterns." },
    "Occlusion & permanence": { c: "var(--occl)", d: "Shell games, hidden objects, translucent panels, and tracking through screens." },
    "Temporal events": { c: "var(--temp)", d: "Flashes, spreading signals, sandpile cascades, and cellular automata." },
    "Agents & navigation": { c: "var(--agent)", d: "Chases, routes, traffic queues, rope swings, and long jumps." },
    "Rules & algorithms": { c: "var(--rules)", d: "Chess moves, braids, tile shuffles, sorting belts, and elimination rules." }
  };
  var RUNG = ["#7aa3e8", "#5b8be0", "#4170d6", "#2f57b8", "#213f8c"];
  var RUNGNAME = ["Observation", "Relations", "Measurement", "Multi-step", "Counterfactual"];
  var counts = {};
  D.families.forEach(function (f) { counts[f] = 0; });
  var SUBS = {
    "Mechanics & motion": 9, "Fluids & optics": 6, "Spatial & 3D geometry": 4, "Occlusion & permanence": 6,
    "Temporal events": 5, "Agents & navigation": 5, "Rules & algorithms": 5
  };

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* Teaser grid */
  var teaser = document.getElementById("teaser");
  D.examples.forEach(function (ex, i) {
    var t = el("div", { class: "tile", role: "button", tabindex: "0", "aria-label": "Try the " + ex.name + " clip" });
    var v = el("video", { muted: "", playsinline: "", loop: "", autoplay: "", preload: "metadata", src: ex.video });
    v.muted = true;
    t.appendChild(v);
    t.appendChild(el("span", { class: "lab" }, '<span class="dot" style="background:' + FAM[ex.family].c + '"></span>' + esc(ex.name)));
    function go() { select(i); document.getElementById("explore").scrollIntoView(); }
    t.addEventListener("click", go);
    t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    teaser.appendChild(t);
  });
  // Play teaser clips only while visible.
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    }, { threshold: 0.2 });
    teaser.querySelectorAll("video").forEach(function (v) { io.observe(v); });
  }

  /* Explorer */
  var picker = document.getElementById("picker"), player = document.getElementById("player");
  var qlist = document.getElementById("qlist"), score = document.getElementById("score");
  var state = { right: 0, done: 0, total: 0 };
  D.examples.forEach(function (ex, i) {
    var b = el("button", { class: "chip", "aria-pressed": "false" }, '<span class="dot" style="background:' + FAM[ex.family].c + '"></span>' + esc(ex.name));
    b.addEventListener("click", function () { select(i); });
    picker.appendChild(b);
  });
  function updScore() {
    score.textContent = state.done ? ("You: " + state.right + " / " + state.done + " correct · " + (state.total - state.done) + " left") : "Pick an answer for each question. Replay the clip as often as you like.";
  }
  function select(i) {
    var ex = D.examples[i];
    picker.querySelectorAll(".chip").forEach(function (b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
    player.src = ex.video;
    var rate = document.querySelector('#speed [aria-pressed="true"]');
    player.playbackRate = rate ? +rate.dataset.r : 1;
    var p = player.play(); if (p && p.catch) p.catch(function () {});
    document.getElementById("clipname").textContent = ex.name;
    document.getElementById("clipfam").textContent = ex.family + " · " + ex.duration.toFixed(1) + " s";
    qlist.innerHTML = "";
    state = { right: 0, done: 0, total: ex.questions.length };
    ex.questions.forEach(function (q) {
      var box = el("div", { class: "q" });
      box.appendChild(el("div", { class: "top" },
        '<span class="rung" style="background:' + RUNG[q.level - 1] + '">L' + q.level + "</span>" +
        '<span class="tag">' + RUNGNAME[q.level - 1] + "</span>" +
        (q.motion ? '<span class="tag">needs motion</span>' : '<span class="tag">single frame</span>')));
      box.appendChild(el("p", null, esc(q.q)));
      var opts = el("div", { class: "opts" });
      q.options.forEach(function (o, k) {
        var L = String.fromCharCode(65 + k);
        var b = el("button", { class: "opt" }, "<b>" + L + "</b>" + esc(o));
        b.addEventListener("click", function () {
          opts.querySelectorAll(".opt").forEach(function (x, kk) {
            x.disabled = true;
            if (String.fromCharCode(65 + kk) === q.answer) x.classList.add("right");
          });
          if (L !== q.answer) b.classList.add("wrong"); else state.right++;
          state.done++; updScore();
        });
        opts.appendChild(b);
      });
      box.appendChild(opts);
      qlist.appendChild(box);
    });
    updScore();
  }
  document.querySelectorAll("#speed button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("#speed button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      player.playbackRate = +b.dataset.r;
    });
  });
  var start = 0;
  D.examples.forEach(function (ex, i) { if (ex.cat === "tangled_braid") start = i; });
  select(start);
  player.pause();

  /* Families */
  var fams = document.getElementById("fams");
  D.families.forEach(function (f) {
    var c = el("div", { class: "fam", style: "border-left-color:" + FAM[f].c });
    c.innerHTML = "<h3>" + esc(f) + ' <span style="color:var(--ink-3);font-weight:500">· ' + SUBS[f] + "</span></h3><p>" + esc(FAM[f].d) + "</p>";
    fams.appendChild(c);
  });

  /* Leaderboard */
  var cols = [
    { k: "name", t: "Model", f: function (m) { return esc(m.name); } },
    { k: "release", t: "Released" },
    { k: "params", t: "Params" },
    { k: "acc", t: "Accuracy", bar: true },
    { k: "ci", t: "95% CI", f: function (m) { return m.ci[0].toFixed(1) + "–" + m.ci[1].toFixed(1); }, nosort: true },
    { k: "adj", t: "Adjusted" }
  ].concat([0, 1, 2, 3, 4].map(function (i) { return { k: "L" + (i + 1), t: "L" + (i + 1), v: function (m) { return m.levels[i]; } }; }));
  var board = document.getElementById("board");
  var maxAcc = Math.max.apply(null, D.models.map(function (m) { return m.acc; }));
  var sortKey = "acc";
  function val(m, c) { return c.v ? c.v(m) : m[c.k]; }
  function drawBoard() {
    var c0 = cols.filter(function (c) { return c.k === sortKey; })[0];
    var rows = D.models.slice().sort(function (a, b) {
      var x = val(a, c0), y = val(b, c0);
      return typeof x === "number" ? y - x : String(x).localeCompare(String(y));
    });
    var best = {};
    cols.forEach(function (c) { if (typeof val(D.models[0], c) === "number") best[c.k] = Math.max.apply(null, D.models.map(function (m) { return val(m, c); })); });
    var h = "<thead><tr>" + cols.map(function (c) {
      return '<th data-k="' + c.k + '"' + (c.k === sortKey ? ' class="sorted"' : "") + ">" + c.t + "</th>";
    }).join("") + "</tr></thead><tbody>";
    rows.forEach(function (m) {
      h += "<tr>" + cols.map(function (c) {
        var x = val(m, c);
        var s = c.f ? c.f(m) : (typeof x === "number" ? x.toFixed(1) : esc(x));
        if (typeof x === "number" && x === best[c.k]) s = "<b>" + s + "</b>";
        if (c.bar) return '<td class="bar"><div class="barcell"><i style="width:' + (100 * x / maxAcc).toFixed(0) + 'px"></i>' + s + "</div></td>";
        return "<td>" + s + "</td>";
      }).join("") + "</tr>";
    });
    var b = D.baseline_levels;
    h += '<tr class="ref"><td>Constant-answer baseline</td><td></td><td></td><td class="bar"><div class="barcell">28.1</div></td><td></td><td>0.0</td>' +
      b.map(function (x) { return "<td>" + x.toFixed(1) + "</td>"; }).join("") + "</tr></tbody>";
    board.innerHTML = h;
    board.querySelectorAll("th").forEach(function (th) {
      var c = cols.filter(function (cc) { return cc.k === th.dataset.k; })[0];
      if (c.nosort) { th.style.cursor = "default"; return; }
      th.addEventListener("click", function () { sortKey = c.k; drawBoard(); });
    });
  }
  drawBoard();

  /* Line chart helper */
  function lineChart(target, series, opts) {
    var W = 520, H = 280, L = 40, R = 14, T = 12, B = 30;
    var y0 = opts.min, y1 = opts.max;
    var x = function (i) { return L + i * (W - L - R) / 4; };
    var y = function (v) { return T + (H - T - B) * (1 - (v - y0) / (y1 - y0)); };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.label) + '">';
    for (var g = y0; g <= y1; g += opts.step) {
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="#eceef2"/>';
      s += '<text x="' + (L - 8) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + g + "</text>";
    }
    for (var i = 0; i < 5; i++) s += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">L' + (i + 1) + "</text>";
    series.forEach(function (se) {
      var pts = se.v.map(function (v, i) { return x(i) + "," + y(v); }).join(" ");
      s += '<polyline fill="none" stroke="' + se.c + '" stroke-width="' + (se.w || 2) + '"' + (se.dash ? ' stroke-dasharray="5 4"' : "") + ' points="' + pts + '"><title>' + esc(se.n) + "</title></polyline>";
      if (se.dots) se.v.forEach(function (v, i) {
        s += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3.5" fill="' + se.c + '"><title>' + esc(se.n) + " L" + (i + 1) + ": " + v.toFixed(1) + "%</title></circle>";
      });
      if (se.end) s += '<text x="' + (x(4) - 4) + '" y="' + (y(se.v[4]) - 8) + '" text-anchor="end" style="fill:' + se.c + ';font-weight:600">' + se.v[4].toFixed(1) + "</text>";
    });
    target.innerHTML = s + "</svg>";
  }
  var top = D.models.slice(0, 3), others = D.models.slice(3);
  var palette = ["#3a5bd9", "#e08a3c", "#2e9fb0"];
  var series = others.map(function (m) { return { n: m.name, v: m.levels, c: "#d3d6dd", w: 1.5 }; });
  series.push({ n: "Constant-answer baseline", v: D.baseline_levels, c: "#8d929c", dash: true, w: 1.5 });
  top.forEach(function (m, i) { series.push({ n: m.name, v: m.levels, c: palette[i], w: 2.5, dots: true }); });
  lineChart(document.getElementById("ladderchart"), series, { min: 20, max: 80, step: 10, label: "Accuracy by rung" });
  document.getElementById("ladderlegend").innerHTML = top.map(function (m, i) {
    return '<span><i style="background:' + palette[i] + '"></i>' + esc(m.name) + "</span>";
  }).join("") + '<span><i style="background:#d3d6dd"></i>Other 8 models</span><span><i style="background:#8d929c"></i>Baseline</span>';

  lineChart(document.getElementById("humanchart"), [
    { n: "Constant-answer baseline", v: D.baseline_levels, c: "#b8bcc6", dash: true, w: 1.5 },
    { n: "Best model", v: D.human.best_levels, c: "#3a5bd9", w: 2.5, dots: true, end: true },
    { n: "Humans", v: D.human.levels, c: "#2e8b4a", w: 2.5, dots: true, end: true }
  ], { min: 20, max: 100, step: 20, label: "Humans versus best model by rung" });

  /* Paired bars for the controls */
  function pairs(target, rows, a, b, maxv) {
    var h = "";
    rows.forEach(function (r) {
      h += '<div class="pair"><span>' + esc(r.name) + '</span><span class="bars">' +
        '<i style="width:' + (100 * r[a] / maxv).toFixed(1) + '%;background:var(--accent)" title="' + r[a].toFixed(1) + '"></i>' +
        '<i style="width:' + (100 * Math.max(r[b], 0) / maxv).toFixed(1) + '%;background:#b8bcc6" title="' + r[b].toFixed(1) + '"></i>' +
        '</span><span class="g">+' + r.gain.toFixed(1) + "</span></div>";
    });
    target.innerHTML = h;
  }
  pairs(document.getElementById("ffbars"), D.final_frame, "video", "frame", 32);
  pairs(document.getElementById("shbars"), D.shuffled, "ordered", "shuffled", 32);

  /* Copy BibTeX */
  document.querySelectorAll(".copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var txt = document.getElementById(b.dataset.target).textContent;
      var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
    });
  });

  /* Active nav link */
  var links = document.querySelectorAll(".nav li a");
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("section[id]").forEach(function (s) { so.observe(s); });
  }
})();
