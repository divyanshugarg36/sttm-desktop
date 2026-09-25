import React from 'react';
import PropTypes from 'prop-types';
import { GurbaniVerseList } from '@khalisfoundation/sikhi-ui';
import Icon from '../icon';
import { classNames } from '../../utils';

const FLOWER_VERSE_ID = 61;
// The app's Gurbani Akhar font (controller.scss $gurmukhi-font-family).
const GURMUKHI_FONT = 'gurbaniakhar';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

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
}) => {
  const isActive = verseId !== undefined && activeVerse[lineNumber] === verseId;
  const isRead = versesRead.includes(verseId);
  const isFlowerVerse = verseId === FLOWER_VERSE_ID;
  // Announcements carry their text as English markup instead of Gurbani.
  const text = verse || englishVerse?.split('<h1>')[1]?.split('</h1>')[0] || '';
  const gurbaniVerse = {
    verseId,
    shabadId: 0,
    verse: { gurmukhi: text, unicode: text },
    larivaar: { gurmukhi: text, unicode: text },
    transliteration: {},
    translation: {},
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
        isFlowerVerse && 'flower-verse',
      )}
    >
      <GurbaniVerseList
        verses={[gurbaniVerse]}
        unicode={!verse}
        fontFamily={verse ? GURMUKHI_FONT : 'inherit'}
        fontSize={1.3}
        lineHeight={1.6}
        highlight={isActive ? verseId : undefined}
        renderLineStart={() => (isRead ? <Icon name="check" className="check-icon" /> : null)}
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

ShabadVerse.propTypes = {
  activeVerse: PropTypes.object,
  changeHomeVerse: PropTypes.func,
  isHomeVerse: PropTypes.number,
  lineNumber: PropTypes.number,
  versesRead: PropTypes.array,
  activeVerseRef: PropTypes.object,
  updateTraversedVerse: PropTypes.func,
  verse: PropTypes.string,
  englishVerse: PropTypes.string,
  verseId: PropTypes.number,
};

export default ShabadVerse;
