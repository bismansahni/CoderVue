
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Code, Play, User } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
    const router = useRouter()

    // This would typically come from an API call
    const pastInterviews = [
        { id: 1, date: '2023-05-15', score: 85, duration: '45 min' },
        { id: 2, date: '2023-05-20', score: 92, duration: '50 min' },
        { id: 3, date: '2023-05-25', score: 88, duration: '40 min' },
    ]

    const startNewInterview = () => {
        // This would typically navigate to the interview page or start the interview process
        console.log('Starting new DSA interview')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Convo<span className="text-blue-600">Vue</span>
                    </h1>
                    {/*<Button variant="outline" onClick={() => router.push('/')}>*/}
                    {/*    Logout*/}
                    {/*</Button>*/}
                    <UserButton />
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <Card className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl">Ready for Your Next Challenge?</CardTitle>
                            <CardDescription className="text-blue-100">
                                Start a new DSA interview to sharpen your skills
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={startNewInterview}
                                variant="secondary"
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                <Play className="mr-2 h-5 w-5" /> Start New Interview
                            </Button>
                        </CardContent>
                    </Card>

                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Past Interviews</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastInterviews.map((interview) => (
                            <Card key={interview.id} className="hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="text-xl">DSA Interview</CardTitle>
                                    <CardDescription>
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {interview.date}
                                        </div>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Your Score</span>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-600">{interview.score}%</span>
                                    </div>
                                    {/*<div className="text-sm text-gray-500">Duration: {interview.duration}</div>*/}
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full">
                                        <Code className="mr-2 h-4 w-4" /> View Details
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}



