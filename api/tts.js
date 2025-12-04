// ---- USER IDS ----
const allowedUsers = [
  "user1",
  "john23",
  "friendA",
  "mycoolid"
];
// -------------------

export default async function handler(req, res) {
  if (req.method === "GET") {
    //
    // ============================
    //  AUTO-LOAD ALL ELEVENLABS VOICES
    // ============================
    //
    try {
const voicesFormatted = data.voices
  .filter(v => v.category === "cloned" || v.category === "generated")
  .map(v => ({
    id: v.voice_id,
    name: v.name
  }));

      const data = await voicesRes.json();

      // Return a clean list to the frontend
      const voicesFormatted = data.voices.map(v => ({
        id: v.voice_id,
        name: v.name
      }));

      return res.status(200).json({ voices: voicesFormatted });

    } catch (err) {
      return res.status(500).json({ error: "Failed to load voices" });
    }
  }

  if (req.method === "POST") {
    //
    // ============================
    //  TEXT-TO-SPEECH HANDLER
    // ============================
    //
    const { userId, text, voiceId } = JSON.parse(req.body);

    // Gatekeeper: user ID required
    if (!userId || userId.trim() === "") {
      return res.status(400).json({ error: "Missing user ID" });
    }

    if (!allowedUsers.includes(userId)) {
      return res.status(403).json({ error: "Invalid user ID" });
    }

    // Must have text
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Missing text" });
    }

    // Default voice if none chosen
    const selectedVoice = voiceId || "EXISTING_DEFAULT_VOICE_ID";

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
      return res.status(500).json({ error: "TTS generation failed" });
    }
  }

  //
  // Unsupported method
  //
  return res.status(405).json({ error: "Method not allowed" });
}
