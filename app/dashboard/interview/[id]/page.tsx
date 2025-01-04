

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, ArrowLeft, MessageSquare, ThumbsUp } from 'lucide-react'

export default function InterviewDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Deserialize the interview object from the query parameter
    const interviewData = JSON.parse(searchParams.get('data') || '{}');

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Coder<span className="text-blue-600">Vue</span>
                    </h1>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Use the deserialized interviewData */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl">DSA Interview Summary</CardTitle>
                            <CardDescription>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {new Date(interviewData.createdAt).toLocaleDateString()}
                                    </div>
                                    {/*<div className="flex items-center">*/}
                                    {/*    <Clock className="mr-2 h-4 w-4" />*/}
                                    {/*    45 min*/}
                                    {/*</div>*/}
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                Score: {interviewData.result?.score}%
                            </div>
                            {/*<div className="text-sm text-gray-500">*/}
                            {/*    {interviewData.result?.feedback}*/}
                            {/*</div>*/}
                        </CardContent>
                    </Card>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center">
                                <MessageSquare className="mr-2 h-5 w-5" /> Interview Question
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">{interviewData.question}</p>
                        </CardContent>
                    </Card>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-xl">Transcription</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap text-sm">
                                {interviewData.transcription || 'No transcription available.'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center">
                                <ThumbsUp className="mr-2 h-5 w-5" /> AI Interviewer Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-blue-50 p-4 rounded-md text-sm">
                                {interviewData.result?.feedback || 'No feedback available.'}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
