import { useEffect, useState, useRef } from "react";
function Verses({ verses, display, currentVerse }) {
    // const centerChildVertically = (parentClientHeight, parentYPos, parentScrollHeight, childYPos) => {
    //     let newChildPos = 0;
    //     const parentMiddlePos = parentYPos + (parentClientHeight / 2);

    //     return newChildPos;
    // }

    // position current verse to display view
    useEffect(() => {
        if (display) {
            console.log(display.clientHeight);
        }
    }, [display]);

    if (verses.length === 0) {
        return <div className="verses-placeholder">Verses displays here</div>;
    }

    return verses.map((value, index) => <div
        className="verses-item"
        key={value.verseId}>
        <span>{index + 1}</span>
        {value.content}
    </div>);
}
export default function Bible() {
    const [verseInput, setVerseInput] = useState({ bookName: '', chapter: 0, verse: 0 });
    const [verses, setVerses] = useState([]);
    const [abbrevs, setAbbrevs] = useState([]);
    const [currentVerse, setCurrentVerse] = useState({ id: '' });
    const versesRef = useRef();

    useEffect(() => {
        fetch('https://localhost:7270/v1/books/abbreviations')
            .then(res => res.json())
            .then(data => setAbbrevs(data))
            .catch(console.error);

        if (verses.length !== 0) {
            setCurrentVerse({ id: verses.find(v => v.verseNo === verseInput.verse).verseId });
        }

    }, [verses]);

    // Resources
    const getChapterVerses = async (bookId, chapter) => await fetch(`https://localhost:7270/v1/books/${bookId}/verses?chapterNo=${chapter}`)
        .then(res => res.json())
        .catch(console.error);

    // form handlers
    async function handleSubmit(e) {
        e.preventDefault();

        const abbrev = abbrevs.find(a => a.abbreviation.toLowerCase() === verseInput.bookName);
        if (!abbrev) {
            console.log("doesn't exist");
        }

        const bookId = abbrev.bookId;
        setVerses(await getChapterVerses(bookId, verseInput.chapter));
        const verse = verses.find(v => v.verseNo === verseInput.verse);
        console.log(verse);
    }

    function handleChange(e) {
        const input = e.target.value.toLowerCase().split(/\s+/);
        setVerseInput({ bookName: input[0], chapter: Number(input[1]), verse: Number(input[2]) });
    }

    return (
        <section className="bible">
            <form onSubmit={handleSubmit}>
                <input type="text" onChange={handleChange} name="verseInput" placeholder="Verse Search: ctrl + /" />
                <input type="submit" id="submit" />
            </form>
            <div className="verses" ref={versesRef}>
                <Verses 
                    verses={verses} 
                    display={versesRef.current} 
                    currentVerse={currentVerse}
                />
            </div>
        </section>
    );
}