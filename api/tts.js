
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


// ============================
// CHARACTER COUNT LOGIC (The Fix)
// ============================
function updateCharacterCount() {
    const textarea = document.getElementById("text");
    const charCount = document.getElementById("charCount");
    // Ensure the element and attributes exist before trying to access them
    if (textarea && charCount) {
        const maxLength = 500; // Use a fixed value or textarea.getAttribute("maxlength");
        const currentLength = textarea.value.length;

        charCount.textContent = `${currentLength} / ${maxLength}`;
        
        // Change color when approaching/at limit
        if (currentLength >= maxLength * 0.9) {
            charCount.style.color = "#ff6b6b"; // Red
        } else {
            charCount.style.color = "#a9d5ff"; // Original color
        }
    }
}

// Ensure the setup runs AFTER the DOM elements are available
document.addEventListener("DOMContentLoaded", () => {
    loadVoices(); // Call the original loadVoices function

    const textarea = document.getElementById("text");
    
    // Check if the textarea exists before trying to attach the listener
    if (textarea) {
        // Attach the event listener to update the count on input
        textarea.addEventListener("input", updateCharacterCount);
        
        // Set the initial count when the page loads
        updateCharacterCount();
    }
});
