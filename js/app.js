/**
 * ReleaseRadar — Home page controller
 */
(function () {
  const state = {
    items: [],
    query: "",
    category: "all",
    sort: "soonest",
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheEls();
    initAmbientParticles();
    bindControls();
    state.items = await ReleaseRadarAPI.getAllItems();
    renderStats();
    renderRadar();
    renderAll();
    setInterval(tickBadges, 30000);
    setInterval(renderRadar, 60000);
  }

  function cacheEls() {
    els.searchHeader = document.getElementById("headerSearch");
    els.searchHero = document.getElementById("heroSearch");
    els.filterChips = document.querySelectorAll("[data-filter]");
    els.sortSelect = document.getElementById("sortSelect");
    els.sections = document.getElementById("sections");
    els.filteredView = document.getElementById("filteredView");
    els.filteredGrid = document.getElementById("filteredGrid");
    els.searchMeta = document.getElementById("searchMeta");
    els.radar = document.getElementById("radar");
    els.statTotal = document.getElementById("statTotal");
    els.statToday = document.getElementById("statToday");
    els.statWeek = document.getElementById("statWeek");
  }

  function bindControls() {
    [els.searchHeader, els.searchHero].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", (e) => {
        state.query = e.target.value.trim().toLowerCase();
        syncSearchInputs(e.target);
        renderAll();
      });
    });

    els.filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        state.category = chip.dataset.filter;
        els.filterChips.forEach((c) => c.classList.toggle("active", c === chip));
        renderAll();
      });
    });

    if (els.sortSelect) {
      els.sortSelect.addEventListener("change", (e) => {
        state.sort = e.target.value;
        renderAll();
      });
    }
  }

  function syncSearchInputs(source) {
    [els.searchHeader, els.searchHero].forEach((input) => {
      if (input && input !== source) input.value = source.value;
    });
  }

  /* ---------------- Rendering orchestration ---------------- */

  function renderAll() {
    const isFiltering = state.query.length > 0 || state.category !== "all";
    els.sections.style.display = isFiltering ? "none" : "";
    els.filteredView.style.display = isFiltering ? "" : "none";
    if (isFiltering) {
      renderFiltered();
    } else {
      renderSections();
    }
  }

  function matchesQuery(item) {
    if (!state.query) return true;
    const hay = (item.title + " " + item.genres.join(" ") + " " + item.studio).toLowerCase();
    return hay.includes(state.query);
  }

  function matchesCategory(item) {
    return state.category === "all" || item.category === state.category;
  }

  function sortItems(list) {
    const copy = [...list];
    switch (state.sort) {
      case "soonest":
        return copy.sort((a, b) => RRTime.sortValue(a.releaseDate) - RRTime.sortValue(b.releaseDate));
      case "latest":
        return copy.sort((a, b) => {
          // TBA (Infinity) titles have no confirmed date, so they don't
          // belong at the "latest" end either — push them to the back
          // for both sort directions instead of pretending they're furthest out.
          const av = RRTime.sortValue(a.releaseDate);
          const bv = RRTime.sortValue(b.releaseDate);
          if (av === Infinity && bv === Infinity) return 0;
          if (av === Infinity) return 1;
          if (bv === Infinity) return -1;
          return bv - av;
        });
      case "anticipated":
        return copy.sort((a, b) => b.hype - a.hype);
      case "az":
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return copy;
    }
  }

  function renderFiltered() {
    let list = state.items.filter((i) => matchesQuery(i) && matchesCategory(i));
    list = sortItems(list);
    els.filteredGrid.innerHTML = "";
    if (list.length === 0) {
      els.searchMeta.innerHTML = `Found <strong>0</strong> titles`;
      els.filteredGrid.innerHTML = emptyState(
        "No signal here",
        "Try a different search term or clear your filters."
      );
      return;
    }
    els.searchMeta.innerHTML = `Found <strong>${list.length}</strong> title${list.length === 1 ? "" : "s"}${
      state.query ? ` for "<strong>${escapeHtml(state.query)}</strong>"` : ""
    }`;
    const frag = document.createDocumentFragment();
    list.forEach((item) => frag.appendChild(buildCard(item)));
    els.filteredGrid.appendChild(frag);
  }

  function emptyState(title, sub) {
    return `<div class="empty-state"><strong>${title}</strong>${sub}</div>`;
  }

  function renderSections() {
    const now = new Date();
    const items = state.items;

    const today = items.filter((i) => RRTime.status(i.releaseDate, i.datePrecision, now) === "today");
    const thisWeek = items.filter((i) => {
      if (i.datePrecision !== "day") return false;
      const d = RRTime.diffParts(new Date(i.releaseDate), now);
      return d.isFuture && d.days <= 7 && RRTime.status(i.releaseDate, i.datePrecision, now) !== "today";
    });
    const thisMonth = items.filter((i) => {
      if (i.datePrecision !== "day") return false;
      const d = RRTime.diffParts(new Date(i.releaseDate), now);
      return d.isFuture && d.days > 7 && d.days <= 30;
    });
    const comingSoon = items
      .filter((i) => {
        const target = i.releaseDate ? new Date(i.releaseDate) : null;
        return RRTime.diffParts(target, now).isFuture;
      })
      .sort((a, b) => RRTime.sortValue(a.releaseDate) - RRTime.sortValue(b.releaseDate));
    const mostAnticipated = items
      .filter((i) => i.anticipated)
      .sort((a, b) => b.hype - a.hype);
    const recentlyReleased = items
      .filter((i) => {
        if (i.datePrecision !== "day") return false;
        const d = RRTime.diffParts(new Date(i.releaseDate), now);
        return !d.isFuture && d.days <= 45;
      })
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

    els.sections.innerHTML = "";
    const blocks = [
      { id: "today", title: "Released Today", sub: "Live now, wherever you play or watch.", data: today, color: "var(--signal-gold)", empty: "Nothing drops today — check back tomorrow." },
      { id: "week", title: "This Week", sub: "Landing in the next seven days.", data: thisWeek, color: "var(--signal-cyan)", empty: "The week ahead is quiet. See what's Coming Soon below." },
      { id: "month", title: "This Month", sub: "On the radar for the next 30 days.", data: thisMonth, color: "var(--signal-violet)" },
      { id: "anticipated", title: "Most Anticipated", sub: "The titles everyone's tracking.", data: mostAnticipated, color: "var(--signal-magenta)" },
      { id: "soon", title: "Coming Soon", sub: "Everything still ahead, soonest first.", data: comingSoon.slice(0, 14), color: "var(--signal-cyan)" },
      { id: "recent", title: "Recently Released", sub: "Out in the last 45 days.", data: recentlyReleased, color: "var(--text-muted)" },
    ];

    blocks.forEach((b) => els.sections.appendChild(buildSection(b)));
  }

  function buildSection(block) {
    const section = document.createElement("section");
    section.className = "section fade-up";
    section.id = "sec-" + block.id;

    const head = document.createElement("div");
    head.className = "section__head";
    head.innerHTML = `
      <div>
        <div class="section__title"><span class="status-dot" style="background:${block.color};box-shadow:0 0 8px 1px ${block.color}"></span>${block.title}</div>
        <div class="section__sub">${block.sub}</div>
      </div>
      <div class="section__count">${block.data.length} title${block.data.length === 1 ? "" : "s"}</div>
    `;
    section.appendChild(head);

    if (block.data.length === 0) {
      const p = document.createElement("div");
      p.className = "empty-state";
      p.innerHTML = `<strong>Nothing here yet</strong>${block.empty || "Check back soon."}`;
      section.appendChild(p);
      return section;
    }

    const railWrap = document.createElement("div");
    railWrap.className = "rail-wrap";
    const rail = document.createElement("div");
    rail.className = "rail";
    block.data.forEach((item) => rail.appendChild(buildCard(item)));
    railWrap.appendChild(rail);

    const leftArrow = document.createElement("button");
    leftArrow.className = "rail-arrow rail-arrow--left";
    leftArrow.setAttribute("aria-label", "Scroll left");
    leftArrow.innerHTML = arrowSvg("left");
    leftArrow.addEventListener("click", () => rail.scrollBy({ left: -440, behavior: "smooth" }));

    const rightArrow = document.createElement("button");
    rightArrow.className = "rail-arrow rail-arrow--right";
    rightArrow.setAttribute("aria-label", "Scroll right");
    rightArrow.innerHTML = arrowSvg("right");
    rightArrow.addEventListener("click", () => rail.scrollBy({ left: 440, behavior: "smooth" }));

    railWrap.appendChild(leftArrow);
    railWrap.appendChild(rightArrow);
    section.appendChild(railWrap);
    return section;
  }

  function arrowSvg(dir) {
    const d = dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="${d}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  /* ---------------- Card ---------------- */

  function buildCard(item) {
    const a = document.createElement("a");
    a.href = `detail.html?id=${encodeURIComponent(item.id)}`;
    a.className = `card card--${item.category}`;
    a.dataset.id = item.id;

    const now = new Date();
    const st = RRTime.status(item.releaseDate, item.datePrecision, now);
    const badgeLabel = RRTime.badgeLabel(item.releaseDate, item.datePrecision, now);

    const platformsHtml = item.platforms
      ? `<div class="card__platforms">${item.platforms
          .slice(0, 3)
          .map((p) => `<span class="plat-tag">${p}</span>`)
          .join("")}</div>`
      : "";

    a.innerHTML = `
      <div class="card__poster">
        ${RRArt.posterArt(item)}
        <div class="card__scrim"></div>
        <span class="card__badge ${st === "today" ? "is-today" : ""}" data-badge data-id="${item.id}">
          <span class="b-dot"></span>${badgeLabel}
        </span>
        <span class="card__category">${RRArt.categoryLabel(item.category)}</span>
        <div class="card__poster-title">${item.title}</div>
      </div>
      <div class="card__body">
        <div class="card__genres">${item.genres.slice(0, 2).join(" / ")}</div>
        <div class="card__date-row">
          <span class="card__date">${RRTime.formatDateShort(item.releaseDate, item.datePrecision)}</span>
        </div>
        ${platformsHtml}
      </div>
    `;
    return a;
  }

  function tickBadges() {
    document.querySelectorAll("[data-badge]").forEach((el) => {
      const item = state.items.find((i) => i.id === el.dataset.id);
      if (!item) return;
      const st = RRTime.status(item.releaseDate, item.datePrecision);
      el.classList.toggle("is-today", st === "today");
      el.innerHTML = `<span class="b-dot"></span>${RRTime.badgeLabel(item.releaseDate, item.datePrecision)}`;
    });
  }

  /* ---------------- Stats ---------------- */

  function renderStats() {
    const now = new Date();
    const upcoming = state.items.filter((i) => {
      const target = i.releaseDate ? new Date(i.releaseDate) : null;
      return RRTime.diffParts(target, now).isFuture;
    });
    const today = state.items.filter((i) => RRTime.status(i.releaseDate, i.datePrecision, now) === "today");
    const week = state.items.filter((i) => {
      if (i.datePrecision !== "day") return false;
      const d = RRTime.diffParts(new Date(i.releaseDate), now);
      return d.isFuture && d.days <= 7;
    });
    if (els.statTotal) els.statTotal.textContent = upcoming.length;
    if (els.statToday) els.statToday.textContent = today.length;
    if (els.statWeek) els.statWeek.textContent = week.length;
  }

  /* ---------------- Radar hero ---------------- */

  function renderRadar() {
    if (!els.radar) return;
    const now = new Date();
    // Only exact-day items get plotted — proximity-to-center only means
    // something when we actually know how many days out a title is.
    const upcoming = state.items
      .filter((i) => {
        if (i.datePrecision !== "day") return false;
        const d = RRTime.diffParts(new Date(i.releaseDate), now);
        return d.isFuture && d.days <= 75;
      })
      .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
      .slice(0, 13);

    els.radar.querySelectorAll(".radar__blip").forEach((b) => b.remove());

    const colorMap = {
      game: "var(--c-game)",
      movie: "var(--c-movie)",
      tv: "var(--c-tv)",
      animation: "var(--c-animation)",
    };

    upcoming.forEach((item, idx) => {
      const days = RRTime.diffParts(new Date(item.releaseDate), now).days;
      const radiusPct = 8 + Math.min(days / 75, 1) * 40; // 8% -> 48%
      const seed = RRArt.hashStr(item.id);
      const angle = (seed % 360) * (Math.PI / 180);
      const jitter = ((seed >> 4) % 10) - 5;
      const x = 50 + (radiusPct + jitter * 0.15) * Math.cos(angle);
      const y = 50 + (radiusPct + jitter * 0.15) * Math.sin(angle);

      const blip = document.createElement("a");
      blip.href = `detail.html?id=${encodeURIComponent(item.id)}`;
      blip.className = "radar__blip";
      blip.style.left = `${x}%`;
      blip.style.top = `${y}%`;
      blip.style.setProperty("--dot-color", colorMap[item.category] || "var(--signal-violet)");
      blip.innerHTML = `
        <span class="ping"></span>
        <span class="core"></span>
        <span class="radar__tooltip">
          <span class="t-title">${item.title}</span><br/>
          <span class="t-meta">${RRTime.badgeLabel(item.releaseDate, item.datePrecision, now)} · ${RRArt.categoryLabel(item.category)}</span>
        </span>
      `;
      els.radar.appendChild(blip);
    });
  }

  /* ---------------- Ambient particle canvas ---------------- */

  function initAmbientParticles() {
    const canvas = document.getElementById("ambientCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = Math.min(window.innerHeight * 1.4, 1400);
    }
    function makeParticles() {
      const count = Math.max(24, Math.min(60, Math.floor((w * h) / 45000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        a: Math.random() * 0.5 + 0.15,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 255, ${p.a})`;
        ctx.fill();
      });
      if (!prefersReduced) requestAnimationFrame(draw);
    }
    resize();
    makeParticles();
    draw();
    window.addEventListener("resize", () => {
      resize();
      makeParticles();
    });
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
})();
