const fs = require('fs');
const path = require('path');

const original_exercise = {
    id: 1,
    title: "Extended Listening Passage – Technology in the Modern World",
    description: "Listen to the extended passage about technology and answer the multiple-choice questions.",
    text: "In the modern world, technology has become an essential part of our daily lives. From the moment we wake up in the morning until we go to sleep at night, we are surrounded by digital devices. Many people begin their day by checking their mobile phones to read messages, respond to emails, scroll through social media, or catch up on the latest news. Smart alarms, fitness trackers, and digital assistants have changed the way we organize our routines and manage our time. In the field of education, technology has completely transformed the learning experience. Students now use online platforms to attend virtual classes, submit assignments, watch educational videos, and communicate with teachers. Digital libraries give learners access to thousands of books and research materials within seconds. This has made education more flexible and accessible, especially for students living in remote areas. However, online learning also requires self-discipline, strong internet connectivity, and technical knowledge, which not everyone may have. One major advantage of technology is improved communication. In the past, people had to wait many days or even weeks to receive a letter from someone living far away. Today, we can send messages instantly through messaging applications and participate in video calls in real time. Families who live in different cities or countries can see and speak to each other face-to-face through screens. Businesses can conduct international meetings without the need for travel. As a result, the world feels smaller and more connected than ever before. Technology has also contributed significantly to the healthcare sector. Doctors use advanced machines to detect diseases early and provide better treatment. Online consultations allow patients to speak with medical professionals without visiting hospitals physically. Health apps help individuals monitor their heart rate, sleep patterns, and physical activity. These innovations have improved life expectancy and overall well-being in many countries. Despite its many benefits, technology also has disadvantages. Many people spend excessive amounts of time on their phones, computers, and televisions. Too much screen time can negatively affect physical health by causing eye strain, headaches, poor posture, lack of exercise, and sleep problems. Mental health can also be influenced, as constant exposure to social media may create pressure and unrealistic expectations. Young people, in particular, may compare their lives to carefully edited images online and feel stressed, anxious, or dissatisfied. Another serious concern is privacy and data security. When individuals share personal information online, it can sometimes be misused. Companies collect user data to understand consumer behavior, and cybercriminals may attempt to steal sensitive information such as passwords, banking details, or identity documents. Therefore, it is extremely important to create strong passwords, enable security features, avoid suspicious links, and think carefully before posting private details on the internet. Technology also impacts employment and the economy. Automation and artificial intelligence are changing the nature of work. Some traditional jobs are disappearing, while new careers in digital marketing, software development, and data analysis are growing rapidly. Workers must continuously update their skills to remain competitive in the job market. Lifelong learning has become more important than ever. Environmental impact is another topic related to technology. The production of electronic devices requires natural resources, and electronic waste can harm the environment if not recycled properly. At the same time, technology also provides solutions for environmental problems, such as renewable energy systems, smart transportation, and digital systems that reduce paper usage. In conclusion, technology is neither completely good nor completely bad. Its impact depends largely on how individuals and societies choose to use it. When used wisely and responsibly, technology can improve education, healthcare, communication, and productivity. However, when used without limits or awareness, it may create physical, emotional, social, and security problems. Finding a healthy balance between the digital world and real life is the key to living a successful and meaningful life in the modern digital age.",
    duration: 180,
    mcqs: [
        {id: 1, part: "Part A: Listening Comprehension (MCQ)", question: "What is the main idea of the passage?", options: ["A) Technology is dangerous", "B) Technology affects daily life in many ways", "C) Only students use technology", "D) Technology should be stopped"], correctAnswer: 1},
        {id: 2, part: "Part A: Listening Comprehension (MCQ)", question: "What is one advantage of technology mentioned in the passage?", options: ["A) It reduces homework", "B) It improves communication", "C) It removes schools", "D) It increases travel time"], correctAnswer: 1},
        {id: 3, part: "Part A: Listening Comprehension (MCQ)", question: "Why do families feel more connected today?", options: ["A) Because they travel more", "B) Because they write letters", "C) Because they can video call instantly", "D) Because they live together"], correctAnswer: 2},
        {id: 4, part: "Part A: Listening Comprehension (MCQ)", question: "What health problem is caused by excessive screen time?", options: ["A) Strong muscles", "B) Better eyesight", "C) Eye strain", "D) Faster growth"], correctAnswer: 2},
        {id: 5, part: "Part A: Listening Comprehension (MCQ)", question: "What is the key message of the passage?", options: ["A) Avoid all technology", "B) Use technology without limits", "C) Use technology responsibly and find balance", "D) Only adults should use technology"], correctAnswer: 2},
        {id: 6, part: "Part B: Grammar MCQs", question: "Technology _____ changed the way people communicate.", options: ["A) have", "B) has", "C) had", "D) having"], correctAnswer: 1},
        {id: 7, part: "Part B: Grammar MCQs", question: "Many students _____ online classes every day.", options: ["A) attends", "B) attend", "C) attending", "D) attended"], correctAnswer: 1},
        {id: 8, part: "Part B: Grammar MCQs", question: "If people use technology wisely, it _____ help them succeed.", options: ["A) can", "B) should", "C) must", "D) has"], correctAnswer: 0},
        {id: 9, part: "Part B: Grammar MCQs", question: "Excessive use of phones can lead _____ health problems.", options: ["A) for", "B) in", "C) to", "D) with"], correctAnswer: 2},
        {id: 10, part: "Part B: Grammar MCQs", question: "It is important _____ personal information safe.", options: ["A) keep", "B) to keep", "C) keeping", "D) kept"], correctAnswer: 1},
        {id: 11, part: "Part B: Grammar MCQs", question: "Companies collect data about _____ customers.", options: ["A) they", "B) their", "C) them", "D) theirs"], correctAnswer: 1},
        {id: 12, part: "Part B: Grammar MCQs", question: "Social media can make people feel stressed _____ they compare themselves to others.", options: ["A) because", "B) but", "C) so", "D) although"], correctAnswer: 0},
        {id: 13, part: "Part B: Grammar MCQs", question: "Technology is useful, _____ it also has disadvantages.", options: ["A) and", "B) but", "C) so", "D) or"], correctAnswer: 1},
        {id: 14, part: "Part B: Grammar MCQs", question: "People should avoid _____ too much time online.", options: ["A) spend", "B) spent", "C) spending", "D) spends"], correctAnswer: 2},
        {id: 15, part: "Part B: Grammar MCQs", question: "The internet makes communication _____ than before.", options: ["A) easy", "B) easier", "C) easiest", "D) more easy"], correctAnswer: 1}
    ]
};

