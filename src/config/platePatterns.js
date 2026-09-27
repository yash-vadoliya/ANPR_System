// State and UT Codes
export const VALID_STATE_CODES = [
  'AN', 'AP', 'AR', 'AS', 'BR', 'CG', 'CH', 'DD', 'DN', 'DL',
  'GA', 'GJ', 'HR', 'HP', 'JH', 'JK', 'KA', 'KL', 'LA', 'LD',
  'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD', 'OR', 'PB', 'PY',
  'RJ', 'SK', 'TN', 'TG', 'TS', 'TR', 'UP', 'UK', 'UA', 'WB'
];

function normalizeOcrErrors(str) {
  return str
    .replace(/[@#$_-]/g, '')
    .replace(/\s+/g, '')
    .replace(/\|/g, '')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase();
}

function buildPlateVariants(text) {
  const base = normalizeOcrErrors(text);
  const variants = new Set([base]);

  const replacements = [
    [/O/g, '0'],
    [/0/g, 'O'],
    [/I/g, '1'],
    [/1/g, 'I'],
    [/Z/g, '2'],
    [/2/g, 'Z'],
    [/S/g, '5'],
    [/5/g, 'S'],
    [/B/g, '8'],
    [/8/g, 'B']
  ];

  for (const [pattern, value] of replacements) {
    variants.add(base.replace(pattern, value));
  }

  return [...variants];
}

/**
 * Validates and cleans raw detected text
 */
export function validateNumberPlate(rawText) {
  if (!rawText) return null;

  const variants = buildPlateVariants(rawText);

  for (const text of variants) {
    const bhMatch = text.match(/([0-9]{2})\s*(BH)\s*([0-9]{4})\s*([A-Z]{1,2})/i);
    if (bhMatch) {
      const plate = `${bhMatch[1]} BH ${bhMatch[3]} ${bhMatch[4]}`.toUpperCase();
      return { plateNumber: plate, type: 'BH Series', isValid: true };
    }

    for (const state of VALID_STATE_CODES) {
      const idx = text.indexOf(state);
      if (idx !== -1) {
        const sub = text.substring(idx);
        const match = sub.match(/([A-Z]{2})\s*([0-9]{1,2})\s*([A-Z]{1,3})\s*([0-9]{1,4})/i);
        if (match) {
          const rto = match[2].padStart(2, '0');
          const series = match[3].toUpperCase();
          const number = match[4];
          const formatted = `${match[1]} ${rto} ${series} ${number}`;
          return { plateNumber: formatted, type: 'Standard Indian', isValid: true };
        }
      }
    }

    const genericMatch = text.match(/([A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{3,4})/i);
    if (genericMatch) {
      return { plateNumber: genericMatch[1].toUpperCase(), type: 'Standard Indian', isValid: true };
    }
  }

  return null;
}