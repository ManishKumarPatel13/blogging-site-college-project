# AI Features API Testing - Demo Payloads

## 🔐 Prerequisites

First, get a JWT token by logging in:

```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the token** and use it in all requests below:
```bash
export TOKEN="your_jwt_token_here"
```

---

## 📝 Demo Blog Content (Use in tests)

```text
React has revolutionized the way we build user interfaces. Since its release by Facebook in 2013, it has become one of the most popular JavaScript libraries in the world. React's component-based architecture allows developers to build reusable UI components, making code more maintainable and easier to test.

One of React's key features is the Virtual DOM, which provides a more efficient way of updating the user interface. Instead of manipulating the browser's DOM directly, React creates a virtual representation of the DOM in memory. When state changes occur, React calculates the minimal set of changes needed and applies them to the real DOM.

Hooks, introduced in React 16.8, have transformed how we write React components. They allow us to use state and other React features without writing class components. The most commonly used hooks are useState for managing local state and useEffect for handling side effects like data fetching.

For state management in larger applications, developers often turn to libraries like Redux or the Context API. These tools help manage global state that needs to be shared across many components. Recently, newer solutions like Zustand and Jotai have gained popularity for their simpler APIs.

Whether you're building a small personal project or a large enterprise application, React provides the tools and ecosystem to get the job done efficiently. Its vast community and extensive documentation make it an excellent choice for both beginners and experienced developers.
```

---

## 🏷️ 1. Auto-Tag Content

### Request
```bash
curl -X POST http://localhost:5000/api/ai/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "React has revolutionized the way we build user interfaces. Since its release by Facebook in 2013, it has become one of the most popular JavaScript libraries in the world. React component-based architecture allows developers to build reusable UI components, making code more maintainable and easier to test. One of React key features is the Virtual DOM, which provides a more efficient way of updating the user interface. Hooks introduced in React 16.8 have transformed how we write React components. They allow us to use state and other React features without writing class components.",
    "maxTags": 5
  }'
```

### Expected Response
```json
{
  "success": true,
  "tags": ["react", "javascript", "frontend", "web development", "ui components"],
  "count": 5
}
```

---

## 📄 2. Generate Summary

### Short Summary
```bash
curl -X POST http://localhost:5000/api/ai/summary \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "React has revolutionized the way we build user interfaces. Since its release by Facebook in 2013, it has become one of the most popular JavaScript libraries in the world. React component-based architecture allows developers to build reusable UI components, making code more maintainable and easier to test. One of React key features is the Virtual DOM, which provides a more efficient way of updating the user interface.",
    "length": "short"
  }'
```

### Medium Summary
```bash
curl -X POST http://localhost:5000/api/ai/summary \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "React has revolutionized the way we build user interfaces. Since its release by Facebook in 2013, it has become one of the most popular JavaScript libraries in the world. React component-based architecture allows developers to build reusable UI components, making code more maintainable and easier to test. One of React key features is the Virtual DOM, which provides a more efficient way of updating the user interface. Hooks introduced in React 16.8 have transformed how we write React components.",
    "length": "medium"
  }'
```

### Expected Response
```json
{
  "success": true,
  "summary": "This article explores React, a popular JavaScript library for building user interfaces, highlighting its component-based architecture, Virtual DOM, and Hooks features.",
  "length": "short"
}
```

---

## 🎯 3. Generate Title Suggestions

### Request
```bash
curl -X POST http://localhost:5000/api/ai/titles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "React has revolutionized the way we build user interfaces. Since its release by Facebook in 2013, it has become one of the most popular JavaScript libraries in the world. React component-based architecture allows developers to build reusable UI components. One of React key features is the Virtual DOM. Hooks introduced in React 16.8 have transformed how we write React components.",
    "count": 5
  }'
```

### Expected Response
```json
{
  "success": true,
  "titles": [
    "The Complete Guide to React: From Basics to Advanced",
    "Why React Dominates Modern Web Development",
    "React in 2024: Everything You Need to Know",
    "Mastering React: Components, Hooks, and Beyond",
    "Building Better UIs with React's Virtual DOM"
  ],
  "count": 5
}
```

---

## ✍️ 4. Expand Text

### Casual Tone
```bash
curl -X POST http://localhost:5000/api/ai/expand \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "React is great for building websites.",
    "tone": "casual"
  }'