const templates = [
    {
        title: "Short Audio - Weather Forecast",
        description: "Listen to the short weather forecast and answer the question.",
        text: "Good morning. Today will be mostly sunny with a high of {temp} degrees. {condition} is expected in the evening, so remember to take your umbrella if you go out.",
        duration: 15,
        question: "What is the expected weather in the evening?",
        options: ["Sunny", "Snowy", "{condition_cap}", "Cloudy"]
    },
    {
        title: "Short Audio - Cafe Order",
        description: "Listen to the dialogue at the cafe.",
        text: "Hello, I'd like a large {drink} and a {food}, please. Can I pay with credit card?",
        duration: 12,
        question: "What did the customer order?",
        options: ["A small tea", "A large {drink} and a {food}", "A juice", "Just a {food}"]
    },
    {
        title: "Short Audio - Airport Announcement",
        description: "Listen to the airport announcement.",
        text: "Attention passengers on flight {flight} to {city}. Your flight has been delayed by {delay} hours due to bad weather.",
        duration: 14,
        question: "Why is the flight delayed?",
        options: ["Mechanical issues", "Bad weather", "Security check", "Missing pilot"]
    },
    {
        title: "Short Audio - Train Station",
        description: "Listen to the train station announcement.",
        text: "The express train to {city} is arriving at Platform {platform}. Please stand back from the yellow line.",
        duration: 13,
        question: "Which platform is the train arriving at?",
        options: ["Platform 1", "Platform {platform}", "Platform 5", "Platform 6"]
    },
    {
        title: "Short Audio - Medical Appointment",
        description: "Listen to the phone call.",
        text: "Hi, I need to cancel my appointment with Dr. {doctor} for tomorrow afternoon. I have a fever.",
        duration: 12,
        question: "Why is the patient canceling the appointment?",
        options: ["They forgot", "They feel better", "They are traveling", "They have a fever"]
    }
];

