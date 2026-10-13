export type GrammarPatternType =
  | "inversion"
  | "cleft_sentence"
  | "reduced_clause"
  | "conditional_inversion"
  | "passive_reporting";

export interface DetectedPattern {
  id: string;
  type: GrammarPatternType;
  name: string;
  bandTarget: "7.5" | "8.0" | "8.5+";
  matchedPhrase: string;
  fullSentence: string;
  explanation: string;
  graRationale: string;
}

export function scanSyntacticPatterns(text: string): DetectedPattern[] {
  if (!text || text.trim().length === 0) return [];

  // Split into sentences using regex boundary
  const sentences = text.split(/(?<=[.?!])\s+/);
  const detected: DetectedPattern[] = [];

  sentences.forEach((sentence, idx) => {
    const s = sentence.trim();
    if (!s) return;

    // 1. INVERSION (Đảo ngữ)
    // Matches "Not only ... but also", "Seldom", "Rarely", "Hardly ... when", "Only by", "Only when"
    const inversionRegex = /\b(not only\b.*?\bbut (also)?|seldom\b|rarely\b|hardly\b.*?\bwhen|only (by|when|if|through)\b)/i;
    const invMatch = s.match(inversionRegex);
    if (invMatch) {
      detected.push({
        id: `inv-${idx}`,
        type: "inversion",
        name: "Negative / Limiting Inversion (Đảo ngữ nhấn mạnh)",
        bandTarget: "8.0",
        matchedPhrase: invMatch[0],
        fullSentence: s,
        explanation: `Sử dụng cấu trúc đảo ngữ với cụm từ '${invMatch[0]}' để tạo trọng âm ngữ pháp và tăng tính học thuật cho luận điểm.`,
        graRationale: "Giám khảo IELTS đánh giá rất cao cấu trúc đảo ngữ vì nó chứng minh khả năng biến hóa cú pháp đa dạng ngoài trật tự S-V-O thông thường.",
      });
    }

    // 2. CLEFT SENTENCES (Câu chẻ)
    // Matches "It is/was ... that/who", "What ... is/was"
    const cleftRegex = /\b(it (is|was)\b.*?\b(that|who|which)\b|^what\b.*?\b(is|was)\b)/i;
    const cleftMatch = s.match(cleftRegex);
    if (cleftMatch && !invMatch) {
      detected.push({
        id: `cleft-${idx}`,
        type: "cleft_sentence",
        name: "Cleft Sentence (Câu chẻ nhấn mạnh trọng tâm)",
        bandTarget: "7.5",
        matchedPhrase: cleftMatch[0],
        fullSentence: s,
        explanation: `Cấu trúc câu chẻ '${cleftMatch[0]}' cô lập chủ ngữ/tân ngữ để hướng người đọc tập trung vào luận cứ quan trọng nhất.`,
        graRationale: "Thể hiện năng lực kiểm soát tiêu điểm thông tin (Information Packaging), tiêu chí cốt lõi trong tiêu chí Grammatical Range Band 7.5+.",
      });
    }

    // 3. CONDITIONAL INVERSION (Đảo ngữ điều kiện)
    // Matches "Were it not for", "Had it not been for", "Should you", "Were they to"
    const condInvRegex = /\b(were it not for|had it not been for|should (we|you|governments|citizens|authorities)\b|were (they|we|it) to\b)/i;
    const condMatch = s.match(condInvRegex);
    if (condMatch) {
      detected.push({
        id: `cond-${idx}`,
        type: "conditional_inversion",
        name: "Conditional Inversion (Đảo ngữ câu điều kiện không 'If')",
        bandTarget: "8.5+",
        matchedPhrase: condMatch[0],
        fullSentence: s,
        explanation: `Bỏ liên từ 'If' và đảo trợ động từ '${condMatch[0]}' lên đầu mệnh đề mang lại phong cách viết luận chuẩn mực của giới học giả.`,
        graRationale: "Điểm tuyệt đối về sự phức tạp ngữ pháp (Sophisticated Syntactic Control) giúp bài viết tiệm cận Band 8.5–9.0.",
      });
    }

    // 4. PASSIVE REPORTING STRUCTURES (Thể bị động khách quan)
    // Matches "It is widely acknowledged/believed/argued/assumed that", "is believed to", "is deemed to"
    const passiveRegex = /\b(it is (widely|generally|commonly|frequently)? ?(acknowledged|believed|argued|assumed|recognized|evident) that|(is|are|was|were) (believed|thought|estimated|deemed|expected) to\b)/i;
    const passMatch = s.match(passiveRegex);
    if (passMatch) {
      detected.push({
        id: `pass-${idx}`,
        type: "passive_reporting",
        name: "Impersonal Passive Reporting (Bị động khách quan / Khách quan hóa)",
        bandTarget: "7.5",
        matchedPhrase: passMatch[0],
        fullSentence: s,
        explanation: `Diễn đạt khách quan với '${passMatch[0]}' giúp né tránh đại từ nhân xưng 'I/You', gia tăng tính học thuật và độ tin cậy cho bài viết luận.`,
        graRationale: "Loại bỏ tính chủ quan trong văn phong học thuật (Hedging & Objective Tone), yêu cầu bắt buộc của Task 2 band cao.",
      });
    }

    // 5. REDUCED RELATIVE CLAUSES (Mệnh đề phân từ rút gọn)
    // Matches participle phrases following comma: ", ranging from", ", exacerbating", ", integrated into"
    const reducedRegex = /,\s+([a-z]+ing|[a-z]+ed)\b.*?(?=,|\.|\;)/i;
    const redMatch = s.match(reducedRegex);
    if (redMatch && !invMatch && !cleftMatch) {
      detected.push({
        id: `red-${idx}`,
        type: "reduced_clause",
        name: "Reduced Participle Clause (Mệnh đề quan hệ rút gọn)",
        bandTarget: "7.5",
        matchedPhrase: redMatch[0],
        fullSentence: s,
        explanation: `Rút gọn mệnh đề bằng phân từ '${redMatch[0].slice(0, 30)}...' làm câu văn cô đọng, súc tích và mạch lạc hơn.`,
        graRationale: "Thể hiện khả năng cô đọng câu phức (Sentence Economy & Syntactic Compression) đặc trưng của văn phong báo chí quốc tế.",
      });
    }
  });

  return detected;
}