```

### Professional Tone
```bash
curl -X POST http://localhost:5000/api/ai/expand \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Machine learning is changing how we process data.",
    "tone": "professional"
  }'
```

### Academic Tone
```bash
curl -X POST http://localhost:5000/api/ai/expand \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Climate change affects global ecosystems.",
    "tone": "academic"
  }'
```

### Expected Response
```json
{
  "success": true,
  "expanded": "React is absolutely fantastic for building websites! It makes creating interactive user interfaces a breeze. With its component-based architecture, you can break down your UI into small, reusable pieces that are easy to manage and test. Plus, the Virtual DOM ensures your apps run super smoothly. Whether you're building a simple landing page or a complex web application, React has got you covered!",
  "originalLength": 38,
  "expandedLength": 423
}
```

---

## 🔧 5. Improve Text

### Grammar & Style Fix
```bash
curl -X POST http://localhost:5000/api/ai/improve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Their going to the store tommorow. Me and him was talking about the project yesterday and we decides to change the approch. The datas shows that users prefers simple interfaces."
  }'
```

### Awkward Phrasing Fix
```bash
curl -X POST http://localhost:5000/api/ai/improve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The thing is is that we need to make sure that the users can easily be able to navigate through the website in a way that is intuitive and not confusing at all."
  }'
```

### Expected Response
```json
{
  "success": true,
  "improved": "They're going to the store tomorrow. He and I were talking about the project yesterday, and we decided to change the approach. The data shows that users prefer simple interfaces.",
  "changes": [
    "Fixed 'Their' to 'They're'",
    "Fixed 'tommorow' to 'tomorrow'",
    "Fixed 'Me and him' to 'He and I'",
    "Fixed 'was' to 'were'",
    "Fixed 'decides' to 'decided'",
    "Fixed 'approch' to 'approach'",
    "Fixed 'datas' to 'data'",
    "Fixed 'prefers' to 'prefer'"
  ]
}
```

---

## 🎭 6. Change Tone

### Casual → Professional
```bash
curl -X POST http://localhost:5000/api/ai/tone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hey! This new feature is super cool and totally awesome! Users are gonna love it so much!",
    "targetTone": "professional"
  }'
```

### Professional → Friendly
```bash
curl -X POST http://localhost:5000/api/ai/tone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "We are pleased to inform you that your application has been approved. Please proceed with the next steps as outlined in the documentation.",
    "targetTone": "friendly"
  }'
```

### Casual → Academic
```bash
curl -X POST http://localhost:5000/api/ai/tone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Social media is messing with how teens see themselves. Like, they just scroll through perfect pics all day and feel bad about themselves.",
    "targetTone": "academic"
  }'
```

### Formal → Casual
```bash
curl -X POST http://localhost:5000/api/ai/tone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "It is imperative that all personnel adhere to the established protocols regarding cybersecurity measures to ensure the protection of sensitive organizational data.",
    "targetTone": "casual"
  }'
```

### Expected Response
```json
{
  "success": true,
  "rewritten": "We are excited to announce a new feature that delivers significant value to our users. Initial feedback indicates strong user satisfaction with the enhancement.",
  "targetTone": "professional"
}
```

---

## ➡️ 7. Continue Writing

### Continue a Story
```bash
curl -X POST http://localhost:5000/api/ai/continue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The old lighthouse stood at the edge of the cliff, its light no longer guiding ships to safety. For decades it had been abandoned, but tonight, someone had lit a candle in the top window.",
    "sentences": 3
  }'
```

### Continue a Technical Explanation
```bash
curl -X POST http://localhost:5000/api/ai/continue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Docker containers have revolutionized the way we deploy applications. By packaging an application with all its dependencies, Docker ensures consistency across different environments.",
    "sentences": 4
  }'
```

### Continue a Blog Introduction
```bash
curl -X POST http://localhost:5000/api/ai/continue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "In today is fast-paced world, productivity has become more important than ever. With endless distractions competing for our attention, finding effective ways to stay focused is crucial.",
    "sentences": 3
  }'
```

### Expected Response
```json
{
  "success": true,
  "continuation": "The villagers had noticed it too, and whispers of the mysterious light spread through the town. Some said it was the ghost of the old keeper, returning to his post after all these years. Others believed it was a signal, though no one knew to whom or for what purpose.",
  "sentences": 3
}
```

---

## ✅ 8. Grammar Check

### Common Mistakes
```bash
curl -X POST http://localhost:5000/api/ai/grammar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Their going to the libary tommorow. Me and him was suppose to study together but we didnt have time. The informations was not very helpfull."
  }'
