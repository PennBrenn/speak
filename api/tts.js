const allowedUsers = [
  "user1",
  "john23",
  "friendA",
  "mycoolid"
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, text, voiceId } = JSON.parse(req.body);

  if (!userId || userId.trim() === "") {
    return res.status(400).json({ error: "Missing user ID" });
  }

  if (!allowedUsers.includes(userId)) {
    return res.status(403).json({ error: "Invalid user ID" });
  }

  const selectedVoice = voiceId || "YOUR_DEFAULT_VOICE_ID";

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
          }
        })
      }
    );

    const audioBuffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
