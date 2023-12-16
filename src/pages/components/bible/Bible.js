import { useEffect, useReducer, useState } from "react";
import Verses from "./Verses";

/* 
    Considerations:
        - expensive re-renders
        - caching
        - security
        - input validation    
*/

export default function Bible() {
    // States
    const [currentInput, setCurrentInput] = useState({});
    const [prevInput, setPrevInput] = useState({});
    const [verses, setVerses] = useState([]);
    const [abbrevs, setAbbrevs] = useState([]);
    const [currentVerse, setCurrentVerse] = useState({});
    const [currentVerseRef, displayRef] = Verses({ verses: verses, currentVerse: currentVerse });

    useEffect(() => {
        if (abbrevs.length > 0) return;

        fetch('https://localhost:7270/v1/books/abbreviations')
            .then(res => res.json())
            .then(data => setAbbrevs(data))
            .catch(console.error);
    }, [])

    // form handlers
    async function handleSubmit(e) {
        e.preventDefault();

        if (!currentInput.validInput) return;

        const verses = await fetch(`https://localhost:7270/v1/books/${currentInput.bookId}/verses?chapterNo=${currentInput.chapterNo}`)
            .then(res => res.json())
            .catch(console.error)

        // SET STATE: currentVerse
        if (verses.length !== 0 && prevInput.verse !== 0 && Object.keys(currentVerse) !== 0) {
            if (currentVerse.verseNo !== prevInput.verseNo || currentVerse.chapterNo !== prevInput.chapterNo) {
                setCurrentVerse(verses.find(v => v.verseNo === prevInput.verseNo));
            }
        }

        // scroll verse into view
        if (!Object.is(displayRef.current, null) && !Object.is(currentVerseRef.current, null)) {
            displayRef.current.scrollTop = currentVerseRef.current.offsetTop;
        }

        setVerses(verses);
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
        const abbrev = abbrevs.find(a => a.abbreviation.toLowerCase() === bookName());
        if (typeof abbrev === 'undefined') {
            console.log('abbrev is does not exist');
            validInput = false;
        }

        // SET STATE: currentInput
        if (validInput) {
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
        <VersesDisplay verses={verses} currentVerse={currentVerse} />
    </section>;
}

function VersesDisplay({ verses, currentVerse }) {
    return (
        <div className="verses">
            {
                verses.length === 0 && (
                    <div className="verses-placeholder">Verses displays here</div>
                )
            }
            {
                verses?.map((value, index) => (
                    <div
                        className={value.verseId === currentVerse.verseId ? "verses-current" : "verses-item"}
                        key={value.verseId}
                    >
                        <span>{index + 1}</span>
                        {value.content}
                    </div>
                ))
            }
        </div>
    )
}