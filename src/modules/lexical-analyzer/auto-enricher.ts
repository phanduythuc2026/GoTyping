export type VocabItemType = "word" | "collocation" | "idiomatic_phrase" | "sentence_formula";

export type VocabTopic =
  | "Environment"
  | "Technology"
  | "Education"
  | "Society"
  | "Health"
  | "Economy"
  | "Academic Writing";

export interface EnrichedVocabEntry {
  id: string;
  term: string;
  item_type: VocabItemType;
  topic: VocabTopic;
  part_of_speech: string;
  definition_en: string;
  definition_vi: string;
  ipa: string;
  context_sentence: string;
  mastery_level: number; // 1 to 5
  created_at: string;
}

// Built-in academic heuristic dictionary for instant client-side enrichment
const ENRICHMENT_LEXICON: Record<
  string,
  {
    type: VocabItemType;
    pos: string;
    en: string;
    vi: string;
    ipa: string;
    topic: VocabTopic;
  }
> = {
  empirical: {
    type: "word",
    pos: "Adjective",
    en: "Based on, concerned with, or verifiable by observation or experience rather than theory.",
    vi: "Dựa trên thực nghiệm, quan sát thực tế (thay vì lý thuyết suông).",
    ipa: "/ɪmˈpɪrɪkl/",
    topic: "Academic Writing",
  },
  mitigate: {
    type: "word",
    pos: "Verb",
    en: "Make something bad less severe, serious, or painful.",
    vi: "Làm giảm nhẹ, giảm thiểu mức độ nghiêm trọng hoặc tác hại.",
    ipa: "/ˈmɪtɪɡeɪt/",
    topic: "Environment",
  },
  paramount: {
    type: "word",
    pos: "Adjective",
    en: "More important than anything else; supreme.",
    vi: "Tối quan trọng, có tầm quan trọng hàng đầu.",
    ipa: "/ˈpærəmaʊnt/",
    topic: "Academic Writing",
  },
  facilitate: {
    type: "word",
    pos: "Verb",
    en: "Make an action or process easy or easier.",
    vi: "Tạo điều kiện thuận lợi, thúc đẩy tiến trình diễn ra nhanh chóng.",
    ipa: "/fəˈsɪlɪteɪt/",
    topic: "Education",
  },
  sustainability: {
    type: "word",
    pos: "Noun",
    en: "The ability to be maintained at a certain rate or level; ecological balance.",
    vi: "Tính bền vững, sự phát triển duy trì lâu dài.",
    ipa: "/səˌsteɪnəˈbɪləti/",
    topic: "Environment",
  },
  infrastructure: {
    type: "word",
    pos: "Noun",
    en: "The basic physical and organizational structures needed for the operation of a society.",
    vi: "Cơ sở hạ tầng cơ bản phục vụ cho xã hội hoặc nền kinh tế.",
    ipa: "/ˈɪnfrəstrʌktʃər/",
    topic: "Society",
  },
  "play a crucial role": {
    type: "collocation",
    pos: "Verb Phrase",
    en: "To have an extremely significant or decisive influence on something.",
    vi: "Đóng vai trò then chốt, quyết định trong một vấn đề.",
    ipa: "/pleɪ ə ˈkruːʃl roʊl/",
    topic: "Academic Writing",
  },
  "conduct research": {
    type: "collocation",
    pos: "Verb Phrase",
    en: "To systematically investigate materials and sources in order to establish facts.",
    vi: "Tiến hành nghiên cứu khoa học chuyên sâu.",
    ipa: "/kənˈdʌkt rɪˈsɜːrtʃ/",
    topic: "Academic Writing",
  },
  "empirical evidence": {
    type: "collocation",
    pos: "Noun Phrase",
    en: "Information acquired by observation or experimentation.",
    vi: "Bằng chứng thực nghiệm khoa học xác thực.",
    ipa: "/ɪmˈpɪrɪkl ˈevɪdəns/",
    topic: "Academic Writing",
  },
  "shed light on": {
    type: "idiomatic_phrase",
    pos: "Idiomatic Phrase",
    en: "To help explain something by providing more information about it.",
    vi: "Làm sáng tỏ, soi rọi thêm thông tin cho một khúc mắc.",
    ipa: "/ʃed laɪt ɑːn/",
    topic: "Academic Writing",
  },
  "it is widely acknowledged that": {
    type: "sentence_formula",
    pos: "Sentence Opener",
    en: "Passive objective structure introducing a universally accepted consensus.",
    vi: "Công thức mở đầu học thuật: Mọi người đều thừa nhận rộng rãi rằng...",
    ipa: "/ɪt ɪz ˈwaɪdli əkˈnɑːlɪdʒd ðæt/",
    topic: "Academic Writing",
  },
};

