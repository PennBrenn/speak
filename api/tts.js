// ============================
// LOAD VOICES AUTOMATICALLY
// ============================
async function loadVoices() {
    try {
        const res = await fetch("/api/tts");
        const data = await res.json();

        const select = document.getElementById("voiceId");
        select.innerHTML = "";

        data.voices.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.id;
            opt.textContent = v.name;
            select.appendChild(opt);
        });

    } catch (e) {
        alert("Failed to load voices.");
    }
}


// ============================
// GENERATE AUDIO
// ============================
async function generateAudio() {
    const userId = document.getElementById("userId").value.trim();
    const text = document.getElementById("text").value.trim();
    const voiceId = document.getElementById("voiceId").value;

    if (!userId) return alert("Please enter your User ID.");
    if (!text) return alert("Please type some text.");

    document.getElementById("loading").style.display = "block";

    const response = await fetch("/api/tts", {
        method: "POST",
        body: JSON.stringify({ userId, text, voiceId })
    });

    document.getElementById("loading").style.display = "none";

    if (!response.ok) {
        alert("Error generating audio.");
        return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const player = document.getElementById("audioPlayer");
    player.src = audioUrl;
    player.style.display = "block";
    player.play();
}
x
