export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    const saavnRes = await fetch(
      `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(q)}&_format=json&_marker=0&api_version=4&n=40`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const data = await saavnRes.json();

    if (!data.results) return res.status(200).json([]);

    const songs = data.results.map((item) => {
      let cover = item.image ? item.image.replace('150x150', '500x500') : '';
      let preview = item.media_preview_url || '';
      let audioUrl = preview
        .replace('preview.saavncdn.com', 'aac.saavncdn.com')
        .replace('_96_p.mp4', '_320.mp4');

      return {
        id: item.id,
        title: item.title ? item.title.replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '',
        artist: item.more_info?.singers || item.subtitle || 'Artist',
        cover: cover,
        url: audioUrl
      };
    });

    return res.status(200).json(songs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tracks' });
  }
}
