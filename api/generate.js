
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://shitaaaa.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { style, topic, length, avoid } = req.body;
  if (!style || !topic) return res.status(400).json({ error: '缺少必要參數' });

  const avoidStr = avoid && avoid.length > 0 ? `請避免涉及：${avoid.join('、')}。` : '';

  const prompt = `你是一個台灣社群媒體文案達人，專門寫讓人看了會想按讚、分享的貼文。

請用「${style}」的風格，針對話題「${topic}」，寫一則${length}的中文社群貼文。

${avoidStr}
要求：
- 語氣自然親切，像朋友在說話
- 可加 1-2 個適當的 emoji
- 結尾可加個小哏或問句引發互動
- 直接給貼文內容，不需要任何說明

請開始：`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.content && data.content[0]) {
      return res.status(200).json({ text: data.content[0].text });
    }
    return res.status(500).json({ error: '產生失敗，請再試一次' });
  } catch (err) {
    return res.status(500).json({ error: '伺服器錯誤：' + err.message });
  }
}
