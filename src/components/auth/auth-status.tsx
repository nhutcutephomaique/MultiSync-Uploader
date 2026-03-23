import Link from "next/link"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "./logout-button"

export async function AuthStatus() {
  const session = await auth()

  if (session?.user) {
    return (
      <div className="flex items-center gap-4 animate-in fade-in duration-500">
        <span className="text-sm font-medium text-neutral-300 hidden sm:inline-block">
          Chào, {session.user.name || "Bạn"}
        </span>
        <LogoutButton />
      </div>
    )
  }

  return (
    <Link href="/login">
      <Button className="bg-white text-neutral-950 hover:bg-neutral-200 font-semibold shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)] px-6">
        Đăng nhập hệ thống
      </Button>
    </Link>
  )
}
