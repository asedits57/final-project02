export interface GrammarQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

export const grammarQuestions: GrammarQuestion[] = [
    {
        id: 1,
        question: "Choose the correct sentence.",
        options: ["A. She go to school every day.", "B. She goes to school every day.", "C. She going to school every day.", "D. She gone to school every day."],
        correctAnswer: 1
    },
    {
        id: 2,
        question: "Fill in the blank.\nHe ______ football every weekend.",
        options: ["A. play", "B. plays", "C. played", "D. playing"],
        correctAnswer: 1
    },
    {
        id: 3,
        question: "Error detection.\nThey **was** late for the meeting.",
        options: ["A. They", "B. was", "C. late", "D. meeting"],
        correctAnswer: 1
    },
    {
        id: 4,
        question: "Choose the correct word.\nShe is ______ than her brother.",
        options: ["A. tall", "B. taller", "C. tallest", "D. more tall"],
        correctAnswer: 1
    },
    {
        id: 5,
        question: "Fill in the blank.\nIf it rains, we ______ stay at home.",
        options: ["A. will", "B. would", "C. should", "D. could"],
        correctAnswer: 0
    },
    {
        id: 6,
        question: "Choose the correct sentence.",
        options: ["A. I have seen that movie yesterday.", "B. I saw that movie yesterday.", "C. I seeing that movie yesterday.", "D. I see that movie yesterday."],
        correctAnswer: 1
    },
    {
        id: 7,
        question: "Fill in the blank.\nShe ______ English for three years.",
        options: ["A. study", "B. studied", "C. has studied", "D. studying"],
        correctAnswer: 2
    },
    {
        id: 8,
        question: "Error detection.\nHe don't like coffee.",
        options: ["A. He", "B. don't", "C. like", "D. coffee"],
        correctAnswer: 1
    },
    {
        id: 9,
        question: "Choose the correct word.\nWe ______ to the park yesterday.",
        options: ["A. go", "B. goes", "C. went", "D. going"],
        correctAnswer: 2
    },
    {
        id: 10,
        question: "Fill in the blank.\nShe is interested ______ music.",
        options: ["A. on", "B. in", "C. at", "D. for"],
        correctAnswer: 1
    },
    {
        id: 11,
        question: "Choose the correct sentence.",
        options: ["A. There is many books on the table.", "B. There are many books on the table.", "C. There many books on the table.", "D. There are much books on the table."],
        correctAnswer: 1
    },
    {
        id: 12,
        question: "Fill in the blank.\nBy next year, I ______ completed my course.",
        options: ["A. will have", "B. have", "C. had", "D. having"],
        correctAnswer: 0
    },
    {
        id: 13,
        question: "Error detection.\nShe can **to** drive very well.",
        options: ["A. She", "B. can", "C. to", "D. drive"],
        correctAnswer: 2
    },
    {
        id: 14,
        question: "Choose the correct word.\nI ______ never visited Japan.",
        options: ["A. have", "B. has", "C. had", "D. having"],
        correctAnswer: 0
    },
    {
        id: 15,
        question: "Fill in the blank.\nNeither the teacher nor the students ______ ready.",
        options: ["A. was", "B. were", "C. is", "D. be"],
        correctAnswer: 1
    },
    {
        id: 16,
        question: "Fill in the blank.\nShe ______ watching TV when I arrived.",
        options: ["A. is", "B. was", "C. were", "D. be"],
        correctAnswer: 1
    },
    {
        id: 17,
        question: "Choose the correct sentence.",
        options: ["A. He don't know the answer.", "B. He doesn't know the answer.", "C. He not know the answer.", "D. He didn't knows the answer."],
        correctAnswer: 1
    },
    {
        id: 18,
        question: "Fill in the blank.\nThey ______ dinner when the phone rang.",
        options: ["A. have", "B. had", "C. were having", "D. are having"],
        correctAnswer: 2
    },
    {
        id: 19,
        question: "Error detection.\nShe **eat** breakfast at 7 a.m.",
        options: ["A. She", "B. eat", "C. breakfast", "D. 7 a.m."],
        correctAnswer: 1
    },
    {
        id: 20,
        question: "Choose the correct word.\nHe runs ______ than me.",
        options: ["A. fast", "B. faster", "C. fastest", "D. more fast"],
        correctAnswer: 1
    },
    {
        id: 21,
        question: "Fill in the blank.\nI ______ my homework already.",
        options: ["A. finish", "B. finished", "C. have finished", "D. finishing"],
        correctAnswer: 2
    },
    {
        id: 22,
        question: "Fill in the blank.\nShe ______ a beautiful dress yesterday.",
        options: ["A. wear", "B. wore", "C. wearing", "D. wears"],
        correctAnswer: 1
    },
    {
        id: 23,
        question: "Fill in the blank.\nIf I ______ rich, I would travel the world.",
        options: ["A. am", "B. was", "C. were", "D. be"],
        correctAnswer: 2
    },
    {
        id: 24,
        question: "Fill in the blank.\nHe has been working here ______ 2019.",
        options: ["A. for", "B. since", "C. from", "D. by"],
        correctAnswer: 1
    },
    {
        id: 25,
        question: "Choose the correct sentence.",
        options: ["A. I am agree with you.", "B. I agree with you.", "C. I agreeing with you.", "D. I agreed with you now."],
        correctAnswer: 1
    },
    {
        id: 26,
        question: "Fill in the blank.\nThey ______ finished their work before the deadline.",
        options: ["A. has", "B. have", "C. had", "D. having"],
        correctAnswer: 1
    },
    {
        id: 27,
        question: "Fill in the blank.\nShe asked me ______ I was busy.",
        options: ["A. if", "B. that", "C. what", "D. which"],
        correctAnswer: 0
    },
    {
        id: 28,
        question: "Fill in the blank.\nHe ______ in this city for ten years.",
        options: ["A. lives", "B. lived", "C. has lived", "D. living"],
        correctAnswer: 2
    },
    {
        id: 29,
        question: "Error detection.\nShe **don't** understand the question.",
        options: ["A. She", "B. don't", "C. understand", "D. the question"],
        correctAnswer: 1
    },
    {
        id: 30,
        question: "Fill in the blank.\nThe book ______ on the table is mine.",
        options: ["A. who", "B. which", "C. where", "D. when"],
        correctAnswer: 1
    },
    {
        id: 31,
        question: "Fill in the blank.\nWe ______ to the cinema tonight.",
        options: ["A. go", "B. going", "C. are going", "D. goes"],
        correctAnswer: 2
    },
    {
        id: 32,
        question: "Fill in the blank.\nShe is the ______ student in the class.",
        options: ["A. smart", "B. smarter", "C. smartest", "D. more smart"],
        correctAnswer: 2
    },
    {
        id: 33,
        question: "Fill in the blank.\nI look forward ______ meeting you.",
        options: ["A. to", "B. for", "C. on", "D. at"],
        correctAnswer: 0
    },
    {
        id: 34,
        question: "Fill in the blank.\nHe ______ his car yesterday.",
        options: ["A. wash", "B. washed", "C. washing", "D. washes"],
        correctAnswer: 1
    },
    {
        id: 35,
        question: "Choose the correct sentence.",
        options: ["A. She is more intelligent than him.", "B. She is more intelligent than he.", "C. She more intelligent than he is.", "D. She intelligent more than him."],
        correctAnswer: 1
    },
    {
        id: 36,
        question: "Fill in the blank.\nI will call you when I ______ home.",
        options: ["A. reach", "B. reached", "C. reaching", "D. reaches"],
        correctAnswer: 0
    },
    {
        id: 37,
        question: "Fill in the blank.\nHe ______ playing football when it started raining.",
        options: ["A. was", "B. were", "C. is", "D. be"],
        correctAnswer: 0
    },
    {
        id: 38,
        question: "Fill in the blank.\nThey ______ studying for the exam all night.",
        options: ["A. was", "B. were", "C. is", "D. be"],
        correctAnswer: 1
    },
    {
        id: 39,
        question: "Fill in the blank.\nShe ______ already left the office.",
        options: ["A. has", "B. have", "C. had", "D. having"],
        correctAnswer: 0
    },
    {
        id: 40,
        question: "Choose the correct word.\nHe is good ______ mathematics.",
        options: ["A. at", "B. in", "C. on", "D. for"],
        correctAnswer: 0
    },
    {
        id: 41,
        question: "Fill in the blank.\nThe teacher asked us ______ quiet.",
        options: ["A. be", "B. to be", "C. being", "D. been"],
        correctAnswer: 1
    },
    {
        id: 42,
        question: "Fill in the blank.\nShe prefers tea ______ coffee.",
        options: ["A. than", "B. to", "C. from", "D. with"],
        correctAnswer: 1
    },
    {
        id: 43,
        question: "Fill in the blank.\nHe ______ his phone at home.",
        options: ["A. forget", "B. forgot", "C. forgetting", "D. forgets"],
        correctAnswer: 1
    },
    {
        id: 44,
        question: "Fill in the blank.\nWe have lived here ______ five years.",
        options: ["A. since", "B. for", "C. from", "D. during"],
        correctAnswer: 1
    },
    {
        id: 45,
        question: "Choose the correct sentence.",
        options: ["A. Everyone have finished the work.", "B. Everyone has finished the work.", "C. Everyone finished the work have.", "D. Everyone finishing the work."],
        correctAnswer: 1
    },
    {
        id: 46,
        question: "Fill in the blank.\nShe ______ to the gym every morning.",
        options: ["A. go", "B. goes", "C. going", "D. gone"],
        correctAnswer: 1
    },
    {
        id: 47,
        question: "Fill in the blank.\nIf you study hard, you ______ pass the exam.",
        options: ["A. will", "B. would", "C. could", "D. might"],
        correctAnswer: 0
    },
    {
        id: 48,
        question: "Fill in the blank.\nThe movie was ______ interesting than the book.",
        options: ["A. most", "B. more", "C. many", "D. much"],
        correctAnswer: 1
    },
    {
        id: 49,
        question: "Fill in the blank.\nI ______ dinner when my friend arrived.",
        options: ["A. cook", "B. cooked", "C. was cooking", "D. cooking"],
        correctAnswer: 2
    },
    {
        id: 50,
        question: "Fill in the blank.\nShe ______ her homework before going out.",
        options: ["A. finish", "B. finished", "C. had finished", "D. finishing"],
        correctAnswer: 2
    }
];
