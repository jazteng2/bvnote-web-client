import { useEffect, useState, useRef } from "react";
export default function Bible() {
    // INPUT
    const initInput = { bookId: null, bookName: null, chapterNo: null, verseNo: null, validInput: false }
    const [currentInput, setCurrentInput] = useState(initInput);
    const [prevInput, setPrevInput] = useState(initInput);

    // RESOURCES
    const [abbrevs, setAbbrevs] = useState([]);
    const [verses, setVerses] = useState([]);
    const [currentVerse, setCurrentVerse] = useState({});
    const getVerses = async (bookId, chapterNo) => await fetch(`https://localhost:7270/v1/books/${bookId}/verses?chapterNo=${chapterNo}`)
        .then(res => res.json())
        .catch(console.error);

    // REFERENCES
    const displayRef = useRef();
    const currentVerseRef = useRef();


    useEffect(() => {
        fetch('https://localhost:7270/v1/books/abbreviations')
            .then(res => res.json())
            .then(data => setAbbrevs(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (typeof currentVerseRef.current !== 'undefined') {
            displayRef.current.scrollTop = currentVerseRef.current.offsetTop;
        }
    }, [currentVerse]);

    // form handlers
    async function handleSubmit(e) {
        e.preventDefault();

        if (!currentInput.validInput) return;
        logging();
        setPrevInput(currentInput);

        if (verses.length === 0) {
            console.log("verses: initialize")
            const dt_verses = await getVerses(currentInput.bookId, currentInput.chapterNo);
            setVerses(dt_verses);
            setCurrentVerse(dt_verses.find(v => v.verseNo === currentInput.verseNo));
            return;
        };

        if (currentInput.bookId !== prevInput.bookId || currentInput.chapterNo !== prevInput.chapterNo) {
            console.log("verses: changed");
            const dt_verses = await getVerses(currentInput.bookId, currentInput.chapterNo);
            setVerses(dt_verses);
            setCurrentVerse(verses.find(v => v.verseNo === currentInput.verseNo));
            return;
        }

        console.log("verses: unchanged");
        setCurrentVerse(verses.find(v => v.verseNo === currentInput.verseNo));
    }

    function handleChange(e) {
        const input = isInputValid(e.target.value);
        if (input.validInput) {
            setCurrentInput(input);
        }
    }

    function isInputValid(i) {
        const input = i.toLowerCase().split(/\s+/);
        const inputLength = input.length;
        const verseNo = input[inputLength - 1];
        const chapterNo = input[inputLength - 2];
        const bookName = () => {
            if (inputLength === 3) return input[0];
            if (inputLength === 4) return `${input[0]} ${input[1]}`;
            return `${input[0]} ${input[1]} ${input[2]}`;
        };
        const abbrev = abbrevs.find(a => a.abbreviation.toLowerCase() === bookName());

        if (bookName === '' || chapterNo === '' || verseNo === '') return initInput;
        if (isNaN(chapterNo) || isNaN(verseNo)) return initInput;
        if (typeof abbrev === 'undefined') return initInput;

        return {
            bookId: abbrev.bookId,
            bookName: bookName(),
            chapterNo: Number(input[1]),
            verseNo: Number(input[2]),
            validInput: true
        };
    }

    function logging() {
        console.clear();
        console.log("currentInput " + JSON.stringify(currentInput));
        console.log("previousInput " + JSON.stringify(prevInput));
        console.log("currentVerse " + JSON.stringify(currentVerse));
    }

    return <section className="bible">
        {/* Verse Form */}
        <form onSubmit={handleSubmit}>
            <input type="text" onChange={handleChange} name="verseInput" placeholder="Verse Search: ctrl + /" />
            <input type="submit" id="submit" />
        </form>
        {/* Verse display */}
        <div className="verses" ref={displayRef}>
            {
                verses.length === 0 && <div className="verses-placeholder">Verses displays here</div>
            }
            {
                verses?.map((value, index) => (
                    <div
                        ref={value.id === currentVerse.id ? currentVerseRef : null}
                        className={value.id === currentVerse.id ? "verses-current" : "verses-item"}
                        key={value.id}
                    >
                        <span>{index + 1}</span>
                        {value.content}
                    </div>
                ))
            }
        </div>
    </section>;
}