```

### Mixed Errors
```bash
curl -X POST http://localhost:5000/api/ai/grammar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Its important to note that the companys profits have been declining. Alot of employees dont understand why there being laid off."
  }'
```

### Punctuation Issues
```bash
curl -X POST http://localhost:5000/api/ai/grammar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "However we decided to proceed, The meeting was scheduled for Monday but it was cancelled, John said that he would be late."
  }'
```

### Expected Response
```json
{
  "success": true,
  "corrected": "They're going to the library tomorrow. He and I were supposed to study together, but we didn't have time. The information was not very helpful.",
  "errors": [
    {"original": "Their", "correction": "They're", "type": "grammar"},
    {"original": "libary", "correction": "library", "type": "spelling"},
    {"original": "tommorow", "correction": "tomorrow", "type": "spelling"},
    {"original": "Me and him", "correction": "He and I", "type": "grammar"},
    {"original": "was suppose", "correction": "were supposed", "type": "grammar"},
    {"original": "didnt", "correction": "didn't", "type": "punctuation"},
    {"original": "informations", "correction": "information", "type": "grammar"},
    {"original": "helpfull", "correction": "helpful", "type": "spelling"}
  ],
  "errorCount": 8
}
```

---

## 🗂️ 9. Classify Category

### Technology Content
```bash
curl -X POST http://localhost:5000/api/ai/category \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Learn how to build a REST API with Node.js and Express. We will cover routing, middleware, error handling, and connecting to a PostgreSQL database using Sequelize ORM."
  }'
```

### Health Content
```bash
curl -X POST http://localhost:5000/api/ai/category \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Maintaining a balanced diet is essential for good health. Eating plenty of fruits, vegetables, whole grains, and lean proteins provides your body with the nutrients it needs. Regular exercise and adequate sleep are equally important for overall wellness."
  }'
```

### Finance Content
```bash
curl -X POST http://localhost:5000/api/ai/category \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Investing in index funds is a popular strategy for building long-term wealth. These funds track market indices like the S&P 500, providing diversification at low cost. Many financial advisors recommend allocating a portion of your portfolio to index funds."
  }'
```

### Travel Content
```bash
curl -X POST http://localhost:5000/api/ai/category \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Tokyo is a city of contrasts, where ancient temples stand alongside modern skyscrapers. From the bustling streets of Shibuya to the serene gardens of the Imperial Palace, there is something for every traveler. Do not miss trying authentic ramen in the small shops of Shinjuku."
  }'
```

### Expected Response
```json
{
  "success": true,
  "category": "Web Development"
}
```

**Possible Categories:**
- Technology, Programming, Web Development, Mobile Development
- Data Science, AI/Machine Learning, DevOps, Cybersecurity
- Business, Marketing, Design, Lifestyle, Travel, Food
- Health, Education, Finance, Entertainment, Sports, Other

---

## 🔬 10. Full Analysis (All-in-One)

### Complete Blog Analysis
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "React has revolutionized the way we build user interfaces. Since its release by Facebook in 2013, it has become one of the most popular JavaScript libraries in the world. React component-based architecture allows developers to build reusable UI components, making code more maintainable and easier to test. One of React key features is the Virtual DOM, which provides a more efficient way of updating the user interface. Instead of manipulating the browser DOM directly, React creates a virtual representation of the DOM in memory. When state changes occur, React calculates the minimal set of changes needed and applies them to the real DOM. Hooks, introduced in React 16.8, have transformed how we write React components. They allow us to use state and other React features without writing class components. The most commonly used hooks are useState for managing local state and useEffect for handling side effects like data fetching."
  }'
```

### Expected Response
```json
{
  "success": true,
  "analysis": {
    "tags": ["react", "javascript", "virtual dom", "hooks", "frontend"],
    "summary": "This article provides an overview of React, covering its component-based architecture, Virtual DOM, and the introduction of Hooks in version 16.8.",
    "category": "Web Development",
    "titles": [
      "The Essential Guide to React: Components, Virtual DOM, and Hooks",
      "Why React Dominates Frontend Development in 2024",
      "From Components to Hooks: Understanding Modern React"
    ]
  }
}
```

---

