/**
 * Audio & Speech Pronunciation Clarity Engine
 * 
 * Provides phonetic expansion, currency-to-words normalization,
 * natural breathing pauses, and accent/voice selection algorithms
 * so Web SpeechSynthesis speaks with pristine, crystal-clear articulation.
 */

export interface SpeechFormatOptions {
  currencyCode?: string;
  clarityMode?: 'high_clarity' | 'natural' | 'crisp_slow';
  expandAcronyms?: boolean;
}

export interface VoiceLanguageOption {
  code: string;
  name: string;
  accent: string;
  flag: string;
  recommendedVoices: string[];
  clarityTip?: string;
}

export const SUPPORTED_VOICE_LANGUAGES: VoiceLanguageOption[] = [
  {
    code: 'en-US',
    name: 'English (United States)',
    accent: 'American Clear',
    flag: '🇺🇸',
    recommendedVoices: ['Natural', 'Google US English', 'Samantha', 'Jenny', 'Guy', 'Aria'],
    clarityTip: 'Standard American articulation and natural pacing',
  },
  {
    code: 'en-IN',
    name: 'English (India)',
    accent: 'Indian Pronunciation',
    flag: '🇮🇳',
    recommendedVoices: ['Neerja', 'Rishi', 'Google हिन्दी', 'Heera', 'India', 'en-IN'],
    clarityTip: 'Indian English rhythm, clear enunciation of numbers & names',
  },
  {
    code: 'en-GB',
    name: 'English (United Kingdom)',
    accent: 'British Received',
    flag: '🇬🇧',
    recommendedVoices: ['Natural', 'Google UK English Female', 'Daniel', 'Sonia', 'Libby', 'George'],
    clarityTip: 'Crisp British Received Pronunciation',
  },
  {
    code: 'en-AU',
    name: 'English (Australia)',
    accent: 'Australian Accent',
    flag: '🇦🇺',
    recommendedVoices: ['Natural', 'Google Australia', 'Karen', 'Natasha', 'Russell'],
    clarityTip: 'Australian inflection and cadence',
  },
  {
    code: 'en-CA',
    name: 'English (Canada)',
    accent: 'Canadian Accent',
    flag: '🇨🇦',
    recommendedVoices: ['Natural', 'Clara', 'Liam'],
    clarityTip: 'Clear North American Canadian enunciation',
  },
];

/**
 * Normalizes numbers with currency symbols into readable words:
 * e.g. "$5.00" -> "5 dollars"
 * e.g. "$125.50" -> "125 dollars and 50 cents"
 */
function expandCurrency(text: string): string {
  let s = text;

  // USD / General Dollar: $X or $X.YY
  s = s.replace(/\$(\d+(?:,\d{3})*(?:\.\d{1,2})?)/g, (m, val) => {
    const rawNum = parseFloat(val.replace(/,/g, ''));
    if (isNaN(rawNum)) return m;
    const dollars = Math.floor(rawNum);
    const cents = Math.round((rawNum - dollars) * 100);
    if (cents > 0) {
      return `${dollars} dollar${dollars === 1 ? '' : 's'} and ${cents} cent${cents === 1 ? '' : 's'}`;
    }
    return `${dollars} dollar${dollars === 1 ? '' : 's'}`;
  });

  // Euros: €X
  s = s.replace(/€(\d+(?:,\d{3})*(?:\.\d{1,2})?)/g, (m, val) => {
    const rawNum = parseFloat(val.replace(/,/g, ''));
    if (isNaN(rawNum)) return m;
    return `${rawNum} euro${rawNum === 1 ? '' : 's'}`;
  });

  // British Pounds: £X
  s = s.replace(/£(\d+(?:,\d{3})*(?:\.\d{1,2})?)/g, (m, val) => {
    const rawNum = parseFloat(val.replace(/,/g, ''));
    if (isNaN(rawNum)) return m;
    return `${rawNum} pound${rawNum === 1 ? '' : 's'}`;
  });

  // Indian Rupees: ₹X
  s = s.replace(/₹(\d+(?:,\d{3})*(?:\.\d{1,2})?)/g, (m, val) => {
    const rawNum = parseFloat(val.replace(/,/g, ''));
    if (isNaN(rawNum)) return m;
    return `${rawNum} rupee${rawNum === 1 ? '' : 's'}`;
  });

  return s;
}

