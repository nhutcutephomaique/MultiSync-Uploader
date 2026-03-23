import Link from "next/link"
import { History, Settings, Upload } from "lucide-react"

export function Navbar() {
  return (
    <nav className="flex items-center gap-1">
      <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Upload</span>
      </Link>
      <Link href="/history" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
        <History className="w-4 h-4" />
        <span className="hidden sm:inline">Lịch sử</span>
      </Link>
      <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Cài đặt</span>
      </Link>
    </nav>
  )
}
