# Remindly - API Reference

Complete documentation of all REST API endpoints for the Remindly application.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Token is obtained from sign-up or sign-in endpoints and stored in localStorage on the frontend.

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

---

## Authentication Endpoints

### 1. Sign Up
Create a new user account.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "totalPoints": 0,
    "streak": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 400: Missing required fields
- 400: Email already exists

---

### 2. Sign In
Authenticate existing user.

**Endpoint:** `POST /auth/signin`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "totalPoints": 150,
    "streak": 5
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 401: Invalid email or password
- 400: Missing credentials

---

### 3. Get Current User
Get authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "totalPoints": 150,
    "streak": 5,
    "lastRevisionDate": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- 401: Unauthorized (missing/invalid token)

---

## Topic Endpoints

### 1. Get All Topics
Get all topics for the authenticated user.

**Endpoint:** `GET /topics`

**Authentication:** Required

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "topics": [
    {
      "_id": "507f191e810c19729de860ea",
      "title": "React Hooks",
      "explanation": "React Hooks are functions that let you use React features...",
      "category": "Programming",
      "status": "pending",
      "nextRevisionDate": "2024-01-18T00:00:00Z",
      "completedRevisions": 1,
      "memoryStrength": 85,
      "averageScore": 88
    }
  ]
}
```

**Status Values:**
- `pending` - Due for revision today
- `overdue` - Past revision date
- `upcoming` - Scheduled for future
- `completed` - All revisions done

---

### 2. Create Topic
Create a new topic for revision.

**Endpoint:** `POST /topics`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "React Hooks",
  "explanation": "React Hooks are functions that let you use React features without writing a class. Common hooks include useState for state management, useEffect for side effects, and useContext for accessing context. They enable functional components to have state and lifecycle methods. Hooks must be called at the top level of your component function.",
  "category": "Programming"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "topic": {
    "_id": "507f191e810c19729de860ea",
    "title": "React Hooks",
    "explanation": "...",
    "category": "Programming",
    "status": "pending",
    "revisionDates": [
      "2024-01-16T00:00:00Z",
      "2024-01-22T00:00:00Z",
      "2024-02-15T00:00:00Z"
    ],
    "nextRevisionDate": "2024-01-16T00:00:00Z",
    "completedRevisions": 0,
    "memoryStrength": 100,
    "adaptiveMultiplier": 1,
    "averageScore": 0
  }
}
```

**Validation:**
- Explanation must be 50-100 words
- Title is required
- Category is required

**Errors:**
- 400: Explanation not 50-100 words
- 400: Missing required fields

---

### 3. Get Topic by ID
Get details of a specific topic.

**Endpoint:** `GET /topics/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "topic": {
    "_id": "507f191e810c19729de860ea",
    "title": "React Hooks",
    "explanation": "...",
    "category": "Programming",
    "status": "pending",
    "nextRevisionDate": "2024-01-18T00:00:00Z",
    "completedRevisions": 1,
    "memoryStrength": 85,
    "averageScore": 88,
    "quizAttempts": 5
  }
}
```

**Errors:**
- 404: Topic not found
- 403: Unauthorized (not owner)

---

### 4. Update Topic
Update topic details.

