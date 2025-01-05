'use client'

import {useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Calendar, Code, Play, User} from 'lucide-react'
import {UserButton, useUser} from "@clerk/nextjs"
import {v4 as uuidv4} from 'uuid'

interface Interview {
    id: string;
    question: string;
    createdAt: string;
    result: {
        score: number;
        feedback: string;
    };
}

export default function Dashboard() {
    const {user} = useUser();
    const router = useRouter();
    const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);

    useEffect(() => {
        if (!user?.id) return;

        const fetchInterviews = async () => {
            try {
                const response = await fetch('/api/fetchPastInterviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({userId: user.id})
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Fetched interviews:', data);
                setPastInterviews(data.interviews);
            } catch (error) {
                console.error('Error fetching interviews:', error);
            }
        };

        fetchInterviews();
    }, [user?.id]);

    const startNewInterview = () => {
        const questions = pastInterviews.map((interview) => interview.question);
        const sessionId = uuidv4();
        const questionsQuery = encodeURIComponent(JSON.stringify(questions));
        router.push(`/dashboard/coding-room/${sessionId}?questions=${questionsQuery}`);
    };

    const viewDetails = (interview: Interview) => {
        const query = encodeURIComponent(JSON.stringify(interview));
        router.push(`/dashboard/interview/${interview.id}?data=${query}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Convo<span className="text-blue-600">Vue</span>
                    </h1>
                    <UserButton/>
                </div>
            </header>

            <main className="flex-grow max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8 flex flex-col">
                <div className="px-4 py-6 sm:px-0 flex-grow flex flex-col">
                    <Card className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl">Ready for Your Next Challenge?</CardTitle>
                            <CardDescription className="text-blue-100">
                                Start a new DSA interview to sharpen your skills
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm">
                                Instructions: In the interview room, press the start button to begin the interview.
                                The question will be shared and the interaction will start. To respond to the
                                interviewer,
                                press the button to speak your thoughts. Your coding editor is visible to the
                                interviewer at all times.
                            </p>
                            <Button
                                onClick={startNewInterview}
                                variant="secondary"
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                <Play className="mr-2 h-5 w-5"/> Start New Interview
                            </Button>
                        </CardContent>
                    </Card>

                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Past Interviews</h2>

                    {pastInterviews.length === 0 ? (
                        <Card className="p-6 text-center text-gray-600">
                            <p>
                                Your recent interviews will appear here. Only successfully completed interviews are
                                shown.
                                If your recently taken interview doesn't show up here, please refresh the page.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                            {pastInterviews.map((interview) => (
                                <Card key={interview.id}
                                      className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-[300px]">
                                    <CardHeader className="flex-shrink-0">
                                        <CardTitle className="text-xl h-16 overflow-hidden">
                                            {interview.question.length > 100
                                                ? `${interview.question.substring(0, 100)}...`
                                                : interview.question}
                                        </CardTitle>
                                        <CardDescription>
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4"/>
                                                {new Date(interview.createdAt).toLocaleDateString()}
                                            </div>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow overflow-hidden">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <User className="mr-2 h-4 w-4"/>
                                                <span>Score</span>
                                            </div>
                                            <span className="text-2xl font-bold text-blue-600">
                                                {interview.result.score}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 h-20 overflow-hidden">
                                            {interview.result.feedback}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="flex-shrink-0 mt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => viewDetails(interview)}
                                        >
                                            <Code className="mr-2 h-4 w-4"/> View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

