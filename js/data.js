/**
 * ReleaseRadar — Data Layer
 * ---------------------------------------------------------
 * This file simulates an API response. Every consumer in the
 * app talks to the functions at the bottom of this file
 * (getAllItems, getItemById, etc.) instead of touching RAW_ITEMS
 * directly. When a real backend exists, replace the body of
 * fetchItems() with an actual `fetch('/api/items')` call that
 * resolves to the same shape and nothing else in the app needs
 * to change.
 *
 * Item shape:
 * {
 *   id: string,
 *   title: string,
 *   category: 'game' | 'movie' | 'tv' | 'animation',
 *   genres: string[],
 *   releaseDate: ISOString | null,   // null only when datePrecision is 'tba'
 *   datePrecision: 'day' | 'month' | 'year' | 'tba',
 *     // 'day'   -> releaseDate is the real, exact release date
 *     // 'month' -> only the month is confirmed; releaseDate is stored
 *     //            as the 1st of that month, for sorting only
 *     // 'year'  -> only the year is confirmed; releaseDate is a
 *     //            mid-year placeholder, for sorting only
 *     // 'tba'   -> nothing announced; releaseDate is null
 *     // The UI (countdown.js) only ever displays/counts down at the
 *     // precision actually known — it never shows a fake day/hour
 *     // countdown for a month/year/TBA title.
 *   studio: string,
 *   description: string,
 *   synopsis: string,
 *   platforms: string[] | null,   // games only
 *   anticipated: boolean,
 *   hype: number,                 // 0-100, drives "Most Anticipated" ordering
 *   rating: number | null,        // critic/user score out of 10, null if unreleased
 * }
 */

