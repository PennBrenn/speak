// ---- USER IDS ----
const allowedUsers = [
  "plmsyd",
];
// -------------------

export default async function handler(req, res) {

  // =====================================================
  //                   GET → RETURN VOICES
  // =====================================================
  if (req.method === "GET") {
    try {
      // Fetch all voices
      const voicesRes = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY
        }
      });

      const data = await voicesRes.json();

      // Filter to ONLY custom voices:
      const voicesFormatted = data.voices
        .filter(v => v.category === "cloned" || v.category === "generated")
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

  // ============================
  // CHARACTER COUNT LOGIC
  // ============================
  function updateCharacterCount() {
      const textarea = document.getElementById("text");
      const charCount = document.getElementById("charCount");
      const maxLength = textarea.getAttribute("maxlength");
      const currentLength = textarea.value.length;
  
      charCount.textContent = `${currentLength} / ${maxLength}`;
      
      // Optional: Visually indicate when the limit is reached
      if (currentLength >= maxLength) {
          charCount.style.color = "#ff6b6b"; // Red
      } else {
          charCount.style.color = "#465e73"; // Original color
      }
  }
  
  // Add an event listener to the textarea
  document.addEventListener("DOMContentLoaded", () => {
      const textarea = document.getElementById("text");
      // Update the count on input (typing) and when the page loads
      if (textarea) {
          textarea.addEventListener("input", updateCharacterCount);
          updateCharacterCount(); // Initial count
      }
  });
  
  // The rest of your script (loadVoices and generateAudio) remains...

  // =====================================================
  //                  METHOD NOT ALLOWED
  // =====================================================
  return res.status(405).json({ error: "Method not allowed" });
}
