import { UploadDashboard } from "@/components/upload/upload-form"

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight">Trung Tâm Điều Phối Video</h2>
        <p className="text-neutral-400">Chỉ cần tải lên video một lần, để AI viết cho bạn những nội dung thu hút và đăng lên toàn mạng xã hội với một nút bấm.</p>
      </div>
      
      <UploadDashboard />
    </div>
  )
}
