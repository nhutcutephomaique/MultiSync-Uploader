"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button 
      variant="outline" 
      onClick={() => signOut()} 
      className="border-neutral-800 bg-neutral-900 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-colors"
    >
      Đăng xuất
    </Button>
  )
}
