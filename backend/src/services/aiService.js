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
  
  // Vary questions based on randomization - Create truly diverse questions
  const easyQuestions = [
    {
      question: `What is the primary subject of "${title}"?`,
      options: [title, "Ancient history", "Popular culture", "Scientific theory"],
      correctAnswer: title,
      explanation: `The primary subject discussed is ${title}`,
      difficulty: "easy"
    },
    {
      question: `Which statement best defines ${title}?`,
      options: [
        explanation.substring(0, 50) + "...", 
        "A type of historical event", 
        "A mathematical concept", 
        "An unrelated topic"
      ],
      correctAnswer: explanation.substring(0, 50) + "...",
      explanation: `${title} is defined as: ${explanation.substring(0, 80)}...`,
      difficulty: "easy"
    },
    {
      question: `What key aspect is emphasized when studying ${title}?`,
      options: [
        concepts[0] || "Understanding core principles", 
        "Memorizing dates", 
        "Ignoring practical applications", 
        "Following outdated methods"
      ],
      correctAnswer: concepts[0] || "Understanding core principles",
      explanation: `A key aspect of ${title} is understanding its core principles and concepts`,
      difficulty: "easy"
    },
  ];
  
  return {
    easy: easyQuestions.sort(() => Math.random() - 0.5).slice(0, 3),
    medium: [
      {
        question: `What is a fundamental concept of ${title}?`,
        options: ["Understanding core principles", "Memorization only", "Ignoring context", "Random facts"],
        correctAnswer: "Understanding core principles",
        explanation: `${title} fundamentally requires understanding its core principles`,
        difficulty: "medium"
      },
      {
        question: `How should ${title} be approached for better learning?`,
        options: ["Through analytical study", "With rote memorization", "By avoiding examples", "Without proper context"],
        correctAnswer: "Through analytical study",
        explanation: `${title} should be approached analytically to gain deeper understanding`,
        difficulty: "medium"
      },
      {
        question: `What distinguishes ${title} from superficial understanding?`,
        options: ["Applying concepts in context", "Just reading definitions", "Memorizing facts", "Surface-level examples"],
        correctAnswer: "Applying concepts in context",
        explanation: `True understanding of ${title} comes from applying concepts in real contexts`,
        difficulty: "medium"
      },
      {
        question: `Why is comprehensive knowledge of ${title} important?`,
        options: ["For building strong foundations", "For quick answers only", "For surface learning", "For avoiding depth"],
        correctAnswer: "For building strong foundations",
        explanation: `Comprehensive knowledge of ${title} builds a strong foundation for advanced learning`,
        difficulty: "medium"
      }
    ].sort(() => Math.random() - 0.5).slice(0, 3),
    hard: [
      {
        question: `How can ${title} be synthesized with broader frameworks?`,
        options: ["Through interconnected analysis", "By isolation", "Avoiding theory", "Random connections"],
        correctAnswer: "Through interconnected analysis",
        explanation: `${title} gains depth when synthesized within broader conceptual frameworks`,
        difficulty: "hard"
      },
      {
        question: `What complex implications arise from mastering ${title}?`,
        options: ["Systemic problem-solving capabilities", "Limited usefulness", "Narrow specialization", "Theoretical confusion"],
        correctAnswer: "Systemic problem-solving capabilities",
        explanation: `Mastering ${title} enables systemic thinking and advanced problem-solving`,
        difficulty: "hard"
      },
      {
        question: `How would you evaluate critical understanding of ${title}?`,
        options: ["Through real-world application and analysis", "By simple recall", "Through memorization tests", "Without practical testing"],
        correctAnswer: "Through real-world application and analysis",
        explanation: `Critical understanding of ${title} is demonstrated through effective real-world application`,
        difficulty: "hard"
      },
      {
        question: `What emerging patterns emerge from studying ${title}?`,
        options: ["Interconnected relationships across domains", "Isolated facts only", "No significant patterns", "Theoretical limitations"],
        correctAnswer: "Interconnected relationships across domains",
        explanation: `Studying ${title} reveals interconnected relationships that apply across multiple domains`,
        difficulty: "hard"
      }
    ].sort(() => Math.random() - 0.5).slice(0, 3),
    other: [
      {
        question: `How does ${title} integrate with adjacent concepts?`,
        options: ["Through identifying meaningful connections", "By ignoring relationships", "Through memorization", "By random association"],
        correctAnswer: "Through identifying meaningful connections",
        explanation: `Integration of ${title} with adjacent concepts requires identifying meaningful connections`,
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