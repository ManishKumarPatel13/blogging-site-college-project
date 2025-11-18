# API Testing Guide

This guide provides example requests for testing all API endpoints using cURL, Postman, or any HTTP client.

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Blog Endpoints](#blog-endpoints)
- [Testing Workflow](#testing-workflow)

---

## Authentication Endpoints

### 1. Register New User

**Endpoint**: `POST /api/auth/register`

**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securepass123",
    "dob": "1995-06-15",
    "gender": "female",
    "nickname": "janesmith"
  }'
```

**Success Response** (201):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6543210abcdef123456789",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "dob": "1995-06-15T00:00:00.000Z",
    "gender": "female",
    "nickname": "janesmith",
    "createdAt": "2025-11-18T10:30:00.000Z"
  }
}
```

**Error Response** (400 - Validation Failed):
```json
{
  "message": "Validation failed",
  "errors": [
    "Password must be at least 6 characters long"
  ]
}
```

**Error Response** (409 - User Exists):
```json
{
  "message": "User already exists with this email address"
}
```

---

### 2. Login User

**Endpoint**: `POST /api/auth/login`

**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securepass123"
  }'
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6543210abcdef123456789",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "dob": "1995-06-15T00:00:00.000Z",
    "gender": "female",
    "nickname": "janesmith",
    "createdAt": "2025-11-18T10:30:00.000Z"
  }
}
```

**Error Response** (401 - Invalid Credentials):
```json
{
  "message": "Invalid email or password"
}
```

---

### 3. Google OAuth Login

**Endpoint**: `GET /api/auth/google`

**Browser Request**:
```
http://localhost:5000/api/auth/google
```

This will redirect to Google's OAuth consent screen. After authorization, Google redirects to:
```
http://localhost:5000/api/auth/google/callback
```

Then the server redirects to your frontend with the token:
```
http://localhost:3000/auth/success?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 4. Get Current User Profile

**Endpoint**: `GET /api/auth/user`

**Request** (Protected - Requires JWT Token):
```bash
curl -X GET http://localhost:5000/api/auth/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response** (200):
```json
{
  "id": "6543210abcdef123456789",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "dob": "1995-06-15T00:00:00.000Z",
  "gender": "female",
  "nickname": "janesmith",
  "createdAt": "2025-11-18T10:30:00.000Z"
}
```

**Error Response** (401 - No Token):
```json
{
  "message": "No authentication token provided",
  "error": "MISSING_TOKEN"
}
```

---

### 5. Update User Profile

**Endpoint**: `PUT /api/auth/profile`

**Request** (Protected):
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Updated Smith",
    "nickname": "jane_updated"
  }'
```

**Success Response** (200):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "6543210abcdef123456789",
    "name": "Jane Updated Smith",
    "email": "jane@example.com",
    "dob": "1995-06-15T00:00:00.000Z",
    "gender": "female",
    "nickname": "jane_updated",
    "createdAt": "2025-11-18T10:30:00.000Z"
  }
}
```

---

### 6. Change Password

**Endpoint**: `PUT /api/auth/password`

**Request** (Protected):
```bash
curl -X PUT http://localhost:5000/api/auth/password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "securepass123",
    "newPassword": "newsecurepass456"
  }'
