from google import genai
import os

api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="اختبر الاتصال فقط من Replit."
)

print(response.text)
