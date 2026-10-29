export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

  try {
    const response = await fetch(
      `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(q)}&_format=json&_marker=0&api_version=4&n=40`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(200).json([]);
    }

    const songs = data.results.map((item) => {
      let cover = item.image ? item.image.replace('150x150', '500x500') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';
      let preview = item.media_preview_url || '';
      let streamUrl = preview
        .replace('preview.saavncdn.com', 'aac.saavncdn.com')
        .replace('_96_p.mp4', '_320.mp4');

      return {
        id: String(item.id),
        title: item.title ? item.title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'") : 'Unknown Track',
        artist: item.more_info?.singers || item.subtitle || 'Artist',
        cover: cover,
        url: streamUrl
      };
    });

    return res.status(200).json(songs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tracks' });
  }
}
