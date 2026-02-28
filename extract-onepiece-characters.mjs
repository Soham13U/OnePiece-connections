// extract-onepiece-characters.mjs
// Node 18+ (global fetch). If you're on older Node, install node-fetch and import it.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://onepiece.fandom.com/api.php';

// NOTE: Inclusion is now controlled solely by entries in charlist.txt.
// We no longer apply any title- or category-based skips; all heuristic
// logic is only used to derive extra fields (race, haki, etc.).

// Local file containing one character name per line (provided by user)
const CHARLIST_FILE = 'charlist.txt';

// Helper: call MediaWiki API with query params
async function mwFetch(params) {
  const search = new URLSearchParams({
    format: 'json',
    ...params,
  });

  const url = `${API_URL}?${search.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const json = await res.json();
  if (json.error) {
    console.error('API error:', json.error);
    throw new Error(JSON.stringify(json.error));
  }
  return json;
}

// Load character titles from local charlist.txt (one name per line)
function loadCharlistTitles() {
  const filePath = path.join(__dirname, CHARLIST_FILE);
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

// Fetch page objects (pageid, title, etc.) for a batch of titles
async function fetchPagesForTitles(titles) {
  const pages = [];

  // MediaWiki limits titles per request; keep batches small to avoid URL length issues
  const BATCH_SIZE = 40;
  for (let i = 0; i < titles.length; i += BATCH_SIZE) {
    const batch = titles.slice(i, i + BATCH_SIZE);
    console.log(`Fetching page metadata for batch of ${batch.length} titles...`);

    const json = await mwFetch({
      action: 'query',
      titles: batch.join('|'),
    });

    if (json.query && json.query.pages) {
      for (const p of Object.values(json.query.pages)) {
        // Skip missing or invalid pages (pageid -1)
        if (p.pageid && p.pageid > 0) {
          pages.push(p);
        }
      }
    }
  }

  return pages;
}

// Collect unique character pages corresponding to titles in charlist.txt
async function collectAllCharacterPages() {
  const titles = loadCharlistTitles();
  console.log(`Loaded ${titles.length} titles from ${CHARLIST_FILE}`);

  const allPages = await fetchPagesForTitles(titles);

  // Deduplicate by pageid
  const byId = new Map();
  for (const p of allPages) {
    if (!byId.has(p.pageid)) {
      byId.set(p.pageid, p);
    }
  }
  const unique = Array.from(byId.values());

  console.log(`Total unique pages resolved from charlist: ${unique.length}`);
  return unique;
}

// Step 2: fetch infobox data for a given page title using action=parse
async function fetchInfobox(title) {
  // Use properties.infoboxes from action=parse
  const json = await mwFetch({
    action: 'parse',
    page: title,
    prop: 'properties',
    formatversion: '2',
  });

  const props = json.parse?.properties;
  if (!props || !props.infoboxes) {
    return null;
  }

  // properties.infoboxes is a JSON string -> parse it to get infobox structure
  const infoboxes = JSON.parse(props.infoboxes);
  return infoboxes[0] || null;
}

// Fetch raw wikitext for a page (used for categories, haki, race, etc.)
async function fetchWikitext(title) {
  const json = await mwFetch({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    formatversion: '2',
  });

  return json.parse?.wikitext || '';
}

// Step 3: fetch basic image info (pageimages)
// You can enhance this later if needed.
async function fetchPageImage(title) {
  const json = await mwFetch({
    action: 'query',
    prop: 'pageimages',
    piprop: 'original',
    titles: title,
  });

  const pages = json.query?.pages || {};
  const page = Object.values(pages)[0];
  return page?.original?.source || null;
}

// Strip HTML tags, reference markers and collapse whitespace for cleaner text values
function stripHtml(html) {
  let text = html;

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode specific numeric entities for brackets, then drop bracketed reference numbers
  text = text
    .replace(/&#91;|&#x5B;|&lbrack;?/gi, '[')
    .replace(/&#93;|&#x5D;|&rbrack;?/gi, ']')
    .replace(/\[\d+]/g, '');

  // Remove any remaining numeric entities like &#160;
  text = text.replace(/&#\d+;?/g, '');

  // Collapse whitespace
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeListValue(value) {
  return value
    .split(/[\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Map parsed infobox structure from properties.infoboxes to our fixed schema
function extractFieldsFromInfobox(pageId, title, infobox, imageUrl, wikitext) {
  const result = {
    id: pageId,
    name: title.replace(/_/g, ' '),
    imageUrl: imageUrl || null,
    crews: [],
    roles: [],
    devilFruitType: null,
    hasAwakenedFruit: null,
    hakiTypes: [],
    race: null,
    bountyNumber: null,
    status: null,
    origin: null,
  };

  if (!infobox || !Array.isArray(infobox.data)) {
    return result;
  }

  // Flatten all label/value pairs from "group" blocks
  const pairs = [];
  for (const block of infobox.data) {
    if (block.type === 'group' && block.data?.value) {
      for (const item of block.data.value) {
        if (item.type === 'data' && item.data) {
          const rawLabel = (item.data.label || '').toString();
          const rawValue = (item.data.value || '').toString();
          const label = stripHtml(rawLabel);
          const value = stripHtml(rawValue);

          // Directly capture Devil Fruit type via dftype/dftype2 source if present
          if (!result.devilFruitType && (item.data.source === 'dftype' || item.data.source === 'dftype2')) {
            const typeMatch = value.match(/Paramecia|Logia|Zoan|Mythical Zoan/i);
            result.devilFruitType = typeMatch ? typeMatch[0] : value;
          }

          if (label && value) {
            pairs.push({ label, value });
          }
        }
      }
    }
  }

  const findValues = (needles) =>
    pairs
      .filter((p) =>
        needles.some((n) =>
          p.label.toLowerCase().includes(n.toLowerCase())
        )
      )
      .map((p) => p.value);

  const firstValue = (needles) => {
    const vals = findValues(needles);
    return vals.length ? vals[0] : null;
  };

  // crews: from Affiliations
  const crewRaw = firstValue(['Affiliations']);
  if (crewRaw) {
    result.crews = normalizeListValue(crewRaw);
  }

  // roles: from Occupations
  const rolesRaw = firstValue(['Occupations']);
  if (rolesRaw) {
    result.roles = normalizeListValue(rolesRaw);
  }

  // status
  const statusRaw = firstValue(['Status']);
  if (statusRaw) {
    result.status = statusRaw;
  }

  // origin
  const originRaw = firstValue(['Origin']);
  if (originRaw) {
    result.origin = originRaw;
  }

  // devilFruitType from Devil Fruit Type:
  if (!result.devilFruitType) {
    // Prefer an exact 'Type:' label so we don't accidentally pick up 'Blood Type:'
    const exactTypeEntry = pairs.find(
      (p) => p.label.trim().toLowerCase() === 'type:'
    );
    const dfTypeRaw = exactTypeEntry?.value || null;
    if (dfTypeRaw) {
      const typeMatch = dfTypeRaw.match(/Paramecia|Logia|Zoan|Mythical Zoan/i);
      result.devilFruitType = typeMatch ? typeMatch[0] : dfTypeRaw;
    }
  }

  // bountyNumber
  const bountyRaw = firstValue(['Bounty']);
  if (bountyRaw) {
    const numeric = parseInt(bountyRaw.replace(/[^\d]/g, ''), 10);
    if (!Number.isNaN(numeric)) {
      result.bountyNumber = numeric;
    }
  }

  // --- Derive additional fields from wikitext & categories ---
  const wikiTextSafe = typeof wikitext === 'string' ? wikitext : '';

  // Categories from bottom of wikitext: [[Category:Humans]], [[Category:Armament Haki Users]], etc.
  const categories = [];
  const catRegex = /\[\[Category:([^\]]+)\]\]/g;
  let match;
  while ((match = catRegex.exec(wikiTextSafe)) !== null) {
    categories.push(match[1]);
  }

  const catHas = (pattern) =>
    categories.some((c) => pattern.test(c));

  // race from categories
  if (catHas(/^Humans?$/i)) {
    result.race = 'Human';
  } else if (catHas(/^Fish[- ]Men$/i)) {
    result.race = 'Fish-Man';
  } else if (catHas(/^Merfolk/i)) {
    result.race = 'Merfolk';
  } else if (catHas(/^Giants?$/i)) {
    result.race = 'Giant';
  } else if (catHas(/Minks?/i)) {
    result.race = 'Mink';
  } else if (catHas(/Lunarians?/i)) {
    result.race = 'Lunarian';
  }

  // hakiTypes from categories and wikitext mentions
  const hakiTypes = new Set(result.hakiTypes || []);

  if (catHas(/Observation Haki Users/i) || /Observation Haki/i.test(wikiTextSafe)) {
    hakiTypes.add('Observation');
  }
  if (catHas(/Armament Haki Users/i) || /Armament Haki/i.test(wikiTextSafe)) {
    hakiTypes.add('Armament');
  }
  if (catHas(/Supreme King Haki Users/i) || /Conqueror'?s Haki/i.test(wikiTextSafe)) {
    hakiTypes.add('Conqueror');
  }

  result.hakiTypes = Array.from(hakiTypes);

  // hasAwakenedFruit from categories (Awakened ... Devil Fruit Users)
  if (catHas(/Awakened .*Devil Fruit Users/i)) {
    result.hasAwakenedFruit = true;
  } else if (result.devilFruitType) {
    // Character has a fruit but no awakened category -> keep null to represent unknown/not-confirmed
    result.hasAwakenedFruit = null;
  }

  // Fallback devilFruitType from devil-fruit-specific categories if infobox didn't give it
  if (!result.devilFruitType) {
    if (catHas(/Paramecia Devil Fruit Users/i)) {
      result.devilFruitType = 'Paramecia';
    } else if (catHas(/Logia Devil Fruit Users/i)) {
      result.devilFruitType = 'Logia';
    } else if (catHas(/Zoan Devil Fruit Users/i)) {
      // Could be generic Zoan; more specific Mythical Zoan handled above via name match
      result.devilFruitType = 'Zoan';
    }
  }

  return result;
}

// Simple concurrency limiter so we don't hammer the API too hard
async function mapWithConcurrency(items, limit, mapper) {
  const results = [];
  let idx = 0;
  let active = 0;

  return new Promise((resolve, reject) => {
    const next = () => {
      if (idx >= items.length && active === 0) {
        resolve(results);
        return;
      }
      while (active < limit && idx < items.length) {
        const currentIndex = idx++;
        const item = items[currentIndex];
        active++;
        Promise.resolve(mapper(item))
          .then((res) => {
            results[currentIndex] = res;
          })
          .catch((err) => {
            console.error('Error processing item', item, err);
            results[currentIndex] = null;
          })
          .finally(() => {
            active--;
            next();
          });
      }
    };
    next();
  });
}

async function main() {
  const pages = await collectAllCharacterPages();

  console.log(`Fetching infobox + image for ${pages.length} pages...`);
  const characters = await mapWithConcurrency(
    pages,
    5,
    async (page) => {
      const title = page.title;

      try {
        const [infobox, imageUrl, wikitext] = await Promise.all([
          fetchInfobox(title),
          fetchPageImage(title),
          fetchWikitext(title),
        ]);
        const mapped = extractFieldsFromInfobox(page.pageid, title, infobox, imageUrl, wikitext);
        console.log(`OK: ${mapped.name}`);
        return mapped;
      } catch (e) {
        console.error(`Failed for ${title}:`, e.message);
        return {
          id: page.pageid,
          name: title.replace(/_/g, ' '),
          imageUrl: null,
          crews: [],
          roles: [],
          devilFruitType: null,
          hasAwakenedFruit: null,
          hakiTypes: [],
          race: null,
          bountyNumber: null,
          status: null,
          origin: null,
        };
      }
    }
  );

  const outPath = path.join(__dirname, 'onepiece_characters.json');
  const cleaned = characters.filter(Boolean);
  fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2), 'utf8');
  console.log(`Wrote ${cleaned.length} characters (after skips) to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});