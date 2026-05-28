import { ChatMessage, APISettings, AppMode } from '../types';

// Standard System Prompt for Preset Mode
const getPresetSystemPrompt = (customAddition: string) => `
Bạn là ST Studio, chuyên gia xây dựng SillyTavern Presets (cấu hình AI).
Nhiệm vụ của bạn là giúp người dùng tạo các thông số cài đặt thế hệ và các **Prompt Blocks** (khối chỉ thị hệ thống) tối ưu cho việc nhập vai (Roleplay) bằng các mô hình ngôn ngữ lớn (đặc biệt là Google Gemini).

Hãy lưu ý:
- Một SillyTavern Preset chất lượng có thể gồm **nhiều Prompt Blocks** khác nhau (ví dụ: block Đạo Diễn, block NSFW/Khung tối, block Văn phong cổ điển, block Chống metagaming, block Lịch trình...).
- Khi người dùng mô tả một preset hoặc một prompt cụ thể, bạn CÓ THỂ xuất ra một block đơn lẻ hoặc danh sách các blocks trong khối code block \`\`\`json\`\`\`.

Schema của Preset đầy đủ:
{
  "temperature": number (0-2),
  "frequency_penalty": number,
  "presence_penalty": number,
  "top_p": number,
  "top_k": number,
  "top_a": number,
  "min_p": number,
  "repetition_penalty": number,
  "openai_max_context": number,
  "openai_max_tokens": number,
  "wrap_in_quotes": false,
  "names_behavior": 0,
  "send_if_empty": "",
  "impersonation_prompt": "string",
  "new_chat_prompt": "",
  "new_group_chat_prompt": "",
  "new_example_chat_prompt": "",
  "continue_nudge_prompt": "string",
  "bias_preset_selected": "Default (none)",
  "max_context_unlocked": true,
  "wi_format": "{0}",
  "scenario_format": "{{scenario}}",
  "personality_format": "{{personality}}",
  "group_nudge_prompt": "",
  "stream_openai": true,
  "prompts": [
    {
      "identifier": "chuỗi-uuid-hoặc-tên-định-danh",
      "name": "Tên khối prompt hiển thị",
      "system_prompt": true,
      "role": "system",
      "content": "Nội dung chỉ thị chi tiết...",
      "enabled": true,
      "injection_position": 0,
      "injection_depth": 4,
      "injection_order": 100,
      "forbid_overrides": false
    }
  ]
}

Nếu bạn chỉ tạo riêng lẻ một hoặc nhiều Prompt Blocks, hãy xuất ra mảng hoặc đối tượng đơn lẻ chứa cấu trúc của prompt block đó để ứng dụng tự động merge.

Sau block JSON, giải thích ngắn gọn ý nghĩa của từng prompt block và các thông số cài đặt bằng tiếng Việt.

${customAddition}
`;

// Standard System Prompt for Regex Mode
const getRegexSystemPrompt = (customAddition: string) => `
Bạn là ST Studio, chuyên gia xây dựng SillyTavern Regex Scripts.
Nhiệm vụ của bạn là tạo các file Regex Script JSON để xử lý và định dạng văn bản (đặc biệt là làm đẹp giao diện UI bằng HTML/CSS trong SillyTavern, lọc thẻ suy nghĩ, bọc các bảng trạng thái, tạo thanh scroller lịch trình, v.v.).

Khi người dùng yêu cầu, bạn PHẢI xuất ra JSON hợp lệ trong code block \`\`\`json\`\`\`.

Schema bắt buộc cho một Regex Script:
{
  "id": "chuỗi-uuid",
  "scriptName": "Tên script hiển thị",
  "findRegex": "/mẫu-regex/flags",
  "replaceString": "Chuỗi thay thế (Có thể chứa mã HTML/CSS inline để làm đẹp UI nếu markdownOnly: true)",
  "trimStrings": [],
  "placement": [2],
  "disabled": false,
  "markdownOnly": true,
  "promptOnly": false,
  "runOnEdit": true,
  "substituteRegex": 0,
  "minDepth": null,
  "maxDepth": null
}

Lưu ý:
- placement [2]: áp dụng cho AI output (phổ biến nhất khi làm đẹp UI bot)
- placement [1]: áp dụng cho user input (đầu vào của người chơi)
- markdownOnly: true nếu replaceString chứa HTML render UI (SillyTavern sẽ hiển thị như một widget HTML)
- promptOnly: true nếu chỉ muốn filter text trước khi gửi đi (không hiển thị ra chat)
- Khi thiết kế widget HTML làm đẹp UI, hãy viết inline CSS hoàn chỉnh, responsive, hỗ trợ dark theme tuyệt đối, màu sắc hài hòa cao cấp.

Sau block JSON, giải thích cách hoạt động của regex bằng tiếng Việt.

${customAddition}
`;

