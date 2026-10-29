export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Song ID is required' });

  try {
    // Fetch full song details by ID
    const detailsRes = await fetch(
      `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${encodeURIComponent(id)}&_format=json&_marker=0&api_version=4`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const detailsData = await detailsRes.json();
    const songData = detailsData[id];

    if (!songData || !songData.encrypted_media_url) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Generate signed auth token for 320kbps stream
    const tokenRes = await fetch(
      `https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&url=${encodeURIComponent(
        songData.encrypted_media_url
      )}&bitrate=320&_format=json&_marker=0&api_version=4`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const tokenData = await tokenRes.json();

    if (tokenData && tokenData.auth_url) {
      return res.status(200).json({ streamUrl: tokenData.auth_url });
    }

    return res.status(500).json({ error: 'Could not generate playback token' });
  } catch (err) {
    return res.status(500).json({ error: 'Playback server error' });
  }
}
