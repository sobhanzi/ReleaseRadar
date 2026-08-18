/**
 * ReleaseRadar — Procedural poster/backdrop art
 * No external image dependency: every item gets a deterministic
 * gradient + icon treatment derived from its category and id,
 * so the UI stays fast, offline-friendly, and consistent.
 */
const RRArt = (() => {
  const ICONS = {
    game: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 7h10a5 5 0 0 1 5 5v3.5a2.5 2.5 0 0 1-4.5 1.5L16 15H8l-1.5 2A2.5 2.5 0 0 1 2 15.5V12a5 5 0 0 1 5-5Z" stroke="white" stroke-width="1.4"/><path d="M7.5 10.5v3M6 12h3" stroke="white" stroke-width="1.4" stroke-linecap="round"/><circle cx="16.2" cy="10.8" r="0.9" fill="white"/><circle cx="18.2" cy="12.8" r="0.9" fill="white"/></svg>`,
    movie: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9.5 5 5h14l2 4.5" stroke="white" stroke-width="1.4" stroke-linejoin="round"/><rect x="3" y="9.5" width="18" height="10" rx="1.5" stroke="white" stroke-width="1.4"/><path d="M7 5 8.6 9.5M12 5l1.6 4.5M17 5l1.6 4.5" stroke="white" stroke-width="1.2"/></svg>`,
    tv: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="1.6" stroke="white" stroke-width="1.4"/><path d="M8 21h8M12 18v3" stroke="white" stroke-width="1.4" stroke-linecap="round"/><path d="M8 3 5 6M16 3l3 3" stroke="white" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    animation: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l1.6 4.5L18 9l-4.4 1.5L12 15l-1.6-4.5L6 9l4.4-1.5L12 3Z" stroke="white" stroke-width="1.3" stroke-linejoin="round"/><circle cx="18.5" cy="17" r="1.6" stroke="white" stroke-width="1.3"/><circle cx="6" cy="17.5" r="1.1" stroke="white" stroke-width="1.3"/></svg>`,
  };

  const CATEGORY_LABEL = {
    game: "Game",
    movie: "Movie",
    tv: "TV Series",
    animation: "Animation",
  };

  function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  const HUES = {
    game: [252, 268],
    movie: [186, 200],
    tv: [12, 26],
    animation: [326, 340],
  };

  function gradientFor(item) {
    const [h1base, h2base] = HUES[item.category] || [252, 268];
    const seed = hashStr(item.id);
    const h1 = h1base + (seed % 10);
    const h2 = h2base + ((seed >> 3) % 10);
    const angle = 120 + (seed % 90);
    return `linear-gradient(${angle}deg, hsl(${h1} 70% 14%) 0%, hsl(${h2} 65% 22%) 45%, hsl(${(h1 + 40) % 360} 55% 10%) 100%)`;
  }

  function icon(category) {
    return ICONS[category] || ICONS.movie;
  }

  function categoryLabel(category) {
    return CATEGORY_LABEL[category] || category;
  }

  /** Poster art element (2:3) used in cards & detail sidebar */
  function posterArt(item) {
    return `
      <div class="card__poster-art" style="background:${gradientFor(item)}"></div>
      <div class="card__poster-icon">${icon(item.category)}</div>
    `;
  }

  /** Wide backdrop treatment for detail header / trailer frame */
  function backdropStyle(item) {
    const seed = hashStr(item.id + "-bd");
    const [h1base] = HUES[item.category] || [252, 268];
    const h1 = h1base + (seed % 14);
    return `background:
      radial-gradient(ellipse 65% 85% at 22% 32%, hsl(${h1} 75% 32% / 1), transparent 62%),
      radial-gradient(ellipse 55% 75% at 82% 68%, hsl(${(h1 + 60) % 360} 70% 26% / 0.95), transparent 62%),
      linear-gradient(160deg, hsl(${h1} 55% 14%), #05060b 78%);`;
  }

  return { gradientFor, icon, categoryLabel, backdropStyle, hashStr, posterArt };
})();
