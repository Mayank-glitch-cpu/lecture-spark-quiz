from fastapi import FastAPI, Request
import uvicorn
from pydantic import BaseModel
from typing import List
import json
from dotenv import load_dotenv
import os

app = FastAPI()
transcript_data = []
load_dotenv()
user = os.getenv("user_name")
class TranscriptMsg(BaseModel):
    msg_type: int
    content: dict
    user_name: str

@app.post("/ingest")
async def ingest_transcript(msg: TranscriptMsg):
    if msg.msg_type == 17 and msg.user_name== user  and "data" in msg.content:
        transcript_data.append(msg.content)
        print(f"📝 {msg.content['user_name']}: {msg.content['data']}")
    return {"status": "ok"}

@app.get("/transcript")
def get_full_transcript():
    full = "\n".join(f"{m['user_name']}: {m['data']}" for m in transcript_data)
    return {"transcript": full}

# @app.get("/generate")
# def generate_summary_and_mcq():
#     from summarizer_service import summarize_text, generate_mcq_json
#     full = "\n".join(f"{m['user_name']}: {m['data']}" for m in transcript_data)
#     summary = summarize_text(full)
#     mcq = generate_mcq_json(summary)
#     return {"summary": summary, "mcq": mcq}

if __name__ == "__main__":
    uvicorn.run("realtime_ingest:app", host="0.0.0.0", port=5000, reload=True)
