# Bitespeed Backend Task – Identity Reconciliation Service

## Project Overview
This is a production-ready Node.js backend service built with TypeScript and Express.js that consolidates and reconciles customer identities based on email and phone number. The service exposes a `/identify` endpoint that accepts customer contact details and gracefully links them using relational logic, converting independent primary contacts into secondary contacts when new overlapping data merges them.

## Architecture & Logic Explanation
The service utilizes **Prisma ORM** over a **PostgreSQL** database:
- **Controllers**: Validates the payload structure using `Zod` and hands over the processing to the service logic layer.
- **Service Layer**: 
  - Searches the database for any contacts matching the given `email` or `phoneNumber`.
  - Maps matches to their root `primaryContact`.
  - Determines if the incoming request provides entirely new information (creating a secondary), is identical to an existing database entry (returning immediately), or bridges two entirely isolated primary trees (merging distinct accounts by updating the `linkedId` and transferring secondary ownership within an atomic Prisma database transaction).
- **Error Handling**: Follows standard formatting for returning JSON validation errors on 400 Bad Request if both fields are missing.

## DB Schema
```prisma
enum LinkPrecedence {
  primary
  secondary
}

model Contact {
  id             Int            @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?
  linkPrecedence LinkPrecedence
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  deletedAt      DateTime?

  // Relations
  linkedContact Contact?  @relation("ContactLinks", fields: [linkedId], references: [id])
  linkedFrom    Contact[] @relation("ContactLinks")
}
```

## Setup Steps
1. Clone the repository and install dependencies:
```bash
npm install
```
2. Make sure the database schema is pushed to the SQL provider:
```bash
npx prisma generate
npx prisma migrate deploy
```
3. Start the compilation script:
```bash
npm run build
npm start
```
*Note: For local development, use `npm run dev` to use `ts-node-dev`.*

## Environment Variables
Create a `.env` file at the root:
```env

PORT=3000
```

## Hosted Endpoint URL
Once deployed to Render.com, replace the domain to access the live API endpoint:
**Endpoint**: `https://<YOUR-RENDER-URL>.onrender.com/identify`

## Sample cURL Requests

**1. Create New Primary Contact**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'
```

**2. Identifying an Existing Flow (Adding Secondary)**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"999999"}'
```

**3. Request Fails (Missing Details)**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{}'
```
