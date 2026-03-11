export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SYSTEM = `You are Lumis, a brilliant and refined general-purpose AI assistant with real-time web search. You are warm, clear, and genuinely insightful. Help with anything.

When the user asks about current events, news, weather, sports, prices or anything requiring up-to-date info, respond ONLY with this JSON:
{"action":"search","query":"<your search query>"}

When generating images respond ONLY with:
{"action":"generate_image","prompt":"<detailed prompt>","caption":"<short caption>"}

For everything else respond normally. After search results, summarize naturally.`;

  try {
    const { messages } = req.body;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM }, ...messages],
        max_tokens: 1024,
        temperature: 0.65
      })
    });
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: 'Server error: ' + err.message } });
  }
}
