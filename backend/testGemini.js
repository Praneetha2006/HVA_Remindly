import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log("Key loaded:", process.env.GEMINI_API_KEY?.slice(0, 6));
console.log("Key length:", process.env.GEMINI_API_KEY?.length);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

const result = await model.generateContent("Say hello");
console.log(result.response.text());