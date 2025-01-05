//
// 'use client'
//
// import { useState } from 'react'
// import Editor from '@monaco-editor/react'
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
//
// export default function CodeEditor({
//                                        onCodeChange,
//                                    }: {
//     onCodeChange: (code: string) => void
// }) {
//     const [code, setCode] = useState('// Start writing your code here...\n')
//     const [language, setLanguage] = useState('javascript')
//     const [theme, setTheme] = useState('vs-light')
//
//     const boilerplateCode: { [key: string]: string } = {
//         javascript: `// JavaScript Boilerplate\nfunction main() {\n  console.log("Hello, JavaScript!");\n}`,
//         python: `# Python Boilerplate\ndef main():\n    print("Hello, Python!")\n\nif __name__ == "__main__":\n    main()`,
//         java: `// Java Boilerplate\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}`,
//         csharp: `// C# Boilerplate\nusing System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, C#!");\n    }\n}`,
//         cpp: `// C++ Boilerplate\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}`,
//         typescript: `// TypeScript Boilerplate\nfunction main(): void {\n  console.log("Hello, TypeScript!");\n}`,
//     }
//
//     const handleEditorChange = (value: string | undefined) => {
//         const updatedCode = value || ''
//         setCode(updatedCode)
//         onCodeChange(updatedCode)
//     }
//
//     const handleLanguageChange = (value: string) => {
//         setLanguage(value)
//         const boilerplate = boilerplateCode[value] || '// No boilerplate available for this language.\n'
//         setCode(boilerplate)
//         onCodeChange(boilerplate)
//     }
//
//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Code Editor</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <div className="flex items-center space-x-4 mb-4">
//                     <Select value={language} onValueChange={handleLanguageChange}>
//                         <SelectTrigger className="w-[180px]">
//                             <SelectValue placeholder="Select language" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="javascript">JavaScript</SelectItem>
//                             <SelectItem value="python">Python</SelectItem>
//                             <SelectItem value="java">Java</SelectItem>
//                             <SelectItem value="csharp">C#</SelectItem>
//                             <SelectItem value="cpp">C++</SelectItem>
//                             <SelectItem value="typescript">TypeScript</SelectItem>
//                         </SelectContent>
//                     </Select>
//                     <Select value={theme} onValueChange={setTheme}>
//                         <SelectTrigger className="w-[180px]">
//                             <SelectValue placeholder="Select theme" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="vs-light">Light</SelectItem>
//                             <SelectItem value="vs-dark">Dark</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>
//                 <div className="h-[400px] rounded-lg overflow-hidden">
//                     <Editor
//                         height="100%"
//                         language={language}
//                         value={code}
//                         onChange={handleEditorChange}
//                         theme={theme}
//                     />
//                 </div>
//             </CardContent>
//         </Card>
//     )
// }
//
//



//
//
// 'use client'
//
// import { useState } from 'react'
// import Editor from '@monaco-editor/react'
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
//
// export default function CodeEditor({
//                                        onCodeChange,
//                                    }: {
//     onCodeChange: (code: string) => void
// }) {
//     const [code, setCode] = useState('// Start writing your code here...\n')
//      const [language, setLanguage] = useState('javascript')
//     const [theme, setTheme] = useState('vs-light')
//
//
//
//     const handleEditorChange = (value: string | undefined) => {
//         const updatedCode = value || ''
//         setCode(updatedCode)
//         onCodeChange(updatedCode)
//     }
//
//     const handleLanguageChange = (value: string) => {
//         setLanguage(value)
//
//     }
//
//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Code Editor</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <div className="flex items-center space-x-4 mb-4">
//                     <Select onValueChange={handleLanguageChange}>
//                         <SelectTrigger className="w-[180px]">
//                             <SelectValue placeholder="JavaScript" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="javascript">JavaScript</SelectItem>
//                             <SelectItem value="python">Python</SelectItem>
//                             <SelectItem value="java">Java</SelectItem>
//                             <SelectItem value="csharp">C#</SelectItem>
//                             <SelectItem value="cpp">C++</SelectItem>
//                             <SelectItem value="typescript">TypeScript</SelectItem>
//                         </SelectContent>
//                     </Select>
//                     <Select value={theme} onValueChange={setTheme}>
//                         <SelectTrigger className="w-[180px]">
//                             <SelectValue placeholder="Select theme" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="vs-light">Light</SelectItem>
//                             <SelectItem value="vs-dark">Dark</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>
//                 <div className="h-[400px] rounded-lg overflow-hidden">
//                     <Editor
//                         height="100%"
//                          language={language}
//                         value={code}
//                         onChange={handleEditorChange}
//                         theme={theme}
//                     />
//                 </div>
//             </CardContent>
//         </Card>
//     )
// }
//
//
//


'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
                                <SelectValue placeholder="JavaScript" />
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
                                <SelectValue placeholder="Select theme" />
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
