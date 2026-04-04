import { Link } from 'react-router-dom'

export default function HomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 gap-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">QuestForge</h1>
        <p className="text-zinc-500 mt-2 text-sm">Learn developer tools through narrative RPG adventures</p>
      </div>

      <div className="flex gap-6">
        <QuestCard
          title="GitQuest"
          subtitle="The Repo Chronicles"
          description="52 missions · 10 levels · Core Git"
          href="/gitquest"
          accent="text-emerald-400"
          border="border-emerald-800 hover:border-emerald-500"
        />
        <QuestCard
          title="SQLQuest"
          subtitle="The Buried City"
          description="53 missions · 10 levels · Core SQL"
          href="/sqlquest"
          accent="text-amber-400"
          border="border-amber-800 hover:border-amber-500"
        />
      </div>
    </div>
  )
}

function QuestCard({ title, subtitle, description, href, accent, border }) {
  return (
    <Link
      to={href}
      className={`flex flex-col gap-3 w-64 p-6 rounded-lg border bg-zinc-900 transition-colors ${border}`}
    >
      <div>
        <div className={`text-xl font-bold ${accent}`}>{title}</div>
        <div className="text-zinc-400 text-sm">{subtitle}</div>
      </div>
      <div className="text-zinc-600 text-xs">{description}</div>
      <div className={`text-sm mt-2 ${accent}`}>Begin →</div>
    </Link>
  )
}
