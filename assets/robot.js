(function () {
  "use strict";
  var svg = document.getElementById("robotfig");
  if (!svg) return;
  var eyes = svg.querySelector(".reyes");
  // Eye centre in the image's coordinates (between the two eyes).
  var EX = 620, EY = 290, MAXX = 34, MAXY = 26;
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  function tick() {
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
    eyes.setAttribute("transform", "translate(" + cx.toFixed(2) + "," + cy.toFixed(2) + ")");
    raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(tick) : null;
  }
  function look(x, y) {
    var r = svg.getBoundingClientRect();
    var ox = r.left + r.width * EX / 1296, oy = r.top + r.height * EY / 1213;
    var dx = x - ox, dy = y - oy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
    tx = dx / d * MAXX * k; ty = dy / d * MAXY * k;
    if (!raf) raf = requestAnimationFrame(tick);
  }
  window.addEventListener("pointermove", function (e) { look(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener("touchstart", function (e) { if (e.touches[0]) look(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  (function blink() {
    setTimeout(function () {
      eyes.classList.add("blink");
      setTimeout(function () { eyes.classList.remove("blink"); blink(); }, 160);
    }, 2400 + Math.random() * 3600);
  })();
})();
