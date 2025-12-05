// ---- USER IDS ----
const allowedUsers = [
  "plmsyd",
];
// -------------------


export default async function handler(req, res) {


  // =====================================================
  //                   GET → RETURN VOICES
  // =====================================================

  // ---- BLOCKED VOICE IDS ----
  const blockedVoices = [
    "ElVDyvTtykmY2kynfxR8",
    // Add more...
  ];

  if (req.method === "GET") {
    try {
      // Fetch all voices
      const voicesRes = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY
        }
      });


      const data = await voicesRes.json();


      // Filter categories AND remove blocked voices
      const voicesFormatted = data.voices
        .filter(v =>
          (v.category === "cloned" || v.category === "generated") &&
          !blockedVoices.includes(v.voice_id)   // remove forbidden voices
        )
        .map(v => ({
          id: v.voice_id,
          name: v.name
        }));


      return res.status(200).json({ voices: voicesFormatted });


    } catch (err) {
      console.error("VOICE LOAD ERROR:", err);
      return res.status(500).json({ error: "Failed to load voices" });
    }
  }






  // =====================================================
  //                POST → GENERATE AUDIO
  // =====================================================
  if (req.method === "POST") {
    const { userId, text, voiceId } = JSON.parse(req.body);


    // Validate user ID
    if (!userId || userId.trim() === "") {
      return res.status(400).json({ error: "Missing user ID" });
    }


    if (!allowedUsers.includes(userId)) {
      return res.status(403).json({ error: "Invalid user ID" });
    }


    // Validate text
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Missing text" });
    }


    // Default voice (fallback if needed)
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
      console.error("TTS ERROR:", error);
      return res.status(500).json({ error: "TTS generation failed" });
    }
  }

  // The rest of your script (loadVoices and generateAudio) remains...


  // =====================================================
  //                  METHOD NOT ALLOWED
  // =====================================================
  return res.status(405).json({ error: "Method not allowed" });
}



