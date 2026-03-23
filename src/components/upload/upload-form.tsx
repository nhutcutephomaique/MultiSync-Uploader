"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Upload, Wand2, KeyRound, Clock, Calendar } from "lucide-react"
import { uploadFileWithProgress } from "@/lib/upload-with-progress"

export type PlatformData = {
  title: string;
  description: string;
  youtubeType?: "long" | "short";
  scheduledAt?: string;
}

export function UploadDashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [platforms, setPlatforms] = useState<Record<string, PlatformData>>({
    facebook: { title: "", description: "" },
    youtube: { title: "", description: "" },
    tiktok: { title: "", description: "" },
  })
  const [isPublishing, setIsPublishing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const updatePlatformData = (platform: string, data: Partial<PlatformData>) => {
    setPlatforms(prev => ({
      ...prev,
      [platform]: { ...prev[platform], ...data }
    }))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handlePublishAll = async () => {
    if (!file) {
      toast.error("Vui lòng tải video chung lên trước.")
      return
    }
    
    // Check if at least one platform has config
    const hasData = Object.values(platforms).some(p => p.title.trim() !== "");
    if (!hasData) {
      toast.error("Vui lòng sinh nội dung hoặc nhập tiêu đề cho ít nhất một nền tảng.")
      return
    }

    setIsPublishing(true)
    setIsUploading(true)
    setUploadProgress(0)
    toast.info("Đang xử lý xuất bản lên toàn bộ hệ thống...", {
      description: "Video đang được tải lên server và đưa vào hàng đợi."
    })
    
    try {
        const { fileUrl } = await uploadFileWithProgress(file, (pct) => setUploadProgress(pct))
        setIsUploading(false)

        let successCount = 0;
        for (const [platform, data] of Object.entries(platforms)) {
          if (data.title) {
            const pubRes = await fetch("/api/publish", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ videoUrl: fileUrl, title: data.title, description: data.description, platform })
            })
            if (pubRes.ok) successCount++;
          }
        }
        
        toast.success(`Đã đưa thành công ${successCount} nền tảng vào hàng đợi đăng tải!`)
    } catch (e: any) {
        toast.error("Lỗi đăng tải chung: " + e.message)
    } finally {
        setIsPublishing(false)
        setIsUploading(false)
        setUploadProgress(0)
    }
  }

  const handlePublishSingle = async (platform: string) => {
    if (!file) {
      toast.error("Vui lòng tải video chung lên trước.")
      return
    }
    
    const data = platforms[platform]
    if (!data.title) {
      toast.error(`Vui lòng nhập Tiêu đề cho ${platform} trước khi đăng lẻ.`)
      return
    }

    setIsPublishing(true)
    setIsUploading(true)
    setUploadProgress(0)
    toast.info(`Đang xử lý xuất bản RIÊNG cho ${platform} ...`)
    
    try {
        const { fileUrl } = await uploadFileWithProgress(file, (pct) => setUploadProgress(pct))
        setIsUploading(false)

        const pubRes = await fetch("/api/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoUrl: fileUrl, title: data.title, description: data.description, platform })
        })
        
        if (!pubRes.ok) throw new Error("API phản hồi lỗi từ " + platform)
        
        toast.success(`Đã xếp hàng đợi video đăng lên ${platform.toUpperCase()} thành công!`)
    } catch (e: any) {
        toast.error(`Lỗi đăng riêng lên ${platform}: ` + e.message)
    } finally {
        setIsPublishing(false)
        setIsUploading(false)
        setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      
      {/* Upload Zone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors
          ${file ? "border-green-500 bg-green-500/10 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]" : "border-neutral-700 hover:border-blue-500 hover:bg-neutral-800/50"}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className={`w-10 h-10 mb-4 ${file ? "text-green-500" : "text-neutral-400"}`} />
        <h3 className="font-semibold text-lg">{file ? file.name : "Kéo & Thả Video Vào Đây Để Dùng Chung Cả 3 Web"}</h3>
        <p className="text-sm text-neutral-400 mt-2 text-center max-w-sm">
          {file 
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB đã ghi nhận thành công.` 
            : `Hỗ trợ MP4, WebM hoặc MOV tối đa 1GB.`}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={() => document.getElementById('global-file-upload')?.click()}>
            Duyệt File Trên Máy
          </Button>
          <input 
            type="file" 
            id="global-file-upload"
            className="hidden" 
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
          />
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Đang tải video lên máy chủ...
            </span>
            <span className="font-bold text-blue-400">{uploadProgress}%</span>
          </div>
          <Progress
            value={uploadProgress}
            className="h-3 bg-neutral-800 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-400 [&>div]:transition-all [&>div]:duration-300"
          />
        </div>
      )}

      {/* Global AI API Key Setting */}
      <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
             <div className="flex-1 w-full">
                 <Label htmlFor="master-api-key" className="flex items-center gap-2 text-indigo-400 font-semibold mb-3">
                   <KeyRound className="w-5 h-5" /> 
                   Gemini AI API Key (Dùng Chung Cho Tất Cả Các Kênh)
                 </Label>
                 <Input 
                    id="master-api-key"
                    type="password" 
                    placeholder="Nhập khóa định danh AIza... duy nhất 1 lần ở đây để AI tự hoạt động trên mọi Tab" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-neutral-950 border-neutral-700 w-full"
                  />
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="facebook" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-neutral-900 border border-neutral-800 p-1 h-12 rounded-xl">
          <TabsTrigger value="facebook" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Facebook</TabsTrigger>
          <TabsTrigger value="youtube" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all">YouTube</TabsTrigger>
          <TabsTrigger value="tiktok" className="rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all">TikTok</TabsTrigger>
        </TabsList>
        
        <div className="mt-6 border border-neutral-800 rounded-2xl bg-neutral-900/40 p-6 shadow-xl backdrop-blur-sm">
          {["facebook", "youtube", "tiktok"].map((plat) => (
             <TabsContent key={plat} value={plat} className="m-0 focus-visible:outline-none focus-visible:ring-0">
               <PlatformForm 
                 platform={plat} 
                 data={platforms[plat]} 
                 onChange={(data) => updatePlatformData(plat, data)}
                 file={file}
                 apiKey={apiKey}
                 onPublishSingle={() => handlePublishSingle(plat)}
                 isPublishingGlobal={isPublishing}
               />
             </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* Publish All Button */}
      <div className="pt-6 pb-20 flex justify-center border-t border-neutral-800">
        <Button 
           onClick={handlePublishAll} 
           disabled={isPublishing} 
           size="lg" 
           className="w-full max-w-xl h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold tracking-wider shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)] transition-all rounded-xl"
        >
          {isPublishing ? "ĐANG TẢI LÊN & XỬ LÝ ĐỒNG LOẠT..." : "🚀 ĐĂNG LÊN TẤT CẢ NỀN TẢNG CÙNG LÚC"}
        </Button>
      </div>
    </div>
  )
}

function PlatformForm({ 
  platform, 
  data, 
  onChange, 
  file, 
  apiKey, 
  onPublishSingle,
  isPublishingGlobal
}: { 
  platform: string, 
  data: PlatformData, 
  onChange: (d: Partial<PlatformData>) => void,
  file: File | null,
  apiKey: string,
  onPublishSingle: () => void,
  isPublishingGlobal: boolean
}) {
  const [useAI, setUseAI] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [useSchedule, setUseSchedule] = useState(false)

  const handleGenerateAI = async () => {
    if (!file) {
      toast.error("Vui lòng tải video chung ở khu vực nét đứt bên trên trước.")
      return
    }
    if (!apiKey) {
      toast.error("Vui lòng nhập Gemini AI API Key ở ô dùng chung bên trên để AI có thể làm việc.")
      return
    }
    
    setIsGenerating(true)
    toast.info(`Đang phân tích video cho ${platform}...`, {
      description: "Hệ thống gọi API của Google Gemini siêu việt."
    })
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) throw new Error("Lỗi khi tải video lên server cục bộ")
      const { fileUrl } = await uploadRes.json()

      const aiRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, apiKey, platform })
      })
      
      if (!aiRes.ok) {
         const err = await aiRes.json()
         throw new Error(err.error || "Lỗi giao tiếp Gemini")
      }
      
      const resData = await aiRes.json()
      
      onChange({
        title: resData.title || "",
        description: resData.description || ""
      })
      toast.success(`Đã tự động đắp nặn kịch bản đỉnh cao cho kênh ${platform}!`)
    } catch (e: any) {
      toast.error("Quá trình AI gặp lỗi: " + e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="bg-neutral-900/40 border-neutral-800 backdrop-blur">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-3 border border-neutral-800 rounded-lg bg-neutral-950/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Viết bài SEO riêng cho {platform.toUpperCase()}</h4>
                <p className="text-xs text-neutral-400">Thiết kế hoàn hảo bắt chước văn phong của mạng xã hội này</p>
              </div>
            </div>
            <Switch checked={useAI} onCheckedChange={setUseAI} />
          </div>

          {useAI && (
            <div className="p-4 border border-indigo-500/30 rounded-lg bg-indigo-500/5 space-y-4 animate-in fade-in zoom-in-95">
              <Button onClick={handleGenerateAI} disabled={isGenerating || isPublishingGlobal || !file} className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-md border-0 uppercase tracking-wider">
                {isGenerating ? "Đang Vắt Óc Điền Thay Bạn..." : `🪄 Sinh Nội Dung Cho ${platform}`}
              </Button>
              <p className="text-xs text-center text-neutral-400">Sử dụng API Key dùng chung phía trên để phân tích video hiện tại (Không mất thêm thao tác copy)</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* YouTube Type Selector */}
      {platform === "youtube" && (
        <div className="p-4 border border-red-900/40 rounded-xl bg-red-950/10 space-y-3 animate-in fade-in">
          <Label className="text-red-400 font-semibold flex items-center gap-2">
            ▶ Loại Video YouTube
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onChange({ youtubeType: "long" })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                (data.youtubeType ?? "long") === "long"
                  ? "border-red-500 bg-red-500/15 text-white"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600"
              }`}
            >
              <p className="font-bold text-lg">🎬 Video Dài</p>
              <p className="text-xs mt-1 opacity-70">Trên 60 giây, nằm trong tab Videos của kênh</p>
            </button>
            <button
              onClick={() => onChange({ youtubeType: "short" })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.youtubeType === "short"
                  ? "border-red-500 bg-red-500/15 text-white"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600"
              }`}
            >
              <p className="font-bold text-lg">⚡ YouTube Shorts</p>
              <p className="text-xs mt-1 opacity-70">Dưới 60 giây, xuất hiện trong tab Shorts</p>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tiêu đề cực lôi cuốn ({platform})</Label>
          <Input 
            placeholder={`Chưa có tiêu đề cho ${platform}...`}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="bg-neutral-900 border-neutral-800"
          />
        </div>
        <div className="space-y-2">
          <Label>Nội dung chi tiết (Caption) & Hashtags</Label>
          <textarea 
            rows={8} 
            className="flex w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={`Hãy giải thích nội dung sâu sắc... \n\n#${platform} #trending`}
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      </div>

      {/* Scheduled Post */}
      <Card className="bg-neutral-900/40 border-neutral-800">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-yellow-400 font-medium">
              <Calendar className="w-4 h-4" />
              Hẹn giờ đăng tự động
            </Label>
            <Switch checked={useSchedule} onCheckedChange={setUseSchedule} />
          </div>
          {useSchedule && (
            <div className="animate-in fade-in zoom-in-95 space-y-2">
              <Input 
                type="datetime-local"
                value={data.scheduledAt || ""}
                onChange={(e) => onChange({ scheduledAt: e.target.value })}
                className="bg-neutral-950 border-neutral-700 text-white [color-scheme:dark]"
                min={new Date().toISOString().slice(0,16)}
              />
              <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Hệ thống sẽ tự động đăng bài vào giờ đã chọn — không cần mở lại ứng dụng.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pt-4 flex justify-end pb-2">
        <Button 
          onClick={onPublishSingle} 
          disabled={isPublishingGlobal || isGenerating || !file} 
          size="lg" 
          variant="outline"
          className="w-full sm:w-auto border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 transition-colors hover:text-white"
        >
          {isPublishingGlobal ? "Đang xử lý chung..." : `Đăng ${platform === "tiktok" ? "nhanh" : "riêng"} lên ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
        </Button>
      </div>

    </div>
  )
}
