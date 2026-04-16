import os
import json
import time
import schedule
import smtplib
import sys
from email.message import EmailMessage
from openai import OpenAI

# --- CONFIGURATION ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "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")
BRAND_NAME = "GearShop.ma"
LOCATION = "Casablanca, Morocco"
USER_EMAIL = "anasshlaibi@gmai.com" # As provided by the user

# Email sender configuration (Set these in your environment for security!)
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "your-bot-email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your-app-password")

# Setup the OpenRouter Client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

def call_gemini(system_prompt, user_prompt):
    """
    Standard AI call wrapper.
    """
    try:
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            extra_headers={
                "HTTP-Referer": "https://gearshop.ma",
                "X-Title": "GearShop Automation Scheduler",
            }
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ AI Error: {str(e)}"

def generate_trending_topic():
    """
    Asks Gemini to invent a high-impact blog topic for the Moroccan market.
    """
    print("🤖 Brainstorming a new trending topic...")
    system_prompt = f"You are a creative Content Strategist for {BRAND_NAME} in Morocco."
    user_prompt = """
    Invent one unique, high-impact SEO blog post title for GearShop.ma.
    The topic should be about professional audiovisual gear (cameras, lights, mics) specifically for Moroccan creators (weddings, TikTok, studio).
    Respond ONLY with the title.
    """
    topic = call_gemini(system_prompt, user_prompt)
    return topic.strip().replace('"', '')

def write_and_save_blog(topic):
    """
    The core blogger logic, adapted for automation.
    """
    print(f"✍️ Writing blog: {topic}...")
    system_prompt = f"You are an Elite E-commerce SEO Strategist for {BRAND_NAME}, located in {LOCATION}."
    user_prompt = f"""
    Write a comprehensive, SEO-optimized blog post about '{topic}' for {BRAND_NAME}.
    Include:
    1. Clickable French title.
    2. Darija Hook.
    3. H2/H3 headings in French.
    4. Internal link placeholders.
    5. JSON-LD Article Schema.
    """
    content = call_gemini(system_prompt, user_prompt)
    
    # Ensure blogs directory exists
    if not os.path.exists("blogs"):
        os.makedirs("blogs")
        
    import re
    safe_topic = re.sub(r'[^\w\s-]', '', topic).strip().replace(' ', '_').lower()[:50]
    filename = f"blogs/blog_{safe_topic}.md"
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
        
    return filename, content

def send_email_notification(filepath, topic, content):
    """
    Sends the generated blog to the user's email.
    """
    if EMAIL_SENDER == "your-bot-email@gmail.com" or EMAIL_PASSWORD == "your-app-password":
        print("⚠️ Email credentials not set. Skipping email notification.")
        print(f"💡 TIP: Set EMAIL_SENDER and EMAIL_PASSWORD env vars to receive emails.")
        return

    print(f"📧 Sending email to {USER_EMAIL}...")
    msg = EmailMessage()
    msg['Subject'] = f"🚀 New SEO Blog Ready: {topic}"
    msg['From'] = EMAIL_SENDER
    msg['To'] = USER_EMAIL
    msg.set_content(f"Hello Anass,\n\nYour automated SEO bot has just generated a new blog post: '{topic}'.\n\nYou can find the full content attached or in the 'blogs/' folder of your project.\n\nKeep growing GearShop.ma!")

    # Attach the markdown file
    with open(filepath, 'rb') as f:
        file_data = f.read()
        msg.add_attachment(file_data, maintype='text', subtype='markdown', filename=os.path.basename(filepath))

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
            smtp.send_message(msg)
        print("✅ Email sent successfully!")
    except Exception as e:
        print(f"❌ Email failed: {str(e)}")

def scheduled_job():
    """
    The main sequence run by the scheduler.
    """
    print(f"\n--- 🕒 Automation Run Started at {time.ctime()} ---")
    topic = generate_trending_topic()
    filepath, content = write_and_save_blog(topic)
    send_email_notification(filepath, topic, content)
    print("--- ✅ Automation Run Complete ---\n")

# --- SCHEDULING ---
# Monday, Wednesday, Friday at 10:00 AM
schedule.every().monday.at("10:00").do(scheduled_job)
schedule.every().wednesday.at("10:00").do(scheduled_job)
schedule.every().friday.at("10:00").do(scheduled_job)

# For testing: Uncomment the line below to run it every 1 minute
# schedule.every(1).minutes.do(scheduled_job)

if __name__ == "__main__":
    if "--run-once" in sys.argv:
        print("🚀 Running automated SEO job (ONE-TIME RUN)...")
        scheduled_job()
        sys.exit(0)

    print(f"🚀 GearShop SEO Scheduler is ACTIVE.")
    print(f"📅 Scheduled to run 3 times a week for {USER_EMAIL}.")
    print("Press Ctrl+C to stop.")
    
    # Run once immediately on start for verification if not in scheduler mode
    scheduled_job()
    
    while True:
        schedule.run_pending()
        time.sleep(60)
