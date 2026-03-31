const startVoice = () => {
    const recognition = new window.webkitSpeechRecognition();

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        console.log(text);
    };

    recognition.start();
};
const checkMistakes = (mistakes) => {
    if (mistakes > 5) {
        showEasyQuestions();
    } else {
        showNormalQuestions();
    }
};