# ProofChain

[![Smart Contract Tests](https://img.shields.io/badge/Smart%20Contract%20Tests-8%20Passing-10B981?style=for-the-badge&logo=solidity)](https://github.com/aryanshsharma2025-max/ProofChain)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-Passing-06B6D4?style=for-the-badge&logo=typescript)](https://github.com/aryanshsharma2025-max/ProofChain)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://proof-chain-kappa.vercel.app)

> **Decentralized Document Integrity & Credential Verification System**  
> Combines client-side SHA-256 cryptographic hashing, optical character recognition (OCR), cross-layer consistency validation, and Solidity smart contract anchoring.

---

## 📌 Problem Statement

Academic credentials, certificates, and official documents are increasingly vulnerable to unauthorized digital alterations. Traditional visual inspection cannot reliably detect modified grades, altered recipient names, or spoofed issuer details. 

ProofChain addresses this vulnerability by implementing a **defense-in-depth verification pipeline** that evaluates document authenticity across cryptographic, content, and registry layers.

---

## 🏗️ System Architecture

```
User Uploads Document (PDF / Image)
            │
            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 1. Client-Side Cryptographic Hashing                   │
 │    • Computes SHA-256 via browser Web Crypto API       │
 │    • Enforces 15 MB file-size ceiling                  │
 └────────────────────────────────────────────────────────┘
            │
            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. Trusted Registry Lookup                             │
 │    • Queries Supabase 'credentials' table by hash      │
 │    • Case-insensitive hash normalization               │
 └────────────────────────────────────────────────────────┘
            │
            ├──► If Hash Matches ──► Retrieve Expected Metadata
            │                        (Holder Name, Issuer Name, Credential ID)
            │
            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. Optical Character Recognition (OCR) Engine          │
 │    • Extracts raw text using Tesseract.js / PDF.js     │
 │    • Bounds preview to prevent UI memory degradation   │
 └────────────────────────────────────────────────────────┘
            │
            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. Cross-Layer Consistency Engine                      │
 │    • Validates OCR text against registry metadata      │
 │    • Classifies fields: MATCH | MISMATCH | NOT_FOUND   │
 └────────────────────────────────────────────────────────┘
            │
            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5. Smart Contract Anchoring Layer (Solidity)           │
 │    • ProofAnchor.sol records immutable (hash, time)    │
 │    • Guarantees duplicate-proof on-chain integrity     │
 └────────────────────────────────────────────────────────┘
```

---

## ⚡ Smart Contract Specification (`ProofAnchor.sol`)

The `ProofAnchor` contract is implemented in Solidity `^0.8.28` and deployed to the EVM execution environment with the following specification:

### Data Structures
```solidity
struct Anchor {
    bytes32 documentHash;
    uint256 timestamp;
    address anchoredBy;
}
```

### Core Functions
1. **`anchorCredential(string calldata credentialId, bytes32 documentHash) external`**
   - Requires non-empty `credentialId`.
   - Requires non-zero `documentHash`.
   - Reverts if `credentialId` has already been anchored.
   - Emits `CredentialAnchored(credentialId, documentHash, block.timestamp, msg.sender)`.
2. **`getAnchor(string calldata credentialId) external view returns (bytes32, uint256, address)`**
   - Returns the stored document hash, Unix timestamp, and anchoring wallet address.
   - Reverts if the `credentialId` is not found.

---

## 🧪 Automated Test Suites

ProofChain enforces test verification across both the blockchain smart contract and frontend utility modules.

### 1. Smart Contract Tests (`blockchain/test/ProofAnchor.test.ts`)
Run via Hardhat and Viem on an isolated local EVM node:
```bash
cd blockchain
npm test
```
**Test Coverage (8 Automated Test Cases):**
- ✔ 1. Should deploy ProofAnchor contract successfully
- ✔ 2. Should anchor a new credential and retrieve its data correctly
- ✔ 3. Should reject anchoring with an empty credential ID
- ✔ 4. Should reject anchoring with a zero document hash
- ✔ 5. Should reject duplicate anchoring for the same credential ID
- ✔ 6. Should revert when querying an unanchored credential ID
- ✔ 7. Should emit `CredentialAnchored` event with indexed parameters
- ✔ 8. Should store and isolate multiple distinct credentials anchored by different accounts

### 2. Frontend Consistency Tests (`frontend/src/utils/consistency.test.ts`)
Run via Node.js:
```bash
cd frontend
npm test
```
**Test Coverage:**
- ✔ Exact text and field matching (`MATCH`)
- ✔ Altered or fraudulent field detection (`MISMATCH`)
- ✔ Absent credential field handling (`NOT_FOUND`)

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology | Purpose |
|---|---|---|
| **Smart Contracts** | Solidity `^0.8.28`, Hardhat, Viem | On-chain document fingerprint registry and duplicate prevention |
| **Frontend UI** | TypeScript, React 19, Vite | Responsive single-page application and drop zone interface |
| **Cryptography** | Web Crypto API (`crypto.subtle`) | In-browser SHA-256 hash generation |
| **OCR Engine** | Tesseract.js, PDF.js | Browser-based text extraction from certificates |
| **Database** | Supabase (PostgreSQL) | Off-chain credential registry and metadata lookup |
| **Hosting** | Vercel | Production web application deployment |

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js `>= 20.0.0`
- npm `>= 10.0.0`

### 1. Clone Repository
```bash
git clone https://github.com/aryanshsharma2025-max/ProofChain.git
cd ProofChain
```

### 2. Blockchain Setup & Test Execution
```bash
cd blockchain
npm install
npm test
```

### 3. Frontend Setup & Run
```bash
cd ../frontend
npm install
npm test
npm run dev
```

Create a `frontend/.env.local` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📊 Implementation Status & Roadmap

### ✅ Implemented
- [x] Client-side SHA-256 calculation (Web Crypto API)
- [x] Supabase credential record querying with hash normalization
- [x] Browser-side OCR text extraction (Tesseract.js & PDF.js)
- [x] Deterministic field consistency verification
- [x] `ProofAnchor.sol` smart contract implementation
- [x] 8 passing Hardhat/Viem unit tests for smart contract
- [x] Responsive dark-mode dashboard UI

### 🔄 Planned / Next Phase
- [ ] Direct Web3 wallet connection in browser (MetaMask / Wagmi) for live on-chain anchoring
- [ ] Public Sepolia testnet contract deployment and Etherscan verification
- [ ] Ed25519 issuer digital signature verification

---

## 📄 License
MIT License.
