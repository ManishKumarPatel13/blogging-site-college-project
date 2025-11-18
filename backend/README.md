# Blogging App Backend

A comprehensive backend API for a blogging application built with Node.js, Express, MongoDB, and Passport.js. Features include user authentication (email/password and Google OAuth), JWT-based session management, and full CRUD operations for blog posts.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## ✨ Features

### Authentication & Authorization
- ✅ User registration with email and password
- ✅ User login with email and password
- ✅ Google OAuth 2.0 integration for social login
- ✅ JWT (JSON Web Token) based session management
- ✅ Password hashing using bcrypt
- ✅ Protected routes with authentication middleware
- ✅ User profile management

### Blog Management
- ✅ Create blog posts with rich content
- ✅ Read blog posts (public access)
- ✅ Update blog posts (author only)
- ✅ Delete blog posts (author only)
- ✅ Pagination support for blog listings
- ✅ Filter blogs by author
- ✅ Media URLs support (images/videos)
- ✅ Customizable templates and fonts
- ✅ Multi-language support

### User Profile
- ✅ User details: name, DOB, gender, nickname
- ✅ Profile update functionality
- ✅ Password change functionality
- ✅ Age validation (minimum 13 years)

## 🛠️ Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js v5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: 
  - Passport.js (Google OAuth 2.0)
  - JWT (jsonwebtoken)
  - bcryptjs for password hashing
- **Session Management**: express-session
- **Environment Variables**: dotenv
- **Security**: CORS enabled

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (v4.0 or higher) - Local or MongoDB Atlas account

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnjaliMinakshi/Blogging-App-Backend.git
   cd Blogging-App-Backend/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` file with your actual credentials (see [Configuration](#configuration))

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URL=mongodb://localhost:27017/blogging-app

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key

# Session Secret (generate a secure random string)
SESSION_SECRET=your-super-secret-session-key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Generate Secure Secrets

To generate secure random strings for JWT_SECRET and SESSION_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret** to your `.env` file

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally and start the service
mongod --dbpath /path/to/data/directory
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get the connection string and replace `<password>` and `<dbname>`
4. Add your IP address to the whitelist

## 🏃 Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

### Verify Server is Running
```bash
curl http://localhost:5000
```

Expected response:
```json
{
  "message": "Blogging App Backend API",
  "status": "running",
  "version": "1.0.0"
}
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "dob": "1995-05-15",
  "gender": "male",
  "nickname": "johnny"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth Login
```http
GET /api/auth/google
```
Redirects to Google's OAuth consent screen.

#### Get Current User Profile
```http
GET /api/auth/user
Authorization: Bearer <jwt-token>
```

#### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "John Updated",
  "nickname": "john_updated"
}
```

#### Change Password
```http
PUT /api/auth/password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### Blog Endpoints

#### Get All Blogs (with pagination)
```http
GET /api/blogs?page=1&limit=10&sort=latest
```

#### Get Recent Blogs
```http
GET /api/blogs/recent?limit=10
```

#### Get Single Blog
```http
GET /api/blogs/:id
```

#### Create Blog Post
```http
POST /api/blogs
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "My first blog post content",
  "media": ["https://example.com/image.jpg"],
  "template": "modern",
  "font": "Roboto",
  "language": "en"
}
```

#### Update Blog Post
```http
PUT /api/blogs/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Updated blog content",
  "template": "classic"
}
```

#### Delete Blog Post
```http
DELETE /api/blogs/:id
Authorization: Bearer <jwt-token>
```

#### Get User's Blogs
```http
GET /api/blogs/user/:userId?page=1&limit=10
```

#### Get My Blogs (authenticated user)
```http
GET /api/blogs/my/posts?page=1&limit=10
Authorization: Bearer <jwt-token>
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection configuration
│   └── passport.js        # Passport Google OAuth strategy
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User model schema
│   └── Blog.js            # Blog post model schema
├── routes/
│   ├── auth.js            # Authentication routes
│   └── blogs.js           # Blog CRUD routes
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore file
├── package.json           # Project dependencies
├── server.js              # Main application entry point
└── README.md              # This file
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication with expiration
- **CORS Protection**: Configured CORS to allow only specific origins
- **Input Validation**: All inputs are validated before processing
- **Session Security**: HTTP-only cookies for sessions
- **Error Handling**: Secure error messages without exposing sensitive data
- **Environment Variables**: Sensitive data stored in environment variables
- **Age Verification**: Minimum age requirement (13 years) for registration

## 🛡️ Error Handling

The API uses standard HTTP status codes:

- **200**: Success
- **201**: Created (successful resource creation)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required or failed)
- **404**: Not Found (resource not found)
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error

All error responses follow this format:
```json
{
  "message": "Error description",
  "error": "ERROR_CODE",
  "errors": ["detailed error 1", "detailed error 2"]
}
```

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "dob": "1990-01-01",
    "gender": "male"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Author

**AnjaliMinakshi**

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- Passport.js for authentication strategies
- MongoDB team for the powerful database
- All contributors and supporters

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Note**: Make sure to never commit your `.env` file to version control. Always use `.env.example` as a template.
