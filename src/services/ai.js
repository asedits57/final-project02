export const correctGrammar = async (text) => {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: "Bearer YOUR_API_KEY",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: `Correct this: ${text}` }
            ]
        })
    });

    const data = await res.json();
    return data.choices[0].message.content;
};