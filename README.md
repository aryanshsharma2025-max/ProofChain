# ProofChain

[![Smart Contract Tests](https://img.shields.io/badge/Hardhat%20Tests-8%20Passing-10B981?style=for-the-badge&logo=solidity)](https://github.com/aryanshsharma2025-max/ProofChain)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://proof-chain-kappa.vercel.app)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.28-363636?style=for-the-badge&logo=solidity)](https://github.com/aryanshsharma2025-max/ProofChain)

A document-integrity and credential-consistency verification prototype combining in-browser cryptographic hashing, OCR text extraction, and smart-contract hash anchoring.

The project explores a multi-layer verification workflow to test whether an uploaded certificate matches recorded issuance metadata and has not undergone client-side modification.

---

## 📌 Problem Statement & Architecture

Digital credentials (transcripts, degrees, certificates) distributed as PDFs are easily modified using desktop editing software (e.g. changing candidate names, roll numbers, or course grades).

ProofChain evaluates document integrity across three distinct layers:
1. **Cryptographic Hashing:** Computes a SHA-256 digest in the user's browser using the native Web Crypto API. The document content stays private on the client machine during hashing.
2. **Registry Lookup & Content Consistency:** Queries a Supabase credential registry by hash. If found, extracted text from client-side OCR (Tesseract.js / PDF.js) is compared against expected metadata (holder name, issuer name, credential ID).
3. **Smart Contract Anchoring:** A Solidity smart contract (`ProofAnchor.sol`) records hashes, timestamps, and issuer wallet addresses immutably on an EVM ledger.

```
User Uploads Certificate (PDF / Image)
            │
            ▼
  ┌────────────────────────────────────────────────────────┐
  │ 1. Client-Side Cryptographic Hashing                   │
  │    • Computes SHA-256 via browser Web Crypto API       │
  │    • Document content stays private on client machine  │
  └────────────────────────────────────────────────────────┘
            │
            ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. Registry Lookup (Supabase)                          │
  │    • Queries credential registry by document SHA-256   │
  │    • If found: retrieves expected metadata (Name, ID)  │
  │    • If not found: document is untrusted / unregistered│
  └────────────────────────────────────────────────────────┘
            │
            ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. Client-Side OCR Extraction (Tesseract.js / PDF.js)  │
  │    • Reads text layers or rasterized visual content    │
  │    • Extracts visible text on the certificate          │
  └────────────────────────────────────────────────────────┘
            │
            ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. Consistency Engine (src/utils/consistency.ts)       │
  │    • Compares OCR text against expected metadata       │
  │    • Flags status: MATCH | MISMATCH | NOT_FOUND        │
  └────────────────────────────────────────────────────────┘
            │
            ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. Smart Contract Anchoring Layer (Solidity)           │
  │    • ProofAnchor.sol records immutable (hash, time)    │
  │    • Prevents duplicate credential registrations       │
  └────────────────────────────────────────────────────────┘
```

---

## 🚦 Implementation Status

| Feature / Component | Status | Implementation Details |
|---|:---:|---|
| **Client-Side SHA-256 Hashing** | **Implemented** | Computed in browser using native Web Crypto API (`crypto.subtle`) |
| **Credential Registry Lookup** | **Implemented** | Supabase query by document hash |
| **OCR Text Extraction** | **Implemented** | Heuristic client-side OCR via Tesseract.js and PDF.js |
| **Field Consistency Checking** | **Implemented** | Checks extracted name, issuer, and ID against registry record |
| **Smart Contract (`ProofAnchor.sol`)** | **Implemented** | Solidity `^0.8.28` contract with duplicate prevention |
| **Hardhat Test Suite** | **Implemented** | 8 automated tests passing on local Hardhat EVM node |
| **Frontend Consistency Unit Tests**| **Implemented** | Verified via Node test runner (`node --experimental-strip-types`) |
| **Live Web App Deployment** | **Verified Live** | Hosted on Vercel at [proof-chain-kappa.vercel.app](https://proof-chain-kappa.vercel.app) |
| **Public Testnet Contract Deploy** | **Local / Configurable**| Hardhat deployable to Sepolia testnet via environment RPC |
| **Institutional PKI Authentication**| **Not Implemented** | Does not independently authenticate issuer real-world identity |

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Smart Contract & Tooling:** Solidity `^0.8.28`, Hardhat, Viem
- **Cryptography & Parsing:** Web Crypto API (SHA-256), Tesseract.js, PDF.js (`pdfjs-dist`)
- **Backend Registry:** Supabase (PostgreSQL)
- **Deployment:** Vercel

---

## 💻 Installation & Setup

### Prerequisites
- Node.js 18 or higher
- npm

### 1. Clone the repository
```bash
git clone https://github.com/aryanshsharma2025-max/ProofChain.git
cd ProofChain
```

### 2. Install Dependencies
```bash
# Install blockchain dependencies
cd blockchain
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `frontend/.env.local` and populate required keys:
```bash
cp .env.example frontend/.env.local
```

---

## 🚀 Execution Instructions

### Running the Frontend Locally
```bash
cd frontend
npm run dev
```
Navigate to `http://localhost:5173`.

### Compiling Smart Contracts
```bash
cd blockchain
npx hardhat compile
```

---

## 🧪 Automated Testing

### 1. Smart Contract Test Suite (`blockchain/test/ProofAnchor.test.ts`)
Run the contract test suite on an isolated local EVM node:

```bash
cd blockchain
npm test
```

**Verified Test Coverage (8 Passing Tests):**
1. Contract deployment verification
2. Credential anchoring and retrieval
3. Rejection of empty credential IDs
4. Rejection of zero-value document hashes
5. Reversion on duplicate registrations for the same credential ID
6. Reversion when querying unanchored credential IDs
7. Event emission (`CredentialAnchored`) with valid arguments
8. Multi-account credential isolation

### 2. Frontend Consistency Tests
```bash
cd frontend
npm test
```
Executes consistency matching tests verifying string matching, whitespace normalization, and mismatch flagging across registry metadata and OCR output.

---

## 🌐 Live Web Deployment

- **Production URL:** [proof-chain-kappa.vercel.app](https://proof-chain-kappa.vercel.app) (Verified HTTP 200 OK)

---

## ⚠️ Known Limitations & Boundaries

1. **Authentication Boundary:** A matching cryptographic hash proves that a file matches a registered byte sequence. It **does not independently prove that the document was issued by a legitimate accredited university** unless combined with institutional public-key infrastructure (PKI).
2. **OCR Heuristic Sensitivity:** Client-side OCR is sensitive to certificate typography, decorative borders, and scan quality. Character substitution noise (e.g. `0` vs `O`) can cause false mismatches.
3. **Blockchain Scope:** The smart contract provides an immutable timestamped ledger of hashes; it relies on external authority to designate which wallet addresses belong to valid issuing bodies.

---

## 🎯 Learning Outcomes

- Implementing client-side cryptographic hashing with the browser Web Crypto API.
- Writing, testing, and verifying Solidity smart contracts with Hardhat and Viem.
- Designing multi-tier verification pipelines combining relational databases and blockchain registries.
- Managing asynchronous OCR parsing and file handling in React.
