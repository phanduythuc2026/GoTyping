/**
 * Normalizes a word token for dictionary lookup:
 * - Lowercases
 * - Strips punctuation and symbols from boundaries
 * - Handles English contractions and common inflection endings
 */
export function cleanToken(word: string): string {
  if (!word) return "";
  // Strip outer punctuation like quotation marks, brackets, commas, periods
  const trimmed = word.replace(/^[^\w]+|[^\w]+$/g, "").toLowerCase();
  return trimmed;
}

/**
 * Basic lemmatization / stemming heuristics for English academic words
 */
export function getWordVariants(word: string): string[] {
  const clean = cleanToken(word);
  if (!clean || clean.length < 3) return [clean];

  const variants = new Set<string>([clean]);

  // Plurals and 3rd person singular (-s, -es, -ies)
  if (clean.endsWith("ies") && clean.length > 4) {
    variants.add(clean.slice(0, -3) + "y");
  } else if (clean.endsWith("es") && clean.length > 3) {
    variants.add(clean.slice(0, -2));
  } else if (clean.endsWith("s") && !clean.endsWith("ss")) {
    variants.add(clean.slice(0, -1));
  }

  // Past tense / participles (-ed, -d)
  if (clean.endsWith("ed")) {
    variants.add(clean.slice(0, -2)); // e.g. defined -> defin (then +e -> define)
    variants.add(clean.slice(0, -1)); // e.g. analyzed -> analyze
  }

  // Continuous (-ing)
  if (clean.endsWith("ing") && clean.length > 5) {
    variants.add(clean.slice(0, -3));
    variants.add(clean.slice(0, -3) + "e"); // e.g. analyzing -> analyze
  }

  // Adverbs (-ly)
  if (clean.endsWith("ly") && clean.length > 4) {
    variants.add(clean.slice(0, -2));
  }

  return Array.from(variants);
}
