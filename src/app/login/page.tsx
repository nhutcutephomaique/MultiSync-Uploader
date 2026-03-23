import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { Video, Shield } from "lucide-react"

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect("/")

  return (
    <div className="flex min-h-[75vh] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-700">
        {/* Logo + Hero */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_40px_-5px_rgba(168,85,247,0.6)]">
              <Video className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-neutral-950">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MultiSync</h1>
            <p className="text-neutral-400 mt-2 text-sm leading-relaxed max-w-xs">
              Quản lý & đăng video lên Facebook, YouTube, TikTok chỉ với một cú click, được hỗ trợ bởi AI.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Đăng nhập để bắt đầu</CardTitle>
            <CardDescription className="text-neutral-400 text-sm">
              Dùng tài khoản Google của bạn — nhanh, an toàn, miễn phí.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
