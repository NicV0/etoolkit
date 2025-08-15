export function redactPII(s: string) {
  return s
    .replace(/\b[\w.-]+@[\w.-]+\.[A-Za-z]{2,6}\b/g, '[email]')
    .replace(/\b\+?\d[\d\s().-]{6,}\b/g, '[phone]');
}

export function safeShare(text: string, mode: 'internal'|'external') {
  return mode==='external' ? redactPII(text) : text;
}
