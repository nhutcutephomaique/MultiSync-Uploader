# 🎬 MultiSync Uploader

**Đăng video lên Facebook, YouTube và TikTok cùng một lúc — được hỗ trợ bởi AI tự động tạo tiêu đề & mô tả.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-7-blue?logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|---|---|
| 🎥 **Upload video dùng chung** | Kéo thả 1 video — dùng cho cả 3 nền tảng |
| 🤖 **AI tự động tạo nội dung** | Dùng Gemini Flash API phân tích video, tự viết tiêu đề + caption chuẩn SEO |
| 📲 **Đăng đồng loạt hoặc lẻ** | Đăng cả 3 nền tảng cùng lúc hoặc từng nền tảng riêng lẻ |
| ▶️ **YouTube Shorts / Video dài** | Chọn loại video phù hợp khi đăng lên YouTube |
| 📅 **Hẹn giờ đăng tự động** | Đặt lịch đăng bài tự động theo giờ bạn chọn |
| 📊 **Lịch sử đăng tải** | Theo dõi trạng thái từng công việc đăng tải |
| 🔐 **Đăng nhập Google** | Xác thực an toàn qua OAuth 2.0 |
| ⚙️ **Trang cài đặt** | Quản lý API Key và liên kết tài khoản mạng xã hội |

---

## 🚀 Cài đặt và chạy Local

### Yêu cầu
- Node.js >= 18
- npm >= 9

### 1. Clone và cài đặt thư viện

```bash
git clone https://github.com/nhutcutephomaique/MultiSync-Uploader.git
cd MultiSync-Uploader
npm install
```

### 2. Tạo file môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
# NextAuth
AUTH_SECRET="chuoi-bi-mat-dai-32-ky-tu-bat-ky"
AUTH_URL="http://localhost:3000/api/auth"

# Google OAuth (lấy tại https://console.cloud.google.com)
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Database (PostgreSQL - dùng Supabase hoặc Neon miễn phí)
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### 3. Migrate database

```bash
npx prisma db push
```

### 4. Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt tại **http://localhost:3000** ✅

---

## 🔑 Lấy API Keys

### Google OAuth (Đăng nhập)
1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services → Credentials → Create OAuth Client ID**
3. Application type: **Web application**
4. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy **Client ID** và **Client Secret** vào `.env.local`

### Gemini AI (Tự động tạo nội dung)
1. Vào [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Tạo API Key miễn phí
3. Nhập vào ô **"Gemini AI API Key"** trong ứng dụng (không cần lưu vào file env)

### Database PostgreSQL (Miễn phí)
- **Supabase**: Vào [supabase.com](https://supabase.com) → New Project → Settings → Database → Copy Connection String
- **Neon**: Vào [neon.tech](https://neon.tech) → New Project → Copy Connection String

---

## ☁️ Deploy lên Vercel

### 1. Push code lên GitHub (đã xong)

### 2. Tạo project trên Vercel
- Vào [vercel.com](https://vercel.com) → Import GitHub repo này
- Thêm các **Environment Variables** sau trong Vercel Dashboard:

```
DATABASE_URL        = (Connection string từ Supabase/Neon)
AUTH_SECRET         = (Chuỗi random 32 ký tự)
AUTH_URL            = https://ten-app.vercel.app/api/auth
AUTH_GOOGLE_ID      = (Google Client ID)
AUTH_GOOGLE_SECRET  = (Google Client Secret)
```

### 3. Cập nhật Google OAuth
Thêm Authorized redirect URI mới trong Google Console:
```
https://ten-app.vercel.app/api/auth/callback/google
```

### 4. Migrate database production
```bash
DATABASE_URL="postgresql://..." npx prisma db push
```

---

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   ├── page.tsx              # Trang chính (Upload)
│   ├── login/page.tsx        # Trang đăng nhập Google
│   ├── history/page.tsx      # Lịch sử đăng tải
│   ├── settings/page.tsx     # Cài đặt tài khoản
│   └── api/
│       ├── auth/             # NextAuth handlers
│       ├── upload/           # Upload file API
│       ├── ai/generate/      # Gemini AI API
│       └── publish/          # Đăng lên mạng xã hội
├── components/
│   ├── auth/                 # Login, Logout, AuthStatus
│   ├── layout/               # Navbar
│   └── upload/               # Form upload video
├── lib/
│   ├── prisma.ts             # Prisma client
│   └── upload-with-progress.ts # Upload với progress bar
├── auth.ts                   # NextAuth config
prisma/
└── schema.prisma             # Database schema
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database ORM**: Prisma 7 + PostgreSQL
- **Auth**: NextAuth.js v5 (Google OAuth)
- **UI**: shadcn/ui + Tailwind CSS
- **AI**: Google Gemini 1.5 Flash API
- **Deploy**: Vercel

---

## 📄 License

MIT — Tự do sử dụng và phát triển.
