import { useEffect, useReducer, useState } from "react";
import Verses from "./Verses";
/* 
    Considerations:
        - expensive re-renders
        - caching
        - security
        - input validation    
*/
const initState = {
    verseInput: { bookId: '', bookName: '', chapterNo: null, verseNo: null },
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

export default function Bible() {
    // States
    const [currentInput, setCurrentInput] = useState({});
    const [state, dispatch] = useReducer(reducer, initState);
    const [verseItems, currentVerseRef, displayRef] = Verses({ verses: state.verses, currentVerse: state.currentVerse });

    useEffect(() => {
        if (currentInput.validInput) {
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
        }

        // SET STATE: abbrevs
        if (state.abbrevs.length === 0) {
            fetch('https://localhost:7270/v1/books/abbreviations')
                .then(res => res.json())
                .then(data => dispatch({ type: 'abbrevs', abbrevs: data }))
                .catch(console.error);
        }
    }, [state, currentVerseRef, displayRef, currentInput]);

    // form handlers
    async function handleSubmit(e) {
        e.preventDefault();
        if (currentInput.validInput) {
            // SET STATE: verseInput
            dispatch({ type: 'verseInput', verseInput: currentInput });

            // SET STATE: verses
            dispatch({
                type: 'verses',
                verses: await fetch(`https://localhost:7270/v1/books/${currentInput.bookId}/verses?chapterNo=${currentInput.chapterNo}`)
                    .then(res => res.json())
                    .catch(console.error)
            });
        }
    }

    function handleChange(e) {
        let validInput = true;
        const input = e.target.value.toLowerCase().split(/\s+/);
        const inputLength = input.length;
        const verseNo = input[inputLength - 1];
        const chapterNo = input[inputLength - 2];
        const bookName = () => {
            if (inputLength === 3) {
                return input[0];
            }
            if (inputLength === 4) {
                return `${input[0]} ${input[1]}`;
            }
            return `${input[0]} ${input[1]} ${input[2]}`;
        };

        // check empty
        if (bookName === '' || chapterNo === '' || verseNo === '') {
            validInput = false;
        }

        // check last two values are number & not zero
        else if (isNaN(chapterNo) || isNaN(verseNo)) {
            validInput = false;
        }

        // check abbreviations exist
        const abbrev = state.abbrevs.find(a => a.abbreviation.toLowerCase() === bookName());
        if (typeof abbrev === 'undefined') {
            console.log('abbrev is does not exist');
            validInput = false;
        }

        // SET STATE: currentInput
        if (validInput) {
            console.log('valid input');
            setCurrentInput({
                ...currentInput,
                bookId: abbrev.bookId,
                bookName: bookName(),
                chapterNo: Number(input[1]),
                verseNo: Number(input[2]),
                validInput: true
            });
        }
    }

    return <section className="bible">
        <form onSubmit={handleSubmit}>
            <input type="text" onChange={handleChange} name="verseInput" placeholder="Verse Search: ctrl + /" />
            <input type="submit" id="submit" />
        </form>
        {verseItems}
    </section>;
}