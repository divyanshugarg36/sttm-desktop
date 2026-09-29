// The i18n key naming a slide line by the content it shows (a content id such
// as 'translation-english' or 'teeka-punjabi').
export const contentLabelKey = (content = ''): string => {
  if (content.includes('gurbani')) return 'QUICK_TOOLS.BANI';
  if (content.includes('announcements')) return 'QUICK_TOOLS.ANNOUNCEMENTS';
  if (content.includes('teeka')) return 'QUICK_TOOLS.TEEKA';
  if (content.includes('translation')) return 'QUICK_TOOLS.TRANSLATION';
  if (content.includes('transliteration')) return 'QUICK_TOOLS.TRANSLITERATION';
  return '';
};
