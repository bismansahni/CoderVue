//
//
// type QuestionProps = {
//     question: string;
// };
//
// const Question = ({ question }: QuestionProps) => {
//     return (
//         <div className="bg-slate-100 text-slate-800 p-6 rounded-lg">
//             <h2 className="text-xl font-semibold mb-2">Coding Question</h2>
//             <p>{question || "Question will be shown here when fetched."}</p>
//         </div>
//     );
// };
//
// export default Question;



type QuestionProps = {
    question: string;
};

const Question = ({ question }: QuestionProps) => {
    return (
        <div className="bg-slate-100 text-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Coding Question</h2>
            <p>{question || "Question will be shown here when fetched."}</p>
        </div>
    );
};

export default Question;