export async function callAI(
  userMessage: string,
  history: ChatMessage[],
  settings: APISettings,
  currentMode: AppMode
): Promise<string> {
  const isDirect = !settings.useProxy;
  const systemPrompt = currentMode === 'preset' 
    ? getPresetSystemPrompt(settings.systemPromptAddition)
    : getRegexSystemPrompt(settings.systemPromptAddition);

  // 1. DIRECT GEMINI API CALL
  if (isDirect) {
    if (!settings.apiKey) {
      throw new Error("Chưa nhập API key. Vào ⚙ Cài đặt.");
    }

    const modelName = settings.selectedModel || 'gemini-2.5-pro';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${settings.apiKey}`;

    // Map history to Gemini format (roles must be alternate user/model)
    const contents: { role: string; parts: { text: string }[] }[] = [];
    
    if (settings.keepContext && history.length > 0) {
      history.forEach(msg => {
        if (msg.role === 'system') return; // Gemini system instructions are separate
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens: settings.maxTokens,
        }
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("API key không hợp lệ.");
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Lỗi API (${response.status})`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      throw new Error("AI không trả về nội dung.");
    }
    return replyText;
  } 
  
  // 2. PROXY CALL (OpenAI-compatible / Custom)
  else {
    if (!settings.proxyUrl) {
      throw new Error("Chưa nhập URL Proxy. Vào ⚙ Cài đặt.");
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (settings.proxyKey) {
      headers['Authorization'] = `Bearer ${settings.proxyKey}`;
    }

    const messages = [];
    messages.push({ role: 'system', content: systemPrompt });

    if (settings.keepContext) {
      history.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    messages.push({ role: 'user', content: userMessage });

    // Handle standard OpenAI endpoint conversion
    let endpoint = settings.proxyUrl;
    if (!endpoint.endsWith('/chat/completions') && !endpoint.includes('/generateContent')) {
      // If it's a base URL, append completions path
      endpoint = endpoint.replace(/\/$/, '') + '/chat/completions';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: settings.selectedModel,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Proxy key không hợp lệ.");
      }
      throw new Error(`Proxy không phản hồi. Lỗi code: ${response.status}`);
    }

    const data = await response.json();
    // Support either OpenAI structure or standard response
    const replyText = data.choices?.[0]?.message?.content || data.content?.[0]?.text || data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      throw new Error("AI qua Proxy không xuất ra văn bản.");
    }
    return replyText;
  }
}

/**
 * Fetch available models from custom Proxy URL
 */
export async function scanProxyModels(proxyUrl: string, proxyKey: string): Promise<string[]> {
  if (!proxyUrl) {
    throw new Error("URL Proxy trống.");
  }

  let endpoint = proxyUrl.replace(/\/$/, '');
  if (!endpoint.endsWith('/models')) {
    endpoint = endpoint + '/models';
  }

  const headers: Record<string, string> = {};
  if (proxyKey) {
    headers['Authorization'] = `Bearer ${proxyKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error("Không thể quét danh sách model từ Proxy.");
  }

  const data = await response.json();
  if (Array.isArray(data.data)) {
    return data.data.map((m: { id?: string }) => m.id).filter(Boolean) as string[];
  }
  throw new Error("Định dạng dữ liệu model trả về không được hỗ trợ.");
}