/**
 * Automatically enriches a captured word or phrase with linguistic metadata
 */
export function enrichCapturedTerm(
  rawTerm: string,
  contextSentence?: string
): EnrichedVocabEntry {
  const term = rawTerm.trim();
  const normalized = term.toLowerCase();

  // 1. Direct dictionary match
  if (ENRICHMENT_LEXICON[normalized]) {
    const matched = ENRICHMENT_LEXICON[normalized];
    return {
      id: "voc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      term,
      item_type: matched.type,
      topic: matched.topic,
      part_of_speech: matched.pos,
      definition_en: matched.en,
      definition_vi: matched.vi,
      ipa: matched.ipa,
      context_sentence: contextSentence || `Empirical context containing '${term}'.`,
      mastery_level: 1,
      created_at: new Date().toLocaleDateString("vi-VN"),
    };
  }

  // 2. Dynamic heuristic inference
  const words = term.split(/\s+/).filter(Boolean);
  let item_type: VocabItemType = "word";
  let pos = "Noun";

  if (words.length === 1) {
    item_type = "word";
    if (normalized.endsWith("tion") || normalized.endsWith("ment") || normalized.endsWith("ity")) {
      pos = "Noun";
    } else if (normalized.endsWith("ate") || normalized.endsWith("ize") || normalized.endsWith("ify")) {
      pos = "Verb";
    } else if (normalized.endsWith("al") || normalized.endsWith("ic") || normalized.endsWith("ive") || normalized.endsWith("ous")) {
      pos = "Adjective";
    } else if (normalized.endsWith("ly")) {
      pos = "Adverb";
    }
  } else if (words.length >= 2 && words.length <= 4) {
    item_type = "collocation";
    pos = words[0].endsWith("ing") || ["play", "conduct", "make", "take", "draw"].includes(words[0]) ? "Verb Phrase" : "Noun Phrase";
  } else if (normalized.startsWith("it is") || normalized.startsWith("not only") || normalized.includes("that")) {
    item_type = "sentence_formula";
    pos = "Sentence Formula";
  } else {
    item_type = "idiomatic_phrase";
    pos = "Idiomatic Expression";
  }

  // Infer Topic
  let topic: VocabTopic = "Academic Writing";
  const textBlob = (term + " " + (contextSentence || "")).toLowerCase();
  if (textBlob.match(/climate|energy|emission|green|solar|carbon|nature|environment/)) {
    topic = "Environment";
  } else if (textBlob.match(/ai|artificial|computer|algorithm|digital|tech|machine/)) {
    topic = "Technology";
  } else if (textBlob.match(/school|student|university|learn|academic|pedagog|education/)) {
    topic = "Education";
  } else if (textBlob.match(/city|urban|housing|population|transit|society|social/)) {
    topic = "Society";
  } else if (textBlob.match(/health|disease|medical|mental|well-being|hospital/)) {
    topic = "Health";
  } else if (textBlob.match(/economy|market|finance|inflation|growth|trade|fiscal/)) {
    topic = "Economy";
  }

  return {
    id: "voc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    term,
    item_type,
    topic,
    part_of_speech: pos,
    definition_en: `High-band academic expression (${pos}) relevant to IELTS Writing and journalistic argumentation.`,
    definition_vi: `Thuật ngữ học thuật chuyên sâu mang ý nghĩa trang trọng trong ngữ cảnh IELTS Writing.`,
    ipa: `/${normalized.slice(0, 4)}.../`,
    context_sentence: contextSentence || `"${term}" in academic discourse.`,
    mastery_level: 1,
    created_at: new Date().toLocaleDateString("vi-VN"),
  };
}

/**
 * Fast lookup for Active Recall Cloze Mode tooltip hint
 */
export function getQuickHint(term: string): { pos: string; vi: string } {
  const normalized = term.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  if (ENRICHMENT_LEXICON[normalized]) {
    return {
      pos: ENRICHMENT_LEXICON[normalized].pos,
      vi: ENRICHMENT_LEXICON[normalized].vi,
    };
  }
  const enriched = enrichCapturedTerm(term);
  return {
    pos: enriched.part_of_speech,
    vi: enriched.definition_vi,
  };
}

