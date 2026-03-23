"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle, ChevronDown, Video, Link2, Calendar, Inbox } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type Job = {
  id: string
  platform: string
  status: string
  postUrl?: string | null
  error?: string | null
  createdAt: string
  scheduledAt?: string | null
  video: {
    title?: string | null
    fileName: string
    description?: string | null
  }
}

const platformColors: Record<string, string> = {
  facebook: "bg-blue-600",
  youtube: "bg-red-600",
  tiktok: "bg-cyan-600",
}

const platformLabel: Record<string, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; progress?: number }> = {
  pending: { label: "Đang chờ", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" />, progress: 0 },
  uploading: { label: "Đang tải lên", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Clock className="w-3 h-3 animate-spin" />, progress: 65 },
  success: { label: "Thành công", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  error: { label: "Lỗi", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <AlertCircle className="w-3 h-3" /> },
}

function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false)
  const sc = statusConfig[job.status] || statusConfig.pending
  const isUploading = job.status === "uploading"

  return (
    <Card className="bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 transition-all overflow-hidden">
      <CardContent className="py-4 px-5">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${platformColors[job.platform] || "bg-neutral-700"}`}>
            <Video className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0 cursor-pointer select-none group" onClick={() => setExpanded(!expanded)}>
            <div className="flex items-center gap-2">
              <p className="font-medium truncate group-hover:text-white transition-colors">
                {job.video.title || job.video.fileName}
              </p>
              <ChevronDown className={`w-4 h-4 text-neutral-500 flex-shrink-0 transition-transform duration-300 ${expanded ? "rotate-180 text-white" : ""}`} />
            </div>
            <p className="text-xs text-neutral-400 capitalize mt-0.5">
              {platformLabel[job.platform]} · {new Date(job.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${sc.color}`}>
              {sc.icon}{sc.label}
            </span>
            {job.postUrl && (
              <a href={job.postUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">Xem bài</a>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="mt-4 space-y-1.5 animate-in fade-in">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Đang tải lên máy chủ...</span>
              <span className="text-blue-400 font-medium">{sc.progress ?? 0}%</span>
            </div>
            <Progress value={sc.progress ?? 0} className="h-2 bg-neutral-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-400" />
          </div>
        )}
      </CardContent>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden border-t border-neutral-800/0 ${expanded ? "max-h-[400px] border-neutral-800" : "max-h-0"}`}>
        <div className="px-5 py-4 bg-neutral-950/40 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Tên tệp</p>
              <p className="text-neutral-200 font-mono text-xs truncate">{job.video.fileName}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Nền tảng</p>
              <p className="text-neutral-200">{platformLabel[job.platform]}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Thời gian tạo</p>
              <p className="text-neutral-200 text-xs">{new Date(job.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            {job.scheduledAt && (
              <div>
                <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Hẹn giờ đăng</p>
                <p className="text-yellow-400 text-xs">{new Date(job.scheduledAt).toLocaleString("vi-VN")}</p>
              </div>
            )}
          </div>

          {job.video.description && (
            <div>
              <p className="text-xs text-neutral-500 mb-1">Caption / Mô tả</p>
              <p className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                {job.video.description}
              </p>
            </div>
          )}

          {job.error && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40">
              <p className="text-xs text-red-400 font-medium mb-1 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Chi tiết lỗi</p>
              <p className="text-xs text-red-300">{job.error}</p>
            </div>
          )}

          {job.postUrl && (
            <a href={job.postUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <Link2 className="w-4 h-4" />
              Mở bài viết đã đăng
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

// Empty state — no mock data. Real data will come from DB after deploy.
const jobs: Job[] = []

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Lịch sử Đăng Tải</h2>
        <p className="text-neutral-400">Theo dõi trạng thái tất cả video đã và đang được đăng lên các nền tảng. Nhấn vào tiêu đề để xem chi tiết.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng công việc", value: jobs.length, color: "text-white" },
          { label: "Thành công", value: jobs.filter(j => j.status === "success").length, color: "text-green-400" },
          { label: "Đang xử lý", value: jobs.filter(j => ["pending","uploading"].includes(j.status)).length, color: "text-yellow-400" },
          { label: "Lỗi", value: jobs.filter(j => j.status === "error").length, color: "text-red-400" },
        ].map(stat => (
          <Card key={stat.label} className="bg-neutral-900/60 border-neutral-800">
            <CardContent className="pt-5 pb-5 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-neutral-400 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Jobs List — empty state when no data */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center">
            <Inbox className="w-8 h-8 text-neutral-500" />
          </div>
          <p className="text-neutral-400 font-medium">Chưa có video nào được đăng tải</p>
          <p className="text-sm text-neutral-600 max-w-xs">Quay lại trang chủ, tải video lên và nhấn Đăng để bắt đầu. Lịch sử sẽ hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
