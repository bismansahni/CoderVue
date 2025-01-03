//
//
// 'use client'
//
// import { useState } from 'react'
// import Editor from '@monaco-editor/react'
// import TalkButton from "@/components/CodeEditorHelper/TalkButton";
//
// export default function CodeEditorPage() {
//     const [code, setCode] = useState('// Start writing your code here...\n')
//     const [language, setLanguage] = useState('javascript') // Default language
//     const [theme, setTheme] = useState('vs-light') // Default theme
//
//     // Boilerplate code for each language
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
//         setCode(value || '')
//     }
//
//     const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const selectedLanguage = e.target.value
//         setLanguage(selectedLanguage)
//         // Update code with the new boilerplate for the selected language
//         setCode(boilerplateCode[selectedLanguage] || '// No boilerplate available for this language.\n')
//     }
//
//     const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         setTheme(e.target.value)
//     }
//
//     const handleThoughtsSubmit = () => {
//         // Capture the current code or text in the editor
//         const thoughtsToShare = code;
//
//         // Send the captured text (code) to an AI model or backend
//         // sendToAI(thoughtsToShare);
//     }
//
//     return (
//         <div className="bg-beige-100 text-slate-800 p-6 rounded-lg shadow-md flex flex-col h-full">
//             <h2 className="text-xl font-semibold mb-4">Code Editor</h2>
//             {/* Dropdowns for Language and Theme */}
//             <div className="flex items-center space-x-6 mb-4">
//                 <div>
//                     <label htmlFor="language" className="mr-2 font-medium">Language:</label>
//                     <select
//                         id="language"
//                         value={language}
//                         onChange={handleLanguageChange}
//                         className="border border-neutral-300 rounded p-2"
//                     >
//                         <option value="javascript">JavaScript</option>
//                         <option value="python">Python</option>
//                         <option value="java">Java</option>
//                         <option value="csharp">C#</option>
//                         <option value="cpp">C++</option>
//                         <option value="typescript">TypeScript</option>
//                     </select>
//                 </div>
//                 <div>
//                     <label htmlFor="theme" className="mr-2 font-medium">Theme:</label>
//                     <select
//                         id="theme"
//                         value={theme}
//                         onChange={handleThemeChange}
//                         className="border border-neutral-300 rounded p-2"
//                     >
//                         <option value="vs-light">Light</option>
//                         <option value="vs-dark">Dark</option>
//                     </select>
//                 </div>
//             </div>
//             {/* Monaco Editor */}
//             <div className="flex-grow h-96 rounded-lg bg-white">
//                 <Editor
//                     height="100%" // Ensure Monaco editor takes full height
//                     language={language}
//                     value={code}
//                     onChange={handleEditorChange}
//                     theme={theme}
//                 />
//             </div>
//              {/*Button to Submit Thoughts */}
//             <TalkButton/>
//         </div>
//     )
// }
//
//
//
//
//


'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import TalkButton from "@/components/CodeEditorHelper/TalkButton";

export default function CodeEditorPage() {
    const [usercode, setUserCode] = useState('// Start writing your code here...\n');
    const [language, setLanguage] = useState('javascript'); // Default language
    const [theme, setTheme] = useState('vs-light'); // Default theme

    // Boilerplate code for each language
    const boilerplateCode: { [key: string]: string } = {
        javascript: `// JavaScript Boilerplate\nfunction main() {\n  console.log("Hello, JavaScript!");\n}`,
        python: `# Python Boilerplate\ndef main():\n    print("Hello, Python!")\n\nif __name__ == "__main__":\n    main()`,
        java: `// Java Boilerplate\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}`,
        csharp: `// C# Boilerplate\nusing System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, C#!");\n    }\n}`,
        cpp: `// C++ Boilerplate\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}`,
        typescript: `// TypeScript Boilerplate\nfunction main(): void {\n  console.log("Hello, TypeScript!");\n}`,
    };

    const handleEditorChange = (value: string | undefined) => {
        setUserCode(value || '');
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = e.target.value;
        setLanguage(selectedLanguage);
        // Update code with the new boilerplate for the selected language
        setUserCode(boilerplateCode[selectedLanguage] || '// No boilerplate available for this language.\n');
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTheme(e.target.value);
    };

    return (
        <div className="bg-beige-100 text-slate-800 p-6 rounded-lg shadow-md flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4">Code Editor</h2>
            {/* Dropdowns for Language and Theme */}
            <div className="flex items-center space-x-6 mb-4">
                <div>
                    <label htmlFor="language" className="mr-2 font-medium">Language:</label>
                    <select
                        id="language"
                        value={language}
                        onChange={handleLanguageChange}
                        className="border border-neutral-300 rounded p-2"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="csharp">C#</option>
                        <option value="cpp">C++</option>
                        <option value="typescript">TypeScript</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="theme" className="mr-2 font-medium">Theme:</label>
                    <select
                        id="theme"
                        value={theme}
                        onChange={handleThemeChange}
                        className="border border-neutral-300 rounded p-2"
                    >
                        <option value="vs-light">Light</option>
                        <option value="vs-dark">Dark</option>
                    </select>
                </div>
            </div>
            {/* Monaco Editor */}
            <div className="flex-grow h-96 rounded-lg bg-white">
                <Editor
                    height="100%" // Ensure Monaco editor takes full height
                    language={language}
                    value={usercode}
                    onChange={handleEditorChange}
                    theme={theme}
                />
            </div>
            {/* Button to Submit Thoughts */}
            <TalkButton code={usercode} />
        </div>
    );
}
