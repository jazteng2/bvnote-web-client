import { useEffect, useRef, useReducer, useState } from "react";
function reducer(state, action) {
    switch (action.type) {
        case 'verseInput': {
            return { ...state, verseInput: action.verseInput };
        }
        case 'verses': {
            return { ...state, verses: action.verses };
        }
        case 'abbrevs': {
            return { ...state, abbrevs: action.abbrevs };
        }
        case 'currentVerse': {
            return { ...state, currentVerse: action.currentVerse };
        }
        default:
            return state;
    }
}

function Verses({ verses, currentVerse, display }) {
    // centering verse in container view
    const [box_ypos, setBox_ypos] = useState(0);
    const verse = useRef(null);
    const box_center_y_pos = (box) => {
        const rect = box.getBoundingClientRect();
        return setBox_ypos(rect.top + (rect.height / 2));
    };

    useEffect(() => {
        if (display !== null && verse !== null) {
            setBox_ypos(box_center_y_pos(display));
        }
    }, [display]);

    // display when no verses
    if (verses.length === 0) {
        return <div className="verses-placeholder">Verses displays here</div>;
    }

    return verses.map((value, index) => {
        if (Object.keys(currentVerse) !== 0 && value.verseId === currentVerse.verseId) {
            // highlight current verse
            return <div style={{
                position: 'relative',
                top: `${box_ypos}px`
            }} ref={verse} className="verses-current" key={value.verseId}><span>{index + 1}</span>{value.content}</div>
        }
        return <div className="verses-item" key={value.verseId}><span>{index + 1}</span>{value.content}</div>;
    });
}
export default function Bible() {
    const initState = {
        verseInput: { bookName: '', chapterNo: 0, verseNo: 0 },
        verses: [],
        abbrevs: [],
        currentVerse: {}
    };
    const [state, dispatch] = useReducer(reducer, initState);
    const versesRef = useRef(null);
    const getChapterVerses = async (bookId, chapterNo) => await fetch(`https://localhost:7270/v1/books/${bookId}/verses?chapterNo=${chapterNo}`)
        .then(res => res.json())
        .catch(console.error);

    useEffect(() => {
        // STATE: abbrevs
        if (state.abbrevs.length === 0) {
            fetch('https://localhost:7270/v1/books/abbreviations')
                .then(res => res.json())
                .then(data => dispatch({ type: 'abbrevs', abbrevs: data }))
                .catch(console.error);
        }
        
        // STATE: currentVerse
        const currentVerse = state.currentVerse;
        const verseInput = state.verseInput;
        const verses = state.verses;
        if (verses.length !== 0 && verseInput.verse !== 0 && Object.keys(currentVerse) !== 0) {
            if (state.currentVerse.verseNo !== verseInput.verseNo) {
                dispatch({ type: 'currentVerse', currentVerse: verses.find(v => v.verseNo === verseInput.verseNo) });
            }
        }

    }, [state]);

    // form handlers
    async function handleSubmit(e) {
        e.preventDefault();

        // STATE: verses
        const verseInput = state.verseInput;
        const abbrev = state.abbrevs.find(a => a.abbreviation.toLowerCase() === verseInput.bookName);
        dispatch({ type: 'verses', verses: await getChapterVerses(abbrev.bookId, verseInput.chapterNo) });
    }

    function handleChange(e) {
        // STATE: verseInput
        const input = e.target.value.toLowerCase().split(/\s+/);
        dispatch({ type: 'verseInput', verseInput: { bookName: input[0], chapterNo: Number(input[1]), verseNo: Number(input[2]) } });
    }

    return (
        <section className="bible">
            <form onSubmit={handleSubmit}>
                <input type="text" onChange={handleChange} name="verseInput" placeholder="Verse Search: ctrl + /" />
                <input type="submit" id="submit" />
            </form>
            <div className="verses" ref={versesRef}>
                <Verses
                    verses={state.verses}
                    currentVerse={state.currentVerse}
                    display={versesRef.current}
                />
            </div>
        </section>
    );
}