```

**Success Response** (200):
```json
{
  "message": "Password updated successfully"
}
```

**Error Response** (401 - Wrong Password):
```json
{
  "message": "Current password is incorrect"
}
```

---

## Blog Endpoints

### 7. Get All Blogs (with Pagination)

**Endpoint**: `GET /api/blogs?page=1&limit=10&sort=latest`

**Request**:
```bash
curl -X GET "http://localhost:5000/api/blogs?page=1&limit=10&sort=latest"
```

**Success Response** (200):
```json
{
  "blogs": [
    {
      "_id": "654abc123def456789012345",
      "content": "This is my first blog post!",
      "media": ["https://example.com/image1.jpg"],
      "template": "modern",
      "font": "Roboto",
      "language": "en",
      "author": {
        "_id": "6543210abcdef123456789",
        "name": "Jane Smith",
        "nickname": "janesmith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-11-18T11:00:00.000Z",
      "updatedAt": "2025-11-18T11:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalBlogs": 42,
    "blogsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 8. Get Recent Blogs

**Endpoint**: `GET /api/blogs/recent?limit=5`

**Request**:
```bash
curl -X GET "http://localhost:5000/api/blogs/recent?limit=5"
```

**Success Response** (200):
```json
{
  "blogs": [
    {
      "_id": "654abc123def456789012345",
      "content": "Latest blog post",
      "author": {
        "name": "Jane Smith",
        "nickname": "janesmith"
      },
      "createdAt": "2025-11-18T11:00:00.000Z"
    }
  ]
}
```

---

### 9. Get Single Blog

**Endpoint**: `GET /api/blogs/:id`

**Request**:
```bash
curl -X GET http://localhost:5000/api/blogs/654abc123def456789012345
```

**Success Response** (200):
```json
{
  "_id": "654abc123def456789012345",
  "content": "This is my first blog post!",
  "media": ["https://example.com/image1.jpg"],
  "template": "modern",
  "font": "Roboto",
  "language": "en",
  "author": {
    "_id": "6543210abcdef123456789",
    "name": "Jane Smith",
    "nickname": "janesmith",
    "email": "jane@example.com",
    "gender": "female"
  },
  "createdAt": "2025-11-18T11:00:00.000Z",
  "updatedAt": "2025-11-18T11:00:00.000Z"
}
```

**Error Response** (404):
```json
{
  "message": "Blog post not found"
}
```

---

### 10. Create Blog Post

**Endpoint**: `POST /api/blogs`

**Request** (Protected):
```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is my awesome blog post about coding!",
    "media": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "template": "modern",
    "font": "Roboto",
    "language": "en"
  }'
```

**Success Response** (201):
```json
{
  "message": "Blog post created successfully",
  "blog": {
    "_id": "654abc123def456789012345",
    "content": "This is my awesome blog post about coding!",
    "media": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "template": "modern",
    "font": "Roboto",
    "language": "en",
    "author": {
      "_id": "6543210abcdef123456789",
      "name": "Jane Smith",
      "nickname": "janesmith",
      "email": "jane@example.com"
    },
    "createdAt": "2025-11-18T12:00:00.000Z",
    "updatedAt": "2025-11-18T12:00:00.000Z"
  }
}
```

**Error Response** (400 - Validation Failed):
```json
{
  "message": "Validation failed",
  "errors": [
    "Blog content cannot be empty"
  ]
}
```

---

### 11. Update Blog Post

**Endpoint**: `PUT /api/blogs/:id`

**Request** (Protected - Must be author):
```bash
curl -X PUT http://localhost:5000/api/blogs/654abc123def456789012345 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated blog content with more information!",
    "template": "classic"
  }'
```

**Success Response** (200):
```json
{
  "message": "Blog post updated successfully",
  "blog": {
    "_id": "654abc123def456789012345",
    "content": "Updated blog content with more information!",
    "media": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "template": "classic",
    "font": "Roboto",
    "language": "en",
    "author": {
      "_id": "6543210abcdef123456789",
      "name": "Jane Smith",
      "nickname": "janesmith",
      "email": "jane@example.com"
    },
    "createdAt": "2025-11-18T12:00:00.000Z",
    "updatedAt": "2025-11-18T13:00:00.000Z"
  }
}
```

**Error Response** (401 - Not Authorized):
```json
{
  "message": "You are not authorized to update this blog post"
}
```

---

### 12. Delete Blog Post

**Endpoint**: `DELETE /api/blogs/:id`

**Request** (Protected - Must be author):
```bash
curl -X DELETE http://localhost:5000/api/blogs/654abc123def456789012345 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response** (200):
```json
{
  "message": "Blog post deleted successfully"
}
```

---

### 13. Get User's Blogs

**Endpoint**: `GET /api/blogs/user/:userId?page=1&limit=10`

**Request**:
```bash
curl -X GET "http://localhost:5000/api/blogs/user/6543210abcdef123456789?page=1&limit=10"
```

**Success Response** (200):
```json
{
  "blogs": [
    {
      "_id": "654abc123def456789012345",
      "content": "User's blog post",
      "author": {
        "_id": "6543210abcdef123456789",
        "name": "Jane Smith",
        "nickname": "janesmith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-11-18T11:00:00.000Z"
    }
  ],
  "author": {
    "_id": "6543210abcdef123456789",
    "name": "Jane Smith",
    "nickname": "janesmith",
    "email": "jane@example.com"
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalBlogs": 25,
    "blogsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 14. Get My Blogs (Authenticated User)

**Endpoint**: `GET /api/blogs/my/posts?page=1&limit=10`

**Request** (Protected):
```bash
curl -X GET "http://localhost:5000/api/blogs/my/posts?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response** (200):
```json
{
  "blogs": [
    {
      "_id": "654abc123def456789012345",
      "content": "My personal blog post",
      "author": {
        "_id": "6543210abcdef123456789",
        "name": "Jane Smith",
        "nickname": "janesmith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-11-18T11:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalBlogs": 15,
    "blogsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Testing Workflow

### Complete Testing Sequence

1. **Register a new user**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@test.com","password":"test123","dob":"1990-01-01","gender":"male"}'
   ```

2. **Save the token from response**
   ```bash
   TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

3. **Get user profile**
   ```bash
   curl -X GET http://localhost:5000/api/auth/user \
     -H "Authorization: Bearer $TOKEN"
   ```

4. **Create a blog post**
   ```bash
   curl -X POST http://localhost:5000/api/blogs \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"content":"My test blog post","template":"modern","font":"Arial"}'
   ```

5. **Get all blogs**
   ```bash
   curl -X GET http://localhost:5000/api/blogs
   ```

6. **Update your blog** (use blog ID from step 4)
   ```bash
   curl -X PUT http://localhost:5000/api/blogs/BLOG_ID \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"content":"Updated content"}'
   ```

7. **Delete your blog**
   ```bash
   curl -X DELETE http://localhost:5000/api/blogs/BLOG_ID \
     -H "Authorization: Bearer $TOKEN"
   ```

---

## Postman Collection

You can import these requests into Postman for easier testing. Create a new collection and add the following variables:

- `base_url`: `http://localhost:5000`
- `token`: (Will be set after login/register)

---

## Notes

- Replace `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your actual JWT token
- Replace `BLOG_ID` and `USER_ID` with actual IDs from your database
- All protected endpoints require the `Authorization: Bearer <token>` header
- Dates should be in ISO 8601 format: `YYYY-MM-DD`
- Gender must be: `male`, `female`, or `other`
