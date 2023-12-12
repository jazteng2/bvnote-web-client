import { useState, useEffect } from "react";
export default function Bible() {
    const [currentVerse, setCurrentVerse] = useState(1);
    function handleSubmit(e) {
        e.preventDefault();

    }

    return (
        <section className="bibleDisplay">
            <form action={handleSubmit}></form>
            <div className="verses"></div>
        </section>
    );
}