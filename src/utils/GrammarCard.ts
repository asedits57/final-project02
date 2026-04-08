// Extend the Window interface for the experimental Speech Recognition API
interface SpeechRecognitionWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SpeechRecognition?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webkitSpeechRecognition?: any;
}

const getSpeechRecognition = () => {
  const win = window as unknown as SpeechRecognitionWindow;
  return win.SpeechRecognition || win.webkitSpeechRecognition;
};

export const startVoice = (): void => {
  const SpeechRecognitionAPI = getSpeechRecognition();

  if (!SpeechRecognitionAPI) {
    console.warn("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any): void => {
    const text = event.results[0][0].transcript;
    console.log(text);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (err: any): void => {
    console.error("Speech recognition error:", err);
  };

  recognition.start();
};

export const checkMistakes = (mistakes: number): void => {
  if (mistakes > 5) {
    showEasyQuestions();
  } else {
    showNormalQuestions();
  }
};

// Placeholder functions — replace with real implementations
function showEasyQuestions(): void {
  console.log("Showing easy questions");
}

function showNormalQuestions(): void {
  console.log("Showing normal questions");
}

export {};
