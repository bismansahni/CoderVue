// 'use client'
//
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Calendar, Clock, ArrowLeft, MessageSquare, ThumbsUp } from 'lucide-react'
//
// export default function InterviewDetails({ params }: { params: { id: string } }) {
//     const router = useRouter()
//
//     // This would typically come from an API call using the params.id
//     const interviewData = {
//         id: params.id,
//         date: '2023-05-15',
//         score: 85,
//         duration: '45 min',
//         question: "Implement a function to reverse a linked list.",
//         transcription: "AI Interviewer: Can you implement a function to reverse a linked list?\n\nCandidate: To reverse a linked list, we need to iterate through the list and change the next pointer of each node to point to the previous node. We'll need to keep track of three nodes: the current node, the previous node, and the next node.\n\nLet me write out the function:\n\n```python\ndef reverse_linked_list(head):\n    prev = None\n    current = head\n    \n    while current is not None:\n        next_node = current.next\n        current.next = prev\n        prev = current\n        current = next_node\n    \n    return prev\n```\n\nThis function takes the head of the linked list as input and returns the new head of the reversed list.\n\nAI Interviewer: Great start. Can you walk me through how this function works?\n\nCandidate: Here's a step-by-step explanation:\n\n1. We initialize three pointers: `prev` as None, `current` as the head of the list, and `next_node` (which we'll set in the loop).\n\n2. We enter a while loop that continues as long as `current` is not None.\n\n3. Inside the loop:\n   a. We save the next node (`next_node = current.next`) before we change `current.next`.\n   b. We reverse the link (`current.next = prev`).\n   c. We move `prev` and `current` one step forward for the next iteration.\n\n4. The loop continues until we reach the end of the list (when `current` becomes None).\n\n5. At the end, `prev` will be pointing to the last node of the original list, which is now the first node of the reversed list. So we return `prev` as the new head.\n\nThe time complexity of this algorithm is O(n) where n is the number of nodes in the list, as we traverse the list once. The space complexity is O(1) as we only use a constant amount of extra space regardless of the input size.\n\nAI Interviewer: Excellent explanation. Can you think of any edge cases we need to consider?\n\nCandidate: Yes, there are a few edge cases we should consider:\n\n1. Empty list: If the input `head` is None, our function will correctly return None.\n\n2. Single node: If the list has only one node, the function will work correctly, essentially returning the same node.\n\n3. Two nodes: This case is good to check because it's the simplest case where actual reversal occurs.\n\nOur current implementation handles all these cases correctly, but it's always good to test them explicitly.\n\nAI Interviewer: Very thorough. Thank you for your detailed explanation and consideration of edge cases.",
//         feedback: "The candidate demonstrated a strong understanding of linked list operations and provided a correct implementation for reversing a linked list. Their explanation was clear and methodical, covering the algorithm, time and space complexity, and potential edge cases. They showed good problem-solving skills and attention to detail.\n\nStrengths:\n1. Correct implementation of the algorithm\n2. Clear and detailed explanation of the code\n3. Accurate analysis of time and space complexity\n4. Consideration of edge cases\n\nAreas for improvement:\n1. Could have mentioned the iterative vs. recursive approach trade-offs\n2. Might have discussed potential follow-up questions or variations of the problem\n\nOverall, this was a strong performance that showcases a solid grasp of data structures and algorithms."
//     }
//
//     return (
//         <div className="min-h-screen bg-gray-50">
//             <header className="bg-white shadow">
//                 <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
//                     <h1 className="text-3xl font-bold text-gray-900">
//                         Interview Details
//                     </h1>
//                     <Button variant="outline" onClick={() => router.push('/dashboard')}>
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
//                     </Button>
//                 </div>
//             </header>
//
//             <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//                 <div className="px-4 py-6 sm:px-0">
//                     <Card className="mb-8">
//                         <CardHeader>
//                             <CardTitle className="text-2xl">DSA Interview Summary</CardTitle>
//                             <CardDescription>
//                                 <div className="flex items-center space-x-4">
//                                     <div className="flex items-center">
//                                         <Calendar className="mr-2 h-4 w-4" />
//                                         {interviewData.date}
//                                     </div>
//                                     <div className="flex items-center">
//                                         <Clock className="mr-2 h-4 w-4" />
//                                         {interviewData.duration}
//                                     </div>
//                                 </div>
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-3xl font-bold text-blue-600 mb-2">
//                                 Score: {interviewData.score}%
//                             </div>
//                             <div className="text-sm text-gray-500">
//                                 This score is based on your performance in this interview question.
//                             </div>
//                         </CardContent>
//                     </Card>
//
//                     <Card className="mb-8">
//                         <CardHeader>
//                             <CardTitle className="text-xl flex items-center">
//                                 <MessageSquare className="mr-2 h-5 w-5" /> Interview Question
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <p className="text-lg font-medium">{interviewData.question}</p>
//                         </CardContent>
//                     </Card>
//
//                     <Card className="mb-8">
//                         <CardHeader>
//                             <CardTitle className="text-xl">Transcription</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap text-sm">
//                                 {interviewData.transcription}
//                             </div>
//                         </CardContent>
//                     </Card>
//
//                     <Card>
//                         <CardHeader>
//                             <CardTitle className="text-xl flex items-center">
//                                 <ThumbsUp className="mr-2 h-5 w-5" /> AI Interviewer Feedback
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="bg-blue-50 p-4 rounded-md text-sm">
//                                 {interviewData.feedback}
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </main>
//         </div>
//     )
// }
//


