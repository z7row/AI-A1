<div align="center">
  <img src="frontend/public/logo.png" alt="AI-A1 Logo" width="120" />
  <h1>🚀 AI-A1: The Ultimate Bridge Between AI and Your Terminal</h1>
  <p><b>Turn AI-generated text into real, executable actions on your machine.</b></p>
  
  <h3>
    <a href="#english-docs">🇬🇧 English Docs</a> | 
    <a href="#arabic-docs">🇪🇬 الشرح بالعربي</a>
  </h3>
</div>

---

<div id="english-docs"></div>

## 🇬🇧 English Documentation

**AI-A1** is not just another AI wrapper. It's a paradigm shift in how you interact with Large Language Models (LLMs). Instead of manually copying code and commands from an AI chat, AI-A1 acts as an intelligent bridge that parses the AI's response and executes it securely on your local machine.

### 🧠 The Chrome Extension (The Secret Weapon)
The real magic happens in the Chrome Extension. It's not just a button; it's a two-way communication bridge between your browser and your local environment.
- **Two-Way Feedback Loop:** When the AI gives you a response, the extension can "Jump & Paste" it directly into your local workspace. Once the task finishes (even if it fails), the extension grabs the terminal output and automatically sends it back to the AI chat. This creates a fully autonomous loop where the AI fixes its own mistakes.
- **Advanced Clipboard Interception:** Modern AI sites (like ChatGPT and DeepSeek) use complex React frameworks that ignore standard text insertion. Our extension bypasses this by intercepting the clipboard API, using synthetic paste events, and forcing the React state to update. It guarantees your text lands in the input box.
- **Smart Picker:** Don't want to rely on default selectors? Use the "Pick" feature to click exactly on the copy button on any website. The extension's advanced algorithm generates a robust CSS selector for it.
- **Always at Bottom:** The extension keeps your AI chat pinned to the bottom, resuming 5 seconds after you stop scrolling.
- **Dynamic Grayscale Icon:** The extension icon uses `OffscreenCanvas` to render itself dynamically. It stays grayscale when disabled, lights up when active, and shows a pulsing state when a task is running.

### 🛡️ Enterprise-Grade Safety (The Workspace)
- **Dangerous Pattern Scanner:** Automatically scans commands for destructive patterns (like `rm -rf /` or `mkfs`). It halts execution and asks for your explicit permission.
- **Sensitive File Guard:** The AI might ask to read your `.env` file. AI-A1 detects this, separates the sensitive commands, runs the safe ones, and prompts you with a warning before touching any credentials.
- **Selection Mode:** You have the final say. Open the "Details" modal and uncheck any command, file, or edit you don't want to execute.

### 🎨 Premium UI/UX
- **Split-Screen Workspace:** Review the AI's notes and file changes on the right while watching the live terminal output on the left.
- **Dynamic Favicon:** The browser tab icon changes colors based on the task status (Pulsing Gray for Running, Red for Failed, Gray for Stopped, Green for Success).
- **Keyboard Shortcuts:** Hit `Ctrl+Enter` to Run, `Esc` to Cancel, and `Ctrl+Shift+X` to Clear.

### 🛠️ Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, Radix UI (Shadcn).
- **Backend:** Python, FastAPI, Uvicorn, Asyncio, PTY (Pseudo-terminal), WebSockets.
- **Extension:** Chrome Extension Manifest V3, Vanilla JS, Chrome APIs.

### 📜 Credits & Attribution
- The `DESIGN.md` specification and format are based on **Google Labs' open-source `DESIGN.md`** project, licensed under the **Apache License 2.0**. Public attribution is required for using the spec.
- Some design inspiration and examples may reference or be inspired by the **`VoltAgent/awesome-design-md`** collection, which is licensed under the **MIT License**. We acknowledge their contribution to the design community.
- Trademarks, logos, and brand identities mentioned in any design examples belong to their respective owners and are not granted by these open-source licenses.

---

<div id="arabic-docs"></div>

## 🇪🇬 الشرح بالعربي (Arabic Documentation)

**AI-A1** مش مجرد أداة عادية، دي نقلة نوعية في طريقة تعاملك مع الذكاء الاصطناعي. بدل ما تنسخ الأكواد والأوامر بإيدك من شات الذكاء الاصطناعي، AI-A1 بيعمل "جسر ذكي" بيقرا رد الذكاء الاصطناعي وينفذه على جهازك بأمان.

