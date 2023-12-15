import { useEffect, useRef, useReducer, useState } from "react";

/* 
    Considerations:
        - expensive re-renders
        - caching
        - security
        - input validation    
*/
const initState = {
    verseInput: { bookName: '', chapterNo: 0, verseNo: 0 },
    verses: [],
    abbrevs: [],
    currentVerse: {}
};

function reducer(state, action) {
    switch (action.type) {
        case 'verseInput': return { ...state, verseInput: action.verseInput };
        case 'verses': return { ...state, verses: action.verses };
        case 'abbrevs': return { ...state, abbrevs: action.abbrevs };
        case 'currentVerse': return { ...state, currentVerse: action.currentVerse };
        default: return state;
    }
}

function Verses({ verses, currentVerse }) {
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

export default function Bible() {
    // States
    const [currentInput, setCurrentInput] = useState({ bookName: '', chapterNo: 0, verseNo: 0 });
    const [state, dispatch] = useReducer(reducer, initState);
    const [verseItems, currentVerseRef, displayRef] = Verses({ verses: state.verses, currentVerse: state.currentVerse });

    useEffect(() => {
        // SET STATE: abbrevs
        if (state.abbrevs.length === 0) {
            fetch('https://localhost:7270/v1/books/abbreviations')
                .then(res => res.json())
                .then(data => dispatch({ type: 'abbrevs', abbrevs: data }))
                .catch(console.error);
        }

        // SET STATE: currentVerse
        const currentVerse = state.currentVerse;
        const verseInput = state.verseInput;
        const verses = state.verses;
        if (verses.length !== 0 && verseInput.verse !== 0 && Object.keys(currentVerse) !== 0) {
            if (currentVerse.verseNo !== verseInput.verseNo || currentVerse.chapterNo !== verseInput.chapterNo) {
                dispatch({ type: 'currentVerse', currentVerse: verses.find(v => v.verseNo === verseInput.verseNo) });
            }
        }

        // scroll verse into view
        if (!Object.is(displayRef.current, null) && !Object.is(currentVerseRef.current, null)) {
            displayRef.current.scrollTop = currentVerseRef.current.offsetTop;
        }

    }, [state, currentVerseRef, displayRef]);

    // form handlers
    async function handleSubmit(e) {
        e.preventDefault();
        // SET STATE: verseInput
        dispatch({ type: 'verseInput', verseInput: currentInput });

        // SET STATE: verses
        const abbrev = state.abbrevs.find(a => a.abbreviation.toLowerCase() === currentInput.bookName);
        dispatch({
            type: 'verses', 
            verses: await fetch(`https://localhost:7270/v1/books/${abbrev.bookId}/verses?chapterNo=${currentInput.chapterNo}`)
                .then(res => res.json())
                .catch(console.error)
        });
    }

    function handleChange(e) {
        // STATE: currentInput
        const input = e.target.value.toLowerCase().split(/\s+/);
        setCurrentInput({ bookName: input[0], chapterNo: Number(input[1]), verseNo: Number(input[2]) });
    }

    return <section className="bible">
        <form onSubmit={handleSubmit}>
            <input type="text" onChange={handleChange} name="verseInput" placeholder="Verse Search: ctrl + /" />
            <input type="submit" id="submit" />
        </form>
        {verseItems}
    </section>;
}