const temps = ["25", "28", "30", "22", "18"];
const conditions = ["heavy rain", "light rain", "thunderstorms", "strong wind"];
const drinks = ["cappuccino", "latte", "americano", "hot chocolate", "macchiato"];
const foods = ["blueberry muffin", "chocolate croissant", "cheese sandwich", "bagel", "cookie"];
const flights = ["4B", "7X", "12A", "9C", "101D"];
const cities = ["London", "Paris", "Berlin", "Tokyo", "New York", "Singapore", "Sydney", "Rome", "Toronto"];
const delays = ["two", "three", "four", "five"];
const platforms = ["2", "3", "4", "7", "8", "9"];
const doctors = ["Smith", "Brown", "Johnson", "Williams", "Jones", "Davis", "Miller"];

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const exercises = [original_exercise];
let mcq_id = 16;

for (let i = 2; i <= 51; i++) {
    const tpl = randomChoice(templates);
    
    // Fill in the blanks
    const temp = randomChoice(temps);
    const condition = randomChoice(conditions);
    const drink = randomChoice(drinks);
    const food = randomChoice(foods);
    const flight = randomChoice(flights);
    const city = randomChoice(cities);
    const delay = randomChoice(delays);
    const platform = randomChoice(platforms);
    const doctor = randomChoice(doctors);
    
    const fillVars = (str) => {
        return str
            .replace(/{temp}/g, temp)
            .replace(/{condition}/g, condition)
            .replace(/{condition_cap}/g, condition.charAt(0).toUpperCase() + condition.slice(1))
            .replace(/{drink}/g, drink)
            .replace(/{food}/g, food)
            .replace(/{flight}/g, flight)
            .replace(/{city}/g, city)
            .replace(/{delay}/g, delay)
            .replace(/{platform}/g, platform)
            .replace(/{doctor}/g, doctor);
    };

    const text = fillVars(tpl.text);
    const question = tpl.question;
    
    const options = [];
    let correct_idx = 0;
    
    // Render options dynamically
    tpl.options.forEach((opt, idx) => {
        const rendered_opt = fillVars(opt);
        options.push(`${String.fromCharCode(65 + idx)}) ${rendered_opt}`);
    });
        
    if (tpl.title.includes("Weather")) correct_idx = 2;
    else if (tpl.title.includes("Cafe")) correct_idx = 1;
    else if (tpl.title.includes("Airport")) correct_idx = 1;
    else if (tpl.title.includes("Train")) correct_idx = 1;
    else if (tpl.title.includes("Medical")) correct_idx = 3;

    const mcq = {
        id: mcq_id++,
        part: "Listening Comprehension",
        question: question,
        options: options,
        correctAnswer: correct_idx
    };
    
    const titleParts = tpl.title.split(" - ");
    exercises.push({
        id: i,
        title: `Short Audio ${i-1} - ${titleParts[1]}`,
        description: tpl.description,
        text: text,
        duration: tpl.duration,
        mcqs: [mcq]
    });
}

const ts_content = "export const exercises = " + JSON.stringify(exercises, null, 4) + ";\n";

const outputDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'listeningExercises.ts'), ts_content, 'utf-8');
console.log("Generated src/data/listeningExercises.ts successfully");
