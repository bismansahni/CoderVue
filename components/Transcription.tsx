


interface TranscriptionProps {
    onStartInterview: () => void; // Callback for starting the interview
}

export default function Transcription({ onStartInterview }: TranscriptionProps) {
    return (
        <div className="bg-beige-100 text-slate-800 p-6 rounded-lg shadow-md flex-grow overflow-y-auto flex items-center justify-center">
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={onStartInterview}
            >
                Start Interview
            </button>
        </div>
    );
}
