from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai

# Configure the API key
genai.configure(api_key='AIzaSyCC3Z5w1rncciEUuQc9rRNWGsAqX1o6bWQ')  # Replace with your actual API key

# Initialize FastAPI app
app = FastAPI()

# Define predefined questions and responses
predefined_responses = {
    # تأخير السائق
    "The driver is late": "We apologize for the delay. Your driver is on the way.",
    "Where is my driver?": "Your driver is on the way. Please check the app for live tracking.",
    "My driver is taking too long!": "We apologize for the delay. Your driver will arrive shortly.",
    "السائق متأخر": "نعتذر، سائقك في الطريق الآن.",
    "السواق لسه مجاش!": "نأسف للتأخير، سائقك قرب يوصل.",
    "فين السواق؟": "سائقك في الطريق، تابع موقعه من التطبيق.",
    "ليه السواق اتأخر؟": "نأسف لذلك، أحيانًا يكون هناك زحام مروري. سائقك في الطريق.",

    # مشاكل السيارة
    "The car is dirty": "We apologize for the inconvenience. Please rate your ride and provide feedback.",
    "The car smells bad": "We’re sorry for the discomfort. Please share your feedback in the app.",
    "The car is old and in bad condition": "We apologize for your experience. Please rate your ride and provide feedback.",
    "العربية مش نضيفة": "نأسف للإزعاج، يمكنك تقييم الرحلة وإبداء ملاحظاتك.",
    "ريحة العربية وحشة": "نعتذر عن الإزعاج، يمكنك ترك ملاحظاتك في التطبيق.",
    "العربية متهالكة": "نأسف لسماع ذلك، يُرجى تقييم الرحلة وإرسال ملاحظاتك.",
    "العربية غير مطابقة للوصف": "نعتذر عن ذلك. يُرجى تزويدنا برقم الرحلة لنتمكن من المساعدة.",

    # إلغاء الرحلة
    "How do I cancel my ride?": "Please visit the app to cancel or request a refund.",
    "Can I cancel my ride without fees?": "Cancellation fees may apply. Please check the app for details.",
    "كيف ألغي الرحلة؟": "يرجى زيارة التطبيق لإلغاء الرحلة أو طلب استرداد الأموال.",
    "ينفع ألغي الرحلة ببلاش؟": "قد يتم تطبيق رسوم الإلغاء، يرجى مراجعة التطبيق لمعرفة التفاصيل.",
    "عاوز ألغي المشوار": "تقدر تلغي من التطبيق، بس ممكن يكون فيه رسوم إلغاء.",
    "السواق مش بيرد وعاوز ألغي الرحلة": "نأسف لذلك. يُرجى محاولة التواصل معه عبر التطبيق، أو إلغاء الرحلة مباشرة.",

    # سوء تصرف السائق
    "The driver was rude": "We apologize for the inconvenience. Please report the issue in the app.",
    "The driver was reckless": "Safety is our top priority. Please report this issue in the app.",
    "The driver used foul language": "We are sorry for your experience. Please report the issue in the app.",
    "السائق كان سيئًا": "نعتذر عن الإزعاج. يرجى الإبلاغ عن المشكلة في التطبيق.",
    "السواق كان بيسوق بسرعة": "سلامتك تهمنا، يُرجى الإبلاغ عن المشكلة في التطبيق.",
    "السواق قليل الأدب": "نأسف لذلك، يمكنك تقديم شكوى عبر التطبيق.",
    "السواق بيتكلم بطريقة غير محترمة": "نأسف لسماع ذلك. يُرجى تزويدنا برقم الرحلة لنتمكن من متابعة الشكوى.",

    # الدفع والاسترداد
    "I was overcharged": "We’re sorry for the issue. Please review your fare in the app and request a refund if necessary.",
    "My promo code didn’t work": "Please ensure your promo code is valid and meets the conditions.",
    "I want a refund": "Please visit the app to request a refund for your trip.",
    "الرحلة غالية أوي": "يمكنك مراجعة تفاصيل الأجرة في التطبيق.",
    "الكود الخصم ماشتغلش": "تأكد من صلاحية الكود والشروط الخاصة به.",
    "عاوز فلوسي ترجع": "يمكنك طلب استرداد الأموال من خلال التطبيق.",
    "تم خصم مبلغ زائد من حسابي": "نأسف لذلك. يُرجى تزويدنا برقم الرحلة لنتمكن من المساعدة.",

    # أمان وراحة الركاب
    "I forgot something in the car": "Please visit the app to report your lost item and contact the driver.",
    "The driver took a wrong route": "We apologize for any inconvenience. Please report this issue in the app.",
    "I don’t feel safe": "Your safety is our top priority. Please report any concerns in the app.",
    "نسيت حاجة في العربية": "يمكنك الإبلاغ عن المفقودات من خلال التطبيق.",
    "السواق مشي من طريق غلط": "لو في مشكلة، ياريت تبلغ عنها في التطبيق.",
    "حاسس بعدم الأمان": "سلامتك أهم حاجة، لو في أي مشكلة، بلّغ في التطبيق فورًا.",
    "السواق قفل التكييف": "نأسف لذلك. يُرجى إبلاغنا برقم الرحلة إذا كنت بحاجة إلى المتابعة.",

    # تجربة الركوب بشكل عام
    "The ride was uncomfortable": "We’re sorry for your experience. Please rate your ride and provide feedback.",
    "The driver was very nice!": "We’re glad you had a great experience! Feel free to rate your ride.",
    "The trip was too long": "Traffic conditions may impact trip duration. We apologize for any inconvenience.",
    "الرحلة كانت وحشة": "نأسف لسماع ذلك، يُرجى تقييم الرحلة وإبداء رأيك.",
    "السواق كان محترم جدًا!": "سعداء بتجربتك الجيدة! يمكنك تقييم الرحلة في التطبيق.",
    "المشوار كان طويل قوي": "زحمة الطريق ممكن تأثر على مدة الرحلة، نعتذر عن أي تأخير.",
    "السائق لم يكن مهذبًا": "نأسف لسماع ذلك. يُرجى تزويدنا برقم الرحلة لنتمكن من المتابعة.",

    # مشاكل تقنية
    "The app is not working": "We apologize for the issue. Please try restarting the app or updating it.",
    "I can't book a ride": "Please ensure your internet connection is stable and try again.",
    "التطبيق مش شغال": "نأسف لذلك. يُرجى إعادة تشغيل التطبيق أو تحديثه.",
    "مش عارف أحجز مشوار": "تأكد من أن الإنترنت شغال وحاول تاني.",
    "في مشكلة في التطبيق": "نأسف على الإزعاج. يُرجى تجربة إعادة تشغيل التطبيق.",

    # حالات خاصة
    "The driver is not moving": "We apologize for the issue. If your driver is unresponsive, consider canceling and rebooking.",
    "My driver took a detour": "We apologize for any inconvenience. Please check the route in the app and report if necessary.",
    "السواق واقف في مكانه ومش بيتحرك": "نأسف لذلك. يُرجى محاولة التواصل معه أو إلغاء الرحلة.",
    "السواق لف طريق غريب": "تقدر تتابع الخريطة من التطبيق، ولو في مشكلة أبلغنا.",
    "السواق غير السيارة المطلوبة": "نأسف لهذا الخطأ. يُرجى تزويدنا برقم الرحلة لمساعدتك.",
}



# Pydantic model for request body
class UserInput(BaseModel):
    message: str

# Function to generate text using Gemini API
def generate_text(prompt):
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"API Error: {e}")
        return "Sorry, I can't help you with that."

# Chatbot endpoint
@app.post("/chat")
async def chat(user_input: UserInput):
    user_message = user_input.message

    # Exit condition
    if user_message.lower() == "exit":
        return {"response": "Goodbye! Take care."}

    # Check if the input matches a predefined question
    if user_message in predefined_responses:
        response = predefined_responses[user_message]
    else:
        # Use Gemini API for general questions
        prompt = f"""You are a helpful assistant for a Capital taxi app. Respond to the following query in a way that relates to the taxi app. The support phone number is +201271267549.and if ask him to mention ride trip, If the query is not directly related to the app, try to connect it to the app's context (e.g., payments, lost items, rides, etc.).
        Query: {user_message}"""
        response = generate_text(prompt)

    return {"response": response}

# Run the FastAPI app
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
