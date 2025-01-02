export default function OutputConsole() {
  return (
    <div className="bg-black text-green-400 p-4 rounded shadow h-32 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-2">Output Console</h2>
      <pre>
        {`> Console output will appear here...`}
      </pre>
    </div>
  )
}

