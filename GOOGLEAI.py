from google import genai
import os

api_key = os.getenv("")

client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-1.5-flash",
    contents="اختبر الاتصال فقط من Replit."
)

print(response.text)
run()