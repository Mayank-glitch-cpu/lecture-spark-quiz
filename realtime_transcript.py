from fastapi import FastAPI
from typing import List
from datetime import datetime, timedelta
import time

app = FastAPI()

transcript_messages: List[dict] = []

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
