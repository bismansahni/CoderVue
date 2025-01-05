'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Calendar, Clock, ArrowLeft, MessageSquare, ThumbsUp, User} from 'lucide-react'
import {ScrollArea} from "@/components/ui/scroll-area"

// Define the type for transcription items
interface TranscriptionItem {
    speaker: string;
    text: string;
}

export default function InterviewDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const interviewData = JSON.parse(searchParams.get('data') || '{}');
    const [parsedTranscription, setParsedTranscription] = useState<TranscriptionItem[]>([]);

    useEffect(() => {
        if (interviewData.transcription) {
            const parsed = interviewData.transcription
                .split('\n')
                .map((line: string): TranscriptionItem | null => {
                    try {
                        return JSON.parse(line);
                    } catch (e) {
                        return null;
                    }
                })
                // .filter((item): TranscriptionItem => item !== null);
                .filter((item: TranscriptionItem | null): item is TranscriptionItem => item !== null);
            setParsedTranscription(parsed);
        }
    }, [interviewData.transcription]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-5xl mx-auto py-4 px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Coder<span className="text-blue-600">Vue</span>
                    </h1>
                    <Button variant="outline" onClick={() => router.push('/dashboard')} className="text-sm px-3 py-2">
                        <ArrowLeft className="mr-1 h-4 w-4"/> Back to Dashboard
                    </Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto py-6 px-4 space-y-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg">DSA Interview Summary</CardTitle>
                        <CardDescription className="text-sm text-blue-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center">
                                    <Calendar className="mr-1 h-4 w-4"/>
                                    {new Date(interviewData.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4"/>
                                    {interviewData.duration || 'Duration not available'}
                                </div>
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-1">Score: {interviewData.result?.score}%</div>
                        <div className="text-sm text-blue-100">This score is based on your performance in this interview
                            question.
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <MessageSquare className="mr-1 h-5 w-5"/> Interview Question
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{interviewData.question}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Transcription</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] rounded-md border p-2">
                            {parsedTranscription.length > 0 ? (
                                parsedTranscription.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`mb-3 p-2 rounded-md ${item.speaker === 'AI' ? 'bg-blue-100' : 'bg-green-100'}`}
                                    >
                                        <div className="flex items-center mb-1">
                                            {item.speaker === 'AI' ? (
                                                <MessageSquare className="mr-1 h-4 w-4"/>
                                            ) : (
                                                <User className="mr-1 h-4 w-4"/>
                                            )}
                                            <strong>{item.speaker}</strong>
                                        </div>
                                        <p className="text-sm">{item.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm">No transcription available.</p>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <ThumbsUp className="mr-1 h-5 w-5"/> AI Interviewer Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-blue-50 p-3 rounded-md text-sm">
                            {interviewData.result?.feedback || 'No feedback available.'}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
