/**
 * Chunks a long article text into manageable typing chunks (150-200 words each)
 * without breaking sentences or common abbreviations (e.g., U.S., i.e., Dr.).
 * Uses Intl.Segmenter with sentence granularity.
 */
export function chunkTextIntoSessions(
  text: string,
  minWords: number = 150,
  maxWords: number = 220
): string[] {
  if (!text || text.trim().length === 0) return [];

  // Protect common abbreviations from being falsely split as sentence ends
  const protectedText = text
    .replace(/\b(e\.g\.)/gi, "__EG__")
    .replace(/\b(i\.e\.)/gi, "__IE__")
    .replace(/\b(u\.s\.)/gi, "__US__")
    .replace(/\b(u\.k\.)/gi, "__UK__")
    .replace(/\b(etc\.)/gi, "__ETC__")
    .replace(/\b(dr\.)/gi, "__DR__")
    .replace(/\b(prof\.)/gi, "__PROF__")
    .replace(/\b(mr\.)/gi, "__MR__")
    .replace(/\b(mrs\.)/gi, "__MRS__")
    .replace(/\b(ms\.)/gi, "__MS__")
    .replace(/\b(vs\.)/gi, "__VS__");

  let sentences: string[] = [];

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
    const segments = segmenter.segment(protectedText);
    for (const seg of segments) {
      const sentence = seg.segment.trim();
      if (sentence) {
        sentences.push(sentence);
      }
    }
  } else {
    // Fallback regex if Intl.Segmenter is not available in environment
    sentences = protectedText.split(/(?<=[.?!])\s+/);
  }

  // Restore protected tokens
  sentences = sentences.map((s) =>
    s
      .replace(/__EG__/g, "e.g.")
      .replace(/__IE__/g, "i.e.")
      .replace(/__US__/g, "U.S.")
      .replace(/__UK__/g, "U.K.")
      .replace(/__ETC__/g, "etc.")
      .replace(/__DR__/g, "Dr.")
      .replace(/__PROF__/g, "Prof.")
      .replace(/__MR__/g, "Mr.")
      .replace(/__MRS__/g, "Mrs.")
      .replace(/__MS__/g, "Ms.")
      .replace(/__VS__/g, "vs.")
  );

  const chunks: string[] = [];
  let currentChunkSentences: string[] = [];
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).filter(Boolean).length;

    if (currentWordCount + sentenceWords > maxWords && currentWordCount >= minWords) {
      // Chunk has reached sufficient length
      chunks.push(currentChunkSentences.join(" "));
      currentChunkSentences = [sentence];
      currentWordCount = sentenceWords;
    } else {
      currentChunkSentences.push(sentence);
      currentWordCount += sentenceWords;
    }
  }

  if (currentChunkSentences.length > 0) {
    // If the last chunk is too small (< 50 words) and there's a previous chunk, merge it
    const remainingText = currentChunkSentences.join(" ");
    if (chunks.length > 0 && currentWordCount < 60) {
      chunks[chunks.length - 1] += " " + remainingText;
    } else {
      chunks.push(remainingText);
    }
  }

  return chunks;
}
