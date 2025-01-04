//
// 'use client'
//
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { Calendar, Code, Play, User } from 'lucide-react';
// import { UserButton } from "@clerk/nextjs";
//
// export default function Dashboard() {
//     const router = useRouter()
//
//     // This would typically come from an API call
//     const pastInterviews = [
//         { id: 1, date: '2023-05-15', score: 85, duration: '45 min' },
//         { id: 2, date: '2023-05-20', score: 92, duration: '50 min' },
//         { id: 3, date: '2023-05-25', score: 88, duration: '40 min' },
//     ]
//
//     const startNewInterview = () => {
//         // This would typically navigate to the interview page or start the interview process
//         // console.log('Starting new DSA interview')
//
//         router.push('/dashboard/coding-room');
//     }
//
//     return (
//         <div className="min-h-screen bg-gray-50">
//             <header className="bg-white shadow">
//                 <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//                     <h1 className="text-3xl font-bold text-gray-900">
//                         Convo<span className="text-blue-600">Vue</span>
//                     </h1>
//                     {/*<Button variant="outline" onClick={() => router.push('/')}>*/}
//                     {/*    Logout*/}
//                     {/*</Button>*/}
//                     <UserButton />
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
//                                 <Play className="mr-2 h-5 w-5" /> Start New Interview
//                             </Button>
//                         </CardContent>
//                     </Card>
//
//                     <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Past Interviews</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {pastInterviews.map((interview) => (
//                             <Card key={interview.id} className="hover:shadow-lg transition-shadow duration-300">
//                                 <CardHeader>
//                                     <CardTitle className="text-xl">DSA Interview</CardTitle>
//                                     <CardDescription>
//                                         <div className="flex items-center">
//                                             <Calendar className="mr-2 h-4 w-4" />
//                                             {interview.date}
//                                         </div>
//                                     </CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="flex items-center justify-between mb-2">
//                                         <div className="flex items-center">
//                                             <User className="mr-2 h-4 w-4" />
//                                             <span>Your Score</span>
//                                         </div>
//                                         <span className="text-2xl font-bold text-blue-600">{interview.score}%</span>
//                                     </div>
//                                     {/*<div className="text-sm text-gray-500">Duration: {interview.duration}</div>*/}
//                                 </CardContent>
//                                 <CardFooter>
//                                     <Button variant="outline" className="w-full">
//                                         <Code className="mr-2 h-4 w-4" /> View Details
//                                     </Button>
//                                 </CardFooter>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </main>
//         </div>
//     )
// }





//
// 'use client'
//
// import { useRouter } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { Calendar, Code, Play, User } from 'lucide-react';
// import { UserButton, useUser } from "@clerk/nextjs";
//
// export default function Dashboard() {
//     const { user } = useUser(); // Destructure the user object from useUser
//     const router = useRouter()
//     const [pastInterviews, setPastInterviews] = useState([])
//
//
//     // mock objecrt
//     {
//         "interviews": [
//         {
//             "id": "gfRLwkc6SWcMSg5C5aol",
//             "question": "Given an array of integers, find the maximum sum of a contiguous subarray within the array.",
//             "transcription": "{\"speaker\":\"AI\",\"text\":\"Hi there!  Thanks for coming in today.  We're going to discuss the problem on your screen: finding the maximum sum of a contiguous subarray.  Can you explain your initial thoughts on how you'd approach this?\\n\"}\n{\"speaker\":\"User\",\"text\":\"yes I think we can use a hashmap\"}\n{\"speaker\":\"AI\",\"text\":\"Okay, a hashmap is one approach, but let's consider if it's the most efficient for this specific problem.  Can you explain how you'd use a hashmap to solve this?  What would the keys and values represent?\\n\"}",
//             "result": {
//                 "feedback": "The candidate's response of using a hashmap demonstrates a lack of understanding of the problem and appropriate data structures.  While a hashmap *could* be used in a very inefficient way (storing all possible subarrays and their sums), it's not the optimal solution. The most efficient approaches for this problem are Kadane's Algorithm (a dynamic programming approach) or a divide-and-conquer strategy. The candidate should have started by outlining an approach such as Kadane's Algorithm or explained their thought process in a way that showed they considered the characteristics of the problem (e.g., contiguous subarray, finding the maximum sum).  The interviewer correctly pointed out the inefficiency, but the candidate didn't recover and suggest a more suitable solution.  The interview ended prematurely without exploring alternative approaches, which is crucial to assessing problem-solving abilities.  To improve, the candidate should practice common algorithmic patterns (like this maximum subarray sum problem), understand time and space complexity analysis, and be able to articulate their thought process clearly, even if their initial approach is incorrect.  They need to demonstrate the ability to adapt and consider better alternatives based on feedback.",
//                 "score": 40
//             },
//             "userEmail": "bismansahni@outlook.com",
//             "createdAt": "2025-01-04T18:07:41.933Z"
//         }
//     ]
//     }//
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
//                     body: JSON.stringify({ userId: user.id }) // Pass the actual user ID
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
//         console.log('Starting new DSA interview')
//     }
//
//     return (
//         <div className="min-h-screen bg-gray-50">
//             <header className="bg-white shadow">
//                 <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//                     <h1 className="text-3xl font-bold text-gray-900">
//                         Convo<span className="text-blue-600">Vue</span>
//                     </h1>
//                     <UserButton />
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
//                                 <Play className="mr-2 h-5 w-5" /> Start New Interview
//                             </Button>
//                         </CardContent>
//                     </Card>
//
//                     <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Past Interviews</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {pastInterviews.map((interview) => (
//                             <Card key={interview.id} className="hover:shadow-lg transition-shadow duration-300">
//                                 <CardHeader>
//                                     <CardTitle className="text-xl">DSA Interview</CardTitle>
//                                     <CardDescription>
//                                         <div className="flex items-center">
//                                             <Calendar className="mr-2 h-4 w-4" />
//                                             {interview.date}
//                                         </div>
//                                     </CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="flex items-center justify-between mb-2">
//                                         <div className="flex items-center">
//                                             <User className="mr-2 h-4 w-4" />
//                                             <span>Your Score</span>
//                                         </div>
//                                         <span className="text-2xl font-bold text-blue-600">{interview.score}%</span>
//                                     </div>
//                                 </CardContent>
//                                 <CardFooter>
//                                     <Button variant="outline" className="w-full">
//                                         <Code className="mr-2 h-4 w-4" /> View Details
//                                     </Button>
//                                 </CardFooter>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </main>
//         </div>
//     )
// }