const RAW_ITEMS = [
  // ---------------- GAMES ----------------
  {
    id: "game-gta-vi",
    title: "Grand Theft Auto VI",
    category: "game",
    genres: ["Action", "Open World"],
    releaseDate: "2026-11-19T00:00:00-05:00",
    datePrecision: "day",
    studio: "Rockstar Games",
    description: "Rockstar's next open-world crime saga, set across Vice City and beyond.",
    synopsis: "Grand Theft Auto VI returns to a reimagined Vice City and the wider state of Leonida, following dual protagonists Jason and Lucia through Rockstar's largest and most detailed open world to date.",
    platforms: ["PS5", "Xbox Series X|S"],
    anticipated: true,
    hype: 99,
    rating: null,
  },
  {
    id: "game-marvels-wolverine",
    title: "Marvel's Wolverine",
    category: "game",
    genres: ["Action", "Adventure"],
    releaseDate: "2026-09-15T00:00:00-04:00",
    datePrecision: "day",
    studio: "Insomniac Games",
    description: "Insomniac's brutal, claw-first take on Logan, set in their Marvel universe.",
    synopsis: "Marvel's Wolverine casts players as Logan in a mature, visceral action-adventure from the studio behind Marvel's Spider-Man, set within Insomniac's shared Marvel game universe.",
    platforms: ["PS5"],
    anticipated: true,
    hype: 93,
    rating: null,
  },
  {
    id: "game-cod-mw4",
    title: "Call of Duty: Modern Warfare 4",
    category: "game",
    genres: ["Shooter", "Action"],
    releaseDate: "2026-10-23T00:00:00-04:00",
    datePrecision: "day",
    studio: "Infinity Ward",
    description: "The next chapter in the rebooted Modern Warfare storyline.",
    synopsis: "Call of Duty: Modern Warfare 4 continues Infinity Ward's rebooted storyline, pairing a new campaign with the series' signature multiplayer and Warzone integration.",
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    anticipated: false,
    hype: 78,
    rating: null,
  },
  {
    id: "game-gears-eday",
    title: "Gears of War: E-Day",
    category: "game",
    genres: ["Shooter", "Action"],
    releaseDate: "2026-10-06T00:00:00-04:00",
    datePrecision: "day",
    studio: "The Coalition",
    description: "A prequel taking Gears of War back to the very first Emergence Day.",
    synopsis: "Gears of War: E-Day is a prequel set on Emergence Day itself, following a younger Marcus Fenix and Dom Santiago as the Locust first surface and the world changes forever.",
    platforms: ["Xbox Series X|S", "PC"],
    anticipated: true,
    hype: 81,
    rating: null,
  },
  {
    id: "game-control-resonant",
    title: "Control Resonant",
    category: "game",
    genres: ["Action", "Supernatural"],
    releaseDate: "2026-09-24T00:00:00-04:00",
    datePrecision: "day",
    studio: "Remedy Entertainment",
    description: "Remedy expands the Control universe with a new supernatural action adventure.",
    synopsis: "Control Resonant continues Remedy's Control universe, blending reality-bending combat with the studio's signature atmosphere and narrative design.",
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    anticipated: false,
    hype: 72,
    rating: null,
  },
  {
    id: "game-blood-of-dawnwalker",
    title: "The Blood of Dawnwalker",
    category: "game",
    genres: ["RPG", "Vampire"],
    releaseDate: "2026-09-03T00:00:00-04:00",
    datePrecision: "day",
    studio: "Rebel Wolves",
    description: "A dark fantasy RPG from ex-Witcher developers, torn between day and night.",
    synopsis: "The Blood of Dawnwalker is a dark fantasy RPG from Rebel Wolves, founded by veteran developers of The Witcher 3, casting players as a man cursed to live a double life between human day and vampiric night.",
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    anticipated: true,
    hype: 80,
    rating: null,
  },
  {
    id: "game-dune-awakening",
    title: "Dune: Awakening",
    category: "game",
    genres: ["Survival", "Open World"],
    releaseDate: "2026-09-22T00:00:00-04:00",
    datePrecision: "day",
    studio: "Funcom",
    description: "An open-world survival game set on the deserts of Arrakis.",
    synopsis: "Dune: Awakening is an open-world survival game set on Arrakis, tasking players with surviving sandworms, rival factions, and the harsh desert itself while building a foothold on the planet.",
    platforms: ["PC", "PS5", "Xbox Series X|S"],
    anticipated: false,
    hype: 74,
    rating: null,
  },
  {
    id: "game-minecraft-dungeons-2",
    title: "Minecraft Dungeons 2",
    category: "game",
    genres: ["Action", "Dungeon Crawler"],
    releaseDate: "2026-09-29T00:00:00-04:00",
    datePrecision: "day",
    studio: "Mojang Studios",
    description: "A sequel to the co-op dungeon crawler set in the Minecraft universe.",
    synopsis: "Minecraft Dungeons 2 returns to the blocky, action-RPG dungeon crawling of the original, with new biomes, gear, and co-op runs for up to four players.",
    platforms: ["PC", "PS5", "Xbox Series X|S", "Switch 2"],
    anticipated: false,
    hype: 60,
    rating: null,
  },
  {
    id: "game-sinking-city-2",
    title: "The Sinking City 2",
    category: "game",
    genres: ["Horror", "Investigation"],
    releaseDate: "2026-08-18T00:00:00-04:00",
    datePrecision: "day",
    studio: "Frogwares",
    description: "A Lovecraftian investigation sequel set in a flooded, cursed city.",
    synopsis: "The Sinking City 2 continues Frogwares' Lovecraftian investigation series, sending a new detective into a flooded city where cosmic horrors lurk beneath the water line.",
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    anticipated: false,
    hype: 58,
    rating: null,
  },
  {
    id: "game-phantom-blade-zero",
    title: "Phantom Blade Zero",
    category: "game",
    genres: ["Action", "Hack and Slash"],
    releaseDate: "2026-09-09T00:00:00-04:00",
    datePrecision: "day",
    studio: "S-GAME",
    description: "A stylish, fast-paced action game blending wuxia mythology with dark fantasy.",
    synopsis: "Phantom Blade Zero is a high-speed action game combining wuxia-inspired swordplay with a dark fantasy world, built around fluid combo-driven combat.",
    platforms: ["PS5", "PC"],
    anticipated: true,
    hype: 76,
    rating: null,
  },
  {
    id: "game-halloween-the-game",
    title: "Halloween: The Game",
    category: "game",
    genres: ["Horror", "Survival"],
    releaseDate: "2026-09-08T00:00:00-04:00",
    datePrecision: "day",
    studio: "Illfonic",
    description: "An asymmetric horror game built around John Carpenter's Halloween.",
    synopsis: "Halloween: The Game brings Michael Myers to an asymmetric multiplayer horror experience, tasking survivors with escaping Haddonfield while one player stalks as The Shape.",
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    anticipated: false,
    hype: 55,
    rating: null,
  },
  {
    id: "game-007-first-light",
    title: "007 First Light",
    category: "game",
    genres: ["Action", "Spy"],
    releaseDate: "2027-05-01T00:00:00-04:00",
    datePrecision: "month",
    studio: "IO Interactive",
    description: "An original Bond origin story from the makers of the Hitman trilogy.",
    synopsis: "007 First Light is an original James Bond origin story from IO Interactive, following a young Bond as he earns his 00 status, blending stealth, action, and spycraft.",
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    anticipated: true,
    hype: 84,
    rating: null,
  },
  {
    id: "game-fable",
    title: "Fable",
    category: "game",
    genres: ["RPG", "Fantasy"],
    releaseDate: "2027-02-23T00:00:00-05:00",
    datePrecision: "day",
    studio: "Playground Games",
    description: "A reimagining of the beloved British fantasy RPG series.",
    synopsis: "Fable reboots the beloved series with a new take on Albion, blending the franchise's trademark humor with a modern open-world RPG built by Playground Games.",
    platforms: ["Xbox Series X|S", "PC"],
    anticipated: true,
    hype: 87,
    rating: null,
  },
  {
    id: "game-persona-4-revival",
    title: "Persona 4 Revival",
    category: "game",
    genres: ["RPG", "JRPG"],
    releaseDate: "2027-02-18T00:00:00-05:00",
    datePrecision: "day",
    studio: "Atlus",
    description: "A full remake of the beloved Persona 4, rebuilt on a modern engine.",
    synopsis: "Persona 4 Revival rebuilds the fan-favorite JRPG from the ground up, modernizing the small-town mystery, social sim, and turn-based combat that defined the original.",
    platforms: ["PS5", "Xbox Series X|S", "PC", "Switch 2"],
    anticipated: true,
    hype: 85,
    rating: null,
  },
  {
    id: "game-tomb-raider-legacy-of-atlantis",
    title: "Tomb Raider: Legacy of Atlantis",
    category: "game",
    genres: ["Action", "Adventure"],
    releaseDate: "2027-07-01T00:00:00-04:00",
    datePrecision: "year",
    studio: "Crystal Dynamics",
    description: "Lara Croft's next adventure, chasing the myth of Atlantis.",
    synopsis: "Tomb Raider: Legacy of Atlantis sends Lara Croft after the legend of Atlantis, continuing Crystal Dynamics' action-adventure series with a new engine and scope.",
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    anticipated: false,
    hype: 70,
    rating: null,
  },
  {
    id: "game-god-of-war-laufey",
    title: "God of War: Laufey",
    category: "game",
    genres: ["Action", "Mythology"],
    releaseDate: "2027-07-01T00:00:00-04:00",
    datePrecision: "year",
    studio: "Santa Monica Studio",
    description: "The next chapter of Kratos and Atreus's Norse saga.",
    synopsis: "God of War: Laufey continues Kratos and Atreus's journey through Norse mythology, following the fallout of the events in Ragnarök.",
    platforms: ["PS5"],
    anticipated: true,
    hype: 90,
    rating: null,
  },
  {
    id: "game-kingdom-hearts-iv",
    title: "Kingdom Hearts IV",
    category: "game",
    genres: ["RPG", "Action"],
    releaseDate: "2027-07-01T00:00:00-04:00",
    datePrecision: "year",
    studio: "Square Enix",
    description: "The next mainline chapter of the Kingdom Hearts saga.",
    synopsis: "Kingdom Hearts IV continues Sora's story in a new arc for the long-running series, introducing the realistic-styled 'Quadratum' world alongside more Disney and Final Fantasy crossovers.",
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    anticipated: true,
    hype: 88,
    rating: null,
  },
  {
    id: "game-witcher-4",
    title: "The Witcher 4",
    category: "game",
    genres: ["RPG", "Fantasy"],
    releaseDate: "2027-07-01T00:00:00-04:00",
    datePrecision: "year",
    studio: "CD Projekt Red",
    description: "A new Witcher saga begins, built on Unreal Engine 5.",
    synopsis: "The Witcher 4 opens a new saga for the series with a new protagonist, Ciri, built on Unreal Engine 5 and CD Projekt Red's next-generation open-world tech.",
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    anticipated: true,
    hype: 96,
    rating: null,
  },
  {
    id: "game-state-of-decay-3",
    title: "State of Decay 3",
    category: "game",
    genres: ["Survival", "Open World"],
    releaseDate: "2027-07-01T00:00:00-04:00",
    datePrecision: "year",
    studio: "Undead Labs",
    description: "The next entry in the open-world zombie survival series.",
    synopsis: "State of Decay 3 continues the open-world zombie survival series, set in the Pacific Northwest with a new engine, deeper community systems, and expanded co-op.",
    platforms: ["Xbox Series X|S", "PC"],
    anticipated: false,
    hype: 69,
    rating: null,
  },
  {
    id: "game-intergalactic-heretic-prophet",
    title: "Intergalactic: The Heretic Prophet",
    category: "game",
    genres: ["Action", "Sci-Fi"],
    releaseDate: null,
    datePrecision: "tba",
    studio: "Naughty Dog",
    description: "Naughty Dog's original sci-fi adventure, still without a release date.",
    synopsis: "Intergalactic: The Heretic Prophet is Naughty Dog's original sci-fi project, following a stranded protagonist on a hostile alien world. No release date has been announced yet.",
    platforms: ["PS5"],
    anticipated: true,
    hype: 77,
    rating: null,
  },

  // ---------------- MOVIES ----------------
  // Cleared — awaiting the Movies list.

  // ---------------- TV SERIES ----------------
  // Cleared — awaiting the Series list.

  // ---------------- ANIMATION ----------------
  // Cleared — awaiting the Animation list.
];

/* ---------------------------------------------------------
 * Public data API — swap the internals for real fetch() calls
 * whenever a backend exists. Every function returns a Promise
 * so callers never need to change.
 * ------------------------------------------------------- */
const ReleaseRadarAPI = (() => {
  function fetchItems() {
    // Simulated network latency for realism; replace with:
    // return fetch('/api/items').then(r => r.json());
    return Promise.resolve(RAW_ITEMS.map((i) => ({ ...i })));
  }

  async function getAllItems() {
    return fetchItems();
  }

  async function getItemById(id) {
    const items = await fetchItems();
    return items.find((i) => i.id === id) || null;
  }

  async function getRelatedItems(item, limit = 4) {
    const items = await fetchItems();
    return items
      .filter((i) => i.id !== item.id)
      .map((i) => {
        let score = 0;
        if (i.category === item.category) score += 2;
        score += i.genres.filter((g) => item.genres.includes(g)).length;
        return { item: i, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.item);
  }

  return { getAllItems, getItemById, getRelatedItems };
})();
