// 'use client'
//
// import {useRouter} from 'next/navigation'
// import {useEffect, useState} from 'react'
// import {Button} from '@/components/ui/button'
// import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
// import {Calendar, Code, Play, User} from 'lucide-react';
// import {UserButton, useUser} from "@clerk/nextjs";
//
// export default function Dashboard() {
//     const {user} = useUser(); // Destructure the user object from useUser
//     const router = useRouter()
//     const [pastInterviews, setPastInterviews] = useState([])
//
//     // Fetch past interviews from the API
//     useEffect(() => {
//         if (!user?.id) return; // Wait until user.id is available
//
//         const fetchInterviews = async () => {
//             try {
//                 const response = await fetch('/api/fetchPastInterviews', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({userId: user.id}) // Pass the actual user ID
//                 })
//
//                 if (!response.ok) {
//                     throw new Error(`Error: ${response.statusText}`)
//                 }
//
//                 const data = await response.json()
//                 console.log('Fetched interviews:', data)
//                 setPastInterviews(data.interviews)
//             } catch (error) {
//                 console.error('Error fetching interviews:', error)
//             }
//         }
//
//         fetchInterviews()
//     }, [user?.id]) // Add user.id as a dependency to ensure the effect runs when it's available
//
//     const startNewInterview = () => {
//         router.push('/dashboard/coding-room')
//     }
//
//     return (
//         <div className="min-h-screen bg-gray-50">
//             <header className="bg-white shadow">
//                 <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//                     <h1 className="text-3xl font-bold text-gray-900">
//                         Convo<span className="text-blue-600">Vue</span>
//                     </h1>
//                     <UserButton/>
//                 </div>
//             </header>
//
//             <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//                 <div className="px-4 py-6 sm:px-0">
//                     <Card className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
//                         <CardHeader>
//                             <CardTitle className="text-2xl">Ready for Your Next Challenge?</CardTitle>
//                             <CardDescription className="text-blue-100">
//                                 Start a new DSA interview to sharpen your skills
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <Button
//                                 onClick={startNewInterview}
//                                 variant="secondary"
//                                 size="lg"
//                                 className="w-full sm:w-auto"
//                             >
//                                 <Play className="mr-2 h-5 w-5"/> Start New Interview
//                             </Button>
//                         </CardContent>
//                     </Card>
//
//                     <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Past Interviews</h2>
//
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {pastInterviews.map((interview) => (
//                             <Card key={interview.id} className="hover:shadow-lg transition-shadow duration-300">
//                                 <CardHeader>
//                                     <CardTitle className="text-xl">
//                                         {interview.question.length > 100
//                                             ? `${interview.question.substring(0, 100)}...`
//                                             : interview.question}
//                                     </CardTitle>
//                                     <CardDescription>
//                                         <div className="flex items-center">
//                                             <Calendar className="mr-2 h-4 w-4"/>
//                                             {new Date(interview.createdAt).toLocaleDateString()}
//                                         </div>
//                                     </CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="flex items-center justify-between mb-2">
//                                         <div className="flex items-center">
//                                             <User className="mr-2 h-4 w-4"/>
//                                             <span>Score</span>
//                                         </div>
//                                         <span
//                                             className="text-2xl font-bold text-blue-600">{interview.result.score}%</span>
//                                     </div>
//                                     <p className="text-sm text-gray-500">
//                                         {interview.result.feedback.length > 100
//                                             ? `${interview.result.feedback.substring(0, 100)}...`
//                                             : interview.result.feedback}
//                                     </p>
//                                 </CardContent>
//                                 <CardFooter>
//                                     <Button variant="outline" className="w-full">
//                                         <Code className="mr-2 h-4 w-4"/> View Details
//                                     </Button>
//                                 </CardFooter>
//                             </Card>
//                         ))}
//                     </div>
//
//
//                 </div>
//             </main>
//         </div>
//     )
//
//
// }


'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Code, Play, User } from 'lucide-react';
import { UserButton, useUser } from "@clerk/nextjs";

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
    const { user } = useUser(); // Destructure the user object from useUser
    const router = useRouter();
    const [pastInterviews, setPastInterviews] = useState<Interview[]>([]); // Typed state

    // Fetch past interviews from the API
    useEffect(() => {
        if (!user?.id) return; // Wait until user.id is available

        const fetchInterviews = async () => {
            try {
                const response = await fetch('/api/fetchPastInterviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: user.id }) // Pass the actual user ID
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
    }, [user?.id]); // Add user.id as a dependency to ensure the effect runs when it's available

    const startNewInterview = () => {
        router.push('/dashboard/coding-room');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Convo<span className="text-blue-600">Vue</span>
                    </h1>
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
                                    <CardTitle className="text-xl">
                                        {interview.question.length > 100
                                            ? `${interview.question.substring(0, 100)}...`
                                            : interview.question}
                                    </CardTitle>
                                    <CardDescription>
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {new Date(interview.createdAt).toLocaleDateString()}
                                        </div>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Score</span>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {interview.result.score}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {interview.result.feedback.length > 100
                                            ? `${interview.result.feedback.substring(0, 100)}...`
                                            : interview.result.feedback}
                                    </p>
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
    );
}
