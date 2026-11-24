(function () {
  "use strict";
  var W = window.GRIPV_WHEEL, D = window.GRIPV;
  var host = document.getElementById("wheel"), info = document.getElementById("wheelinfo");
  if (!host || !W) return;
  var NS = "http://www.w3.org/2000/svg";
  var R0 = 150, R1 = 158, R2 = 300, R3 = 306, R4 = 496;
  var N = 0; W.forEach(function (f) { N += f.subs.length; });
  var step = 360 / N;
  var FAMDESC = {
    "Mechanics & motion": "Collisions, bounces, gears, springs, balances, ramps, and stacks that topple.",
    "Fluids & optics": "Pouring, draining, floating, flooding, and light bouncing off mirrors.",
    "Spatial & 3D geometry": "Spinning solids, turntables, moving shadows, and symmetric patterns.",
    "Occlusion & permanence": "Shell games, hidden objects, translucent panels, and tracking through screens.",
    "Temporal events": "Flashes, spreading signals, sandpile cascades, and cellular automata.",
    "Agents & navigation": "Chases, routes, traffic queues, rope swings, and long jumps.",
    "Rules & algorithms": "Chess moves, braids, tile shuffles, sorting belts, and elimination rules."
  };
  var clipIndex = {};
  (D && D.examples || []).forEach(function (e, i) { clipIndex[e.cat] = i; });

  function s(tag, a, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) e.setAttribute(k, a[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function pt(r, deg) { var t = (deg - 90) * Math.PI / 180; return [r * Math.cos(t), r * Math.sin(t)]; }
  function arc(r1, r2, a1, a2) {
    var p1 = pt(r2, a1), p2 = pt(r2, a2), p3 = pt(r1, a2), p4 = pt(r1, a1), big = a2 - a1 > 180 ? 1 : 0;
    return "M" + p1 + "A" + r2 + "," + r2 + " 0 " + big + " 1 " + p2 + "L" + p3 + "A" + r1 + "," + r1 + " 0 " + big + " 0 " + p4 + "Z";
  }
  function mix(hex, w) { // blend with white
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return "rgb(" + Math.round(r + (255 - r) * w) + "," + Math.round(g + (255 - g) * w) + "," + Math.round(b + (255 - b) * w) + ")";
  }
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var svg = s("svg", { viewBox: "-505 -505 1010 1010", role: "img", "aria-label": "GRIP-V taxonomy: 40 sub-benchmarks in seven reasoning families" }, host);
  var gF = s("g", {}, svg), gS = s("g", {}, svg), gL = s("g", { "pointer-events": "none" }, svg);
  var famEls = [], subEls = [];
  var a = 0;
  W.forEach(function (f, fi) {
    var a0 = a, a1 = a + f.subs.length * step;
    var fp = s("path", { d: arc(R1, R2, a0 + 0.35, a1 - 0.35), fill: f.color, class: "wf", tabindex: "0" }, gF);
    fp._f = fi; famEls.push(fp);
    // family label, tangential, flipped on the lower half
    var mid = (a0 + a1) / 2, p = pt((R1 + R2) / 2, mid), rot = mid, flip = mid > 90 && mid < 270;
    if (flip) rot += 180;
    var t = s("text", { transform: "translate(" + p + ") rotate(" + rot + ")", class: "wfl", "text-anchor": "middle" }, gL);
    var amp = f.name.indexOf(" & ");
    var lines = amp >= 0 ? [f.name.slice(0, amp + 2), f.name.slice(amp + 3)] : f.name.split(" ");
    var avail = 2 * Math.PI * ((R1 + R2) / 2) * (a1 - a0) / 360 - 26;
    var longest = Math.max(lines[0].length, lines[1].length);
    var fs = Math.min(26, avail / (longest * 0.6));
    t.style.fontSize = fs.toFixed(1) + "px";
    lines.forEach(function (ln, k) {
      s("tspan", { x: 0, dy: k === 0 ? -0.55 * fs : 1.08 * fs }, t).textContent = ln;
    });
    var ss = Math.min(17, avail / (15 * 0.55));
    s("tspan", { x: 0, dy: 1.05 * fs, class: "wfs", style: "font-size:" + ss.toFixed(1) + "px" }, t).textContent = f.subs.length + " sub-benchmarks";
    f.subs.forEach(function (sb, k) {
      var b0 = a + k * step, b1 = b0 + step;
      var sp = s("path", { d: arc(R3, R4, b0 + 0.25, b1 - 0.25), fill: mix(f.color, 0.45 + 0.4 * k / Math.max(1, f.subs.length - 1)), class: "ws", tabindex: "0" }, gS);
      sp._f = fi; sp._s = sb; subEls.push(sp);
      var m = (b0 + b1) / 2, right = m < 180;
      var q = pt(R3 + 14, m), rr = right ? m - 90 : m + 90;
      var tt = s("text", { transform: "translate(" + q + ") rotate(" + rr + ")", class: "wsl", "text-anchor": right ? "start" : "end", dy: "6" }, gL);
      tt.textContent = sb.label;
      tt.style.fontSize = Math.min(19, (R4 - R3 - 34 - (sb.v ? 18 : 0)) / (sb.label.length * 0.5)).toFixed(1) + "px";
      if (sb.v) { var dp = pt(R4 - 14, m); s("circle", { cx: dp[0], cy: dp[1], r: 6.5, fill: "#b3261e" }, gL); }
    });
    a = a1;
  });

  /* Robot */
  s("circle", { r: R0, fill: "#fff" }, svg);
  s("circle", { r: R0 - 8, fill: "#0b0d12" }, svg);
  var bot = s("g", { "pointer-events": "none" }, svg);
  s("path", { d: "M-78,138 C-78,72 -46,52 0,52 C46,52 78,72 78,138 Z", fill: "#eef0f4" }, bot);
  s("path", { d: "M-40,62 C-24,56 24,56 40,62 L32,92 L-32,92 Z", fill: "#d9dde4" }, bot);
  var lab = s("text", { x: 0, y: 110, "text-anchor": "middle", class: "wbot" }, bot); lab.textContent = "GRIP-V";
  s("rect", { x: -14, y: 30, width: 28, height: 26, rx: 6, fill: "#c9ced7" }, bot);
  var head = s("g", {}, bot);
  s("circle", { cx: -84, cy: -36, r: 24, fill: "#c9ced7" }, head);
  s("circle", { cx: 84, cy: -36, r: 24, fill: "#c9ced7" }, head);
  s("circle", { cx: -84, cy: -36, r: 13, fill: "none", stroke: "#4fa3ff", "stroke-width": 4 }, head);
  s("circle", { cx: 84, cy: -36, r: 13, fill: "none", stroke: "#4fa3ff", "stroke-width": 4 }, head);
  s("rect", { x: -78, y: -102, width: 156, height: 138, rx: 62, fill: "#f4f5f8" }, head);
  s("rect", { x: -64, y: -86, width: 128, height: 100, rx: 46, fill: "#07080c" }, head);
  var eyes = s("g", { class: "weyes" }, head);
  var eyeL = s("path", { d: "M-42,-30 Q-28,-50 -14,-30", fill: "none", stroke: "#5ab8ff", "stroke-width": 9, "stroke-linecap": "round" }, eyes);
  var eyeR = s("path", { d: "M14,-30 Q28,-50 42,-30", fill: "none", stroke: "#5ab8ff", "stroke-width": 9, "stroke-linecap": "round" }, eyes);
  s("ellipse", { cx: -18, cy: -72, rx: 26, ry: 7, fill: "#fff", opacity: 0.12 }, head);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  function tick() {
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
    eyes.setAttribute("transform", "translate(" + cx.toFixed(2) + "," + cy.toFixed(2) + ")");
    head.setAttribute("transform", "translate(" + (cx * 0.25).toFixed(2) + "," + (cy * 0.2).toFixed(2) + ")");
    raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(tick) : null;
  }
  function look(clientX, clientY) {
    var r = svg.getBoundingClientRect();
    var ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    var dx = clientX - ox, dy = clientY - oy, d = Math.hypot(dx, dy) || 1;
    var k = Math.min(1, d / 300);
    tx = dx / d * 16 * k; ty = dy / d * 11 * k;
    if (!raf) raf = requestAnimationFrame(tick);
  }
  if (!reduce) {
    window.addEventListener("pointermove", function (e) { look(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener("touchstart", function (e) { if (e.touches[0]) look(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    // blink now and then
    (function blink() {
      setTimeout(function () {
        eyes.classList.add("blink");
        setTimeout(function () { eyes.classList.remove("blink"); blink(); }, 160);
      }, 2600 + Math.random() * 3200);
    })();
  }

  /* Info panel and highlighting */
  function base() {
    info.innerHTML = '<p class="wk">The GRIP-V taxonomy</p><h3>40 sub-benchmarks, seven families</h3>' +
      "<p>Each sub-benchmark has 2,500 procedurally generated clips and ten questions per clip. " +
      'A <span class="vdot"></span> red dot marks the three sub-benchmarks with injected rule violations.</p>' +
      '<p class="hint">Hover over (or tap) a family or a sub-benchmark.</p>';
  }
  function famHTML(fi) {
    var f = W[fi];
    return '<p class="wk" style="color:' + f.color + '">Family</p><h3>' + esc(f.key) + "</h3><p>" + esc(FAMDESC[f.key]) + "</p>" +
      '<ul class="wlist">' + f.subs.map(function (sb) { return "<li>" + esc(sb.label) + (sb.v ? ' <span class="vdot"></span>' : "") + "</li>"; }).join("") + "</ul>";
  }
  function subHTML(sb, fi) {
    var f = W[fi], h = '<p class="wk" style="color:' + f.color + '">' + esc(f.key) + "</p><h3>" + esc(sb.label) + "</h3><p>" + esc(sb.d) + "</p>";
    if (sb.v) h += '<p class="vtag"><span class="vdot"></span> Some clips contain one injected rule violation</p>';
    h += '<p class="wmeta">2,500 clips &middot; 25,000 questions</p>';
    if (clipIndex.hasOwnProperty(sb.cat)) h += '<button class="btn wtry" data-cat="' + sb.cat + '">Try its clip &rarr;</button>';
    return h;
  }
  function highlight(fi, el) {
    svg.classList.add("dim");
    famEls.forEach(function (p) { p.classList.toggle("on", p._f === fi); });
    subEls.forEach(function (p) { p.classList.toggle("on", el ? p === el : p._f === fi); });
  }
  function clear() { svg.classList.remove("dim"); famEls.concat(subEls).forEach(function (p) { p.classList.remove("on"); }); base(); }
  var pinned = null;
  function show(el) {
    if (el._s) { highlight(el._f, el); info.innerHTML = subHTML(el._s, el._f); }
    else { highlight(el._f, null); info.innerHTML = famHTML(el._f); }
  }
  famEls.concat(subEls).forEach(function (el) {
    el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse" && !pinned) show(el); });
    el.addEventListener("focus", function () { show(el); });
    el.addEventListener("click", function () {
      if (pinned === el) { pinned = null; clear(); return; }
      pinned = el; show(el);
    });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter") el.dispatchEvent(new Event("click")); });
  });
  svg.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && !pinned) clear(); });
  info.addEventListener("click", function (e) {
    var b = e.target.closest(".wtry");
    if (b && window.GRIPV_select) { window.GRIPV_select(clipIndex[b.dataset.cat]); document.getElementById("explore").scrollIntoView(); }
  });
  base();
})();
