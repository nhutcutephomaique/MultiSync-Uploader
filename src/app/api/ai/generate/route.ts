import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, apiKey, platform } = await request.json();
    if (!fileUrl || !apiKey || !platform) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // In a real scenario using the exact Gemini Video File API:
    // 1. Read the file from disk (since fileUrl is relative local path like '/uploads/123.mp4')
    // 2. Upload it to Gemini File API to get a file URI.
    // 3. Ask Gemini Flash 1.5 to generate the prompt.
    
    // Using simple text generation for now to validate API integration.
    const prompt = `Bạn là một chuyên gia sáng tạo nội dung mạng xã hội bậc thầy. Tôi vừa tải lên một tác phẩm video chuẩn bị đăng tải trên nền tảng ${platform}. Nhiệm vụ của bạn là:
1. Viết một tiêu đề (title) thật giật gân, thu hút sự chú ý và tối ưu SEO cho ${platform}.
2. Viết phần MÔ TẢ CỰC KỲ CHI TIẾT (description): Rất chi tiết, bao gồm lời chào, nội dung giới thiệu lôi cuốn phân bổ thành 3-4 đoạn rõ ràng, các bài học/giá trị mang lại cho người xem (cực chi tiết), lời kêu gọi hành động (Call to action như Đăng ký/Follow/Mua hàng), và một danh sách 10 đến 15 thẻ hashtags tối ưu theo xu hướng hiện nay.

Hãy phân tích cực kỳ kĩ về nền tảng ${platform} để đưa ra văn phong phù hợp nhất (ví dụ phong cách ngắn gọn bí ẩn với Tiktok, hàn lâm sâu sắc với Youtube, hoặc tương tác cao với Facebook).

Trả lời DUY NHẤT một chuỗi nội dung JSON (không kèm chuỗi markdown text nào, chỉ bắt đầu bằng \`{\` và kết thúc bằng \`}\`) có cấu trúc sau:
{
  "title": "<Tiêu đề tuyệt hay>",
  "description": "<Đoạn mô tả siêu chi tiết và hashtag>"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
        const err = await response.json();
        return NextResponse.json({ error: err.error?.message || "Lỗi từ Gemini API" }, { status: 500 });
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (textOutput) {
        return NextResponse.json(JSON.parse(textOutput));
    } else {
        throw new Error("No text output from Gemini format");
    }

  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Could not generate AI content." }, { status: 500 });
  }
}
