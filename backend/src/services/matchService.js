// Levenshtein distance helper
function getLevenshteinDistance(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  return track[str2.length][str1.length];
}

// Calculate similarity percentage
function getSimilarity(s1, s2) {
  const len = Math.max(s1.length, s2.length);
  if (len === 0) return 1.0;
  const dist = getLevenshteinDistance(s1, s2);
  return (len - dist) / len;
}

// Normalize strings (remove stops, lower, clean specs)
function normalizeTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[()-[\]{},.;:_+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract specs
function extractSpecs(title) {
  const normalized = normalizeTitle(title);
  
  // Storage regex e.g. "128 gb", "128gb", "256gb", "512gb", "1tb", "64gb"
  const storageMatch = normalized.match(/(\d+)\s*(gb|tb)\b/i);
  let storage = null;
  if (storageMatch) {
    storage = storageMatch[0].replace(/\s+/g, '').toUpperCase();
  }

  // RAM regex e.g. "8 gb ram", "8gb ram", "16gb" (if after a slash or separate)
  const ramMatch = normalized.match(/(\d+)\s*gb\s*ram\b/i) || normalized.match(/\b(\d+)\s*gb\b.*ram/i);
  let ram = null;
  if (ramMatch) {
    ram = ramMatch[1] + 'GB';
  } else if (storage && normalized.includes('ram')) {
    // try to find secondary GB match that isn't storage
    const gbMatches = [...normalized.matchAll(/\b(\d+)\s*gb\b/gi)];
    if (gbMatches.length > 1) {
      const secondaryVal = gbMatches.find(m => m[0].replace(/\s+/g, '').toUpperCase() !== storage);
      if (secondaryVal) {
        ram = secondaryVal[1] + 'GB';
      }
    }
  }

  // Colors list check
  const colors = ['blue', 'black', 'gray', 'grey', 'white', 'red', 'green', 'yellow', 'purple', 'gold', 'silver', 'pink', 'orange', 'magico black', 'chromatic gray'];
  let color = null;
  for (const c of colors) {
    const regex = new RegExp(`\\b${c}\\b`, 'i');
    if (normalized.match(regex)) {
      color = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // Size list check (apparel / footwear)
  // Sizes like S, M, L, XL, XXL, UK 7, UK 8, UK 9, UK 10, US 9
  const sizeMatch = normalized.match(/\b(uk|us)\s*(\d+)\b/i) || normalized.match(/\b(size|sz)\s*(s|m|l|xl|xxl)\b/i) || normalized.match(/\b(s|m|l|xl|xxl)\b/i);
  let size = null;
  if (sizeMatch) {
    size = sizeMatch[0].toUpperCase();
  }

  return { storage, ram, color, size };
}

// Clean title of spec keywords to isolate core product name
function cleanProductRootName(title) {
  let root = normalizeTitle(title);
  // remove storage specs
  root = root.replace(/\d+\s*(gb|tb)\b/gi, '');
  // remove ram specs
  root = root.replace(/\d+\s*gb\s*ram\b/gi, '');
  // remove size
  root = root.replace(/\b(uk|us)\s*\d+\b/gi, '');
  root = root.replace(/\b(size|sz)\s*(s|m|l|xl|xxl)\b/gi, '');
  // remove colors
  const colors = ['blue', 'black', 'gray', 'grey', 'white', 'red', 'green', 'yellow', 'purple', 'gold', 'silver', 'pink', 'orange', 'magico black', 'chromatic gray'];
  for (const c of colors) {
    root = root.replace(new RegExp(`\\b${c}\\b`, 'gi'), '');
  }
  // remove common filler terms
  const fillers = ['wireless', 'smartwatch', 'earphones', 'headphones', 't-shirt', 'wallet', 'sneakers', 'saree', 'traditional', 'solid', 'men', 'women'];
  for (const f of fillers) {
    root = root.replace(new RegExp(`\\b${f}\\b`, 'gi'), '');
  }
  
  return root.replace(/\s+/g, ' ').trim();
}

// Check if two product titles match as variants
function isProductMatch(title1, title2) {
  const root1 = cleanProductRootName(title1);
  const root2 = cleanProductRootName(title2);
  
  // Direct match check
  if (root1 === root2) return true;
  
  // Fuzzy token check: check intersection of key words
  const words1 = new Set(root1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(root2.split(' ').filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return false;
  
  let intersectionCount = 0;
  for (const w of words1) {
    if (words2.has(w)) intersectionCount++;
  }
  
  const minSize = Math.min(words1.size, words2.size);
  const tokenOverlap = intersectionCount / minSize;
  
  // Also check Levenshtein similarity on roots
  const similarity = getSimilarity(root1, root2);
  
  // If roots share at least 70% of keywords AND Levenshtein similarity is > 65%
  return (tokenOverlap >= 0.7 && similarity >= 0.65) || similarity >= 0.8;
}

module.exports = {
  getLevenshteinDistance,
  getSimilarity,
  normalizeTitle,
  extractSpecs,
  cleanProductRootName,
  isProductMatch
};
