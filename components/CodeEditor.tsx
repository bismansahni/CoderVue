'use client'

import {useState} from 'react'
import Editor from '@monaco-editor/react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

export default function CodeEditor({
                                       onCodeChange,
                                   }: {
    onCodeChange: (code: string) => void
}) {
    const [code, setCode] = useState('// Start writing your code here...\n')
    const [language, setLanguage] = useState('javascript')
    const [theme, setTheme] = useState('vs-light')

    const handleEditorChange = (value: string | undefined) => {
        const updatedCode = value || ''
        setCode(updatedCode)
        onCodeChange(updatedCode)
    }

    const handleLanguageChange = (value: string) => {
        setLanguage(value)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Code Editor</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-2 mb-4">
                    <div className="flex items-center space-x-4">
                        <Select onValueChange={handleLanguageChange} value={language}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="JavaScript"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="csharp">C#</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="typescript">TypeScript</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select theme"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vs-light">Light</SelectItem>
                                <SelectItem value="vs-dark">Dark</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Instruction below the language selector */}
                    <p className="text-sm text-gray-500">
                        Choose the language you want to write your code in from the dropdown above.
                    </p>
                </div>
                <div className="h-[400px] rounded-lg overflow-hidden">
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={handleEditorChange}
                        theme={theme}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
