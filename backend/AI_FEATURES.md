# AI Features API Guide

## 🆓 Setup (One-Time)

### Get Your Free Groq API Key

1. **Go to**: https://console.groq.com/
2. **Sign up** with Google/GitHub (free)
3. **Create an API key** in the dashboard
4. **Copy the key** (starts with `gsk_`)

### Add to Environment

```bash
# In backend/.env
GROQ_API_KEY=gsk_your_key_here
```

### Add to Render (Production)

In Render dashboard → Environment → Add:
```
GROQ_API_KEY=gsk_your_key_here
```

---

## 🎯 API Endpoints

All endpoints require authentication (Bearer token).

### 1. Auto-Tag Content

**POST** `/api/ai/tags`

```bash
curl -X POST http://localhost:5000/api/ai/tags \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your blog content here...",
    "maxTags": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "tags": ["javascript", "web development", "react", "frontend", "tutorial"],
  "count": 5
}
```

---

### 2. Generate Summary

**POST** `/api/ai/summary`

```bash
curl -X POST http://localhost:5000/api/ai/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your blog content here...",
    "length": "short"
  }'
```

**Options for `length`:** `short`, `medium`, `long`

---

### 3. Generate Title Suggestions

**POST** `/api/ai/titles`

```bash
curl -X POST http://localhost:5000/api/ai/titles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your blog content here...",
    "count": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "titles": [
    "10 Essential Tips for Modern Web Development",
    "The Ultimate Guide to JavaScript in 2024",
    "How to Build Better Web Apps Today"
  ]
}
```

---

### 4. Expand Text (Writing Assistant)

**POST** `/api/ai/expand`

```bash
curl -X POST http://localhost:5000/api/ai/expand \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "React is a popular JavaScript library.",
    "tone": "professional"
  }'
```

**Options for `tone`:** `professional`, `casual`, `academic`

---

### 5. Improve Text

**POST** `/api/ai/improve`

```bash
curl -X POST http://localhost:5000/api/ai/improve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is a text with some error and bad grammer."
  }'
```

**Response:**
```json
{
  "success": true,
  "improved": "This is a text with some errors and bad grammar.",
  "changes": ["Fixed 'error' to 'errors'", "Fixed 'grammer' to 'grammar'"]
}
```

---

### 6. Change Tone

**POST** `/api/ai/tone`

```bash
curl -X POST http://localhost:5000/api/ai/tone \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is super cool and awesome!",
    "targetTone": "professional"
  }'
```

**Options:** `professional`, `casual`, `academic`, `friendly`, `formal`

---

### 7. Continue Writing

**POST** `/api/ai/continue`

```bash
curl -X POST http://localhost:5000/api/ai/continue \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "React was first released in 2013 by Facebook.",
    "sentences": 3
  }'
```

---

### 8. Grammar Check

**POST** `/api/ai/grammar`

```bash
curl -X POST http://localhost:5000/api/ai/grammar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Their going to the store tommorow."
  }'
```

**Response:**
```json
{
  "success": true,
  "corrected": "They're going to the store tomorrow.",
  "errors": [
    {"original": "Their", "correction": "They're", "type": "grammar"},
    {"original": "tommorow", "correction": "tomorrow", "type": "spelling"}
  ],
  "errorCount": 2
}
```

---

### 9. Classify Content Category

**POST** `/api/ai/category`

```bash
curl -X POST http://localhost:5000/api/ai/category \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "How to build a REST API with Node.js and Express..."
  }'
```

**Response:**
```json
{
  "success": true,
  "category": "Web Development"
}
```

---

### 10. Full Analysis (All-in-One)

**POST** `/api/ai/analyze`

```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your full blog content here (min 100 chars)..."
  }'
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "tags": ["javascript", "nodejs", "tutorial"],
    "summary": "This article covers...",
    "category": "Programming",
    "titles": ["3 Ways to Master Node.js", "...]
  }
}
```

---

### 11. Check AI Status

**GET** `/api/ai/status`

```bash
curl http://localhost:5000/api/ai/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Auto-Tagging on Blog Creation

When you create a blog post, AI automatically:
- Generates relevant tags
- Creates a short summary
- Classifies the category

```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your blog content here (100+ characters)...",
    "autoTag": true
  }'
```

Set `"autoTag": false` to disable automatic AI tagging.

---

## 💰 Free Tier Limits (Groq)

| Limit | Value |
|-------|-------|
| Requests/minute | 30 |
| Requests/day | 14,400 |
| Tokens/minute | 6,000 |
| Cost | **$0 (FREE)** |

This is more than enough for a college project! 🎉

---

## 🔧 Troubleshooting

### "AI service not configured"
- Make sure `GROQ_API_KEY` is set in `.env`
- Restart the server after adding the key

### "Rate limit exceeded"
- Wait a few seconds and retry
- Consider caching results for repeated content

### "AI service temporarily unavailable"
- Check your API key is valid
- Check Groq status: https://status.groq.com/

---

## 📁 Files Added/Modified

| File | Purpose |
|------|---------|
| `services/aiService.js` | AI helper functions |
| `routes/ai.js` | AI API endpoints |
| `models/Blog.js` | Added tags, summary, category fields |
| `routes/blogs.js` | Integrated auto-tagging |
| `server.js` | Registered AI routes |

---

**Need help?** Check the Groq documentation: https://console.groq.com/docs
