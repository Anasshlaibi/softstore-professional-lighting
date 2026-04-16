import os
import json
import time
from openai import OpenAI

# --- CONFIGURATION ---
# Securely load the API key. 
# It's recommended to set this as an environment variable: OPENROUTER_API_KEY
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "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")
BRAND_NAME = "GearShop.ma"
LOCATION = "Casablanca, Morocco"

# Setup the OpenRouter Client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

def call_gemini(system_prompt, user_prompt, use_search=False):
    """
    Robust wrapper for calling Gemini via OpenRouter with retry logic.
    """
    model = "google/gemini-2.0-flash-001" # Using a stable, fast model
    
    # Exponential backoff retry logic
    for delay in [1, 2, 4]:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                extra_headers={
                    "HTTP-Referer": "https://gearshop.ma",
                    "X-Title": "GearShop SEO Strategist",
                }
            )
            return response.choices[0].message.content
        except Exception as e:
            if "429" in str(e): # Rate limit
                print(f"⚠️ Rate limited. Retrying in {delay}s...")
                time.sleep(delay)
            else:
                return f"❌ Error calling AI: {str(e)}"
    
    return "❌ Failed to connect after multiple retries."

def auto_blogger():
    print("\n" + "="*50)
    print("✍️  THE AUTO-BLOGGER: GENERATING HIGH-RANKING CONTENT")
    print("="*50)
    topic = input("Enter the blog topic (e.g., 'Best microphones for podcasting in Morocco'): ")
    print(f"\n⏳ Researching and writing a localized SEO article for '{topic}'...")
    
    system_prompt = f"You are an Elite E-commerce SEO Strategist for {BRAND_NAME}, located in {LOCATION}. You blend Professional French with natural Moroccan Darija to build trust."
    
    user_prompt = f"""
    Write a comprehensive, SEO-optimized blog post about '{topic}' for {BRAND_NAME}.
    
    Requirements:
    1. A catchy, clickable title in French that includes high-volume keywords.
    2. A short 'Darija Hook' (1-2 sentences) at the beginning to build immediate local trust.
    3. Detailed, professional French content broken into clear headings (H2, H3).
    4. Focus on the benefits for Moroccan creators (TikTok, YouTube, Weddings).
    5. Include internal link placeholders (e.g., [Lien vers nos Microphones ici]).
    6. Provide a valid JSON-LD 'Article' Schema block at the very bottom.
    
    Tone: Expert, helpful, and localized for the Moroccan market.
    """
    
    content = call_gemini(system_prompt, user_prompt)
    
    safe_topic = topic.replace(' ', '_').lower()
    filename = f"blog_{safe_topic}.md"
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"\n✅ SUCCESS! Your article has been saved to: {filename}")
    print(f"💡 TIP: Post this on your 'Blog' or 'Actualités' section to drive traffic.")

def competitor_spy():
    print("\n" + "="*50)
    print("🕵️‍♂️  THE COMPETITOR SPY: ANALYZE & OUTRANK")
    print("="*50)
    competitor_input = input("Enter a competitor's URL or a target keyword to analyze: ")
    print(f"\n⏳ Analyzing the competitive landscape for '{competitor_input}'...")
    
    system_prompt = f"You are a Senior SEO Analyst specialized in the Moroccan Audiovisual and Tech market."
    
    user_prompt = f"""
    I need an SEO teardown for the following competitor link or keyword in the Moroccan market: {competitor_input}
    
    Please provide:
    1. TARGET KEYWORDS: What primary and secondary keywords are they likely ranking for?
    2. CONTENT GAPS: What specific information or value are they missing that {BRAND_NAME} can provide?
    3. THE 'BETTER CONTENT' PLAN: Give me 3 concrete steps to create a piece of content that outranks them.
    4. LOCAL ADVANTAGE: How can we use our location in {LOCATION} to beat them?
    """
    
    content = call_gemini(system_prompt, user_prompt)
    filename = "competitor_analysis_report.md"
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"\n✅ SUCCESS! Competitor report generated: {filename}")
    print(f"💡 TIP: Use the 'Content Gaps' to update your existing product pages.")

def backlink_planner():
    print("\n" + "="*50)
    print("🔗  THE BACKLINK PLANNER: BUILD AUTHORITY")
    print("="*50)
    niche = input("Enter your specific niche or category (e.g., 'Studio Lighting', 'Cameras'): ")
    print(f"\n⏳ Generating a custom Moroccan backlink strategy for '{niche}'...")
    
    system_prompt = "You are a Digital PR and Link Building expert for the North African market."
    
    user_prompt = f"""
    Create a specific, actionable backlink building strategy for {BRAND_NAME} focusing on the '{niche}' category in Morocco.
    
    Provide:
    1. TOP TARGETS: 5 types of Moroccan websites (directories, tech blogs, news sites) where we should be listed.
    2. OUTREACH TEMPLATE: A professional French email template to send to Moroccan influencers/YouTubers for gear reviews.
    3. LINK MAGNET IDEAS: 2 creative content ideas (like a 'Moroccan Price Guide' or 'Buying Guide') that people will naturally want to link to.
    4. FORUM STRATEGY: Which Moroccan forums or Facebook groups are best for sharing our expertise?
    """
    
    content = call_gemini(system_prompt, user_prompt)
    filename = "backlink_strategy.md"
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"\n✅ SUCCESS! Your custom backlink strategy is ready: {filename}")
    print(f"💡 TIP: Getting even 2-3 high-quality local backlinks can double your traffic.")

def main():
    while True:
        print("\n" + "="*50)
        print(f"   🚀 {BRAND_NAME.upper()} SEO STRATEGIST BOT (v2.0)   ")
        print("="*50)
        print("1. ✍️  AUTO-BLOGGER   (Write an SEO Article)")
        print("2. 🕵️‍♂️  COMPETITOR SPY (Analyze & Outrank)")
        print("3. 🔗  BACKLINK PLANNER (Build Authority)")
        print("4. ❌  EXIT")
        print("="*50)
        
        choice = input("Select an option (1-4): ")
        
        if choice == '1':
            auto_blogger()
        elif choice == '2':
            competitor_spy()
        elif choice == '3':
            backlink_planner()
        elif choice == '4':
            print(f"\n👋 Exiting. Good luck ranking {BRAND_NAME} at #1!")
            break
        else:
            print("❌ Invalid choice. Please select 1, 2, 3, or 4.")

if __name__ == "__main__":
    main()
