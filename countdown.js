/**
 * ReleaseRadar — Countdown & date utilities
 */
const RRTime = (() => {
  const DAY_MS = 86400000;

  function diffParts(targetDate, now = new Date()) {
    const diff = targetDate.getTime() - now.getTime();
    const abs = Math.abs(diff);
    const days = Math.floor(abs / DAY_MS);
    const hours = Math.floor((abs % DAY_MS) / 3600000);
    const minutes = Math.floor((abs % 3600000) / 60000);
    const seconds = Math.floor((abs % 60000) / 1000);
    return { diff, days, hours, minutes, seconds, isFuture: diff > 0 };
  }

  function isSameCalendarDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  /** Short badge text: "Today", "In 3d", "In 6h 12m", "5d ago" */
  function badgeLabel(releaseDate, now = new Date()) {
    const target = new Date(releaseDate);
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
  function longLabel(releaseDate, now = new Date()) {
    const target = new Date(releaseDate);
    if (isSameCalendarDay(target, now)) return "Released Today";
    const { days, isFuture } = diffParts(target, now);
    if (isFuture) {
      if (days === 1) return "Releases Tomorrow";
      return `Releases in ${days} day${days === 1 ? "" : "s"}`;
    }
    if (days === 1) return "Released Yesterday";
    return `Released ${days} day${days === 1 ? "" : "s"} ago`;
  }

  function formatDate(releaseDate) {
    const d = new Date(releaseDate);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatDateShort(releaseDate) {
    const d = new Date(releaseDate);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function status(releaseDate, now = new Date()) {
    const target = new Date(releaseDate);
    if (isSameCalendarDay(target, now)) return "today";
    return target.getTime() > now.getTime() ? "upcoming" : "released";
  }

  return {
    diffParts,
    isSameCalendarDay,
    badgeLabel,
    longLabel,
    formatDate,
    formatDateShort,
    status,
    DAY_MS,
  };
})();
