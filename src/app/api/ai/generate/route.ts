import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, platform } = await request.json();
    if (!apiKey || !platform) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Text-based content generation - no video file needed
    const prompt = `Bạn là một chuyên gia sáng tạo nội dung mạng xã hội bậc thầy. Tôi chuẩn bị đăng tải một video trên nền tảng ${platform}. Nhiệm vụ của bạn là:
1. Viết một tiêu đề (title) thật giật gân, thu hút sự chú ý và tối ưu SEO cho ${platform}.
2. Viết phần MÔ TẢ CỰC KỲ CHI TIẾT (description): bao gồm lời chào, nội dung giới thiệu lôi cuốn phân bổ thành 3-4 đoạn rõ ràng, lời kêu gọi hành động (Call to action), và một danh sách 10 đến 15 thẻ hashtags tối ưu theo xu hướng hiện nay.

Hãy phân tích cực kỳ kĩ về nền tảng ${platform} để đưa ra văn phong phù hợp nhất (phong cách ngắn gọn bí ẩn với Tiktok, hàn lâm sâu sắc với Youtube, hoặc tương tác cao với Facebook).

Trả lời DUY NHẤT một chuỗi nội dung JSON (không kèm chuỗi markdown text nào, chỉ bắt đầu bằng \`{\` và kết thúc bằng \`}\`) có cấu trúc sau:
{
  "title": "<Tiêu đề tuyệt hay>",
  "description": "<Đoạn mô tả siêu chi tiết và hashtag>"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      const errMsg = err.error?.message || "Lỗi từ Gemini API";
      // Provide clearer Vietnamese message for quota exceeded
      if (errMsg.includes("quota") || errMsg.includes("Quota") || response.status === 429) {
        return NextResponse.json({
          error: "⚠️ API Key Gemini của bạn đã hết hạn mức miễn phí hôm nay. Vui lòng chờ reset lúc 7:00 sáng (giờ VN) hoặc tạo API Key mới tại aistudio.google.com"
        }, { status: 429 });
      }
      if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("invalid")) {
        return NextResponse.json({ error: "❌ API Key Gemini không hợp lệ. Vui lòng kiểm tra lại key trong phần Cài Đặt." }, { status: 401 });
      }
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (textOutput) {
      return NextResponse.json(JSON.parse(textOutput));
    } else {
      throw new Error("No text output from Gemini");
    }

  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Could not generate AI content." }, { status: 500 });
  }
}
