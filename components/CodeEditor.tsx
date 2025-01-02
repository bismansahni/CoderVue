
'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'

export default function CodeEditor() {
    const [code, setCode] = useState('// Start writing your code here...\n')
    const [language, setLanguage] = useState('javascript') // Default language
    const [theme, setTheme] = useState('vs-light') // Default theme

    const handleEditorChange = (value: string | undefined) => {
        setCode(value || '')
    }

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value)
    }

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTheme(e.target.value)
    }

    return (
        <div className="bg-white p-4 rounded shadow flex-grow">
            <h2 className="text-xl font-semibold mb-2">Code Editor</h2>
            {/* Dropdowns for Language and Theme */}
            <div className="flex items-center space-x-4 mb-4">
                <div>
                    <label htmlFor="language" className="mr-2 font-medium">Language:</label>
                    <select
                        id="language"
                        value={language}
                        onChange={handleLanguageChange}
                        className="border rounded p-1"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="csharp">C#</option>
                        <option value="cpp">C++</option>
                        <option value="typescript">TypeScript</option>
                        {/* Add more languages as needed */}
                    </select>
                </div>
                <div>
                    <label htmlFor="theme" className="mr-2 font-medium">Theme:</label>
                    <select
                        id="theme"
                        value={theme}
                        onChange={handleThemeChange}
                        className="border rounded p-1"
                    >
                        <option value="vs-light">Light</option>
                        <option value="vs-dark">Dark</option>
                    </select>
                </div>
            </div>
            {/* Monaco Editor */}
            <div className="h-80 border rounded">
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                    theme={theme}
                />
            </div>
        </div>
    )
}
