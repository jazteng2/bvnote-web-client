import Bible from './components/Bible';
import VideoPlayer from './components/VideoPlayer';
export default function WorkSpace() {
    return (
        <main>
            <section className="left">
                <VideoPlayer/>
                <Bible/>
            </section>
            <section className="middle"></section>
            <section className="right">
                <section className="collections"></section>
                <section className="resources"></section>
                <section className="playlists"></section>
                <section className="unlisted"></section>
            </section>
        </main>
    );  
}