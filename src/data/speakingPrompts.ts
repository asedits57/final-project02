export interface SpeakingPrompt {
    id: number;
    category: string;
    prompt: string;
    prepTime: string;
    speakingTime: string;
    emoji: string;
}

export const speakingPrompts: SpeakingPrompt[] = [
    // Personal Experience
    { id: 1, category: "Personal Experience", prompt: "Describe your favorite place to relax.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🌿" },
    { id: 2, category: "Personal Experience", prompt: "Talk about a memorable event in your life.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🎉" },
    { id: 3, category: "Personal Experience", prompt: "Describe your best friend.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "👫" },
    { id: 4, category: "Personal Experience", prompt: "Describe a teacher who helped you learn something important.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🏫" },
    { id: 5, category: "Personal Experience", prompt: "Talk about a time when you helped someone.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🤲" },
    { id: 6, category: "Personal Experience", prompt: "Describe your favorite holiday or festival.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🎊" },
    { id: 7, category: "Personal Experience", prompt: "Talk about a challenge you faced and how you overcame it.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "💪" },
    { id: 8, category: "Personal Experience", prompt: "Describe your favorite childhood memory.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🧒" },
    { id: 9, category: "Personal Experience", prompt: "Describe a person who inspires you.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "⭐" },
    { id: 10, category: "Personal Experience", prompt: "Talk about a skill you learned recently.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🎯" },

    // Opinion Questions
    { id: 11, category: "Opinion", prompt: "Do you prefer studying alone or with friends? Why?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "📚" },
    { id: 12, category: "Opinion", prompt: "Do you think technology improves education? Explain.", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "💻" },
    { id: 13, category: "Opinion", prompt: "Should students use mobile phones in school? Why or why not?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "📱" },
    { id: 14, category: "Opinion", prompt: "Do you prefer online learning or classroom learning?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🖥️" },
    { id: 15, category: "Opinion", prompt: "Is teamwork important in school and work?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🤝" },
    { id: 16, category: "Opinion", prompt: "Do you think social media has a positive or negative effect?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "📲" },
    { id: 17, category: "Opinion", prompt: "Should people exercise every day? Why?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🏋️" },
    { id: 18, category: "Opinion", prompt: "Is traveling important for learning about other cultures?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "✈️" },
    { id: 19, category: "Opinion", prompt: "Do you think reading books is important?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "📖" },
    { id: 20, category: "Opinion", prompt: "Should students have homework every day?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "📝" },

    // Description Tasks
    { id: 21, category: "Description", prompt: "Describe your hometown or city.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🏙️" },
    { id: 22, category: "Description", prompt: "Describe your favorite food.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🍽️" },
    { id: 23, category: "Description", prompt: "Describe your favorite movie or TV show.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🎬" },
    { id: 24, category: "Description", prompt: "Describe your favorite book.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "📕" },
    { id: 25, category: "Description", prompt: "Describe your favorite sport.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "⚽" },
    { id: 26, category: "Description", prompt: "Describe a place you want to visit.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🗺️" },
    { id: 27, category: "Description", prompt: "Describe your favorite subject in school.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🎓" },
    { id: 28, category: "Description", prompt: "Describe your ideal job.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "💼" },
    { id: 29, category: "Description", prompt: "Describe your favorite season of the year.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "🍂" },
    { id: 30, category: "Description", prompt: "Describe your daily routine.", prepTime: "10 seconds", speakingTime: "45 seconds", emoji: "⏰" },

    // Future & Goals
    { id: 31, category: "Future & Goals", prompt: "What are your goals for the future?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🚀" },
    { id: 32, category: "Future & Goals", prompt: "What job would you like to have in the future?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "👔" },
    { id: 33, category: "Future & Goals", prompt: "What skill would you like to learn?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🧠" },
    { id: 34, category: "Future & Goals", prompt: "Where would you like to travel in the future?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🌍" },
    { id: 35, category: "Future & Goals", prompt: "What do you want to achieve in the next five years?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🏆" },
    { id: 36, category: "Future & Goals", prompt: "How do you plan to improve your English?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "📈" },
    { id: 37, category: "Future & Goals", prompt: "What career do you dream about?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "💭" },
    { id: 38, category: "Future & Goals", prompt: "What new technology do you want to learn?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🤖" },
    { id: 39, category: "Future & Goals", prompt: "What is your biggest goal in life?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🎯" },
    { id: 40, category: "Future & Goals", prompt: "What do you want to learn this year?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "📅" },

    // Problem Solving
    { id: 41, category: "Problem Solving", prompt: "What should people do to protect the environment?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🌱" },
    { id: 42, category: "Problem Solving", prompt: "How can students manage their time better?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🕐" },
    { id: 43, category: "Problem Solving", prompt: "How can people reduce stress in daily life?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🧘" },
    { id: 44, category: "Problem Solving", prompt: "What can schools do to improve education?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🏫" },
    { id: 45, category: "Problem Solving", prompt: "How can communities become safer places?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🛡️" },
    { id: 46, category: "Problem Solving", prompt: "How can technology help students learn better?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "💡" },
    { id: 47, category: "Problem Solving", prompt: "What should people do to stay healthy?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "❤️" },
    { id: 48, category: "Problem Solving", prompt: "How can we reduce pollution?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "♻️" },
    { id: 49, category: "Problem Solving", prompt: "What can people do to help others in their community?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🤲" },
    { id: 50, category: "Problem Solving", prompt: "How can teamwork help solve problems?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "👥" },

    // Comparison Questions
    { id: 51, category: "Comparison", prompt: "Do you prefer city life or countryside life?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🌆" },
    { id: 52, category: "Comparison", prompt: "Is it better to travel alone or with friends?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "✈️" },
    { id: 53, category: "Comparison", prompt: "Is online shopping better than shopping in stores?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🛒" },
    { id: 54, category: "Comparison", prompt: "Is watching movies better than reading books?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🎬" },
    { id: 55, category: "Comparison", prompt: "Is working from home better than working in an office?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🏠" },
    { id: 56, category: "Comparison", prompt: "Is technology making people more connected or less connected?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🔗" },
    { id: 57, category: "Comparison", prompt: "Are schools better today than in the past?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🏫" },
    { id: 58, category: "Comparison", prompt: "Is it better to learn by doing or by reading?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "📖" },
    { id: 59, category: "Comparison", prompt: "Is studying abroad better than studying in your home country?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "🌍" },
    { id: 60, category: "Comparison", prompt: "Are modern lifestyles healthier than past lifestyles?", prepTime: "10 seconds", speakingTime: "60 seconds", emoji: "⚖️" },
];
