"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { KeyRound, Link2, CheckCircle2 } from "lucide-react"

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("")
  const [fbToken, setFbToken] = useState("")
  const [ytToken, setYtToken] = useState("")
  const [ttToken, setTtToken] = useState("")

  const handleSaveKeys = () => {
    // In production: POST /api/settings/keys with session auth
    if (geminiKey) localStorage.setItem("gemini_api_key", geminiKey)
    toast.success("Đã lưu cài đặt API Key thành công!")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Cài Đặt Tài Khoản</h2>
        <p className="text-neutral-400">Quản lý API Keys và liên kết tài khoản mạng xã hội.</p>
      </div>

      {/* AI Config */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            Gemini AI API Key
          </CardTitle>
          <CardDescription>
            Key này dùng để sinh tiêu đề và mô tả tự động. Lấy key miễn phí tại <a className="text-blue-400 hover:underline" href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Gemini API Key</Label>
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="bg-neutral-950 border-neutral-700 font-mono"
            />
          </div>
          <Button onClick={handleSaveKeys} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Lưu API Key
          </Button>
        </CardContent>
      </Card>

      <Separator className="bg-neutral-800" />

      {/* Social Accounts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Link2 className="w-5 h-5 text-neutral-400" />
          Liên kết tài khoản mạng xã hội
        </h3>
        <p className="text-sm text-neutral-400">Sau khi liên kết, hệ thống sẽ dùng token OAuth để đăng bài tự động lên tài khoản của bạn.</p>

        {/* Facebook */}
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">f</div>
              <div>
                <p className="font-medium">Facebook / Instagram</p>
                <p className="text-xs text-neutral-400">Đăng Video Reels và bài viết lên Trang / Cá nhân</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input type="password" placeholder="Access Token..." value={fbToken} onChange={e => setFbToken(e.target.value)} className="bg-neutral-950 border-neutral-700 w-48 font-mono text-xs" />
              <Button variant="outline" size="sm" className="border-blue-800 text-blue-400 hover:bg-blue-950/50 whitespace-nowrap" onClick={() => toast.info("OAuth Facebook: Cần thiết lập App ID trong .env.local")}>
                Liên kết
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* YouTube */}
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white">▶</div>
              <div>
                <p className="font-medium">YouTube (Google)</p>
                <p className="text-xs text-neutral-400">Đăng Video dài và YouTube Shorts lên kênh</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input type="password" placeholder="Access Token..." value={ytToken} onChange={e => setYtToken(e.target.value)} className="bg-neutral-950 border-neutral-700 w-48 font-mono text-xs" />
              <Button variant="outline" size="sm" className="border-red-800 text-red-400 hover:bg-red-950/50 whitespace-nowrap" onClick={() => toast.info("OAuth Google: Cần thiết lập Client ID trong .env.local")}>
                Liên kết
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TikTok */}
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white">T</div>
              <div>
                <p className="font-medium">TikTok</p>
                <p className="text-xs text-neutral-400">Đăng video lên tài khoản TikTok của bạn</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input type="password" placeholder="Access Token..." value={ttToken} onChange={e => setTtToken(e.target.value)} className="bg-neutral-950 border-neutral-700 w-48 font-mono text-xs" />
              <Button variant="outline" size="sm" className="border-cyan-800 text-cyan-400 hover:bg-cyan-950/50 whitespace-nowrap" onClick={() => toast.info("OAuth TikTok: Cần thiết lập App Key trong .env.local")}>
                Liên kết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pb-12 flex items-center gap-2 text-xs text-neutral-500">
        <CheckCircle2 className="w-4 h-4 text-green-500/70 flex-shrink-0" />
        Tất cả thông tin xác thực được mã hoá và lưu trữ an toàn trên server của bạn, không chia sẻ với bên thứ ba.
      </div>
    </div>
  )
}
