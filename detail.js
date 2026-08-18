/**
 * ReleaseRadar — Detail page controller
 */
(function () {
  const CATEGORY_COLOR = {
    game: "var(--c-game)",
    movie: "var(--c-movie)",
    tv: "var(--c-tv)",
    animation: "var(--c-animation)",
  };

  document.addEventListener("DOMContentLoaded", init);
  let currentItem = null;
  let countdownTimer = null;

  async function init() {
    initAmbientParticles();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const item = id ? await ReleaseRadarAPI.getItemById(id) : null;

    if (!item) {
      renderNotFound();
      return;
    }
    currentItem = item;
    document.title = `${item.title} — ReleaseRadar`;
    document.documentElement.style.setProperty("--accent", CATEGORY_COLOR[item.category]);
    render(item);
    startCountdown(item);
    loadRelated(item);
    bindTrailer(item);
  }

  function renderNotFound() {
    const root = document.getElementById("detailRoot");
    root.innerHTML = `
      <div class="page">
        <a href="index.html" class="back-link">&larr; Back to ReleaseRadar</a>
        <div class="empty-state" style="margin-top:40px;">
          <strong>Signal lost</strong>
          This title doesn't exist in our database. It may have been delisted or the link is incorrect.
        </div>
      </div>
    `;
  }

  function render(item) {
    document.getElementById("backdrop").style.cssText += RRArt.backdropStyle(item);
    document.getElementById("posterArt").innerHTML = RRArt.posterArt(item);

    document.getElementById("categoryBadge").innerHTML = `
      <span class="b-dot"></span>${RRArt.categoryLabel(item.category)}
    `;
    document.getElementById("detailTitle").textContent = item.title;
    document.getElementById("detailTagline").textContent = item.description;
    document.getElementById("studioVal").textContent = item.studio;
    document.getElementById("dateVal").textContent = RRTime.formatDate(item.releaseDate);
    document.getElementById("genresVal").textContent = item.genres.join(", ");

    const ratingItem = document.getElementById("ratingItem");
    if (item.rating) {
      ratingItem.style.display = "";
      document.getElementById("ratingVal").textContent = `${item.rating.toFixed(1)} / 10`;
    } else {
      ratingItem.style.display = "none";
    }

    document.getElementById("synopsisText").textContent = item.synopsis;

    const genrePills = document.getElementById("genrePills");
    genrePills.innerHTML = item.genres.map((g) => `<span class="chip">${g}</span>`).join("");

    const platformSection = document.getElementById("platformSection");
    if (item.platforms && item.platforms.length) {
      platformSection.style.display = "";
      document.getElementById("platformList").innerHTML = item.platforms
        .map((p) => `<span class="platform-pill">${platformIcon()}${p}</span>`)
        .join("");
    } else {
      platformSection.style.display = "none";
    }

    document.getElementById("trailerFrame").style.cssText += RRArt.backdropStyle(item);
  }

  function platformIcon() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="1.5" stroke="white" stroke-width="1.4"/><path d="M8 20h8" stroke="white" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  }

  function startCountdown(item) {
    const panel = document.getElementById("countdownPanel");
    function tick() {
      const now = new Date();
      const target = new Date(item.releaseDate);
      const st = RRTime.status(item.releaseDate, now);
      const label = document.getElementById("countdownLabel");

      if (st === "today") {
        panel.classList.add("released");
        label.textContent = "Released Today";
        setUnits(0, 0, 0, 0);
      } else if (st === "released") {
        panel.classList.add("released");
        const { days, hours } = RRTime.diffParts(target, now);
        label.textContent = "Released";
        document.getElementById("countdownUnits").innerHTML = `
          <div class="cu"><div class="n mono">${days}</div><div class="u">days ago</div></div>
        `;
        return; // no need to keep ticking every second for past items
      } else {
        panel.classList.remove("released");
        label.textContent = "Countdown to release";
        const { days, hours, minutes, seconds } = RRTime.diffParts(target, now);
        setUnits(days, hours, minutes, seconds);
      }
    }
    function setUnits(d, h, m, s) {
      document.getElementById("countdownUnits").innerHTML = `
        <div class="cu"><div class="n mono">${pad(d)}</div><div class="u">days</div></div>
        <div class="cu"><div class="n mono">${pad(h)}</div><div class="u">hrs</div></div>
        <div class="cu"><div class="n mono">${pad(m)}</div><div class="u">min</div></div>
        <div class="cu"><div class="n mono">${pad(s)}</div><div class="u">sec</div></div>
      `;
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function bindTrailer(item) {
    const frame = document.getElementById("trailerFrame");
    const viz = document.getElementById("trailerViz");
    viz.innerHTML = Array.from({ length: 20 })
      .map((_, i) => `<span style="animation-delay:${(i * 0.07).toFixed(2)}s"></span>`)
      .join("");
    frame.addEventListener("click", () => {
      frame.classList.toggle("is-playing");
      document.getElementById("trailerLabel").textContent = frame.classList.contains("is-playing")
        ? `Now playing — ${item.title} (Official Trailer)`
        : "Watch Trailer";
    });
  }

  async function loadRelated(item) {
    const related = await ReleaseRadarAPI.getRelatedItems(item, 4);
    const grid = document.getElementById("relatedGrid");
    const section = document.getElementById("relatedSection");
    if (!related.length) {
      section.style.display = "none";
      return;
    }
    grid.innerHTML = "";
    related.forEach((r) => grid.appendChild(buildMiniCard(r)));
  }

  function buildMiniCard(item) {
    const a = document.createElement("a");
    a.href = `detail.html?id=${encodeURIComponent(item.id)}`;
    a.className = `card card--${item.category}`;
    const badgeLabel = RRTime.badgeLabel(item.releaseDate);
    const st = RRTime.status(item.releaseDate);
    a.innerHTML = `
      <div class="card__poster">
        ${RRArt.posterArt(item)}
        <div class="card__scrim"></div>
        <span class="card__badge ${st === "today" ? "is-today" : ""}"><span class="b-dot"></span>${badgeLabel}</span>
        <span class="card__category">${RRArt.categoryLabel(item.category)}</span>
        <div class="card__poster-title">${item.title}</div>
      </div>
      <div class="card__body">
        <div class="card__genres">${item.genres.slice(0, 2).join(" / ")}</div>
        <div class="card__date-row"><span class="card__date">${RRTime.formatDateShort(item.releaseDate)}</span></div>
      </div>
    `;
    return a;
  }

  function initAmbientParticles() {
    const canvas = document.getElementById("ambientCanvas2");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = Math.min(window.innerHeight * 1.4, 1400);
    }
    function make() {
      const count = Math.max(20, Math.min(50, Math.floor((w * h) / 50000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.4,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        a: Math.random() * 0.5 + 0.15,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 255, ${p.a})`;
        ctx.fill();
      });
      if (!prefersReduced) requestAnimationFrame(draw);
    }
    resize(); make(); draw();
    window.addEventListener("resize", () => { resize(); make(); });
  }
})();
