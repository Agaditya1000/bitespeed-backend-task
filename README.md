# Bitespeed Backend Task – Identity Reconciliation Service

# Bitespeed Backend Task – Identity Reconciliation Service

## Problem Statement
Meet the brilliant yet eccentric Dr. Emmett Brown, better known as Doc. Hopelessly stuck in 2023, he is fixing his time machine to go back to the future and save his friend. His favourite online store FluxKart.com sells all the parts required to build this contraption. As crazy as he might get at times, Doc surely knows how to be careful. To avoid drawing attention to his grandiose project, Doc is using different email addresses and phone numbers for each purchase.

FluxKart decides to integrate Bitespeed into their platform to collect contact details from shoppers for a personalized customer experience. However, given Doc's modus operandi, Bitespeed faces a unique challenge: linking different orders made with different contact information to the same person.

**Our Goal**: Design a web service with an endpoint `/identify` that will receive HTTP POST requests and return a consolidated contact payload.

## Architecture & Logic Explanation
The service utilizes **Prisma ORM** over a **PostgreSQL** database, developed using **Node.js with TypeScript**:
- **Controllers**: Validates the payload structure using `Zod` (requires at least one of `email` or `phoneNumber`) and hands over the processing to the service logic layer.
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
