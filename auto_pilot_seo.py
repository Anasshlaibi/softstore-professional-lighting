import os
import json
import datetime
from openai import OpenAI

# --- CONFIGURATION ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)

# This is where the AI will save the new content on your website
DATA_FILE_PATH = "src/data/seo_trends.json"

def get_market_trend():
    """Asks the AI to analyze the market and write a new SEO update."""
    prompt = """
    You are the AI Marketing Director for GearShop.ma (a professional photography/video lighting store in Casablanca, Morocco).
    Your goal is to keep the website at #1 on Google.
    
    Write a short, highly-optimized "Lighting Tip of the Week" (approx 100 words in French).
    It must include trending keywords for Moroccan creators (e.g., TikTok lighting, Studio setup, ZSYB, Casablanca).
    
    Return ONLY a raw JSON object with this exact format:
    {
        "date": "YYYY-MM-DD",
        "title": "...",
        "content": "...",
        "keywords": ["...", "..."]
    }
    """
    
    try:
        response = client.chat.completions.create(
          model="google/gemini-2.0-flash-001",
          messages=[{"role": "user", "content": prompt}]
        )
        
        # Clean the response to ensure it's pure JSON
        raw_text = response.choices[0].message.content
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            
        return json.loads(raw_text)
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("🤖 GearShop Auto-Pilot Waking Up...")
    
    trend_data = get_market_trend()
    
    if trend_data:
        # Override the date to today
        trend_data["date"] = datetime.datetime.now().strftime("%Y-%m-%d")
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(DATA_FILE_PATH), exist_ok=True)
        
        # Save the data directly into your website's code
        with open(DATA_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(trend_data, f, ensure_ascii=False, indent=4)
            
        print("✅ Successfully generated new SEO content!")
        print(f"Title: {trend_data['title']}")
        print("This file is ready to be pushed to GitHub.")
    else:
        print("❌ Failed to generate content.")
