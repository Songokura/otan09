/* Автошкола Отан 09. Ванильный JS: плиты и «поворотник», меню, якоря, лента отзывов, форма. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, W = window;
  root.classList.add("js");
  var REDUCED = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var smooth = function (x) { x = clamp(x); return x * x * (3 - 2 * x); };
  /* ход указателя: быстрый разгон, мягкое доведение до края */
  var sweep = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 2.2); };
  var TOUCH = W.matchMedia("(pointer:coarse)").matches;
  var VW = W.innerWidth, VH = W.innerHeight;

  /* ---------- WhatsApp: текст собирается в момент клика (фаза захвата на window, совместимо с LeadBot) ---------- */
  var WA_NUM = "77770606952";
  var SITE = "Пишу с сайта автошколы Отан 09.";
  var WA = {
    "default": "Здравствуйте! " + SITE + " Хочу записаться на обучение категории B.",
    hero: "Здравствуйте! " + SITE + " Хочу записаться на обучение категории B. Город: ",
    menu: "Здравствуйте! " + SITE + " Хочу записаться на обучение. Город: ",
    standart: "Здравствуйте! " + SITE + " Хочу записаться на тариф «Стандарт» (69 990 тг). Город: ",
    vse: "Здравствуйте! " + SITE + " Хочу записаться на тариф «Всё включено» (109 990 тг). Город: ",
    drugie: "Здравствуйте! " + SITE + " Интересует обучение на другую категорию: ",
    praktika: "Здравствуйте! " + SITE + " Хочу узнать расписание занятий. Город: ",
    akciya: "Здравствуйте! " + SITE + " Хотим записаться вдвоём по акции «Приведи друга». Город: ",
    "akc-abai": "Здравствуйте! " + SITE + " Хочу записаться на обучение по акции в Абае (39 990 тг).",
    "akc-saran": "Здравствуйте! " + SITE + " Хочу записаться на обучение по акции в Сарани (49 990 тг).",
    "akc-prishakhtinsk": "Здравствуйте! " + SITE + " Хочу записаться на обучение по акции в Пришахтинске (49 990 тг).",
    "akc-mojka": "Здравствуйте! " + SITE + " Записываемся с другом по акции «Приведи друга», выбираю подарок: мойка. Город: ",
    "akc-benzin": "Здравствуйте! " + SITE + " Записываемся с другом по акции «Приведи друга», выбираю подарок: бензин. Город: ",
    "akc-skidka": "Здравствуйте! " + SITE + " Записываемся с другом по акции «Приведи друга», выбираю скидку 10 000 тг. Город: ",
    instruktor: "Здравствуйте! " + SITE + " Хочу подобрать инструктора под свой график. Город: ",
    kontakty: "Здравствуйте! " + SITE + " Хочу записаться на обучение. Город: ",
    sticky: "Здравствуйте! " + SITE + " Хочу записаться на обучение категории B. Город: ",
    "city-saran": "Здравствуйте! " + SITE + " Интересует ближайшая группа в филиале Сарань.",
    "city-abai": "Здравствуйте! " + SITE + " Интересует ближайшая группа в филиале Абай.",
    "city-shakhtinsk": "Здравствуйте! " + SITE + " Интересует ближайшая группа в филиале Шахтинск.",
    "city-prishakhtinsk": "Здравствуйте! " + SITE + " Интересует ближайшая группа в филиале Пришахтинск.",
    "city-sortirovka": "Здравствуйте! " + SITE + " Интересует ближайшая группа в филиале Сортировка."
  };
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var text = WA[key] || WA["default"];
    a.setAttribute("href", "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(text));
  }, true);

  /* ---------- Конверсии Google Ads и Meta Pixel: звонок, WhatsApp/почта, отправка формы ---------- */
  var FB_EVENT = { phone: "Contact", contact: "Contact", lead: "Lead" };
  function conv(key) {
    if (typeof W.fbq === "function") W.fbq("track", FB_EVENT[key]);
    var id = (W.OTAN_CONV || {})[key];
    if (!id || typeof W.gtag !== "function") return;
    W.gtag("event", "conversion", { send_to: id, value: 1.0, currency: "USD", transport_type: "beacon" });
  }
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) conv("phone");
    else if (h.indexOf("wa.me") > -1 || h.indexOf("mailto:") === 0 || h.indexOf("t.me/") > -1) conv("contact");
  }, true);

  /* ---------- fitText для строк заголовка героя ---------- */
  var h1 = doc.getElementById("h1");
  function fitLine(sel, prop) {
    var l = h1.querySelector(sel), avail = h1.clientWidth;
    if (!l || !avail) return;
    h1.style.removeProperty(prop);
    var fs = parseFloat(getComputedStyle(l).fontSize), guard = 0;
    while (guard++ < 30 && l.scrollWidth > avail + 1 && fs > 22) { fs *= 0.95; h1.style.setProperty(prop, fs + "px"); }
  }
  function fitText() { if (!h1) return; fitLine(".l1", "--fs"); fitLine(".l2", "--fs2"); }

  /* ---------- Меню ---------- */
  var burger = doc.querySelector(".burger"), menu = doc.getElementById("menu");
  var behind = [doc.getElementById("main"), doc.querySelector(".foot"), doc.getElementById("sticky")];
  function setMenu(open, returnFocus) {
    if (!menu || !burger) return;
    var was = doc.body.classList.contains("menu-open");
    if (open === was) return;
    doc.body.classList.toggle("menu-open", open);
    behind.forEach(function (el) { if (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("open"); });
      setTimeout(function () { var first = menu.querySelector("a"); if (first) first.focus({ preventScroll: true }); }, 60);
    } else {
      menu.classList.remove("open");
      setTimeout(function () { if (!doc.body.classList.contains("menu-open")) menu.hidden = true; }, 320);
      if (returnFocus) burger.focus({ preventScroll: true });
    }
  }
  if (burger) burger.addEventListener("click", function () { var o = doc.body.classList.contains("menu-open"); setMenu(!o, o); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("menu-open")) setMenu(false, true); });

  /* ---------- Якоря ---------- */
  var HDR = function () { return parseFloat(getComputedStyle(root).getPropertyValue("--hdr")) || 70; };
  function targetTop(el) {
    var r = el.getBoundingClientRect().top + W.pageYOffset;
    if (el.classList.contains("pw")) return r;
    if (el.classList.contains("sec")) return r - HDR();
    return r - HDR() - 14;
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    setMenu(false);
    var top = Math.max(0, targetTop(el));
    if (instant || REDUCED) { root.style.scrollBehavior = "auto"; W.scrollTo(0, top); root.style.scrollBehavior = ""; }
    else W.scrollTo({ top: top, behavior: "smooth" });
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (goTo(id)) {
      e.preventDefault();
      try { history.pushState(null, "", "#" + id); } catch (err) {}
      var t = doc.getElementById(id);
      if (t) { if (!t.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) t.setAttribute("tabindex", "-1"); try { t.focus({ preventScroll: true }); } catch (err2) {} }
    }
  });

  /* ---------- Плиты ---------- */
  var pws = [].slice.call(doc.querySelectorAll(".pw"));
  var sticky = doc.getElementById("sticky"), kont = doc.getElementById("kontakty");
  var hdr = doc.getElementById("hdr");
  var INTRO = (location.hash.length > 1 || W.pageYOffset > 80 || REDUCED) ? 1 : 0;
  var introStart = 0, ticking = false;

  /* чтение размеров пакетом, потом запись; open догоняет цель плавно (lerp), чтобы фронт не дёргался при скролле пальцем */
  var st = pws.map(function (pw) { return { open: -1, out: {}, sig: pw.querySelector(".sig") }; });
  var lastTs = 0;
  function put(pw, s, k, v) { if (s.out[k] !== v) { s.out[k] = v; pw.style.setProperty(k, v); } }
  function update(ts) {
    ticking = false;
    var now = typeof ts === "number" ? ts : performance.now();
    var dt = lastTs ? Math.min(64, now - lastTs) : 16.7; lastTs = now;
    var k = 1 - Math.pow(1 - 0.22, dt / 16.7);
    var H = VH;
    var pageY = W.pageYOffset;
    var kontTop = kont ? kont.getBoundingClientRect().top : null;
    var rects = [], nxtTops = [], i;
    for (i = 0; i < pws.length; i++) {
      rects.push(pws[i].getBoundingClientRect());
      var nx = pws[i].nextElementSibling;
      nxtTops.push(nx ? nx.getBoundingClientRect().top : null);
    }
    var moving = false;
    for (i = 0; i < pws.length; i++) {
      var pw = pws[i], r = rects[i], s = st[i];
      var enter = clamp(1 - r.top / H);
      var stay = r.height > H ? clamp(-r.top / (r.height - H)) : 0;
      var exit = nxtTops[i] !== null ? clamp(1 - nxtTops[i] / H) : 0;
      var isHero = pw.classList.contains("pw-hero");
      var open;
      if (isHero) open = REDUCED ? 1 : sweep(INTRO);
      else open = REDUCED ? 1 : sweep(smooth((enter - 0.22) / 0.62));
      var near = r.bottom > -H * 0.5 && r.top < H * 1.5;
      if (s.open < 0 || REDUCED || !near || isHero) { s.open = open; }
      else {
        s.open += (open - s.open) * k;
        if (Math.abs(open - s.open) > 0.002) moving = true; else s.open = open;
      }
      pw.classList.toggle("near", near);
      put(pw, s, "--enter", enter.toFixed(4));
      put(pw, s, "--stay", stay.toFixed(4));
      put(pw, s, "--exit", exit.toFixed(4));
      put(pw, s, "--open", s.open.toFixed(4));
      if (isHero) put(pw, s, "--intro", s.open.toFixed(4));
      /* фронт дошёл до края: кадр чистый, сегменты сняты */
      if (s.sig) s.sig.classList.toggle("done", s.open >= 0.999);
      var plate = pw.firstElementChild;
      if (plate) plate.classList.toggle("gone", exit >= 1);
      if (!s.txts) s.txts = pw.querySelectorAll(".txt");
      var on = isHero ? INTRO > 0.3 : enter > 0.66;
      if (s.on !== on) { s.on = on; for (var t = 0; t < s.txts.length; t++) s.txts[t].classList.toggle("on", on); }
    }
    if (sticky) {
      var show = pageY > H * 0.55;
      if (kontTop !== null && kontTop < H * 0.5) show = false;
      sticky.classList.toggle("show", show);
    }
    if (hdr) hdr.classList.toggle("scrolled", pageY > 12);
    if (moving) onScroll();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", function () {
    /* на телефоне смена только высоты - это адресная строка: раскладку не пересчитываем */
    if (W.innerWidth !== VW) { VW = W.innerWidth; VH = W.innerHeight; fitText(); updateRails(); }
    else if (!TOUCH) VH = W.innerHeight;
    onScroll();
  });
  function runIntro(ts) {
    if (!introStart) introStart = ts;
    INTRO = clamp((ts - introStart) / 1250);
    update(ts);
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }

  /* ---------- Ленты со стрелками ---------- */
  var rails = [].slice.call(doc.querySelectorAll(".rail"));
  function railStep(rail) {
    var card = rail.firstElementChild; if (!card) return 300;
    var cs = getComputedStyle(rail);
    var gap = parseFloat(cs.columnGap || cs.gap) || 16;
    return card.getBoundingClientRect().width + gap;
  }
  function updateRail(rail) {
    var btns = doc.querySelectorAll('.arr[data-for="' + rail.id + '"]');
    var max = rail.scrollWidth - rail.clientWidth;
    var none = max <= 1;
    [].forEach.call(btns, function (b) {
      b.hidden = none;
      var dir = +b.getAttribute("data-dir");
      b.disabled = dir < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= max - 2;
    });
  }
  function updateRails() { rails.forEach(updateRail); }
  rails.forEach(function (rail) {
    rail.addEventListener("scroll", function () { updateRail(rail); }, { passive: true });
    rail.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); rail.scrollBy({ left: railStep(rail), behavior: REDUCED ? "auto" : "smooth" }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); rail.scrollBy({ left: -railStep(rail), behavior: REDUCED ? "auto" : "smooth" }); }
    });
  });
  [].forEach.call(doc.querySelectorAll(".arr[data-for]"), function (b) {
    b.addEventListener("click", function () {
      var rail = doc.getElementById(b.getAttribute("data-for")); if (!rail) return;
      rail.scrollBy({ left: railStep(rail) * (+b.getAttribute("data-dir")), behavior: REDUCED ? "auto" : "smooth" });
    });
  });

  /* ---------- Проявление секций ---------- */
  var rv = [].slice.call(doc.querySelectorAll(".rv"));
  if ("IntersectionObserver" in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < W.innerHeight) el.classList.add("in"); }); }, 1500);
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Салют в разделе акций: запускается при входе в раздел, повторяется после ухода из него ---------- */
  var akc = doc.getElementById("akciya"), cv = akc ? akc.querySelector(".salut") : null;
  if (cv && cv.getContext && !REDUCED && "IntersectionObserver" in W) {
    var cx = cv.getContext("2d"), parts = [], rockets = [], running = false, armed = true, cw = 0, ch = 0, dpr = 1, lastF = 0;
    var COLS = ["#E8CB7A", "#F5E3A8", "#C9A24D", "#FFFFFF", "#E3262E", "#FF5A4E"];
    /* холст ростом в экран, ставится на видимую часть раздела */
    var size = function () {
      dpr = Math.min(2, W.devicePixelRatio || 1);
      var top = Math.max(0, -akc.getBoundingClientRect().top);
      cv.style.transform = "translateY(" + Math.round(top) + "px)";
      cw = cv.clientWidth; ch = cv.clientHeight;
      cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var burst = function (x, y) {
      var n = cw < 700 ? 56 : 96, col = COLS[(Math.random() * COLS.length) | 0], col2 = COLS[(Math.random() * COLS.length) | 0];
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2 + Math.random() * 0.2, sp = (cw < 700 ? 2.9 : 4) * (0.5 + Math.random() * 0.65);
        parts.push({ x: x, y: y, px: x, py: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.011 + Math.random() * 0.01, c: i % 3 ? col : col2 });
      }
    };
    var launch = function (delay) {
      setTimeout(function () {
        var tx = cw * (0.12 + Math.random() * 0.76), ty = ch * (0.16 + Math.random() * 0.3);
        rockets.push({ x: tx + (Math.random() - 0.5) * 60, y: ch, tx: tx, ty: ty, t: 0 });
        if (!running) { running = true; lastF = 0; requestAnimationFrame(frame); }
      }, delay);
    };
    var frame = function (ts) {
      var dt = lastF ? Math.min(2.5, (ts - lastF) / 16.7) : 1; lastF = ts;
      cx.clearRect(0, 0, cw, ch);
      cx.lineCap = "round";
      for (var r = rockets.length - 1; r >= 0; r--) {
        var k = rockets[r]; k.t += 0.045 * dt;
        var e = 1 - Math.pow(1 - Math.min(1, k.t), 3), x = k.x + (k.tx - k.x) * e, y = k.y + (k.ty - k.y) * e;
        cx.strokeStyle = "rgba(245,227,168,.9)"; cx.lineWidth = 2;
        cx.beginPath(); cx.moveTo(x, y + 14); cx.lineTo(x, y); cx.stroke();
        if (k.t >= 1) { burst(k.tx, k.ty); rockets.splice(r, 1); }
      }
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.px = p.x; p.py = p.y;
        p.vx *= Math.pow(0.975, dt); p.vy = p.vy * Math.pow(0.975, dt) + 0.045 * dt;
        p.x += p.vx * dt * 1.6; p.y += p.vy * dt * 1.6;
        p.life -= p.decay * dt;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        cx.globalAlpha = Math.min(1, p.life * 1.4);
        cx.strokeStyle = p.c; cx.lineWidth = 3 * p.life + 0.8;
        cx.beginPath(); cx.moveTo(p.px - p.vx * 2.2, p.py - p.vy * 2.2); cx.lineTo(p.x, p.y); cx.stroke();
      }
      cx.globalAlpha = 1;
      if (parts.length || rockets.length) requestAnimationFrame(frame);
      else { running = false; cx.clearRect(0, 0, cw, ch); }
    };
    var show = function () {
      size();
      var n = cw < 700 ? 5 : 8;
      for (var i = 0; i < n; i++) launch(i * 330 + Math.random() * 160);
    };
    new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (x.isIntersecting && armed) { armed = false; show(); }
        if (!x.isIntersecting) armed = true;
      });
    }, { rootMargin: "0px 0px -45% 0px", threshold: 0 }).observe(akc);
  }

  /* ---------- Форма -> WhatsApp ---------- */
  var form = doc.getElementById("form"), thanks = doc.getElementById("thanks"), ferr = doc.getElementById("ferr");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      if (f.website && f.website.value) { form.hidden = true; if (thanks) thanks.hidden = false; return; }
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      var badName = !name, badPhone = phone.replace(/\D/g, "").length < 10;
      f.name.classList.toggle("bad", badName); f.phone.classList.toggle("bad", badPhone);
      f.name.setAttribute("aria-invalid", badName ? "true" : "false"); f.phone.setAttribute("aria-invalid", badPhone ? "true" : "false");
      if (badName || badPhone) { if (ferr) ferr.hidden = false; (badName ? f.name : f.phone).focus(); return; }
      if (ferr) ferr.hidden = true;
      var lines = ["Заявка с сайта автошколы Отан 09", "Имя: " + name, "Телефон: " + phone, "Город: " + f.city.value, "Тариф: " + f.tarif.value];
      if (f.message.value.trim()) lines.push("Сообщение: " + f.message.value.trim());
      var url = "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(lines.join("\n"));
      conv("lead");
      W.open(url, "_blank", "noopener");
      if (thanks) { thanks.hidden = false; try { thanks.focus({ preventScroll: true }); } catch (err) {} }
      form.reset();
    });
  }

  var year = doc.getElementById("year"); if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Старт ---------- */
  function start() {
    fitText();
    if (location.hash.length > 1) {
      var id = location.hash.slice(1);
      goTo(id, true);
      setTimeout(function () { goTo(id, true); update(); }, 60);
      setTimeout(function () { goTo(id, true); update(); }, 500);
    }
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
    updateRails();
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitText(); update(); });
  if (doc.readyState === "complete") start(); else W.addEventListener("load", start);
  update();
})();
