import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Gemini API key:", process.env.OPENAI_API_KEY?.slice(0, 6));
console.log("Gemini API key length:", process.env.OPENAI_API_KEY?.length);

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const generateAdaptiveQuestions = async (title, explanation) => {
  try {
    const prompt = `
Generate 10 quiz questions for adaptive assessment: 3 easy, 3 medium, 3 hard, 1 other (mix of any level).

Topic: ${title}

Explanation:
${explanation}

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
  
  return {
    easy: [
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
        question: `${title} is primarily about:`,
        options: [explanation.substring(0, 50) + "...", "Something else", "Another thing", "Not related"],
        correctAnswer: explanation.substring(0, 50) + "...",
        explanation: `${title} focuses on understanding key concepts`,
        difficulty: "easy"
      }
    ],
    medium: [
      {
        question: `Based on the explanation, what is a key aspect of ${title}?`,
        options: ["Understanding core concepts", "Memorization only", "Ignoring details", "Random facts"],
        correctAnswer: "Understanding core concepts",
        explanation: `A key aspect is understanding the core concepts thoroughly`,
        difficulty: "medium"
      },
      {
        question: `How would you explain ${title} to someone?`,
        options: ["Using key concepts", "With memorized facts", "Through random examples", "Without explanation"],
        correctAnswer: "Using key concepts",
        explanation: `The best approach is to explain through key concepts and practical examples`,
        difficulty: "medium"
      },
      {
        question: `What is important to understand about ${title}?`,
        options: ["The underlying principles", "Just the definitions", "Only examples", "Memorized facts"],
        correctAnswer: "The underlying principles",
        explanation: `Understanding the underlying principles is crucial for ${title}`,
        difficulty: "medium"
      }
    ],
    hard: [
      {
        question: `How can you apply knowledge of ${title} in practice?`,
        options: ["Through analysis and reasoning", "By memorization alone", "Ignoring theory", "Random guessing"],
        correctAnswer: "Through analysis and reasoning",
        explanation: `Applying ${title} requires analysis and critical reasoning`,
        difficulty: "hard"
      },
      {
        question: `What are the implications of understanding ${title}?`,
        options: ["Better decision-making and problem-solving", "No real impact", "Confusion", "Wasted time"],
        correctAnswer: "Better decision-making and problem-solving",
        explanation: `Understanding ${title} leads to improved decision-making abilities`,
        difficulty: "hard"
      },
      {
        question: `Which scenario best demonstrates ${title}?`,
        options: ["A real-world application of concepts", "A random event", "Unrelated situation", "Fictional scenario"],
        correctAnswer: "A real-world application of concepts",
        explanation: `${title} is best demonstrated through real-world applications`,
        difficulty: "hard"
      }
    ],
    other: [
      {
        question: `How would you integrate knowledge of ${title} with other subjects?`,
        options: ["By finding connections with other concepts", "By ignoring other subjects", "By memorizing facts", "By random associations"],
        correctAnswer: "By finding connections with other concepts",
        explanation: `Integrating knowledge across subjects shows deeper understanding`,
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