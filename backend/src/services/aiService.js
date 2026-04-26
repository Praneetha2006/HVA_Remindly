import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Gemini API key:", process.env.OPENAI_API_KEY?.slice(0, 6));
console.log("Gemini API key length:", process.env.OPENAI_API_KEY?.length);

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const generateAdaptiveQuestions = async (title, explanation) => {
  try {
    // Add randomization seed to ensure different questions each time
    const timestamp = new Date().getTime();
    const randomSeed = Math.floor(Math.random() * 10000);
    
    const prompt = `
Generate 10 NEW and UNIQUE quiz questions (different from previous attempts) for adaptive assessment: 3 easy, 3 medium, 3 hard, 1 other.

Topic: ${title}
Random Seed: ${randomSeed}
Generation Time: ${timestamp}

Explanation:
${explanation}

IMPORTANT: Create NEW questions each time. Vary question types:
- Some asking for definitions
- Some asking for applications
- Some asking for comparisons
- Some asking for analysis
- Some asking for synthesis

Return ONLY valid JSON (no markdown, no code blocks):
{
  "easy": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "...",
      "difficulty": "easy"
    }
  ],
  "medium": [...],
  "hard": [...],
  "other": [...]
}

Each question must have: question, options (4 options), correctAnswer, explanation, difficulty
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.log("Gemini quiz generation failed, using fallback:", error.message);

    // Fallback quiz questions based on topic
    return generateFallbackQuiz(title, explanation);
  }
};

const generateFallbackQuiz = (title, explanation) => {
  const concepts = explanation.split('.').filter(s => s.trim().length > 10).slice(0, 3);
  const randomFactor = Math.floor(Math.random() * 100); // Add randomization
  
  // Vary questions based on randomization
  const easyQuestions = [
    {
      question: `What is the main topic discussed?`,
      options: [title, "History", "Science", "Literature"],
      correctAnswer: title,
      explanation: `The main topic is ${title}`,
      difficulty: "easy"
    },
    {
      question: `Which of the following is related to ${title}?`,
      options: [title, "Unrelated concept", "Random fact", "Other topic"],
      correctAnswer: title,
      explanation: `${title} is directly related to the main concept`,
      difficulty: "easy"
    },
    {
      question: `Can you describe what ${title} is?`,
      options: [explanation.substring(0, 30) + "...", "Completely unrelated", "Historical event", "Mathematical formula"],
      correctAnswer: explanation.substring(0, 30) + "...",
      explanation: `${title} refers to the concept explained in the material`,
      difficulty: "easy"
    },
  ];
  
  return {
    easy: easyQuestions.sort(() => Math.random() - 0.5).slice(0, 3),
    medium: [
      {
        question: `What is a key characteristic of ${title}?`,
        options: ["Understanding core concepts", "Memorization only", "Ignoring details", "Random facts"],
        correctAnswer: "Understanding core concepts",
        explanation: `A key characteristic is understanding the core concepts thoroughly`,
        difficulty: "medium"
      },
      {
        question: `How would you best describe ${title}?`,
        options: ["Using theoretical frameworks", "With memorized facts only", "Through random examples", "Without any analysis"],
        correctAnswer: "Using theoretical frameworks",
        explanation: `${title} is best described using proper theoretical frameworks`,
        difficulty: "medium"
      },
      {
        question: `Which best captures the essence of ${title}?`,
        options: ["The interconnected principles", "Just the definitions", "Only surface-level examples", "Isolated facts"],
        correctAnswer: "The interconnected principles",
        explanation: `The essence lies in understanding how different principles interconnect`,
        difficulty: "medium"
      },
      {
        question: `What is essential for mastering ${title}?`,
        options: ["Deep understanding and application", "Surface-level memorization", "Ignoring context", "Passive reading"],
        correctAnswer: "Deep understanding and application",
        explanation: `Mastery requires both deep understanding and practical application`,
        difficulty: "medium"
      }
    ].sort(() => Math.random() - 0.5).slice(0, 3),
    hard: [
      {
        question: `How can you critically apply knowledge of ${title}?`,
        options: ["Through synthesis and advanced reasoning", "By memorization alone", "Avoiding theory", "Superficial analysis"],
        correctAnswer: "Through synthesis and advanced reasoning",
        explanation: `Critical application requires advanced reasoning and synthesis`,
        difficulty: "hard"
      },
      {
        question: `What broader implications emerge from studying ${title}?`,
        options: ["Systemic understanding and pattern recognition", "No significant impact", "Narrow specialization only", "Theoretical confusion"],
        correctAnswer: "Systemic understanding and pattern recognition",
        explanation: `${title} enables broader systemic understanding across domains`,
        difficulty: "hard"
      },
      {
        question: `Which complex scenario best tests mastery of ${title}?`,
        options: ["Multi-faceted real-world problem", "Simple textbook case", "Completely unrelated situation", "Hypothetical only"],
        correctAnswer: "Multi-faceted real-world problem",
        explanation: `True mastery shows through solving complex, real-world problems`,
        difficulty: "hard"
      },
      {
        question: `How does ${title} connect to broader principles?`,
        options: ["Through interconnected frameworks", "As isolated concept", "Without broader context", "Randomly associated"],
        correctAnswer: "Through interconnected frameworks",
        explanation: `${title} gains depth when connected to broader conceptual frameworks`,
        difficulty: "hard"
      }
    ].sort(() => Math.random() - 0.5).slice(0, 3),
    other: [
      {
        question: `How would you integrate ${title} with related concepts?`,
        options: ["By identifying meaningful connections", "By ignoring relationships", "By rote memorization", "By random linking"],
        correctAnswer: "By identifying meaningful connections",
        explanation: `Integration through meaningful connections shows comprehensive understanding`,
        difficulty: "medium"
      }
    ]
  };
};

export const evaluateVoiceUnderstanding = async (title, explanation, recordingDuration) => {
  try {
    const prompt = `
You are an expert evaluator. Evaluate a student's understanding based on their voice recording.

Topic: ${title}
Expected Explanation: ${explanation}
Recording Duration: ${recordingDuration} seconds

Generate an evaluation with:
1. Score (0-10): Higher score if recording is substantial and shows effort
2. Feedback: Specific feedback on what they should focus on
3. Missing Concepts: Key concepts they should review
4. Can Unlock Quiz: true if score >= 6, false otherwise

Scoring Guidance:
- Less than 10 seconds: Score 2-3 (too short)
- 10-20 seconds: Score 4-5 (brief but attempted)
- 20-40 seconds: Score 6-7 (good effort)
- 40+ seconds: Score 8-10 (comprehensive)
- Add bonus points if they likely covered key concepts based on duration

Return ONLY valid JSON (no markdown):
{
  "score": <0-10>,
  "feedback": "...",
  "missingConcepts": ["concept1", "concept2", "concept3"],
  "canUnlockQuiz": true/false,
  "encouragement": "..."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const evaluation = JSON.parse(cleaned);

    return {
      success: true,
      score: Math.min(10, Math.max(0, evaluation.score)),
      feedback: evaluation.feedback,
      missingConcepts: evaluation.missingConcepts || [],
      isUnlocked: evaluation.canUnlockQuiz || evaluation.score >= 6,
      encouragement: evaluation.encouragement
    };
  } catch (error) {
    console.log("Gemini API error - using fallback scoring:", error.message);
    
    // Improved fallback evaluation based on recording duration
    let score;
    let feedback;
    let encouragement;

    if (recordingDuration < 10) {
      score = 3;
      feedback = "Your recording was quite short. Try to speak for at least 20-30 seconds to cover the main concepts thoroughly.";
      encouragement = "Don't worry! You're just getting started. Take another try and speak more about the topic.";
    } else if (recordingDuration < 20) {
      score = 5;
      feedback = "Good start! Your recording shows effort, but consider expanding on the key concepts and explaining them in more detail.";
      encouragement = "You're on the right track! Try recording again and go into more depth about the topic.";
    } else if (recordingDuration < 40) {
      score = 7;
      feedback = "Great effort! You've covered a good amount of material. Try to be more specific about the key concepts and their applications.";
      encouragement = "Excellent work! You're demonstrating solid understanding. Let's test it with the quiz!";
    } else {
      score = 9;
      feedback = "Outstanding! Your comprehensive recording shows excellent understanding of the topic. You're well-prepared for the quiz.";
      encouragement = "Fantastic! Your detailed explanation shows deep understanding. You're ready to take the quiz and test your knowledge!";
    }

    return {
      success: true,
      score: score,
      feedback: feedback,
      missingConcepts: [
        "Practice explaining with examples",
        "Focus on key definitions",
        "Connect concepts together"
      ],
      isUnlocked: score >= 6,
      encouragement: encouragement
    };
  }
};