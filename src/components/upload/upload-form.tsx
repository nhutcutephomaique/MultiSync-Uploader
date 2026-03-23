"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Upload, Wand2, KeyRound, Clock, Calendar } from "lucide-react"

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

  // Fetch token settings to know if user has Facebook token ready
  const [userSettings, setUserSettings] = useState<any>({})

  useEffect(() => {
    fetch('/api/user/settings')
      .then(res => res.json())
      .then(data => {
         if (data && !data.error) {
           setUserSettings(data)
           if (data.geminiApiKey) setApiKey(data.geminiApiKey)
         }
      }).catch(e => console.error(e))
  }, [])

  const updatePlatformData = (platform: string, data: Partial<PlatformData>) => {
    setPlatforms(prev => ({ ...prev, [platform]: { ...prev[platform], ...data } }))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  /* PUBLISHING WORKER FUNCTIONS */
  const publishToFacebook = async () => {
    if (!userSettings.facebookAccessToken) throw new Error("Chưa thêm Access Token Facebook trong Cài Đặt.");
    setUploadProgress(10);
    const formData = new FormData();
    formData.append("access_token", userSettings.facebookAccessToken);
    formData.append("source", file!);
    formData.append("title", platforms.facebook.title);
    formData.append("description", platforms.facebook.description);
    
    setUploadProgress(30);
    const res = await fetch("https://graph.facebook.com/v19.0/me/videos", { method: "POST", body: formData });
    const data = await res.json();
    setUploadProgress(100);
    
    if (!res.ok) {
        if (data.error?.message?.includes("CORS")) throw new Error("Bị chặn CORS - Thử kết nối trực tiếp hoặc kiểm tra proxy");
        throw new Error(data.error?.message || "Lỗi tải lên Facebook");
    }
    return data;
  }

  const publishToYouTube = async () => {
    setUploadProgress(10);
    const authRes = await fetch("/api/publish/youtube/auth", { method: "POST" });
    if (!authRes.ok) {
       const err = await authRes.json();
       throw new Error(err.error || "Lỗi xác thực YouTube. Refresh Token có thể đã hết hạn.");
    }
    const { accessToken } = await authRes.json();
    
    setUploadProgress(30);
    const metadata = {
      snippet: { title: platforms.youtube.title, description: platforms.youtube.description },
      status: { privacyStatus: "public", selfDeclaredMadeForKids: false }
    };
    
    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file!);
    
    const res = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    
    const data = await res.json();
    setUploadProgress(100);
    
    if (!res.ok) {
        if (data.error?.message?.includes("CORS")) {
             throw new Error("CORS: Bạn cần thêm domain web vào 'Authorized JavaScript origins' ở Google Cloud Console");
        }
        throw new Error(data.error?.message || "Lỗi API YouTube");
    }
    return data;
  }

  const publishToTikTok = async () => {
    setUploadProgress(10);
    const initRes = await fetch("/api/publish/tiktok/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoSize: file!.size })
    });
    if (!initRes.ok) {
      const err = await initRes.json();
      if (err.details?.error?.code === "ok") {
        // sometimes TikTok errors are wrapped strangely
      } else {
        throw new Error(err.error || "Lỗi khởi tạo TikTok - Vui lòng kiểm tra lại Access Token");
      }
    }
    
    const { result: initData } = await initRes.json();
    if (!initData?.upload_url) throw new Error("TikTok không trả về URL tải lên.");
    
    const publishId = initData.publish_id;
    const uploadUrl = initData.upload_url;
    
    setUploadProgress(40);
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file!.type || "video/mp4",
        "Content-Range": `bytes 0-${file!.size - 1}/${file!.size}`
      },
      body: file!
    });
    
    if (!uploadRes.ok) throw new Error("Lỗi đứt cáp khi tải lên máy chủ TikTok");
    
    setUploadProgress(80);
    const confirmRes = await fetch("/api/publish/tiktok/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publishId, title: platforms.tiktok.title, description: platforms.tiktok.description })
    });
    if (!confirmRes.ok) throw new Error("Lỗi khi báo cáo hoàn tất đăng video TikTok");
    
    setUploadProgress(100);
    return await confirmRes.json();
  }

  const handlePublishAll = async () => {
    if (!file) { toast.error("Vui lòng tải video chung lên trước."); return; }
    
    const validPlatforms = Object.entries(platforms).filter(([_, data]) => data.title.trim() !== "");
    if (validPlatforms.length === 0) {
      toast.error("Vui lòng sinh nội dung cho ít nhất một nền tảng.");
      return;
    }

    setIsPublishing(true);
    setUploadProgress(5);
    toast.info("Bắt đầu khởi động động cơ tải lên máy chủ mẹ trực tiếp từ trình duyệt...");
    
    let successCount = 0;
    
    // Process one by one sequentially just to track progress better
    for (const [platform, data] of validPlatforms) {
        setUploadProgress(10);
        try {
            if (platform === "facebook") await publishToFacebook();
            else if (platform === "youtube") await publishToYouTube();
            else if (platform === "tiktok") await publishToTikTok();
            
            successCount++;
            toast.success(`✅ Đã rải bom video lên ${platform.toUpperCase()} thành công!`);
        } catch (e: any) {
            toast.error(`❌ Lỗi đăng ${platform.toUpperCase()}: ` + e.message, { duration: 8000 });
        }
    }
    
    if (successCount > 0) {
       toast.success(`🎉 Hoàn tất! Bạn đã ném video lên ${successCount} trạm không gian!`, { duration: 5000 });
    }
    setIsPublishing(false);
    setUploadProgress(0);
  }

  const handlePublishSingle = async (platform: string) => {
    if (!file) { toast.error("Vui lòng tải video chung lên trước."); return; }
    if (!platforms[platform].title) { toast.error(`Vui lòng nhập Tiêu đề cho ${platform} trước khi đăng lẻ.`); return; }

    setIsPublishing(true);
    setUploadProgress(0);
    toast.info(`Máy chủ đang mở luồng tải trực tiếp video lên ${platform}...`);
    
    try {
        if (platform === "facebook") await publishToFacebook();
        else if (platform === "youtube") await publishToYouTube();
        else if (platform === "tiktok") await publishToTikTok();
        
        toast.success(`🚀 Gửi video lên ${platform.toUpperCase()} HOÀN HẢO!`);
    } catch (e: any) {
        toast.error(`❌ Bể bánh xe với ${platform.toUpperCase()}: ` + e.message, { duration: 8000 });
    } finally {
        setIsPublishing(false);
        setUploadProgress(0);
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
        <h3 className="font-semibold text-lg">{file ? file.name : "Kéo & Thả Video Vào Đây Để Dùng Chung Cả 3 Kênh"}</h3>
        <p className="text-sm text-neutral-400 mt-2 text-center max-w-sm">
          {file 
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB đã ghi nhận thành công.` 
            : `Trình duyệt tự xử lý cực nhanh, không qua server Vercel chặn lỗi.`}
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
      {isPublishing && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Đang bắn gói tin lên nhà đài... (Trực tiếp từ trình duyệt)
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
                   Gemini AI API Key (Key Dùng Chung)
                 </Label>
                 <Input 
                    id="master-api-key"
                    type="password" 
                    placeholder="Nhập khóa định danh AIza... ở đây hoặc trong Cài đặt" 
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
          {isPublishing ? "ĐANG RẢI THẢM VIDEO BẰNG HỆ THỐNG TRUYỀN TẢI THẲNG..." : "🚀 BẮN LÊN 3 NỀN TẢNG CÙNG LÚC"}
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
    if (!file) { toast.error("Vui lòng tải video chung ở khu vực nét đứt bên trên trước."); return }
    if (!apiKey) { toast.error("Vui lòng nhập Gemini AI API Key trước."); return }
    
    setIsGenerating(true)
    toast.info(`Đang gọi AI cho ${platform}...`)
    
    try {
      const aiRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, platform })
      })
      
      if (!aiRes.ok) {
         const err = await aiRes.json()
         throw new Error(err.error || "Lỗi giao tiếp Gemini")
      }
      
      const resData = await aiRes.json()
      onChange({ title: resData.title || "", description: resData.description || "" })
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
            </div>
          )}
        </CardContent>
      </Card>

      {platform === "youtube" && (
        <div className="p-4 border border-red-900/40 rounded-xl bg-red-950/10 space-y-3 animate-in fade-in">
          <Label className="text-red-400 font-semibold flex items-center gap-2">▶ Loại Video YouTube</Label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onChange({ youtubeType: "long" })} className={`p-4 rounded-xl border-2 text-left transition-all ${(data.youtubeType ?? "long") === "long" ? "border-red-500 bg-red-500/15 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-400"}`}>
              <p className="font-bold text-lg">🎬 Video Dài</p>
            </button>
            <button onClick={() => onChange({ youtubeType: "short" })} className={`p-4 rounded-xl border-2 text-left transition-all ${data.youtubeType === "short" ? "border-red-500 bg-red-500/15 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-400"}`}>
              <p className="font-bold text-lg">⚡ YouTube Shorts</p>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tiêu đề cực lôi cuốn ({platform})</Label>
          <Input placeholder={`Chưa có tiêu đề cho ${platform}...`} value={data.title} onChange={(e) => onChange({ title: e.target.value })} className="bg-neutral-900 border-neutral-800" />
        </div>
        <div className="space-y-2">
          <Label>Nội dung chi tiết (Caption) & Hashtags</Label>
          <textarea rows={8} className="flex w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400" placeholder={`Hãy giải thích nội dung sâu sắc... \n\n#${platform}`} value={data.description} onChange={(e) => onChange({ description: e.target.value })} />
        </div>
      </div>

      <div className="pt-4 flex justify-end pb-2">
        <Button onClick={onPublishSingle} disabled={isPublishingGlobal || isGenerating || !file} size="lg" variant="outline" className="w-full sm:w-auto border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 transition-colors hover:text-white">
          {isPublishingGlobal ? "Đang xử lý chung..." : `Đăng ${platform === "tiktok" ? "nhanh" : "riêng"} lên ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
        </Button>
      </div>
    </div>
  )
}
