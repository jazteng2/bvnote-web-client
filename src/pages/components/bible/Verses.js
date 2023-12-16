import { useRef } from 'react';

export default function Verses({ verses, currentVerse }) {
    const verse = useRef(null);
    const verseDisplay = useRef(null);
    const verseItems =
        verses.map((value, index) => {
            return <div
                ref={value.verseId === currentVerse.verseId ? verse : null}
                className={value.verseId === currentVerse.verseId ? "verses-current" : "verses-item"}
                key={value.verseId}
            >
                <span>{index + 1}</span>
                {value.content}
            </div>
        });

    return [
        <div className="verses" ref={verseDisplay}> {verses.length === 0
            ? <div className="verses-placeholder">Verses displays here</div> : verseItems
        } </div>,
        verse,
        verseDisplay
    ];
}
