export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'No query provided' });

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const r1 = await fetch(url);
    const wiki = await r1.json();

    let results = '';
    if (wiki.extract) results += wiki.extract + '\n\n';

    const newsUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`;
    const r2 = await fetch(newsUrl);
    const news = await r2.json();

    if (news.hits && news.hits.length > 0) {
      results += 'Recent mentions:\n';
      news.hits.forEach(h => {
        if (h.title) results += '• ' + h.title + '\n';
      });
    }

    return res.status(200).json({
      results: results || 'No results found for: ' + query
    });
  } catch (err) {
    return res.status(500).json({ error: 'Search failed: ' + err.message });
  }
}
