
import AIVoiceAnimation from "@/components/AIVoiceAnimation";
import CodeEditor from "@/components/CodeEditor";
import Header from "@/components/Header";
import OutputConsole from "@/components/OutputConsole";
import Question from "@/components/Question";
import Transcription from "@/components/Transcription";



export default function InterviewRoom() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-col w-full md:w-3/4 space-y-4">
          <Question />
          <CodeEditor />
          <OutputConsole />
        </div>
        <div className="w-full md:w-1/4 space-y-4">
          <AIVoiceAnimation />
          <Transcription />
        </div>
      </div>
    </div>
  )
}

