const synth = window.speechSynthesis;
let selectedVoice = null; // Store the selected voice

function populateVoiceList() {
  const voiceSelect = document.getElementById("voice-select");
  const voices = synth.getVoices();

  voiceSelect.innerHTML = ""; // Clear existing options

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  selectedVoice = voices.find((voice) => voice.lang === "en-US") || voices[0];

  voiceSelect.addEventListener("change", function () {
    selectedVoice = voices.find((voice) => voice.name === voiceSelect.value);
  });
}

function speak(message) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = selectedVoice; // Use the selected voice
  speechSynthesis.speak(utterance);
}

if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = populateVoiceList;
} else {
  populateVoiceList();
}

// Initialize speech recognition
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = "en-US"; // Set preferred language

const api_key = "5878944582ef8963d92960f95ef05d29"; // OpenWeather API key
const chatbox = document.querySelector(".chatbox");
let replay = "";

// Start listening when the mic button is clicked
function champ() {
  document.getElementById("champ").style.display = "block";
  document.getElementById("mic-btn").style.display = "none";
  recognition.start();
  setTimeout(function () {
    document.getElementById("champ").style.display = "none";
    document.getElementById("mic-btn").style.display = "block";
  }, 3000);
}

recognition.addEventListener("result", (e) => {
  replay = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join(" ");

  if (e.results[0].isFinal) {
    addMessageToChat(`You said: ${replay}`, "sent");
    handleFinalResults(replay.toUpperCase());
  }
});

function handleFinalResults(finalText) {
  if (finalText.includes("HELLO" || "HI" || "HEY" || "HEY SPEAKBOT")) {
    replay = "Hi, I am a SpeakBot. How can I help you?";
    addMessageToChat(replay, "received");
    speak(replay);
  } else if (finalText.includes("HOW ARE YOU")) {
    replay = "I am fine, Thank you.";
    addMessageToChat(replay, "received");
    speak(replay);
  } else if (finalText.includes("WHAT'S THE WEATHER")) {
    getCurrentCity()
      .then((cityName) => fetchWeather(cityName))
      .catch(handleWeatherError);
  } else if (finalText.includes("CAN YOU TELL ME THE WEATHER OF")) {
    let query = finalText.split("CAN YOU TELL ME THE WEATHER OF")[1].trim();
    if (query) {
      fetchWeather(query);
    } else {
      replay = "Please tell me the city name.";
      addMessageToChat(replay, "received");
      speak(replay);
    }
  } else if (finalText.includes("THANK YOU")) {
    replay = "It's my pleasure to help you.";
    addMessageToChat(replay, "received");
    speak(replay);
  } else if (
    finalText.includes("WHAT WILL YOU DO FOR ME" || "WHAT CAN YOU DO FOR ME")
  ) {
    replay =
      "I can run applications, search any text in Wikipedia, and provide weather updates, etc.";
    addMessageToChat(replay, "received");
    speak(replay);
  } else if (finalText.includes("NICE TO MEET YOU")) {
    replay = "Nice to meet you too.";
    addMessageToChat(replay, "received");
    speak(replay);
  } else if (finalText.includes("TELL ME ABOUT")) {
    let query = finalText.split("TELL ME ABOUT")[1].trim();
    fetchWikipediaInfo(query);
  } else {
    replay = "Searching on Google.";
    addMessageToChat(replay, "received");
    speak(replay);
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      finalText
    )}`;
    window.open(searchUrl, "_blank");
  }
}

function fetchWikipediaInfo(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=&titles=${encodeURIComponent(
    query
  )}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const page = data.query.pages;
      const pageId = Object.keys(page)[0];
      const extract = page[pageId].extract;

      replay =
        extract ||
        `Sorry, I couldn't find any detailed information about "${query}".`;
      addMessageToChat(replay, "received");
      speak(replay);
    })
    .catch((error) => {
      replay = "Error fetching Wikipedia information.";
      addMessageToChat(replay, "received");
      speak(replay);
    });
}

function fetchWeather(cityName) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${api_key}`;
  fetch(url)
    .then((data) => data.json())
    .then((data) => {
      if (data.cod !== 200) {
        throw new Error(data.message); // Handle invalid city name or other errors
      }
      const temp = data.main.temp - 273.15;
      replay = `The weather in ${cityName} is ${Math.trunc(temp)}° Celsius.`;
      addMessageToChat(replay, "received");
      speak(replay);
    })
    .catch(handleWeatherError);
}

function handleWeatherError(error) {
  replay = `Error: ${error.message || "Sorry, I cannot find the city."}`;
  addMessageToChat(replay, "received");
  speak(replay);
}

function getCurrentCity() {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api_key}`;

          fetch(url)
            .then((response) => response.json())
            .then((data) => {
              const cityName = data.name;
              resolve(cityName);
            })
            .catch(reject);
        },
        (error) => reject(error)
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

function addMessageToChat(message, role) {
  const div = document.createElement("div");
  div.classList.add("eachmessage", role, "animated");
  div.innerHTML = "<p>" + message + "</p>";
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}