## 📊 11. Check AI Status

### Request
```bash
curl http://localhost:5000/api/ai/status \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response
```json
{
  "success": true,
  "available": true,
  "models": ["FAST", "BALANCED", "MIXTRAL"],
  "features": [
    "tags",
    "summary",
    "titles",
    "expand",
    "improve",
    "tone",
    "continue",
    "grammar",
    "category",
    "analyze"
  ]
}
```

---

## 📝 12. Create Blog with Auto-Tagging

### With Auto-Tagging (default)
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Getting started with Python is easier than you might think. Python is known for its clean syntax and readability, making it an excellent choice for beginners. In this tutorial, we will cover the basics of Python programming, including variables, data types, loops, and functions. By the end of this guide, you will have a solid foundation to start building your own Python projects. Whether you are interested in web development, data science, or automation, Python has you covered.",
    "title": "Python for Beginners: A Complete Guide",
    "template": "default",
    "font": "Arial",
    "language": "en"
  }'
```

### Without Auto-Tagging
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a quick post about my day. I went to the coffee shop and worked on some code. Nothing too fancy, just wanted to share!",
    "autoTag": false,
    "tags": ["personal", "daily"]
  }'
```

### With Custom Tags (overrides AI)
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Today we released version 2.0 of our application. This major update includes a complete UI redesign, improved performance, and several new features that our users have been requesting.",
    "tags": ["release", "v2.0", "announcement", "product"],
    "title": "Announcing Version 2.0"
  }'
```

### Expected Response (with Auto-Tagging)
```json
{
  "message": "Blog post created successfully",
  "blog": {
    "id": "uuid-here",
    "content": "Getting started with Python...",
    "title": "Python for Beginners: A Complete Guide",
    "tags": ["python", "programming", "tutorial", "beginners", "coding"],
    "summary": "A beginner-friendly introduction to Python programming covering variables, data types, loops, and functions.",
    "category": "Programming",
    "aiGenerated": true,
    "author": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2025-11-25T10:00:00.000Z"
  }
}
```

---

## 🧪 Quick Test Script

Save this as `test-ai.sh` and run:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:5000"
TOKEN="YOUR_JWT_TOKEN_HERE"

echo "🧪 Testing AI Features..."
echo ""

# Test 1: AI Status
echo "1️⃣ Checking AI Status..."
curl -s "$BASE_URL/api/ai/status" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 2: Generate Tags
echo "2️⃣ Testing Tag Generation..."
curl -s -X POST "$BASE_URL/api/ai/tags" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "React and Node.js are popular technologies for building modern web applications.", "maxTags": 3}' | jq .
echo ""

# Test 3: Grammar Check
echo "3️⃣ Testing Grammar Check..."
curl -s -X POST "$BASE_URL/api/ai/grammar" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Their going to the store tommorow."}' | jq .
echo ""

# Test 4: Full Analysis
echo "4️⃣ Testing Full Analysis..."
curl -s -X POST "$BASE_URL/api/ai/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Machine learning is transforming how we interact with technology. From voice assistants to recommendation systems, AI is everywhere. Python and TensorFlow are popular tools for building ML models."}' | jq .

echo ""
echo "✅ All tests completed!"
```

Run with:
```bash
chmod +x test-ai.sh
./test-ai.sh
```

---

## 🐛 Error Response Examples

### Missing Content
```json
{
  "success": false,
  "message": "Content is required for tag generation"
}
```

### Content Too Short
```json
{
  "success": false,
  "message": "Content must be at least 50 characters for accurate tagging"
}
```

### AI Service Not Configured
```json
{
  "success": false,
  "message": "AI service is not configured. Please add GROQ_API_KEY to environment variables."
}
```

### Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

---

## 📱 Frontend Integration Example (JavaScript)

```javascript
// AI Service Helper
const aiService = {
  baseUrl: 'http://localhost:5000/api/ai',
  token: localStorage.getItem('token'),

  async generateTags(content) {
    const res = await fetch(`${this.baseUrl}/tags`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, maxTags: 5 })
    });
    return res.json();
  },

  async improveText(text) {
    const res = await fetch(`${this.baseUrl}/improve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  async fullAnalysis(content) {
    const res = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    return res.json();
  }
};

// Usage
const result = await aiService.generateTags('Your blog content here...');
console.log(result.tags);
```

---

Happy Testing! 🚀
