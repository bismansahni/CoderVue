//
//
// export default function Header() {
//     return (
//         <header className="bg-slate-100 text-slate-800 p-4 shadow-md">
//             <h1 className="text-2xl font-bold">Codervue</h1>
//         </header>
//     );
// }



import { Card, CardContent } from "@/components/ui/card"

export default function Header() {
    return (
        <Card className="rounded-none">
            <CardContent className="p-2">
                <h1 className="text-2xl font-bold text-slate-800">
                    Coder<span className="text-blue-600">Vue</span>
                </h1>
            </CardContent>
        </Card>
    )
}
