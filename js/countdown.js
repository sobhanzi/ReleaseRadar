/**
 * ReleaseRadar — Countdown & date utilities
 *
 * Not every real-world title has a confirmed exact release day.
 * Every date-aware function here takes a `precision` argument:
 *   'day'   — exact date known; full countdown & Today/Released badges apply
 *   'month' — only "Month YYYY" is known; releaseDate is stored as the
 *             1st of that month purely so it still sorts correctly —
 *             it is never shown or counted down to the day/hour
 *   'year'  — only the year is known; releaseDate is a mid-year
 *             placeholder, sorting-only, same rule as above
 *   'tba'   — nothing announced yet; releaseDate is null
 *
 * This keeps the UI honest: we never fabricate a fake day/hour
 * countdown for a title that hasn't actually had one announced.
 */
const RRTime = (() => {
  const DAY_MS = 86400000;

  function diffParts(targetDate, now = new Date()) {
    if (!targetDate) return { diff: Infinity, days: Infinity, hours: 0, minutes: 0, seconds: 0, isFuture: true };
    const diff = targetDate.getTime() - now.getTime();
    const abs = Math.abs(diff);
    const days = Math.floor(abs / DAY_MS);
    const hours = Math.floor((abs % DAY_MS) / 3600000);
    const minutes = Math.floor((abs % 3600000) / 60000);
    const seconds = Math.floor((abs % 60000) / 1000);
    return { diff, days, hours, minutes, seconds, isFuture: diff > 0 };
  }

  function isSameCalendarDay(a, b) {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  /** Sortable timestamp — TBA titles sort to the very end. */
  function sortValue(releaseDate) {
    return releaseDate ? new Date(releaseDate).getTime() : Infinity;
  }

  /** Short badge text: "Today", "In 3d", "Est. 2027", "TBA" */
  function badgeLabel(releaseDate, precision = "day", now = new Date()) {
    if (precision === "tba" || !releaseDate) return "TBA";
    const target = new Date(releaseDate);
    if (precision === "year") return `Est. ${target.getFullYear()}`;
    if (precision === "month") {
      return `Est. ${target.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
    }
    if (isSameCalendarDay(target, now)) return "Today";
    const { days, hours, isFuture } = diffParts(target, now);
    if (isFuture) {
      if (days === 0) return `In ${hours}h`;
      if (days === 1) return "Tomorrow";
      if (days < 30) return `In ${days}d`;
      const months = Math.round(days / 30);
      return months <= 1 ? "In 1mo" : `In ${months}mo`;
    } else {
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 30) return `${days}d ago`;
      const months = Math.round(days / 30);
      return months <= 1 ? "1mo ago" : `${months}mo ago`;
    }
  }

  /** Longer sentence for detail/hero use */
  function longLabel(releaseDate, precision = "day", now = new Date()) {
    if (precision === "tba" || !releaseDate) return "Release date to be announced";
    const target = new Date(releaseDate);
    if (precision === "year") return `Expected in ${target.getFullYear()}`;
    if (precision === "month") {
      return `Expected ${target.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;
    }
    if (isSameCalendarDay(target, now)) return "Released Today";
    const { days, isFuture } = diffParts(target, now);
    if (isFuture) {
      if (days === 1) return "Releases Tomorrow";
      return `Releases in ${days} day${days === 1 ? "" : "s"}`;
    }
    if (days === 1) return "Released Yesterday";
    return `Released ${days} day${days === 1 ? "" : "s"} ago`;
  }

  /** Full display date, respecting precision: "TBA" / "2027" / "May 2027" / "November 19, 2026" */
  function formatDate(releaseDate, precision = "day") {
    if (precision === "tba" || !releaseDate) return "To be announced";
    const d = new Date(releaseDate);
    if (precision === "year") return String(d.getFullYear());
    if (precision === "month") return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  function formatDateShort(releaseDate, precision = "day") {
    if (precision === "tba" || !releaseDate) return "TBA";
    const d = new Date(releaseDate);
    if (precision === "year") return String(d.getFullYear());
    if (precision === "month") return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  /** 'today' | 'upcoming' | 'released' — only exact-day items can be 'today'/'released' */
  function status(releaseDate, precision = "day", now = new Date()) {
    if (precision === "tba" || !releaseDate) return "upcoming";
    if (precision !== "day") return "upcoming";
    const target = new Date(releaseDate);
    if (isSameCalendarDay(target, now)) return "today";
    return target.getTime() > now.getTime() ? "upcoming" : "released";
  }

  return {
    diffParts,
    isSameCalendarDay,
    sortValue,
    badgeLabel,
    longLabel,
    formatDate,
    formatDateShort,
    status,
    DAY_MS,
  };
})();
