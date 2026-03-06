export interface ReadabilityMetrics {
  fleschReadingEase: number; // 0-100, higher = easier
  fleschKincaidGrade: number; // US grade level
  readingTimeMinutes: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  readabilityLevel: 'Very Easy' | 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult';
}

/**
 * Calculate comprehensive readability metrics for a text
 */
export function calculateReadability(text: string): ReadabilityMetrics {
  // Remove extra whitespace and split into sentences
  const cleanText = text.trim().replace(/\s+/g, ' ');

  // Count sentences (split by . ! ? followed by space or end)
  const sentences = cleanText.split(/[.!?]+(?:\s|$)/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  // Count words (split by whitespace)
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Count syllables
  const syllableCount = words.reduce((total, word) => total + countSyllables(word), 0);

  // Calculate averages
  const averageWordsPerSentence = wordCount / sentenceCount;
  const averageSyllablesPerWord = syllableCount / wordCount;

  // Flesch Reading Ease (0-100, higher = easier to read)
  // Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const fleschReadingEase = Math.max(
    0,
    Math.min(
      100,
      206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord
    )
  );

  // Flesch-Kincaid Grade Level (US school grade)
  // Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const fleschKincaidGrade = Math.max(
    0,
    0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59
  );

  // Reading time (average adult reads 200-250 words per minute)
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 225));

  // Determine readability level based on Flesch Reading Ease
  let readabilityLevel: ReadabilityMetrics['readabilityLevel'];
  if (fleschReadingEase >= 80) {
    readabilityLevel = 'Very Easy';
  } else if (fleschReadingEase >= 60) {
    readabilityLevel = 'Easy';
  } else if (fleschReadingEase >= 40) {
    readabilityLevel = 'Moderate';
  } else if (fleschReadingEase >= 20) {
    readabilityLevel = 'Difficult';
  } else {
    readabilityLevel = 'Very Difficult';
  }

  return {
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
    readingTimeMinutes,
    wordCount,
    sentenceCount,
    syllableCount,
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
    averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 100) / 100,
    readabilityLevel,
  };
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;

  // Remove common endings that don't add syllables
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  // Count vowel groups
  const matches = word.match(/[aeiouy]{1,2}/g);
  const syllables = matches ? matches.length : 1;

  return syllables;
}

/**
 * Get a human-readable explanation of the readability score
 */
export function getReadabilityExplanation(metrics: ReadabilityMetrics): string {
  const grade = Math.round(metrics.fleschKincaidGrade);

  if (grade <= 6) {
    return 'Easily understood by 6th graders and below. Very accessible to the general public.';
  } else if (grade <= 8) {
    return 'Easily understood by middle school students. Accessible to most adults.';
  } else if (grade <= 10) {
    return 'Easily understood by high school students. Standard for consumer health information.';
  } else if (grade <= 12) {
    return 'High school level. Suitable for educated general audience.';
  } else if (grade <= 16) {
    return 'College level. May require some background knowledge.';
  } else {
    return 'Graduate/professional level. Intended for specialized audience.';
  }
}

/**
 * Generate a complete readability report
 */
export function generateReadabilityReport(text: string): string {
  const metrics = calculateReadability(text);
  const explanation = getReadabilityExplanation(metrics);

  return `Readability Analysis:
- Reading Level: ${metrics.readabilityLevel} (Grade ${Math.round(metrics.fleschKincaidGrade)})
- Flesch Reading Ease: ${metrics.fleschReadingEase}/100
- Reading Time: ~${metrics.readingTimeMinutes} min
- Word Count: ${metrics.wordCount} words
- Average Sentence Length: ${metrics.averageWordsPerSentence} words

${explanation}`;
}
