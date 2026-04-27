# OptimaSkill — Firestore Database Schema

> **Backend:** Firebase Firestore (NoSQL)
> **Storage:** Firebase Storage (for avatar/icon images)
> **Session:** localStorage (client-side only, not Firestore)

---

## Collections Overview

```
Firestore
├── users/          → admins & students
├── topics/         → exam subjects
├── questions/      → MCQ questions per topic
└── results/        → student exam attempts
```

---

## 1. `users` Collection

Stores both **admin** and **student** accounts.

| Field       | Type                    | Required | Description                                     |
|-------------|-------------------------|----------|-------------------------------------------------|
| `id`        | `string`                | ✅       | Document ID (e.g. `admin-001`, `student-{ts}`)  |
| `name`      | `string`                | ✅       | Display name                                    |
| `email`     | `string`                | ✅       | Unique, stored lowercase                        |
| `password`  | `string`                | ✅       | ⚠️ Plaintext — consider hashing in production  |
| `role`      | `"admin" \| "student"` | ✅       | Controls dashboard access                       |
| `createdAt` | `string`                | ✅       | ISO 8601 timestamp                              |
| `bio`       | `string`                | ❌       | Optional profile bio                            |
| `location`  | `string`                | ❌       | Optional location                               |
| `phone`     | `string`                | ❌       | Optional phone number                           |
| `avatar`    | `string`                | ❌       | URL to profile image (Firebase Storage)         |

### Example Document

```json
{
  "id": "admin-001",
  "name": "Admin User",
  "email": "admin@examapp.com",
  "password": "admin123",
  "role": "admin",
  "createdAt": "2026-04-27T05:00:00.000Z",
  "bio": null,
  "location": null,
  "phone": null,
  "avatar": null
}
```

### Seeded Defaults

| ID            | Name         | Email                  | Password     | Role    |
|---------------|--------------|------------------------|--------------|---------|
| `admin-001`   | Admin User   | admin@examapp.com      | `admin123`   | admin   |
| `student-001` | John Student | student@examapp.com    | `student123` | student |

---

## 2. `topics` Collection

Exam subjects created by admins. `questionCount` is computed at read time and **not stored** in Firestore.

| Field           | Type                        | Required | Description                          |
|-----------------|-----------------------------|----------|--------------------------------------|
| `id`            | `string`                    | ✅       | Document ID (e.g. `topic-001`)       |
| `name`          | `string`                    | ✅       | Topic title                          |
| `description`   | `string`                    | ✅       | Short description                    |
| `icon`          | `string`                    | ✅       | Emoji character or image URL         |
| `difficulty`    | `"Easy" \| "Medium" \| "Hard"` | ✅    | Difficulty level                     |
| `createdAt`     | `string`                    | ✅       | ISO 8601 timestamp                   |
| `questionCount` | `number`                    | ❌       | Computed at read time, NOT stored    |

### Example Document

```json
{
  "id": "topic-001",
  "name": "JavaScript Fundamentals",
  "description": "Core concepts of JavaScript including variables, functions, and closures.",
  "icon": "⚡",
  "difficulty": "Easy",
  "createdAt": "2026-04-27T05:00:00.000Z"
}
```

### Seeded Defaults

| ID          | Name                   | Difficulty |
|-------------|------------------------|------------|
| `topic-001` | JavaScript Fundamentals | Easy      |
| `topic-002` | React & Next.js         | Medium    |
| `topic-003` | Data Structures         | Hard      |

---

## 3. `questions` Collection

Individual MCQ questions. Each question belongs to one topic via `topicId`.

