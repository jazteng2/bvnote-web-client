import Bible from './components/workspace/Bible';
// import VideoPlayer from './components/VideoPlayer';
export default function WorkSpace() {
    return (
        <main className='workspace margin-10'>
            <section className="workspace-left">
                <section className='videoPlayer'></section>
                <Bible/>
            </section>
            <section className="workspace-middle">
            </section>
            <section className="workspace-right">
            </section>
        </main>
    );  
}