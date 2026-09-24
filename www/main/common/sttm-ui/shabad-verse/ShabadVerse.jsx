import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../icon';

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
  const loadActiveClass = (verseObj, currentVerseId, verseIndex) =>
    Object.keys(verseObj).map((verseKey) => {
      if (Number(verseKey) === verseIndex && verseObj[verseKey] === currentVerseId) {
        return true;
      }
      return false;
    })[0];

  return (
    <li
      id={`line-${lineNumber}`}
      value={lineNumber}
      ref={loadActiveClass(activeVerse, verseId, lineNumber) ? activeVerseRef : null}
      className={`shabad-pane-list shabad-li ${
        loadActiveClass(activeVerse, verseId, lineNumber) ? 'shabad-pane-active' : ''
      }`}
    >
      <span className="shabad-pane-controls">
        {versesRead.map(
          (isRead, index) => isRead === verseId && <Icon key={index} name="check" className="check-icon" />,
        )}
      </span>
      {verse ? (
        <span
          className={`gurmukhi verse-content ${verseId === 61 ? 'flower-verse' : ''}`}
          onClick={() => {
            updateTraversedVerse(verseId, lineNumber);
          }}
        >
          {verse}
        </span>
      ) : (
        <span
          className="verse-content"
          onClick={() => {
            updateTraversedVerse(verseId, lineNumber);
          }}
        >
          {englishVerse && englishVerse.split('<h1>')[1].split('</h1>')[0]}
        </span>
      )}
      <Icon
        name="home"
        onClick={() => changeHomeVerse(lineNumber)}
        className={`home-icon ${isHomeVerse !== lineNumber ? 'hoverIcon' : ''}`.trim()}
      />
    </li>
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