| Field           | Type       | Required | Description                                    |
|-----------------|------------|----------|------------------------------------------------|
| `id`            | `string`   | ✅       | Document ID (e.g. `q-001`)                     |
| `topicId`       | `string`   | ✅       | Foreign key → `topics.id`                      |
| `text`          | `string`   | ✅       | The question text                              |
| `options`       | `string[]` | ✅       | Array of answer choices (typically 4 items)    |
| `correctAnswer` | `number`   | ✅       | 0-based index into the `options` array         |
| `explanation`   | `string`   | ✅       | Shown to student after answering               |
| `points`        | `number`   | ✅       | Score value awarded for correct answer         |
| `createdAt`     | `string`   | ✅       | ISO 8601 timestamp                             |

### Example Document

```json
{
  "id": "q-001",
  "topicId": "topic-001",
  "text": "Which keyword declares a block-scoped variable in JavaScript?",
  "options": ["var", "let", "const", "Both let and const"],
  "correctAnswer": 3,
  "explanation": "Both `let` and `const` are block-scoped. `var` is function-scoped.",
  "points": 10,
  "createdAt": "2026-04-27T05:00:00.000Z"
}
```

---

## 4. `results` Collection

Records of exam attempts submitted by students.

| Field          | Type       | Required | Description                                      |
|----------------|------------|----------|--------------------------------------------------|
| `id`           | `string`   | ✅       | Auto-generated by Firestore or provided          |
| `studentId`    | `string`   | ✅       | Foreign key → `users.id`                         |
| `topicId`      | `string`   | ✅       | Foreign key → `topics.id`                        |
| `score`        | `number`   | ✅       | Total points earned in this attempt              |
| `totalPoints`  | `number`   | ✅       | Maximum possible points for the exam             |
| `answers`      | `number[]` | ✅       | Student's selected option indices per question   |
| `timeTaken`    | `number`   | ✅       | Time to complete the exam in seconds             |
| `completedAt`  | `string`   | ✅       | ISO 8601 timestamp of submission                 |

### Example Document

```json
{
  "id": "Xk9mN2pQrT",
  "studentId": "student-001",
  "topicId": "topic-001",
  "score": 20,
  "totalPoints": 30,
  "answers": [3, 2, 1],
  "timeTaken": 142,
  "completedAt": "2026-04-27T06:15:00.000Z"
}
```

---

## Relationships

```
users      (1) ──────────── (many) results
topics     (1) ──────────── (many) questions
topics     (1) ──────────── (many) results
```

### Cascade Delete Rules (enforced in code, not Firestore rules)

| Action                  | Cascade Effect                          |
|-------------------------|-----------------------------------------|
| Delete a **user**       | All their `results` are deleted         |
| Delete a **topic**      | All its `questions` are deleted         |

---

## Session (localStorage — not Firestore)

The active login session is stored client-side under the key `exam_auth`.
It is set on login and removed on logout.

| Field      | Type                    | Description                    |
|------------|-------------------------|--------------------------------|
| `userId`   | `string`                | References `users.id`          |
| `role`     | `"admin" \| "student"` | Used to route to correct dashboard |
| `name`     | `string`                | Display name                   |
| `email`    | `string`                | User email                     |
| `avatar`   | `string` (optional)     | Profile image URL              |

### Example localStorage value

```json
{
  "userId": "student-001",
  "role": "student",
  "name": "John Student",
  "email": "student@examapp.com",
  "avatar": null
}
```

---

## Firebase Services Used

| Service              | Purpose                                      |
|----------------------|----------------------------------------------|
| **Firestore**        | All persistent data (users, topics, questions, results) |
| **Firebase Storage** | Avatar images, topic icon images             |
| **Firebase Auth**    | Google & GitHub OAuth (initialized, available) |
| **Firebase Analytics** | Usage analytics (browser-only)             |

---

## Security Notes

> ⚠️ **Plaintext Passwords** — Passwords are stored as plaintext strings in Firestore.
> For production, migrate to **Firebase Authentication** (already initialized) or hash passwords with `bcrypt`.

> ⚠️ **No Firestore Security Rules shown** — Ensure Firestore rules restrict reads/writes
> to authenticated users and prevent students from reading other users' data.
