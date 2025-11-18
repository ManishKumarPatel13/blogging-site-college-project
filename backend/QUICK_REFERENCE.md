# Quick Reference Guide

A quick reference for developers working with the Blogging App Backend API.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Start development server
npm run dev
```

---

## 📋 Environment Variables (Required)

```env
PORT=5000
NODE_ENV=development
MONGO_URL=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
```

---

## 🔑 API Endpoints Quick Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/google` | No | Google OAuth |
| GET | `/api/auth/user` | Yes | Get current user |
| PUT | `/api/auth/profile` | Yes | Update profile |
| PUT | `/api/auth/password` | Yes | Change password |

### Blogs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/blogs` | No | Get all blogs |
| GET | `/api/blogs/recent` | No | Get recent blogs |
| GET | `/api/blogs/:id` | No | Get single blog |
| POST | `/api/blogs` | Yes | Create blog |
| PUT | `/api/blogs/:id` | Yes | Update blog |
| DELETE | `/api/blogs/:id` | Yes | Delete blog |
| GET | `/api/blogs/user/:userId` | No | Get user's blogs |
| GET | `/api/blogs/my/posts` | Yes | Get my blogs |

---

## 📝 Common Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "dob": "1995-01-01",
    "gender": "male"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Blog (with token)
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My blog post content",
    "template": "modern",
    "font": "Arial"
  }'
```

### Get All Blogs
```bash
curl http://localhost:5000/api/blogs?page=1&limit=10
```

---

## 🔒 Authentication Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Server Error |

---

## 🗂️ Data Models

### User Model
```javascript
{
  name: String,          // Required, 2-100 chars
  email: String,         // Required, unique
  password: String,      // Hashed
  dob: Date,            // Required, 13+ years
  gender: String,       // male/female/other
  nickname: String,     // Optional, max 50 chars
  googleId: String,     // For OAuth users
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Model
```javascript
{
  author: ObjectId,     // Reference to User
  content: String,      // Required, max 50,000 chars
  media: [String],      // Array of URLs
  template: String,     // Default: 'default'
  font: String,         // Default: 'Arial'
  language: String,     // Default: 'en'
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🛠️ Validation Rules

### Registration
- Name: 2-100 characters
- Email: Valid email format
- Password: Minimum 6 characters
- DOB: User must be 13+ years old
- Gender: male, female, or other

### Blog Post
- Content: 1-50,000 characters
- Media: Valid HTTP/HTTPS URLs
- Language: Format like 'en' or 'en-US'

---

## 🐛 Common Error Codes

| Error Code | Description |
|------------|-------------|
| `MISSING_TOKEN` | No auth token provided |
| `INVALID_TOKEN` | Token is invalid |
| `TOKEN_EXPIRED` | Token has expired |
| `USER_NOT_FOUND` | User doesn't exist |
| `INVALID_CREDENTIALS` | Wrong email/password |
| `GOOGLE_AUTH_FAILED` | Google OAuth failed |

---

## 📦 NPM Scripts

```bash
npm start      # Start production server
npm run dev    # Start development server with auto-reload
npm test       # Run tests (not implemented yet)
```

---

## 🔍 Debugging Tips

### Check MongoDB Connection
```bash
# In MongoDB shell
show dbs
use blogging-app
show collections
db.users.find()
db.blogs.find()
```

### Test Server Health
```bash
curl http://localhost:5000
```

### View API Documentation
```bash
curl http://localhost:5000/api
```

---

## 📁 File Locations

| Feature | File Path |
|---------|-----------|
| Main Server | `server.js` |
| Auth Routes | `routes/auth.js` |
| Blog Routes | `routes/blogs.js` |
| User Model | `models/User.js` |
| Blog Model | `models/Blog.js` |
| JWT Middleware | `middleware/auth.js` |
| DB Config | `config/db.js` |
| Passport Config | `config/passport.js` |

---

## 🎯 Testing Checklist

- [ ] MongoDB running and connected
- [ ] .env file configured
- [ ] JWT_SECRET set
- [ ] Google OAuth credentials (optional)
- [ ] Server starts without errors
- [ ] Can register new user
- [ ] Can login user
- [ ] Can create blog post
- [ ] Can read blog posts
- [ ] Can update own blog
- [ ] Can delete own blog

---

## 💡 Quick Tips

1. **Token Storage**: Store JWT token in localStorage or secure HTTP-only cookie
2. **Token Refresh**: Implement token refresh before implementing long sessions
3. **CORS**: Update FRONTEND_URL in .env for production
4. **MongoDB Atlas**: Use MongoDB Atlas for free cloud database
5. **Error Handling**: Always check response status before parsing JSON
6. **Pagination**: Use `page` and `limit` params for large datasets
7. **Google OAuth**: Requires HTTPS in production

---

## 🔗 Useful Links

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Google Cloud Console](https://console.cloud.google.com/)
- [JWT.io](https://jwt.io/) - Decode JWT tokens
- [Postman](https://www.postman.com/) - API testing tool

---

## 📞 Need Help?

1. Check `README.md` for detailed documentation
2. Check `API_TESTING.md` for request examples
3. Check `IMPLEMENTATION_SUMMARY.md` for feature details
4. Create an issue on GitHub

---

**Last Updated**: November 18, 2025
**Version**: 1.0.0