//
// 'use client'
//
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { Calendar, Code, Play, User } from 'lucide-react';
// import { UserButton } from "@clerk/nextjs";
//
// export default function Dashboard() {
//     const router = useRouter()
//
//     // Updated API response
//     const interviews = [
//         {
//             id: "gfRLwkc6SWcMSg5C5aol",
//             question: "Given an array of integers, find the maximum sum of a contiguous subarray within the array. hello hello hello hello hello  hello hello hello hello hello hello hello hello hello ",
//             transcription: "{\"speaker\":\"AI\",\"text\":\"Hi there! Thanks for coming in today. We're going to discuss the problem on your screen: finding the maximum sum of a contiguous subarray. Can you explain your initial thoughts on how you'd approach this?\\n\"}{\"speaker\":\"User\",\"text\":\"yes I think we can use a hashmap\"}{\"speaker\":\"AI\",\"text\":\"Okay, a hashmap is one approach, but let's consider if it's the most efficient for this specific problem. Can you explain how you'd use a hashmap to solve this? What would the keys and values represent?\\n\"}",
//             result: {
//                 feedback: "The candidate's response of using a hashmap demonstrates a lack of understanding of the problem and appropriate data structures. To improve, the candidate should practice common algorithmic patterns and articulate their thought process clearly.",
//                 score: 40
//             },
//             userEmail: "bismansahni@outlook.com",
//             createdAt: "2025-01-04T18:07:41.933Z"
//         }
//     ]
//
//     const startNewInterview = () => {
//         router.push('/dashboard/coding-room');
//     }
//
//     return (
//         <div className="min-h-screen bg-gray-50">
//             <header className="bg-white shadow">
//                 <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//                     <h1 className="text-3xl font-bold text-gray-900">
//                         Convo<span className="text-blue-600">Vue</span>
//                     </h1>
//                     <UserButton />
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
//                                 <Play className="mr-2 h-5 w-5" /> Start New Interview
//                             </Button>
//                         </CardContent>
//                     </Card>
//
//                     <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Past Interviews</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {interviews.map((interview) => (
//                             <Card key={interview.id} className="hover:shadow-lg transition-shadow duration-300">
//                                 <CardHeader>
//                                     <CardTitle className="text-xl">{interview.question}</CardTitle>
//                                     <CardDescription>
//                                         <div className="flex items-center">
//                                             <Calendar className="mr-2 h-4 w-4" />
//                                             {new Date(interview.createdAt).toLocaleDateString()}
//                                         </div>
//                                     </CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="flex items-center justify-between mb-2">
//                                         <div className="flex items-center">
//                                             <User className="mr-2 h-4 w-4" />
//                                             <span>Score</span>
//                                         </div>
//                                         <span className="text-2xl font-bold text-blue-600">{interview.result.score}%</span>
//                                     </div>
//                                     <p className="text-sm text-gray-500">
//                                         {interview.result.feedback.length > 100
//                                             ? interview.result.feedback.substring(0, 100) + '...'
//                                             : interview.result.feedback}
//                                     </p>
//                                 </CardContent>
//                                 <CardFooter>
//                                     <Button variant="outline" className="w-full">
//                                         <Code className="mr-2 h-4 w-4" /> View Details
//                                     </Button>
//                                 </CardFooter>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </main>
//         </div>
//     )
// }


'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Code, Play, User } from 'lucide-react';
import { UserButton, useUser } from "@clerk/nextjs";

export default function Dashboard() {
    const {user} = useUser(); // Destructure the user object from useUser
    const router = useRouter()
    const [pastInterviews, setPastInterviews] = useState([])

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
                    body: JSON.stringify({userId: user.id}) // Pass the actual user ID
                })

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`)
                }

                const data = await response.json()
                console.log('Fetched interviews:', data)
                setPastInterviews(data.interviews)
            } catch (error) {
                console.error('Error fetching interviews:', error)
            }
        }

        fetchInterviews()
    }, [user?.id]) // Add user.id as a dependency to ensure the effect runs when it's available

    const startNewInterview = () => {
        router.push('/dashboard/coding-room')
    }

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
                                    <Play className="mr-2 h-5 w-5"/> Start New Interview
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
                                                <Calendar className="mr-2 h-4 w-4"/>
                                                {new Date(interview.createdAt).toLocaleDateString()}
                                            </div>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <User className="mr-2 h-4 w-4"/>
                                                <span>Score</span>
                                            </div>
                                            <span
                                                className="text-2xl font-bold text-blue-600">{interview.result.score}%</span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {interview.result.feedback.length > 100
                                                ? `${interview.result.feedback.substring(0, 100)}...`
                                                : interview.result.feedback}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" className="w-full">
                                            <Code className="mr-2 h-4 w-4"/> View Details
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
