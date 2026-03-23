"use client"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function LoginButton() {
  return (
    <Button variant="secondary" onClick={() => signIn()}>
      Sign In
    </Button>
  )
}