### 🧠 إضافة كروم (السلاح السري)
السحر الحقيقي بيحصل في الإكستنشن. هو مش مجرد زرار، هو جسر تواصل ثنائي الاتجاه بين متصفحك وجهازك.
- **حلقة التغذية الراجعة التلقائية:** لما الذكاء الاصطناعي يرد، الإكستنشن بياخد الرد ويلصقه في موقعك المحلي بضغطة واحدة (Jump & Paste). ولما المهمة تخلص (حتى لو فشلت)، الإكستنشن بيسحب الـ Output من الترمنال ويبعته للذكاء الاصطناعي تلقائياً عشان يصلح غلطه. ده بيخليك تشتغل في وضع "Autopilot".
- **اعتراض الحافظة المتقدم (Clipboard):** المواقع الحديثة زي ChatGPT و DeepSeek بتستخدم React وبترفض النص العادي. إكستنشن AI-A1 بيكسر الحاجز ده عن طريق اعتراض الـ Clipboard واستخدام أحداث لصق وهمية (Synthetic Paste) عشان يضمن إن النص دخل في المكان الصح.
- **الالتقاط الذكي (Smart Picker):** لو مش عايز تعتمد على الاختيارات الافتراضية، ممكن تستخدم زرار Pick وتدوس على زرار النسخ في أي موقع، الإكستنشن هيجيب الـ Selector بتاعه ويحفظه.
- **التمرير التلقائي (Always at Bottom):** الإكستنشن بيثبت الشات تحت، وبيرجع يثبته تلقائياً بعد 5 ثواني من وقوفك عن التمرير.
- **أيقونة ديناميكية:** أيقونة الإكستنشن بتتغير. بتبقى رمادية لو الإكستنشن مقفول، بتتلون لو شغال، وبتعمل أنيميشن (نبض) لو فيه مهمة بتتنفذ.

### 🛡️ حماية بمستوى المؤسسات (الواجهة)
- **فاحص الأوامر الخطيرة:** بيمسك الأوامر التدميرية زي `rm -rf /` وبيمنعها إلا لو إنت وافقت.
- **حماية الملفات الحساسة:** لو الذكاء الاصطناعي طلب يقرا ملف `.env` أو مفاتيح سرية، الأداة بتفصل الأمر ده عن باقي الأوامر، بتنفذ الآمن وتطلعلك تحذير عشان تقرر.
- **وضع الاختيار (Selection Mode):** الكلمة الأخيرة ليك. افتح تاب الـ Details واقدر تشيل علامة الصح من أي أمر أو ملف مش عايزه يتنفذ.

### 🎨 واجهة مستخدم احترافية
- **شاشة مقسمة:** بتشوف الملاحظات والملفات على اليمين، والترمنال شغال لايف على الشمال.
- **أيقونة الموقع (Favicon):** أيقونة التاب في المتصفح بتتغير (رمادية بتنبض أثناء التشغيل، حمراء للفشل، رمادية للتوقف، خضراء للنجاح).
- **اختصارات الكيبورد:** دوس `Ctrl+Enter` عشان تشغل، `Esc` عشان تلغي، و `Ctrl+Shift+X` عشان تمسح.

### 🛠️ التقنيات المستخدمة (Tech Stack)
- **الواجهة (Frontend):** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, Radix UI (Shadcn).
- **الباك إند (Backend):** Python, FastAPI, Uvicorn, Asyncio, PTY (Pseudo-terminal), WebSockets.
- **الإكستنشن (Extension):** Chrome Extension Manifest V3, Vanilla JS, Chrome APIs.

### 📜 الشكر والإسناد (Credits & Attribution)
- مواصفة `DESIGN.md` وتنسيقها مبنيان على مشروع **Google Labs مفتوح المصدر `DESIGN.md`**، والمرخص بموجب **Apache License 2.0**. يتطلب الاستخدام إسناداً عاماً.
- بعض الإلهام التصميمي والأمثلة قد تشير إلى أو تستلهم من مجموعة **`VoltAgent/awesome-design-md`**، والمرخصة بموجب **MIT License**. نحن نعترف بمساهمتهم في مجتمع التصميم.
- العلامات التجارية والشعارات والهويات التجارية المذكورة في أي أمثلة تصميمية هي ملك لأصحابها، ولا تمنحها هذه التراخيص مفتوحة المصدر.

---

## 🚀 Getting Started / طريقة التشغيل

### 1. Clone the repository
```bash
git clone https://github.com/z7row/ai-a1.git
cd ai-a1
```

### 2. Setup the Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*(The backend runs on `http://localhost:2030`)*

### 3. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```
*(The frontend runs on `http://localhost:2000`)*

### 4. Install the Extension
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `chrome-extension` folder.
4. Enable the extension and start chatting with your AI!

---
<div align="center">
  <b>Built with ❤️ by Z7row</b>
  <br/>
  <i>Stop typing. Start executing.</i>
</div>
