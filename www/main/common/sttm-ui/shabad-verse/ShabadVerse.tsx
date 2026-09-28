import React from 'react';
import { GurbaniVerseList, type GurbaniVerse } from '@khalisfoundation/sikhi-ui';
import { i18n } from '../../main-app';
import Icon from '../icon';
import { classNames } from '../../utils';

const FLOWER_VERSE_ID = 61;
// The app's Gurbani Akhar font (controller.scss $gurmukhi-font-family).
const GURMUKHI_FONT = 'gurbaniakhar';

type ShabadVerseProps = {
  /** The active verse's ID, keyed by its line number. */
  activeVerse: Record<number, number>;
  changeHomeVerse: (lineNumber: number) => void;
  /** The home verse's line number (the pane's homeVerse). */
  isHomeVerse: number | false;
  lineNumber: number;
  versesRead: number[];
  activeVerseRef: React.Ref<HTMLDivElement>;
  updateTraversedVerse: (verseId: number | undefined, lineNumber: number) => void;
  verse?: string;
  englishVerse?: string;
  /** Undefined for a line without an ID. */
  verseId?: number;
};

// One line of the verse list: a single-verse sikhi-ui GurbaniVerseList, so the
// list can stay virtualised (ShabadText renders one per row). A tick on the
// left marks verses already shown; the home button on the right sets the home
// verse (always shown on the home verse, on hover elsewhere).
const ShabadVerse = ({
  activeVerse,
  changeHomeVerse,
  isHomeVerse,
  lineNumber,
  versesRead,
  activeVerseRef,
  updateTraversedVerse,
  verse,
  englishVerse,
  verseId,
}: ShabadVerseProps) => {
  const isActive = verseId !== undefined && activeVerse[lineNumber] === verseId;
  const isRead = verseId !== undefined && versesRead.includes(verseId);
  const isFlowerVerse = verseId === FLOWER_VERSE_ID;
  // Announcements carry their text as English markup instead of Gurbani.
  const text = verse || englishVerse?.split('<h1>')[1]?.split('</h1>')[0] || '';
  // Only the text is shown, so there are no transliterations or translations.
  const gurbaniVerse: GurbaniVerse = {
    // Passed on as it is, undefined included, as before.
    verseId: verseId as number,
    shabadId: 0,
    verse: { gurmukhi: text, unicode: text },
    larivaar: { gurmukhi: text, unicode: text },
    transliteration: {} as GurbaniVerse['transliteration'],
    translation: {} as GurbaniVerse['translation'],
    source: { sourceId: '', pageNo: 0 },
  };

  return (
    <div
      id={`line-${lineNumber}`}
      ref={isActive ? activeVerseRef : null}
      onClick={() => updateTraversedVerse(verseId, lineNumber)}
      className={classNames(
        'shabad-verse',
        isActive && 'shabad-verse--active',
        isHomeVerse === lineNumber && 'shabad-verse--home',
        isFlowerVerse && 'shabad-verse--flower',
      )}
    >
      <GurbaniVerseList
        verses={[gurbaniVerse]}
        unicode={!verse}
        fontFamily={verse ? GURMUKHI_FONT : 'inherit'}
        fontSize={1.3}
        lineHeight={1.6}
        highlight={isActive ? verseId : undefined}
        renderLineStart={() =>
          isRead ? <Icon name="check" className="shabad-verse__check" /> : null
        }
        actions={
          isFlowerVerse
            ? undefined
            : [
                {
                  icon: 'home',
                  label: i18n.t('SHABAD_PANE.HOME_VERSE'),
                  onClick: () => changeHomeVerse(lineNumber),
                },
              ]
        }
      />
    </div>
  );
};

export default ShabadVerse;
