//
//
//
// import { Card, CardContent } from "@/components/ui/card"
//
// export default function Header() {
//     return (
//         <Card className="rounded-none">
//             <CardContent className="p-2 flex justify-between items-center">
//                 <h1 className="text-2xl font-bold text-slate-800">
//                     Coder<span className="text-blue-600">Vue</span>
//                 </h1>
//                 {/*<button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">*/}
//                 {/*    End Interview*/}
//                 {/*</button>*/}
//                 <button className="bg-red-600 text-white px-3 py-1.5 text-sm rounded hover:bg-red-700 transition">
//                     End Interview
//                 </button>
//
//             </CardContent>
//         </Card>
//     )
// }


import { Card, CardContent } from "@/components/ui/card"

export default function Header({ onEndInterview }: { onEndInterview: () => void }) {
    return (
        <Card className="rounded-none">
            <CardContent className="p-2 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">
                    Coder<span className="text-blue-600">Vue</span>
                </h1>
                <button
                    className="bg-red-600 text-white px-3 py-1.5 text-sm rounded hover:bg-red-700 transition"
                    onClick={onEndInterview}
                >
                    End Interview
                </button>
            </CardContent>
        </Card>
    )
}
