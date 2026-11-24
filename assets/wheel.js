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

  /* Robot: the paper's GRIP-V robot (eyes removed from the image), with live eyes on top */
  s("circle", { r: R0, fill: "#fff" }, svg);
  var defs = s("defs", {}, svg);
  var cp = s("clipPath", { id: "hubclip" }, defs); s("circle", { r: R0 - 8 }, cp);
  var glow = s("filter", { id: "eyeglow", x: "-60%", y: "-60%", width: "220%", height: "220%" }, defs);
  s("feGaussianBlur", { stdDeviation: "3.2", result: "b" }, glow);
  var mg = s("feMerge", {}, glow); s("feMergeNode", { in: "b" }, mg); s("feMergeNode", { in: "b" }, mg); s("feMergeNode", { in: "SourceGraphic" }, mg);
  var hub = s("g", { "clip-path": "url(#hubclip)", "pointer-events": "none" }, svg);
  s("rect", { x: -R0, y: -R0, width: 2 * R0, height: 2 * R0, fill: "#000" }, hub);
  s("image", { href: "assets/robot.jpg", x: -(R0 - 8), y: -(R0 - 8), width: 2 * (R0 - 8), height: 2 * (R0 - 8), preserveAspectRatio: "xMidYMid slice" }, hub);
  var eyes = s("g", { class: "weyes" }, hub);
  [["M-47.5,-39.4 Q-35.0,-60.0 -22.2,-42.0"], ["M7.0,-49.6 Q20.4,-72.6 33.9,-51.7"]].forEach(function (d) {
    var e = s("g", {}, eyes);
    s("path", { d: d[0], fill: "none", stroke: "#1f7bff", "stroke-width": 9, "stroke-linecap": "round", filter: "url(#eyeglow)", opacity: 0.95 }, e);
    s("path", { d: d[0], fill: "none", stroke: "#9fdcff", "stroke-width": 5, "stroke-linecap": "round" }, e);
  });

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  function tick() {
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
    eyes.setAttribute("transform", "translate(" + cx.toFixed(2) + "," + cy.toFixed(2) + ")");
    raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(tick) : null;
  }
  function look(clientX, clientY) {
    var r = svg.getBoundingClientRect();
    var ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    var dx = clientX - ox, dy = clientY - oy, d = Math.hypot(dx, dy) || 1;
    var k = Math.min(1, d / 300);
    tx = dx / d * 9 * k; ty = dy / d * 7 * k;
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