'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, ArrowLeft, MessageSquare, ThumbsUp } from 'lucide-react'

export default function InterviewDetails({ params }: { params: { id: string } }) {
    const router = useRouter()

    // This would typically come from an API call using the params.id
    const interviewData = {
        id: params.id,
        date: '2023-05-15',
        score: 85,
        duration: '45 min',
        question: "Implement a function to reverse a linked list.",
        transcription: "AI Interviewer: Can you implement a function to reverse a linked list?\n\nCandidate: To reverse a linked list, we need to iterate through the list and change the next pointer of each node to point to the previous node. We'll need to keep track of three nodes: the current node, the previous node, and the next node.\n\nLet me write out the function:\n\n\`\`\`python\ndef reverse_linked_list(head):\n    prev = None\n    current = head\n    \n    while current is not None:\n        next_node = current.next\n        current.next = prev\n        prev = current\n        current = next_node\n    \n    return prev\n\`\`\`\n\nThis function takes the head of the linked list as input and returns the new head of the reversed list.\n\nAI Interviewer: Great start. Can you walk me through how this function works?\n\nCandidate: Here's a step-by-step explanation:\n\n1. We initialize three pointers: `prev` as None, `current` as the head of the list, and `next_node` (which we'll set in the loop).\n\n2. We enter a while loop that continues as long as `current` is not None.\n\n3. Inside the loop:\n   a. We save the next node (`next_node = current.next`) before we change `current.next`.\n   b. We reverse the link (`current.next = prev`).\n   c. We move `prev` and `current` one step forward for the next iteration.\n\n4. The loop continues until we reach the end of the list (when `current` becomes None).\n\n5. At the end, `prev` will be pointing to the last node of the original list, which is now the first node of the reversed list. So we return `prev` as the new head.\n\nThe time complexity of this algorithm is O(n) where n is the number of nodes in the list, as we traverse the list once. The space complexity is O(1) as we only use a constant amount of extra space regardless of the input size.\n\nAI Interviewer: Excellent explanation. Can you think of any edge cases we need to consider?\n\nCandidate: Yes, there are a few edge cases we should consider:\n\n1. Empty list: If the input `head` is None, our function will correctly return None.\n\n2. Single node: If the list has only one node, the function will work correctly, essentially returning the same node.\n\n3. Two nodes: This case is good to check because it's the simplest case where actual reversal occurs.\n\nOur current implementation handles all these cases correctly, but it's always good to test them explicitly.\n\nAI Interviewer: Very thorough. Thank you for your detailed explanation and consideration of edge cases.",
        feedback: "The candidate demonstrated a strong understanding of linked list operations and provided a correct implementation for reversing a linked list. Their explanation was clear and methodical, covering the algorithm, time and space complexity, and potential edge cases. They showed good problem-solving skills and attention to detail.\n\nStrengths:\n1. Correct implementation of the algorithm\n2. Clear and detailed explanation of the code\n3. Accurate analysis of time and space complexity\n4. Consideration of edge cases\n\nAreas for improvement:\n1. Could have mentioned the iterative vs. recursive approach trade-offs\n2. Might have discussed potential follow-up questions or variations of the problem\n\nOverall, this was a strong performance that showcases a solid grasp of data structures and algorithms."
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Coder<span className="text-blue-600">Vue</span>
                    </h1>
                    <div className="flex items-center space-x-4">

                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-2xl">DSA Interview Summary</CardTitle>
                            <CardDescription>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {interviewData.date}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4" />
                                        {interviewData.duration}
                                    </div>
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                Score: {interviewData.score}%
                            </div>
                            <div className="text-sm text-gray-500">
                                This score is based on your performance in this interview question.
                            </div>
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
                                {interviewData.transcription}
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
                                {interviewData.feedback}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

