/* Spicy Pete's Tacos – page interactions, menu rendering & the Live Taco-Meter™ */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Small helpers ---------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
  }

  let bubbleTimer;
  function petesSay(msg) {
    const b = $("#speech-bubble");
    if (!b) return;
    b.textContent = msg;
    b.classList.remove("pop");
    void b.offsetWidth; // restart animation
    b.classList.add("pop");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => b.classList.remove("pop"), 4500);
  }
  window.petesSay = petesSay;

  /* ---------- Nav ---------- */
  const navToggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Open / closed status ---------- */
  // [openHour, closeHour] per weekday (0 = Sunday). Close > 24 means after midnight.
  const HOURS = { 0: [11, 21], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 22], 5: [11, 26], 6: [11, 26] };

  function isOpen(now) {
    const day = now.getDay();
    const h = now.getHours() + now.getMinutes() / 60;
    const [o, c] = HOURS[day];
    if (h >= o && h < c) return true;
    const prev = HOURS[(day + 6) % 7]; // late night spill-over from yesterday
    return prev[1] > 24 && h < prev[1] - 24;
  }

  function updateOpenStatus() {
    const pill = $("#open-status");
    if (!pill) return;
    const open = isOpen(new Date());
    pill.classList.toggle("open", open);
    pill.classList.toggle("closed", !open);
    pill.textContent = open
      ? "🟢 Open now – the grill is sizzling"
      : "🔴 Closed – Pete is dreaming of tacos";
  }
  updateOpenStatus();
  setInterval(updateOpenStatus, 60 * 1000);

  /* ---------- Rotating tagline ---------- */
  const TAGLINES = [
    "Now with extra crunch and extra cheer.",
    "Voted #1 taco bar by Pete's mom (twice).",
    "Our salsa brings the sunshine and a little sizzle.",
    "Lettuce be real: you came here for the tacos.",
    "We put the 'spicy' in 'Spicy Pete's'. It was right there.",
    "Guaranteed to pair well with a happy appetite.",
    "Shell yeah.",
  ];
  let tagIdx = 0;
  const tagEl = $("#rotating-tagline");
  if (tagEl) {
    setInterval(() => {
      tagIdx = (tagIdx + 1) % TAGLINES.length;
      tagEl.classList.add("fade");
      setTimeout(() => {
        tagEl.textContent = TAGLINES[tagIdx];
        tagEl.classList.remove("fade");
      }, 350);
    }, 4500);
  }

  /* ---------- Menu ---------- */
  const menu = window.SPICY_MENU || [];
  const tabsEl = $("#menu-tabs");
  const gridEl = $("#menu-grid");

  function renderCategory(cat) {
    gridEl.replaceChildren();
    gridEl.setAttribute("aria-labelledby", "tab-" + cat.id);
    const blurb = el("p", "menu-blurb", cat.blurb);
    gridEl.appendChild(blurb);

    cat.items.forEach((item, i) => {
      const card = el("article", "menu-item");
      card.style.animationDelay = i * 45 + "ms";

      const head = el("div", "menu-item-head");
      const name = el("h3", "menu-item-name", item.name);
      const dots = el("span", "menu-dots");
      const price = el("span", "menu-price", "$" + item.price.toFixed(2));
      head.append(name, dots, price);

      const desc = el("p", "menu-desc", item.desc);

      const tags = el("div", "menu-tags");
      if (item.pick) tags.appendChild(el("span", "tag tag-pick", "⭐ Pete's Pick"));
      if (item.veg) tags.appendChild(el("span", "tag tag-veg", "🌱 Veg"));
      const spice = el("span", "tag tag-spice", item.spice > 0 ? "🌶️".repeat(item.spice) : "😇 No heat");
      spice.title = "Spice level " + item.spice + " of 5";
      tags.appendChild(spice);

      const add = el("button", "btn btn-small btn-add", "Add to Order");
      add.type = "button";
      add.addEventListener("click", () => {
        toast(`🌮 "${item.name}" added! (Just kidding, this is a demo. But we appreciate the enthusiasm.)`);
        if (item.spice >= 5) petesSay("Ghost Pepper? Ask me for a cool glass of milk.");
        else if (item.veg) petesSay("A veggie lover! Respect. I'll save Pete a veggie taco too.");
        else petesSay(`Ooh, ${item.name}! Excellent taste. Almost as good as mine.`);
        bumpStat("tacosServed", 1);
      });

      card.append(head, desc, tags, add);
      gridEl.appendChild(card);
    });
  }

  function selectTab(id, focus) {
    tabsEl.querySelectorAll("[role=tab]").forEach((t) => {
      const active = t.dataset.id === id;
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
      if (active && focus) t.focus();
    });
    const cat = menu.find((c) => c.id === id);
    if (cat) renderCategory(cat);
  }

  if (tabsEl && gridEl && menu.length) {
    menu.forEach((cat) => {
      const tab = el("button", "menu-tab", cat.label);
      tab.type = "button";
      tab.id = "tab-" + cat.id;
      tab.dataset.id = cat.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "menu-grid");
      tab.addEventListener("click", () => selectTab(cat.id));
      tabsEl.appendChild(tab);
    });
    tabsEl.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const tabs = [...tabsEl.querySelectorAll("[role=tab]")];
      const cur = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const next = (cur + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next].dataset.id, true);
      e.preventDefault();
    });
    selectTab(menu[0].id);
  }

  /* ---------- Live Taco-Meter™ ---------- */
  // This is a static template, so stats are simulated from the time of day
  // and then tick up live. Swap `stats` updates for a real API/websocket later.
  function minutesSinceOpen(now) {
    const open = new Date(now);
    open.setHours(11, 0, 0, 0);
    let mins = (now - open) / 60000;
    if (mins < 0) mins += 24 * 60; // after-midnight counts toward "today"
    return Math.max(0, mins);
  }

  const mins = minutesSinceOpen(new Date());
  const stats = {
    tacosServed: Math.round(mins * 2.7) + rand(20, 60),
    hungryHumans: rand(18, 64),
    salsaSmiles: Math.round(mins * 0.35) + rand(3, 12),
    napkinsUsed: Math.round(mins * 9.1) + rand(50, 200),
  };
  const shown = { tacosServed: 0, hungryHumans: 0, salsaSmiles: 0, napkinsUsed: 0 };
  const fmt = new Intl.NumberFormat("en-US");

  function renderStats() {
    let animating = false;
    Object.keys(stats).forEach((key) => {
      const target = stats[key];
      const diff = target - shown[key];
      if (diff !== 0) {
        const step = reduceMotion ? diff : Math.sign(diff) * Math.max(1, Math.ceil(Math.abs(diff) / 12));
        shown[key] += step;
        animating = true;
      }
      const node = document.querySelector(`[data-stat="${key}"]`);
      if (node) node.textContent = fmt.format(shown[key]);
    });
    if (animating) requestAnimationFrame(renderStats);
  }

  function bumpStat(key, amount) {
    stats[key] = Math.max(1, stats[key] + amount);
    const node = document.querySelector(`[data-stat="${key}"]`);
    if (node && amount > 0) {
      const card = node.closest(".stat-card");
      card.classList.remove("bump");
      void card.offsetWidth;
      card.classList.add("bump");
    }
    renderStats();
  }
  window.bumpTacoStat = bumpStat;

  // Kick off the count-up once the section is visible
  const liveSection = $("#live");
  if ("IntersectionObserver" in window && liveSection) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        renderStats();
        io.disconnect();
      }
    });
    io.observe(liveSection);
  } else {
    renderStats();
  }

  setInterval(() => bumpStat("tacosServed", rand(1, 4)), 2200);
  setInterval(() => bumpStat("hungryHumans", rand(-3, 4)), 3100);
  setInterval(() => { if (Math.random() < 0.45) bumpStat("salsaSmiles", 1); }, 4000);
  setInterval(() => bumpStat("napkinsUsed", rand(3, 15)), 1700);

  /* Order feed */
  const NAMES = ["Brenda", "Carlos", "Ty", "Mona", "Big Steve", "Lil' Steve", "Grandma Rosa", "Dmitri",
    "Aisha", "Kevin (again)", "Jo", "Mateo", "A suspicious raccoon", "Priya", "Hank", "The Mayor"];
  const REACTIONS = ["🔥", "😍", "😭", "🤯", "💯", "🥵", "🙏", "👌"];
  const allItems = menu.flatMap((c) => c.items);
  const feed = $("#order-feed");

  function addOrder() {
    if (!feed || !allItems.length) return;
    const item = pick(allItems);
    const qty = rand(1, 5);
    const li = el("li", "feed-item");
    const who = el("strong", "", pick(NAMES));
    const what = el("span", "", ` ordered ${qty}× ${item.name} `);
    const react = el("span", "feed-react", pick(REACTIONS));
    const when = el("time", "feed-time", "just now");
    li.append(who, what, react, when);
    feed.prepend(li);
    while (feed.children.length > 6) feed.lastElementChild.remove();
    // age the timestamps a bit for realism
    [...feed.children].forEach((node, i) => {
      const t = node.querySelector(".feed-time");
      if (t && i > 0) t.textContent = i * rand(6, 14) + "s ago";
    });
  }
  for (let i = 0; i < 4; i++) addOrder();
  setInterval(addOrder, 3800);

  /* Spice meter */
  const SPICE_LEVELS = [
    [20, "Mild. A gentle hello from the jalapeño."],
    [40, "Medium-ish. A cheerful kick of jalapeño."],
    [60, "Hot. Somebody just ordered the Salsa Flight."],
    [80, "Very hot. The kitchen is doing a happy salsa dance."],
    [101, "🔥 GHOST PEPPER MODE. Pete is fanning himself with a tortilla."],
  ];
  let spice = 45;
  function updateSpice() {
    spice = Math.min(100, Math.max(5, spice + rand(-12, 14)));
    const fill = $("#spice-fill");
    const meter = $("#spice-meter");
    const label = $("#spice-label");
    if (fill) fill.style.width = spice + "%";
    if (meter) meter.setAttribute("aria-valuenow", String(spice));
    if (label) label.textContent = SPICE_LEVELS.find(([max]) => spice < max)[1];
  }
  updateSpice();
  setInterval(updateSpice, 3500);

  /* ---------- Taco rain ---------- */
  const rain = $("#taco-rain");
  const RAIN_EMOJI = ["🌮", "🌮", "🌮", "🌶️", "🥑", "🌯", "🧀"];
  function makeItRain() {
    if (!rain) return;
    if (reduceMotion) {
      toast("🌮 Imagine 40 tacos falling gracefully. Beautiful, right?");
      return;
    }
    for (let i = 0; i < 40; i++) {
      const t = el("span", "rain-drop", pick(RAIN_EMOJI));
      t.style.left = Math.random() * 100 + "vw";
      t.style.fontSize = rand(22, 48) + "px";
      t.style.animationDuration = 2 + Math.random() * 2.5 + "s";
      t.style.animationDelay = Math.random() * 0.8 + "s";
      t.addEventListener("animationend", () => t.remove());
      rain.appendChild(t);
    }
    bumpStat("tacosServed", 40);
    petesSay("IT'S RAINING TACOS! 🎶 Hallelujah!");
  }
  const rainBtn = $("#taco-rain-btn");
  if (rainBtn) rainBtn.addEventListener("click", makeItRain);

  // Konami-ish easter egg: type "taco" anywhere
  let typed = "";
  document.addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("input, textarea")) return;
    typed = (typed + (e.key || "")).slice(-4).toLowerCase();
    if (typed === "taco") makeItRain();
  });
})();