**Endpoint:** `PUT /topics/:id`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated React Hooks",
  "explanation": "Updated explanation with more details...",
  "category": "Web Development"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "topic": {
    "_id": "507f191e810c19729de860ea",
    "title": "Updated React Hooks",
    "explanation": "...",
    "category": "Web Development"
  }
}
```

**Errors:**
- 404: Topic not found
- 403: Unauthorized
- 400: Invalid update data

---

### 5. Delete Topic
Delete a topic permanently.

**Endpoint:** `DELETE /topics/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Topic deleted successfully"
}
```

**Errors:**
- 404: Topic not found
- 403: Unauthorized

---

### 6. Mark Topic Revised
Mark a topic as revised and update spaced repetition schedule.

**Endpoint:** `POST /topics/:id/mark-revised`

**Authentication:** Required

**Request Body:** (Empty)

**Response (200 OK):**
```json
{
  "success": true,
  "topic": {
    "_id": "507f191e810c19729de860ea",
    "completedRevisions": 2,
    "nextRevisionDate": "2024-02-15T00:00:00Z",
    "status": "upcoming",
    "memoryStrength": 90
  },
  "message": "Topic marked as revised. Next revision on 2024-02-15"
}
```

**What Happens:**
- Increments `completedRevisions`
- Updates `nextRevisionDate` to next interval
- Updates `memoryStrength`
- Updates user's streak if on schedule
- User earns points

**Errors:**
- 404: Topic not found
- 403: Unauthorized

---

## AI Endpoints

### 1. Generate Quiz
Generate AI-powered quiz questions for a topic.

**Endpoint:** `POST /ai/generate-quiz`

**Authentication:** Required

**Request Body:**
```json
{
  "topic": "React Hooks",
  "explanation": "React Hooks are functions that let you use React features...",
  "difficulty": "medium"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "questions": [
    {
      "question": "What is the primary purpose of the useState hook?",
      "options": [
        "To manage component state in functional components",
        "To handle side effects in components",
        "To access context values",
        "To optimize component rendering"
      ],
      "correctAnswer": "To manage component state in functional components"
    }
  ]
}
```

**Difficulty Levels:**
- `easy` - Basic comprehension questions
- `medium` - Understanding and application
- `hard` - Complex analysis and synthesis

**Errors:**
- 400: Missing required fields
- 500: Gemini API error

---

### 2. Evaluate Explanation
AI-powered evaluation of user's understanding.

**Endpoint:** `POST /ai/evaluate-explanation`

**Authentication:** Required

**Request Body:**
```json
{
  "topic": "React Hooks",
  "originalExplanation": "React Hooks are functions that let you use React features...",
  "userExplanation": "Hooks are functions in React that help manage state and side effects in functional components. useState allows us to add state, useEffect runs after render, and useContext accesses context."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "score": 8,
  "feedback": "Excellent understanding of the core concepts. You correctly identified useState and useEffect, and understood their purposes.",
  "missingConcepts": [
    "Custom hooks creation",
    "Rules of hooks"
  ],
  "isUnlocked": true,
  "message": "Score 8/10 - Quiz unlocked! Try the quiz to earn points."
}
```

**Score Range:** 0-10

**isUnlocked:** True if score >= 6 (quiz becomes available)

**Errors:**
- 400: Missing fields
- 500: Gemini API error

---

### 3. Generate Adaptive Quiz
Generate a complete adaptive quiz with varying difficulties.

**Endpoint:** `POST /ai/generate-adaptive-quiz`

**Authentication:** Required

**Request Body:**
```json
{
  "topic": "React Hooks",
  "explanation": "React Hooks are functions that let you use React features..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "questions": [
    {
      "difficulty": "easy",
      "question": "What is useState?",
      "options": [...],
      "correctAnswer": "..."
    },
    {
      "difficulty": "medium",
      "question": "How do you manage multiple state values?",
      "options": [...],
      "correctAnswer": "..."
    },
    {
      "difficulty": "hard",
      "question": "Why must hooks be called at the top level?",
      "options": [...],
      "correctAnswer": "..."
    }
  ]
}
```

**Structure:**
- 5 easy questions
- 5 medium questions
- 5 hard questions
- Total: 15 questions

**Errors:**
- 400: Missing fields
- 500: Gemini API error

---

## Quiz Results Endpoints

### 1. Submit Quiz Result
Submit quiz attempt and calculate points.

**Endpoint:** `POST /quiz-results`

**Authentication:** Required

**Request Body:**
```json
{
  "topicId": "507f191e810c19729de860ea",
  "score": 4,
  "totalQuestions": 5,
  "difficulty": "medium"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "quizResult": {
    "_id": "507f1f77bcf86cd799439012",
    "topicId": "507f191e810c19729de860ea",
    "score": 4,
    "totalQuestions": 5,
    "difficulty": "medium",
    "pointsEarned": 12,
    "percentage": 80,
    "createdAt": "2024-01-16T15:30:00Z"
  },
  "message": "Quiz submitted! You earned 12 points."
}
```

**Point Calculation:**
```
basePoints = 10
multiplier = difficulty (easy: 1, medium: 1.5, hard: 2)
points = basePoints × (score/totalQuestions) × multiplier
```

**Errors:**
- 404: Topic not found
- 400: Invalid score values

---

### 2. Get Quiz Results for Topic
Get all quiz attempts for a specific topic.

**Endpoint:** `GET /quiz-results/:topicId`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "results": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "score": 4,
      "totalQuestions": 5,
      "difficulty": "medium",
      "pointsEarned": 12,
      "percentage": 80,
      "createdAt": "2024-01-16T15:30:00Z"
    }
  ],
  "averageScore": 82,
  "totalAttempts": 3
}
```

**Errors:**
- 404: Topic not found
- 403: Unauthorized

---

## Leaderboard Endpoints

### Get Leaderboard
Get top 50 users ranked by points.

**Endpoint:** `GET /leaderboard`

**Authentication:** Not required (public)

**Response (200 OK):**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "name": "Alice Johnson",
      "points": 1250,
      "streak": 12
    },
    {
      "rank": 2,
      "name": "Bob Smith",
      "points": 1100,
      "streak": 8
    }
  ]
}
```

**Ranking:**
- Sorted by totalPoints (descending)
- Top 50 users returned
- Rank starts from 1

**Errors:** None (public endpoint)

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - User not authorized |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Backend error |

---

## Rate Limiting

Currently no rate limiting. For production, implement:
- 100 requests per minute per IP
- 1000 requests per hour per user
- Queue AI requests due to API limits

---

## Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Create Topic
```bash
curl -X POST http://localhost:5000/api/topics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Topic",
    "explanation":"This is a test explanation with enough words to meet the minimum word count requirement for the topic explanation field which should be between fifty and one hundred words total.",
    "category":"General"
  }'
```

### Generate Quiz
```bash
curl -X POST http://localhost:5000/api/ai/generate-quiz \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic":"Test Topic",
    "explanation":"Explanation here",
    "difficulty":"medium"
  }'
```

---

## Webhook Events (Future)

Future versions will support webhooks for:
- Topic created
- Quiz completed
- Achievement unlocked
- Streak milestone

---

## Changelog

### v1.0.0 (Initial Release)
- Authentication system
- Topic CRUD operations
- AI-powered quiz generation
- Explanation evaluation
- Quiz results tracking
- Leaderboard system
- Spaced repetition scheduling
