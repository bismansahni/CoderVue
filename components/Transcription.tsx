import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Transcription({ transcription }: { transcription: Array<{ speaker: string; text: string }> }) {
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [transcription])

    return (
        <ScrollArea className="h-[400px]" ref={scrollAreaRef}>
            <div className="space-y-2 p-4">
                {transcription.map((line, index) => (
                    <div key={index} className={`p-2 rounded ${line.speaker === 'AI' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <strong>{line.speaker}:</strong> {line.text}
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