/**
 * Transforms written text into phonetically distinct and natural spoken language.
 * Ensures numbers, invoice IDs, acronyms, and units are spoken clearly.
 */
export function formatTextForSpeech(
  rawText: string,
  options: SpeechFormatOptions = {}
): string {
  if (!rawText) return '';
  let s = rawText.trim();

  // 1. Remove Markdown syntax (bold, italics, backticks) that confuse speech synthesizers
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/\*([^*]+)\*/g, '$1');
  s = s.replace(/`([^`]+)`/g, '$1');
  s = s.replace(/#+\s+/g, '');

  // 2. Expand Document Identifiers (e.g. "INV-2026-0004" -> "invoice number 4")
  s = s.replace(/\bINV-(\d{4})-(\d+)\b/gi, (m, yr, num) => `invoice number ${parseInt(num, 10)}`);
  s = s.replace(/\bINV-(\d+)\b/gi, (m, num) => `invoice number ${parseInt(num, 10)}`);
  s = s.replace(/\bBILL-(\d{4})-(\d+)\b/gi, (m, yr, num) => `bill number ${parseInt(num, 10)}`);
  s = s.replace(/\bBILL-(\d+)\b/gi, (m, num) => `bill number ${parseInt(num, 10)}`);
  s = s.replace(/\bPO-(\d{4})-(\d+)\b/gi, (m, yr, num) => `purchase order number ${parseInt(num, 10)}`);
  s = s.replace(/\bVCH-(\d{4})-(\d+)\b/gi, (m, yr, num) => `voucher number ${parseInt(num, 10)}`);
  s = s.replace(/\bSKU-(\d+)\b/gi, (m, num) => `S-K-U ${num}`);

  // 3. Units & Measurements (must happen BEFORE acronym letter splitting)
  s = s.replace(/\b1\s*(?:pc|pcs|piece)\b/gi, '1 piece');
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*(?:pcs|pieces|pc)\b/gi, '$1 pieces');
  s = s.replace(/\b1\s*(?:unit|item|nos)\b/gi, '1 unit');
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*(?:units|items|nos)\b/gi, '$1 units');
  s = s.replace(/\b1\s*(?:box)\b/gi, '1 box');
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*(?:boxes)\b/gi, '$1 boxes');
  s = s.replace(/\b1\s*(?:hr|hour)\b/gi, '1 hour');
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*(?:hrs|hours)\b/gi, '$1 hours');
  s = s.replace(/\b1\s*(?:kg)\b/gi, '1 kilogram');
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*(?:kg|kgs)\b/gi, '$1 kilograms');
  s = s.replace(/\bqty\b/gi, 'quantity');
  s = s.replace(/\bea\b/gi, 'each');

  // 4. Currency symbols
  s = expandCurrency(s);

  // 5. Financial terms & Acronyms expansion
  s = s.replace(/\bP&L\b/gi, 'Profit and Loss');
  s = s.replace(/\bCOGS\b/gi, 'Cost of Goods Sold');
  s = s.replace(/\bEBITDA\b/gi, 'E-bit-dah');
  s = s.replace(/\bROI\b/gi, 'Return on Investment');
  s = s.replace(/\bOCR\b/gi, 'O-C-R');
  s = s.replace(/\bVAT\b/gi, 'V-A-T');
  s = s.replace(/\bGST\b/gi, 'G-S-T');
  s = s.replace(/\bARR\b/gi, 'Annual Recurring Revenue');
  s = s.replace(/\bMRR\b/gi, 'Monthly Recurring Revenue');
  s = s.replace(/\bFY(\d{2,4})\b/gi, 'Fiscal Year $1');
  s = s.replace(/\bQ([1-4])\b/gi, 'Quarter $1');

  // 6. Conversational symbols & connectives
  s = s.replace(/\s+&\s+/g, ' and ');
  s = s.replace(/\bvs\.?\b/gi, 'versus');
  s = s.replace(/\bw\/\b/gi, 'with ');
  s = s.replace(/@/g, ' at the rate of ');
  s = s.replace(/%/g, ' percent');

  // 7. Clear pronunciation for test words, acronyms, and single letters
  // e.g. "abc" -> "A-B-C", "xyz" -> "X-Y-Z", "ttt" -> "T-T-T"
  s = s.replace(/\babc\b/gi, 'A-B-C');
  s = s.replace(/\bxyz\b/gi, 'X-Y-Z');
  s = s.replace(/\bttt\b/gi, 'T-T-T');
  // Any 2-4 identical consonants (e.g. "aaa", "bbb", "zzz")
  s = s.replace(/\b([a-zA-Z])\1{1,3}\b/g, (m) => m.toUpperCase().split('').join('-'));

  // 8. Natural phrasing & breathing pauses
  s = s.replace(/\bat rate\b/gi, ', at the rate of');
  s = s.replace(/\bTotal invoice amount is\b/gi, '. The total invoice amount is');
  s = s.replace(/\bTotal bill is\b/gi, '. The total bill is');
  s = s.replace(/\bTotal amount is\b/gi, '. The total amount is');

  // 9. Clean up awkward punctuation or double spaces
  s = s.replace(/\s*,\s*,+/g, ', ');
  s = s.replace(/\s*\.\s*\.+/g, '. ');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Finds the highest quality, most natural sounding voice for a given language code.
 * Filters out foreign voices and prioritizes Natural / Neural / Studio voices.
 */
export function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  targetLanguageCode: string = 'en-US',
  preferredVoiceUri?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. If user explicitly specified a voiceURI and it exists, use it
  if (preferredVoiceUri) {
    const explicit = voices.find((v) => v.voiceURI === preferredVoiceUri);
    if (explicit) return explicit;
  }

  // 2. Normalize target language prefix (e.g., 'en-US' -> 'en-us')
  const cleanTarget = targetLanguageCode.toLowerCase();
  const langPrefix = cleanTarget.split('-')[0]; // 'en'

  // Filter voices that match the exact language (e.g. en-IN or en-US)
  const exactLangVoices = voices.filter((v) => v.lang.toLowerCase().replace('_', '-') === cleanTarget);

  // Filter voices that match the language family (e.g. 'en')
  const familyVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

  const candidatePool = exactLangVoices.length > 0 ? exactLangVoices : familyVoices;
  if (candidatePool.length === 0) {
    // Fallback to any voice available
    return voices[0] || null;
  }

  // 3. Priority rankings for clarity and natural human tone:
  // High quality markers: Natural, Neural, Online, Google, Siri, Samantha, Daniel, Rishi, Sonia, Heera
  const priorityKeywords = [
    'natural',
    'neural',
    'online',
    'google',
    'siri',
    'samantha',
    'daniel',
    'rishi',
    'neerja',
    'sonia',
    'karen',
    'oliver',
    'serena',
    'premium',
    'studio',
  ];

  // First check within exact language candidates
  for (const kw of priorityKeywords) {
    const matched = candidatePool.find((v) => v.name.toLowerCase().includes(kw));
    if (matched) return matched;
  }

  // Next return the default voice if it matches language
  const defaultVoice = candidatePool.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  return candidatePool[0] || null;
}

/**
 * Calculates recommended speech rate and pitch based on user clarity mode
 */
export function getClarityAudioConfig(clarityMode: 'high_clarity' | 'natural' | 'crisp_slow' = 'high_clarity'): {
  rate: number;
  pitch: number;
} {
  switch (clarityMode) {
    case 'crisp_slow':
      // Deliberate, extra space between syllables for highest intelligibility
      return { rate: 0.85, pitch: 1.0 };
    case 'high_clarity':
      // Crisp, slightly relaxed rate that prevents words and numbers from blurring
      return { rate: 0.92, pitch: 1.0 };
    case 'natural':
    default:
      return { rate: 1.0, pitch: 1.0 };
  }
}
