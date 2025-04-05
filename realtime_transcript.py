from fastapi import FastAPI
from typing import List
from datetime import datetime, timedelta
import time
import sqlite3
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware to allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

transcript_messages: List[dict] = []

class MCQQuestion(BaseModel):
    question: str
    options: dict
    answer: str

@app.post("/add_message")
async def add_message(message: dict):
    transcript_messages.append(message)
    return {"status": "Message received"}

@app.get("/transcript")
async def get_transcript():
    now_micro = int(time.time() * 1_000_000)
    one_minute_ago = now_micro - (60 * 1_000_000)#currently 1 minute
    one_minute_ago = int(one_minute_ago)

    recent_messages = [
        msg for msg in transcript_messages
        if msg["timestamp"] >= one_minute_ago
    ]

    full_text = "\n".join(f"{msg['user_name']}: {msg['data']}" for msg in recent_messages)

    return {"transcript": full_text}

@app.get("/latest_mcq")
async def get_latest_mcq():
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
