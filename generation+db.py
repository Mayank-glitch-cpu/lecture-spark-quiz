import os
from dotenv import load_dotenv
import google.generativeai as genai
import json
import re
import sqlite3
from supabase import create_client  # requires supabase-py package

# Load environment variables from .env file
load_dotenv()

# Configure Gemini API with the correct environment variable name
api_key = os.getenv("GEMINI-API-KEY")
if not api_key:
    raise ValueError("GEMINI-API-KEY not found in environment variables")
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

# Set up SQLite connection
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
    answer TEXT
)
''')
conn.commit()

supabase_url = os.environ.get("SUPABASE_URL", "https://avlxadmsemdtiygbotas.supabase.co")
supabase_key = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bHhhZG1zZW1kdGl5Z2JvdGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3OTcxNzQsImV4cCI6MjA1OTM3MzE3NH0.Uy397lqE2j6yU9dtNvkM5hNR28al_lBYv8gZQKhGRks")
supabase = create_client(supabase_url, supabase_key)

# Add this debug code temporarily at the start of your script
print(f"Supabase URL: {supabase_url}")
print(f"Supabase key length: {len(supabase_key) if supabase_key else 'No key found'}")

# Replace the existing table check code with this:
def create_supabase_table():
    create_table_sql = """
    create table if not exists public.mcqs (
        id bigint primary key generated always as identity,
        question text not null,
        option_a text not null,
        option_b text not null,
        option_c text not null,
        option_d text not null,
        answer text not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
    """
    try:
        # Using REST API to create table
        response = supabase.rpc('exec_sql', {'query': create_table_sql}).execute()
        print("✅ MCQs table created or already exists in Supabase")
        return True
    except Exception as e:
        print(f"❌ Error creating table: {str(e)}")
        return False

# Replace the existing try-except block with this:
try:
    # Test if table exists by attempting to select from it
    response = supabase.table("mcqs").select("id").limit(1).execute()
    print("✅ MCQs table exists in Supabase")
except Exception as e:
    print("⚠️ Table doesn't exist, attempting to create...")
    if create_supabase_table():
        print("✅ Table created successfully")
    else:
        print("❌ Failed to create table")

# Add this test code temporarily
try:
    response = supabase.table("mcqs").select("*").execute()
    print("Connection test successful:", response)
except Exception as e:
    print("Connection test failed:", str(e))

def summarize_text(text, temperature=0.2, max_tokens=500, top_p=0.9, top_k=40):
    prompt = f"Summarize the following text:\n\n{text}"
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": temperature,
            "top_p": top_p,
            "top_k": top_k,
            "max_output_tokens": max_tokens
        }
    )
    return response.text

def generate_mcq_json(summary_text):
    prompt = f"""
From the following text, generate a multiple-choice question with 4 options (A, B, C, D) in **valid JSON format**. The JSON should include:
- "question": the question string
- "options": a dictionary with keys A, B, C, and D and their corresponding answers
- "answer": the correct option letter (A/B/C/D)
Only return valid JSON. No explanation.

Text: \"\"\"{summary_text}\"\"\" 
"""
    response = model.generate_content(prompt)
    return extract_json_from_response(response.text)

def extract_json_from_response(raw_text):
    """
    Extract JSON block from Gemini response text.
    Strips backticks and handles common issues.
    """
    clean_text = re.sub(r"```json|```", "", raw_text.strip())
    clean_text = clean_text.replace("“", "\"").replace("”", "\"").replace("‘", "'").replace("’", "'")

    try:
        return json.loads(clean_text)
    except json.JSONDecodeError as e:
        print("⚠️ JSON Decode Error:", e)
        print("Cleaned text:\n", clean_text)
        return None

def insert_mcq(mcq):
    try:
        # Insert into SQLite database
        cursor.execute('''
            INSERT INTO mcqs (question, option_a, option_b, option_c, option_d, answer)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            mcq["question"],
            mcq["options"]["A"],
            mcq["options"]["B"],
            mcq["options"]["C"],
            mcq["options"]["D"],
            mcq["answer"]
        ))
        conn.commit()
        print("✅ MCQ inserted into SQLite database.")
    
        # Insert into Supabase database
        data = {
            "question": mcq["question"],
            "option_a": mcq["options"]["A"],
            "option_b": mcq["options"]["B"],
            "option_c": mcq["options"]["C"],
            "option_d": mcq["options"]["D"],
            "answer": mcq["answer"]
        }
        
        response = supabase.table("mcqs").insert(data).execute()
        if hasattr(response, 'data') and response.data:
            print("✅ MCQ inserted into Supabase database.")
            print(f"Inserted data: {response.data}")
        else:
            print("❌ No data returned from Supabase insertion")
            
    except Exception as e:
        print(f"❌ Error during insertion: {str(e)}")
        print(f"Error type: {type(e)}")
        if hasattr(e, 'response'):
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")

if __name__ == "__main__":
    input_text = input("Enter the text to summarize: ")
    summary = summarize_text(input_text)
    print("\nSummary:\n", summary)

    mcq = generate_mcq_json(summary)
    if mcq:
        print("\nGenerated MCQ JSON:\n", json.dumps(mcq, indent=2))
        insert_mcq(mcq)
    else:
        print("❌ Could not generate a valid MCQ.")
