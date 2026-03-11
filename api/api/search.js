export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'No query provided' });

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(url);
    const data = await response.json();

    let results = '';
    if (data.AbstractText) results += data.AbstractText + '\n\n';
    if (data.Answer) results += data.Answer + '\n\n';
    if (data.RelatedTopics) {
      data.RelatedTopics.slice(0, 6).forEach(t => {
        if (t.Text) results += '• ' + t.Text + '\n';
      });
    }

    return res.status(200).json({
      results: results || 'No results found for: ' + query
    });
  } catch (err) {
    return res.status(500).json({ error: 'Search failed: ' + err.message });
  }
}
