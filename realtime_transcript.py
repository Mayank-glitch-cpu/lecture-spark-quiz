from fastapi import FastAPI, BackgroundTasks
from typing import List, Dict
from datetime import datetime, timedelta
import time
import sqlite3
import os
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
from dotenv import load_dotenv
import google.generativeai as genai

app = FastAPI()

# Add CORS middleware to allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables for Gemini
load_dotenv()
api_key = os.getenv("GEMINI-API-KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
else:
    print("WARNING: GEMINI-API-KEY not found in environment variables")

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect("mcq.db")
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS mcqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT,
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        answer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()
    conn.close()

init_db()

# Store transcripts globally
transcript_messages: List[dict] = []
latest_transcript_summary: str = ""
auto_quiz_interval: int = 5  # Default interval in minutes

class MCQQuestion(BaseModel):
    question: str
    options: Dict[str, str]
    answer: str

class TranscriptMessage(BaseModel):
    user_name: str
    data: str
    timestamp: int

class QuizInterval(BaseModel):
    minutes: int

@app.post("/add_message")
async def add_message(message: TranscriptMessage):
    transcript_messages.append(message.dict())
    
    # Store in SQLite
    conn = sqlite3.connect("mcq.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO transcripts (content) VALUES (?)",
        (json.dumps(message.dict()),)
    )
    conn.commit()
    conn.close()
    
    return {"status": "Message received"}

@app.get("/transcript")
async def get_transcript(minutes: int = 30):
    """Get transcript from the last X minutes"""
    now_micro = int(time.time() * 1_000_000)
    time_ago = now_micro - (minutes * 60 * 1_000_000)
    
    recent_messages = [
        msg for msg in transcript_messages
        if msg["timestamp"] >= time_ago
    ]
    
    full_text = "\n".join(f"{msg['user_name']}: {msg['data']}" for msg in recent_messages)
    return {"transcript": full_text}

@app.get("/transcript/summary")
async def get_transcript_summary(minutes: int = 30):
    """Get a summary of the transcript from the last X minutes"""
    global latest_transcript_summary
    
    if not api_key:
        return {"error": "GEMINI-API-KEY not found"}
        
    transcript_response = await get_transcript(minutes)
    transcript_text = transcript_response["transcript"]
    
    if not transcript_text or len(transcript_text.strip()) < 50:
        return {"summary": "Not enough transcript data to generate a summary."}
    
    try:
        response = model.generate_content(
            f"Summarize this lecture transcript concisely, keeping important concepts and key points:\n\n{transcript_text}"
        )
        summary = response.text
        latest_transcript_summary = summary
        return {"summary": summary}
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate-mcq")
async def generate_mcq_from_transcript(background_tasks: BackgroundTasks, minutes: int = 30):
    """Generate MCQ from transcript"""
    if not api_key:
        return {"error": "GEMINI-API-KEY not found"}
        
    # Get transcript
    transcript_response = await get_transcript(minutes)
    transcript_text = transcript_response["transcript"]
    
    if not transcript_text or len(transcript_text.strip()) < 50:
        return {"error": "Not enough transcript data to generate questions"}
    
    # Run MCQ generation in background to avoid timeout
    background_tasks.add_task(generate_and_store_mcq, transcript_text)
    
    return {"status": "MCQ generation started in background"}

async def get_latest_mcq():
    """Get the latest MCQ from the database"""
    try:
        # Connect to SQLite database
        conn = sqlite3.connect("mcq.db")
        cursor = conn.cursor()
        
        # Get the latest MCQ
        cursor.execute('''
            SELECT question, option_a, option_b, option_c, option_d, answer 
            FROM mcqs 
            ORDER BY id DESC 
            LIMIT 1
        ''')
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            question, option_a, option_b, option_c, option_d, answer = result
            return {
                "question": question,
                "options": {
                    "A": option_a,
                    "B": option_b,
                    "C": option_c,
                    "D": option_d
                },
                "answer": answer
            }
        else:
            return {"message": "No MCQs available"}
            
    except Exception as e:
        return {"error": str(e)}

@app.get("/latest_mcq")
async def latest_mcq():
    """API endpoint to get the latest MCQ"""
    return await get_latest_mcq()

@app.post("/quiz-interval")
async def set_quiz_interval(interval: QuizInterval):
    """Set the automatic quiz generation interval in minutes"""
    global auto_quiz_interval
    auto_quiz_interval = interval.minutes
    return {"status": f"Auto quiz interval set to {auto_quiz_interval} minutes"}

@app.get("/quiz-interval")
async def get_quiz_interval():
    """Get the current automatic quiz generation interval"""
    return {"minutes": auto_quiz_interval}

def generate_and_store_mcq(transcript_text):
    """Generate MCQ from transcript and store in database"""
    try:
        # First, generate a summary
        summary_prompt = f"Summarize this lecture transcript, focusing on key concepts and important points:\n\n{transcript_text}"
        summary_response = model.generate_content(summary_prompt)
        summary = summary_response.text
        
        # Then, generate an MCQ based on the summary
        mcq_prompt = f"""
        Based on this lecture summary, create a multiple-choice question with 4 options (A, B, C, D).
        Return only valid JSON with the following structure exactly:
        {{
            "question": "the question text",
            "options": {{"A": "option A text", "B": "option B text", "C": "option C text", "D": "option D text"}},
            "answer": "the correct option letter (A, B, C, or D)"
        }}

        Summary: {summary}
        """
        
        mcq_response = model.generate_content(mcq_prompt)
        mcq_text = mcq_response.text
        
        # Clean up the response to extract just the JSON
        mcq_text = mcq_text.replace("```json", "").replace("```", "").strip()
        mcq_data = json.loads(mcq_text)
        
        # Store in SQLite
        conn = sqlite3.connect("mcq.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO mcqs (question, option_a, option_b, option_c, option_d, answer) VALUES (?, ?, ?, ?, ?, ?)",
            (
                mcq_data["question"],
                mcq_data["options"]["A"],
                mcq_data["options"]["B"],
                mcq_data["options"]["C"],
                mcq_data["options"]["D"],
                mcq_data["answer"]
            )
        )
        conn.commit()
        conn.close()
        
        print(f"MCQ generated and stored: {mcq_data['question']}")
        return mcq_data
        
    except Exception as e:
        print(f"Error generating MCQ: {e}")
        return None
