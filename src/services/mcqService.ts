
// MCQ Service to fetch questions from the API

export interface MCQQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
}

// API base URL should be configurable for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Fetches the latest MCQ from the API
 * @returns Promise with the latest MCQ question
 */
export async function fetchLatestMCQ(): Promise<MCQQuestion> {
  try {
    const response = await fetch(`${API_BASE_URL}/latest_mcq`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    
    // Check if we got an actual MCQ or an error message
    if (data.message === "No MCQs available") {
      throw new Error("No MCQs available");
    }
    
    return data as MCQQuestion;
  } catch (error) {
    console.error("Error fetching MCQ:", error);
    throw error;
  }
}

/**
 * Triggers the generation of a new MCQ from the current transcript
 * @param minutes How many minutes of transcript to use (default: 30)
 */
export async function generateMCQ(minutes: number = 30): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-mcq?minutes=${minutes}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating MCQ:", error);
    throw error;
  }
}

/**
 * Gets the current transcript summary
 * @param minutes How many minutes of transcript to use (default: 30)
 */
export async function getTranscriptSummary(minutes: number = 30): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/transcript/summary?minutes=${minutes}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Error fetching transcript summary:", error);
    throw error;
  }
}

/**
 * Gets the current quiz interval setting from the server
 */
export async function getQuizInterval(): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/quiz-interval`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.minutes;
  } catch (error) {
    console.error("Error fetching quiz interval:", error);
    return 5; // Default to 5 minutes if there's an error
  }
}

/**
 * Sets the quiz interval on the server
 * @param minutes The interval in minutes
 */
export async function setQuizInterval(minutes: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/quiz-interval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ minutes })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error setting quiz interval:", error);
    throw error;
  }
}

/**
 * Maps the API format to the frontend's QuizQuestion type
 */
export function mapMCQToQuizQuestion(mcq: MCQQuestion): any {
  // Convert options from {A, B, C, D} format to array format
  const optionsArray = [
    mcq.options.A,
    mcq.options.B,
    mcq.options.C,
    mcq.options.D
  ];

  // Determine correct option index based on the answer letter
  const correctOptionIndex = mcq.answer.charCodeAt(0) - 'A'.charCodeAt(0);

  return {
    id: `q-${new Date().getTime()}`,
    question: mcq.question,
    options: optionsArray,
    correctOptionIndex,
    timestamp: new Date().toISOString(),
    topicTag: "Generated Question", // This could be improved with AI-generated tags
    transcriptSegment: null // No transcript segment available from generated questions
  };
}
