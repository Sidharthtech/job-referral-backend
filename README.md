# 🚀 Job Referral Backend: GraphQL API

A **GraphQL-powered** backend for managing employee job referrals, built with **Apollo Server**, **Prisma ORM**, and **PostgreSQL**. Features JWT-based authentication and role-based access control for **Employees** and **HR** personnel.

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [GraphQL Schema](#-graphql-schema)
- [API Usage](#-api-usage)
  - [Mutations](#mutations)
  - [Queries](#queries)
- [Authentication](#-authentication)
- [Role-Based Access Control](#-role-based-access-control)

---

## 🛠 Tech Stack

| Technology                                                    | Purpose                   |
| ------------------------------------------------------------- | ------------------------- |
| [Apollo Server](https://www.apollographql.com/docs/apollo-server/) | GraphQL server framework  |
| [GraphQL](https://graphql.org/)                               | API query language        |
| [Prisma](https://www.prisma.io/)                              | ORM & database migrations |
| [PostgreSQL](https://www.postgresql.org/)                     | Relational database       |
| [JSON Web Tokens](https://jwt.io/)                            | Authentication            |
| [bcrypt](https://www.npmjs.com/package/bcrypt)                | Password hashing          |

---

## 📁 Project Structure

```
job-referral-backend/
├── prisma/
│   ├── migrations/        # Prisma database migrations
│   └── schema.prisma      # Database models & enums
├── src/
│   ├── index.js           # Apollo Server entry point
│   ├── schema.js          # GraphQL type definitions
│   ├── resolvers.js       # GraphQL resolvers (queries & mutations)
│   └── context.js         # Request context (Prisma client + JWT auth)
├── .env                   # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** ≥ 16
- **PostgreSQL** running locally or remotely

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/job-referral-backend.git
cd job-referral-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables (see section below)
cp .env.example .env

# 4. Run Prisma migrations
npx prisma migrate dev --name init

# 5. Generate Prisma Client
npx prisma generate

# 6. Start the development server
npm run dev
```

The server will start at **`http://localhost:4000`**, opening the **Apollo Sandbox** for interactive GraphQL exploration.

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/job_referral"
JWT_SECRET="your-secret-key"
```

| Variable       | Description                              |
| -------------- | ---------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string             |
| `JWT_SECRET`   | Secret key for signing JWT tokens        |

---

## 📐 GraphQL Schema

### Enums

```graphql
enum Role {
  EMPLOYEE
  HR
}

enum ReferralStatus {
  PENDING
  HIRED
  REJECTED
}
```

### Types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  role: Role!
}

type Candidate {
  id: ID!
  name: String!
  email: String!
  experienceYears: Int!
}

type Referral {
  id: ID!
  status: ReferralStatus!
  candidate: Candidate!
  referredBy: User!
}

type AuthPayload {
  token: String!
  user: User!
}
```

---

## 🔌 API Usage

Once the server is running, open **`http://localhost:4000`** in your browser to access the Apollo Sandbox playground. All requests are sent to the single GraphQL endpoint.

### Mutations

#### `register` — Create a new account

```graphql
mutation {
  register(
    name: "Alice Johnson"
    email: "alice@company.com"
    password: "securepassword"
    role: EMPLOYEE
  ) {
    token
    user {
      id
      name
      role
    }
  }
}
```

#### `login` — Authenticate & receive a JWT

```graphql
mutation {
  login(email: "alice@company.com", password: "securepassword") {
    token
    user {
      id
      name
      role
    }
  }
}
```

#### `createCandidate` — Add a candidate profile 🔒

```graphql
mutation {
  createCandidate(
    name: "Bob Smith"
    email: "bob@example.com"
    experienceYears: 5
  ) {
    id
    name
    email
    experienceYears
  }
}
```

#### `createReferral` — Refer a candidate 🔒 *(EMPLOYEE only)*

```graphql
mutation {
  createReferral(candidateId: "candidate-uuid-here") {
    id
    status
    candidate {
      name
    }
    referredBy {
      name
    }
  }
}
```

#### `updateReferralStatus` — Update referral status 🔒 *(HR only)*

```graphql
mutation {
  updateReferralStatus(
    referralId: "referral-uuid-here"
    status: HIRED
  ) {
    id
    status
    candidate {
      name
    }
  }
}
```

### Queries

#### `me` — Get current authenticated user 🔒

```graphql
query {
  me {
    id
    name
    email
    role
  }
}
```

#### `myReferrals` — List referrals made by the current user 🔒

```graphql
query {
  myReferrals {
    id
    status
    candidate {
      name
      email
      experienceYears
    }
  }
}
```

#### `allReferrals` — List all referrals 🔒 *(HR only)*

```graphql
query {
  allReferrals {
    id
    status
    candidate {
      name
    }
    referredBy {
      name
    }
  }
}
```

---

## 🔑 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

1. Obtain a token via the `register` or `login` mutation.
2. Include the token in the **`Authorization`** header for all subsequent requests:

```
Authorization: Bearer <your-jwt-token>
```

The `context.js` middleware extracts and verifies the JWT on every request, making the decoded user available to all resolvers.

---

## 🛡 Role-Based Access Control

| Role         | Permissions                                                        |
| ------------ | ------------------------------------------------------------------ |
| **EMPLOYEE** | Register, login, create candidates, create referrals, view own referrals |
| **HR**       | Register, login, create candidates, view all referrals, update referral status |

Operations marked with 🔒 require authentication. Operations additionally marked with a role require that specific role.

---

## 📄 Database Models (Prisma)

The database consists of three models with the following relationships:

```
User (1) ──── (*) Referral (*) ──── (1) Candidate
```

- A **User** can create many **Referrals**
- A **Candidate** can have many **Referrals**
- Each **Referral** links one **Candidate** to the **User** who referred them

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
