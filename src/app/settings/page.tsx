"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { KeyRound, Link2, CheckCircle2, Save, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("")
  const [fbToken, setFbToken] = useState("")
  const [ytToken, setYtToken] = useState("")
  const [ttToken, setTtToken] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Fetch user keys
    fetch('/api/user/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setGeminiKey(data.geminiApiKey || "")
          setFbToken(data.facebookAccessToken || "")
          setYtToken(data.youtubeRefreshToken || "")
          setTtToken(data.tiktokAccessToken || "")
        }
      })
      .catch(err => {
        console.error("Failed to load settings", err)
        toast.error("Không thể tải cấu hình cũ")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiApiKey: geminiKey,
          facebookAccessToken: fbToken,
          youtubeRefreshToken: ytToken,
          tiktokAccessToken: ttToken,
        })
      })

      if (res.ok) {
        toast.success("Đã lưu tất cả cấu hình thành công!")
      } else {
        toast.error("Lưu cấu hình thất bại.")
      }
    } catch (e) {
      toast.error("Có lỗi xảy ra khi lưu")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Cài Đặt Tài Khoản</h2>
          <p className="text-neutral-400">Quản lý API Keys và Token mạng xã hội của riêng bạn.</p>
        </div>
        <Button onClick={handleSaveAll} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Lưu Tất Cả
        </Button>
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
        </CardContent>
      </Card>

      <Separator className="bg-neutral-800" />

      {/* Social Accounts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Link2 className="w-5 h-5 text-neutral-400" />
          Chìa Khóa Mạng Xã Hội (Access Tokens)
        </h3>
        <p className="text-sm text-neutral-400">Điền Token định danh cá nhân để cấp quyền đăng video tự động lên tài khoản của bạn.</p>

        {/* Facebook */}
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="py-5 flex sm:flex-row flex-col gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-white">f</div>
              <div>
                <p className="font-medium">Facebook Page Access Token</p>
                <p className="text-xs text-neutral-400">Dùng để đăng Reels và bài viết lên Fanpage cá nhân của bạn</p>
              </div>
            </div>
            <Input type="password" placeholder="EAAB..." value={fbToken} onChange={e => setFbToken(e.target.value)} className="bg-neutral-950 border-neutral-700 w-full sm:w-64 font-mono text-xs" />
          </CardContent>
        </Card>

        {/* YouTube */}
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="py-5 flex sm:flex-row flex-col gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center font-bold text-white">▶</div>
              <div>
                <p className="font-medium">YouTube Refresh Token</p>
                <p className="text-xs text-neutral-400">Dùng để đăng Video và Shorts lên Kênh YouTube của bạn</p>
              </div>
            </div>
            <Input type="password" placeholder="1//0e..." value={ytToken} onChange={e => setYtToken(e.target.value)} className="bg-neutral-950 border-neutral-700 w-full sm:w-64 font-mono text-xs" />
          </CardContent>
        </Card>

        {/* TikTok */}
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="py-5 flex sm:flex-row flex-col gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex-shrink-0 flex items-center justify-center font-bold text-white">T</div>
              <div>
                <p className="font-medium">TikTok Access Token</p>
                <p className="text-xs text-neutral-400">Dùng để đăng bài tự động lên tài khoản TikTok cá nhân</p>
              </div>
            </div>
            <Input type="password" placeholder="act.d..." value={ttToken} onChange={e => setTtToken(e.target.value)} className="bg-neutral-950 border-neutral-700 w-full sm:w-64 font-mono text-xs" />
          </CardContent>
        </Card>
      </div>

      <div className="pt-6 flex items-center gap-2 text-xs text-neutral-500">
        <CheckCircle2 className="w-4 h-4 text-green-500/70 flex-shrink-0" />
        Tất cả mã Token của bạn được lưu mã hóa cực kỳ an toàn trên máy chủ, cam kết không lộ lọt ra ngoài.
      </div>
    </div>
  )
}
