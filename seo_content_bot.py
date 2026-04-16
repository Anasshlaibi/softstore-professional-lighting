import json
import os
from openai import OpenAI

# --- CONFIGURATION ---
# It is best practice to keep your API key in a .env file.
# We will try to load it from the environment first.
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "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")
BRAND_NAME = "GearShop.ma"
LOCATION = "Casablanca, Morocco"

# Setup the OpenRouter Client
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=OPENROUTER_API_KEY,
)

def generate_seo_package(product_name, price_dh, category):
    """
    Generates a full SEO package using OpenRouter (Gemini 1.5 Flash)
    """
    
    prompt = f"""
    You are an expert SEO copywriter for {BRAND_NAME}, the #1 audiovisual store in {LOCATION}.
    
    PRODUCT: {product_name}
    PRICE: {price_dh} DH
    CATEGORY: {category}
    
    TASKS:
    1. Write a professional, persuasive product description in French (approx 150 words). 
       Focus on benefits for Moroccan creators (TikTok, YouTube, Weddings).
       Target keywords: 'Acheter {product_name} Maroc', 'Meilleur prix {category} Casablanca'.
    
    2. Write exactly one sentence in Moroccan Darija that builds massive trust (e.g., 'Had l'matériel dial l'khidma, ghadi ihanniq mn l'machakil').
    
    3. Generate the JSON-LD Schema (Product type) including name, image placeholder, description, and offer (price, currency MAD, and availability).
    
    4. Provide 5 specific SEO keywords for this product.
    
    FORMAT: Return the result in clear sections.
    """
    
    try:
        response = client.chat.completions.create(
          model="google/gemini-2.0-flash-001", # Latest and most compatible
          messages=[
            {
              "role": "user",
              "content": prompt
            }
          ],
          extra_headers={
            "HTTP-Referer": "https://gearshop.ma", # Optional, for OpenRouter analytics
            "X-Title": "GearShop SEO Bot", 
          }
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error calling AI: {str(e)}"

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    print(f"\n--- ⚡ {BRAND_NAME} SEO Automation Bot ---")
    print("Powered by OpenRouter & Gemini AI\n")
    
    p_name = input("Enter Product Name (e.g. ZSYB 600W): ")
    p_price = input("Enter Price in DH: ")
    p_cat = input("Enter Category (e.g. Studio, Portable): ")
    
    print(f"\n🚀 Generating expert content for {p_name}... Please wait.\n")
    
    result = generate_seo_package(p_name, p_price, p_cat)
    
    # Save to a text file
    safe_name = p_name.replace(' ', '_').lower()
    filename = f"seo_{safe_name}.txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(result)
        
    print("="*50)
    print(result)
    print("="*50)
    
    print(f"\n✅ Content generated successfully!")
    print(f"📁 Saved to: {filename}")
    print(f"💡 TIP: Use the Darija line in your WhatsApp ads for higher trust.")
