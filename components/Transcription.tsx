

import { useEffect, useRef } from "react";

export default function Transcription({ transcription }: { transcription: Array<{ speaker: string; text: string }> }) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Scroll to the bottom when the transcription updates
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [transcription]);

    return (
        <div
            ref={containerRef}
            className="bg-white p-4 rounded shadow overflow-y-auto"
            style={{
                maxHeight: "70vh", // Constrain height to a reasonable size (e.g., 50% of viewport)
                height: "100%",   // Use available height from parent
            }}
        >
            <h2 className="text-xl font-semibold mb-2">Transcription</h2>
            <div className="space-y-2">
                {transcription.map((line, index) => (
                    <p key={index}>
                        <strong>{line.speaker}:</strong> {line.text}
                    </p>
                ))}
            </div>
        </div>
    );
}
