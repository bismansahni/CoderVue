import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type QuestionProps = {
    question: string
}

const Question = ({ question }: QuestionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Coding Question</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{question || "Question will be shown here when fetched."}</p>
            </CardContent>
        </Card>
    )
}

export default Question

