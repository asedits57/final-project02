export interface ReadingQuestion {
    id: number;
    question: string;
    options: string[];
    answer: string;
}

export interface ReadingPassage {
    id: number;
    title: string;
    content: string;
    questions: ReadingQuestion[];
}

export const readingPassages: ReadingPassage[] = [
    {
        id: 1,
        title: "Technology and Communication",
        content: "Technology has transformed the way people communicate. In the past, people relied on letters and telephone calls. Today, communication happens instantly through emails, messaging apps, and video calls. This has made it easier for people to stay connected regardless of distance.",
        questions: [
            {
                id: 1,
                question: "What is the main topic of the passage?",
                options: ["Writing letters", "Modern communication technology", "Telephone history", "Internet safety"],
                answer: "B"
            },
            {
                id: 2,
                question: "How did people communicate in the past?",
                options: ["Emails", "Letters and telephone calls", "Messaging apps", "Social media"],
                answer: "B"
            },
            {
                id: 3,
                question: "What is one benefit of modern communication?",
                options: ["It is slower", "It is more expensive", "People can connect instantly", "People write more letters"],
                answer: "C"
            },
            {
                id: 4,
                question: "What does “instantly” mean in the passage?",
                options: ["Slowly", "Immediately", "Rarely", "Secretly"],
                answer: "B"
            },
            {
                id: 5,
                question: "What is the author's opinion about technology?",
                options: ["It makes communication easier", "It is dangerous", "It is confusing", "It is unnecessary"],
                answer: "A"
            }
        ]
    },
    {
        id: 2,
        title: "Healthy Lifestyle",
        content: "Maintaining a healthy lifestyle is important for overall well-being. Regular exercise, balanced nutrition, and enough sleep help people stay physically and mentally healthy. Doctors also recommend reducing stress through activities such as meditation or hobbies.",
        questions: [
            {
                id: 6,
                question: "What is the main idea of the passage?",
                options: ["Doctors’ salaries", "Healthy living habits", "Sleeping problems", "Sports competitions"],
                answer: "B"
            },
            {
                id: 7,
                question: "Which of the following helps maintain health?",
                options: ["Junk food", "Lack of sleep", "Regular exercise", "Skipping meals"],
                answer: "C"
            },
            {
                id: 8,
                question: "What do doctors recommend for reducing stress?",
                options: ["Watching TV", "Meditation or hobbies", "Eating more sugar", "Working longer hours"],
                answer: "B"
            },
            {
                id: 9,
                question: "What does “balanced nutrition” mean?",
                options: ["Eating only vegetables", "Eating a variety of healthy foods", "Eating fast food", "Eating once a day"],
                answer: "B"
            },
            {
                id: 10,
                question: "According to the passage, sleep is important because it helps maintain",
                options: ["fashion", "wealth", "health", "popularity"],
                answer: "C"
            }
        ]
    },
    {
        id: 3,
        title: "Online Learning",
        content: "Online learning has become popular in recent years. Many students prefer it because they can study from home and access learning materials anytime. However, some students feel that traditional classroom learning provides better interaction with teachers.",
        questions: [
            {
                id: 11,
                question: "Why do many students prefer online learning?",
                options: ["It is cheaper", "They can study from home", "It has fewer subjects", "It replaces teachers"],
                answer: "B"
            },
            {
                id: 12,
                question: "What is one disadvantage of online learning mentioned?",
                options: ["Lack of interaction with teachers", "Expensive books", "Slow internet everywhere", "Difficult exams"],
                answer: "A"
            },
            {
                id: 13,
                question: "What does “access learning materials anytime” mean?",
                options: ["Only during class", "Only in the morning", "At any time", "Once a week"],
                answer: "C"
            },
            {
                id: 14,
                question: "Traditional classrooms provide better",
                options: ["internet speed", "interaction with teachers", "homework", "computers"],
                answer: "B"
            },
            {
                id: 15,
                question: "What is the main topic?",
                options: ["Advantages of sports", "Online learning", "School uniforms", "Library rules"],
                answer: "B"
            }
        ]
    },
    {
        id: 4,
        title: "Environmental Protection",
        content: "Environmental protection is necessary to preserve the planet. Pollution from factories, vehicles, and plastic waste damages ecosystems. Governments and individuals must work together to reduce pollution and protect natural resources.",
        questions: [
            {
                id: 16,
                question: "Why is environmental protection important?",
                options: ["To protect animals and nature", "To increase pollution", "To build more factories", "To reduce education"],
                answer: "A"
            },
            {
                id: 17,
                question: "What causes pollution according to the passage?",
                options: ["Trees", "Vehicles and factories", "Rain", "Mountains"],
                answer: "B"
            },
            {
                id: 18,
                question: "Who should help protect the environment?",
                options: ["Only governments", "Only students", "Everyone", "Only scientists"],
                answer: "C"
            },
            {
                id: 19,
                question: "What does “ecosystems” refer to?",
                options: ["Living organisms and their environment", "Cities", "Computers", "Books"],
                answer: "A"
            },
            {
                id: 20,
                question: "Plastic waste can",
                options: ["protect nature", "damage ecosystems", "improve air quality", "help plants grow"],
                answer: "B"
            }
        ]
    },
    {
        id: 5,
        title: "Importance of Reading",
        content: "Reading books is one of the best ways to improve knowledge and vocabulary. It allows people to explore new ideas and cultures. Many successful people develop a habit of reading daily.",
        questions: [
            {
                id: 21,
                question: "What is one benefit of reading?",
                options: ["Improves vocabulary", "Reduces knowledge", "Makes people lazy", "Stops learning"],
                answer: "A"
            },
            {
                id: 22,
                question: "Reading helps people explore",
                options: ["new cities", "new ideas and cultures", "sports events", "shopping malls"],
                answer: "B"
            },
            {
                id: 23,
                question: "Successful people often",
                options: ["avoid reading", "read daily", "sleep all day", "watch TV all day"],
                answer: "B"
            },
            {
                id: 24,
                question: "What is the main topic?",
                options: ["Importance of reading", "Importance of sports", "Importance of money", "Importance of travel"],
                answer: "A"
            },
            {
                id: 25,
                question: "Reading improves",
                options: ["vocabulary", "driving skills", "cooking", "dancing"],
                answer: "A"
            }
        ]
    },
    {
        id: 6,
        title: "Travel and Culture",
        content: "Traveling allows people to experience different cultures, foods, and traditions. Visiting new places helps individuals understand the world better and develop open-minded perspectives.",
        questions: [
            {
                id: 26,
                question: "Why do people travel?",
                options: ["To experience different cultures", "To avoid learning", "To stay at home", "To forget traditions"],
                answer: "A"
            },
            {
                id: 27,
                question: "Traveling helps people understand",
                options: ["the weather", "the world better", "only languages", "only food"],
                answer: "B"
            },
            {
                id: 28,
                question: "What does “open-minded” mean?",
                options: ["Willing to accept new ideas", "Angry", "Confused", "Lazy"],
                answer: "A"
            },
            {
                id: 29,
                question: "Travel introduces people to",
                options: ["traditions and foods", "only sports", "only movies", "only music"],
                answer: "A"
            },
            {
                id: 30,
                question: "The passage mainly discusses",
                options: ["travel benefits", "driving rules", "airplane safety", "hotel prices"],
                answer: "A"
            }
        ]
    },
    {
        id: 7,
        title: "Importance of Time Management",
        content: "Time management helps people complete tasks efficiently. Students who plan their schedules often perform better academically and experience less stress.",
        questions: [
            {
                id: 31,
                question: "What does time management help people do?",
                options: ["Waste time", "Complete tasks efficiently", "Avoid studying", "Skip work"],
                answer: "B"
            },
            {
                id: 32,
                question: "Students who plan schedules often",
                options: ["perform better", "fail exams", "sleep less", "forget tasks"],
                answer: "A"
            },
            {
                id: 33,
                question: "Good time management reduces",
                options: ["happiness", "stress", "success", "learning"],
                answer: "B"
            },
            {
                id: 34,
                question: "What is the main idea?",
                options: ["Importance of planning time", "Importance of money", "Importance of sports", "Importance of food"],
                answer: "A"
            },
            {
                id: 35,
                question: "Time management helps students",
                options: ["become lazy", "organize tasks", "avoid homework", "forget deadlines"],
                answer: "B"
            }
        ]
    },
    {
        id: 8,
        title: "Role of Technology in Education",
        content: "Technology has changed modern education by introducing digital classrooms, online resources, and interactive learning tools.",
        questions: [
            {
                id: 36,
                question: "Technology introduced",
                options: ["digital classrooms", "fewer teachers", "fewer books", "no learning"],
                answer: "A"
            },
            {
                id: 37,
                question: "Online resources help students",
                options: ["learn anytime", "stop learning", "avoid teachers", "remove exams"],
                answer: "A"
            },
            {
                id: 38,
                question: "Interactive tools make learning",
                options: ["boring", "difficult", "engaging", "impossible"],
                answer: "C"
            },
            {
                id: 39,
                question: "The passage mainly discusses",
                options: ["technology in education", "farming", "cooking", "sports"],
                answer: "A"
            },
            {
                id: 40,
                question: "Digital classrooms are an example of",
                options: ["traditional learning", "modern technology in education", "farming technology", "travel technology"],
                answer: "B"
            }
        ]
    },
    {
        id: 9,
        title: "Importance of Teamwork",
        content: "Teamwork allows individuals to combine their skills and achieve common goals effectively.",
        questions: [
            {
                id: 41,
                question: "Teamwork helps people",
                options: ["work alone", "combine skills", "avoid tasks", "compete always"],
                answer: "B"
            },
            {
                id: 42,
                question: "A team works toward",
                options: ["individual success only", "common goals", "no goals", "competition only"],
                answer: "B"
            },
            {
                id: 43,
                question: "Teamwork improves",
                options: ["cooperation", "isolation", "loneliness", "confusion"],
                answer: "A"
            },
            {
                id: 44,
                question: "The main topic is",
                options: ["teamwork benefits", "sports rules", "cooking recipes", "travel planning"],
                answer: "A"
            },
            {
                id: 45,
                question: "Teams succeed when members",
                options: ["refuse to cooperate", "collaborate", "avoid communication", "work alone"],
                answer: "B"
            }
        ]
    },
    {
        id: 10,
        title: "Importance of Education",
        content: "Education helps people gain knowledge and develop skills needed for future careers.",
        questions: [
            {
                id: 46,
                question: "Education helps people",
                options: ["gain knowledge", "lose skills", "avoid work", "forget learning"],
                answer: "A"
            },
            {
                id: 47,
                question: "Education prepares people for",
                options: ["sports only", "careers", "holidays", "entertainment"],
                answer: "B"
            },
            {
                id: 48,
                question: "Learning develops",
                options: ["skills", "weakness", "laziness", "boredom"],
                answer: "A"
            },
            {
                id: 49,
                question: "The passage mainly discusses",
                options: ["importance of education", "importance of food", "importance of games", "importance of travel"],
                answer: "A"
            },
            {
                id: 50,
                question: "Education helps build a better",
                options: ["future", "past", "problem", "mistake"],
                answer: "A"
            }
        ]
    }
];
