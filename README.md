# MedVault

MedVault is a decentralized medical records vault that lets patients and healthcare providers securely store, share and manage medical records. The project combines a Next.js client (frontend) with a Solidity smart contract for on-chain metadata & access control and uses Arweave for decentralized file storage. MetaMask (Ethereum wallet) and Arweave are used on the client to upload files and sign transactions.

---

## Table of Contents

- [Project overview](#project-overview)
- [Key features](#key-features)
- [Architectural overview](#architectural-overview)
- [Repository layout](#repository-layout)
- [Important files](#important-files)
- [Quick start (development)](#quick-start-development)
- [Smart contract: compile & deploy](#smart-contract-compile--deploy)
- [How the system works (flow)](#how-the-system-works-upload--register-flow)
- [Example interactions (ethers.js)](#example-interacting-with-the-contract-ethersjs)
- [Environment & prerequisites](#environment--prerequisites)
- [Security notes](#security--privacy-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Project overview

MedVault aims to give users full ownership and control of their medical records by combining decentralized storage (Arweave) with an on-chain registry for record metadata and access control. Users sign in on the frontend, upload encrypted medical records to Arweave, and store record metadata (including an encrypted key and the Arweave transaction id) on-chain in the smart contract.

---

## Key features

- User registration on-chain (Patients and Admins)
- Upload medical records to Arweave from the browser
- Store encrypted file keys + Arweave tx id in a Solidity smart contract
- Admins can register patients (and assign ownership when needed)
- Frontend built with Next.js (React) and uses MetaMask for signing

---

## Architectural overview

- **Client (Next.js app)**
  - UI for landing page, dashboard, healthcare admin UI and upload-record flow
  - Uses `arweave` javascript client to create transactions and upload files
  - Uses `ethers` / MetaMask for wallet connectivity and signing

- **Smart contract (Solidity)**
  - `DMROS` contract keeps users, records, and patient-record mappings
  - Functions include `newUser(...)` and `storeRecord(...)` among others

- **Storage**
  - Binary files stored on Arweave (permanent decentralized storage)
  - Encrypted symmetric key (for decrypting the file) stored in contract metadata

---

## Repository layout (high level)

```
client/
  contract/
    dmros.sol            # Solidity smart contract
  src/
    app/
      page.js            # Home / landing page
      layout.js          # Root layout
      upload-record/
        page.js          # Upload flow: Arweave upload + MetaMask signing
      components/
        HealthcareAdminUI.js # Admin UI for viewing/uploading records
  README.md              # Auto-generated Next.js README scaffold
  eslint.config.mjs
LICENSE                  # Project license (MIT)
```

---

## Important files

- **client/contract/dmros.sol**
  - Solidity contract. Contains:
    - `enum UserType { Patient, Admin }`
    - `struct User` and `struct Record`
    - `mapping(uint256 => Record) public records;`
    - `mapping(address => User) public users;`
    - `mapping(address => uint256[]) public patientRecords;`
    - `function newUser(string memory name, UserType userType) public`
    - `function storeRecord(string memory fileName, string memory _arweaveTxId, string memory _encryptedKey, address patientAddress) public`
  - Header declares `// SPDX-License-Identifier: GPL-3.0` and `pragma solidity >=0.7.0 <0.9.0;`

- **client/src/app/upload-record/page.js**
  - Client-side React page (uses `'use client'`) to:
    - Connect to MetaMask
    - Initialize Arweave client (arweave.init with host `arweave.net`)
    - Accept a file input and upload to Arweave
    - Create Arweave transaction, add tags (Content-Type), use MetaMask `personal_sign` to sign the Arweave transaction payload and set the signature on the transaction
    - Use `arweave.transactions.getUploader(transaction)` to upload with progress tracking

- **client/src/app/page.js**
  - Landing page and route behavior; redirects logged-in users to `/dashboard`

- **client/src/app/components/HealthcareAdminUI.js**
  - Admin UI that navigates to `/upload-record` to start upload flow

- **client/eslint.config.mjs**
  - ESLint config extending `next/core-web-vitals`

- **LICENSE**
  - MIT license (project-level file)

---

## Quick start (development)

**Prerequisites:**
- Node.js 18+ and npm/yarn/pnpm
- MetaMask installed in your browser
- (Optional) Hardhat / Remix for contract deployment
- Access to an Arweave network (mainnet or testnet — code uses arweave.net by default)

Clone the repo and start the client:

```bash
git clone https://github.com/siyasiyasiya/medvault.git
cd medvault/client
npm install
npm run dev   # or `yarn dev` / `pnpm dev`
# open http://localhost:3000
```

**Dependencies you will likely need (install in client/):**
- arweave
- ethers
- axios
- react / next

Install example:
```bash
npm install arweave ethers axios
```

---

## Smart contract: compile & deploy

The repo includes `client/contract/dmros.sol`. The contract targets Solidity 0.7.x - 0.8.x range (pragma: `>=0.7.0 <0.9.0`). You can deploy with either Remix or Hardhat.

**Using Hardhat (recommended for local dev + scripts):**

1. Initialize a Hardhat project (if not present):
    ```bash
    mkdir contracts && cd contracts
    npm init -y
    npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
    npx hardhat           # create a sample project
    ```

2. Copy `client/contract/dmros.sol` into `contracts/DMROS.sol`.

3. Example deploy script (`scripts/deploy.js`):
    ```javascript
    async function main() {
      const [deployer] = await ethers.getSigners();
      console.log('Deploying with account:', deployer.address);

      const DMROS = await ethers.getContractFactory("DMROS");
      const dmros = await DMROS.deploy();
      await dmros.deployed();
      console.log("DMROS deployed to:", dmros.address);
    }
    main().catch((error) => { console.error(error); process.exitCode = 1; });
    ```

4. Run:
    ```bash
    npx hardhat run --network <network-name> scripts/deploy.js
    ```

Or use **Remix**: paste the contract, compile with a compatible compiler (0.8.x) and deploy via injected Web3 (MetaMask).

**Important:** The smart contract file header currently declares `SPDX-License-Identifier: GPL-3.0`. If you intend to distribute the contract under MIT or another license, change the SPDX identifier in the `.sol` file to avoid license inconsistency.

---

## How the system works (upload + register flow)

1. **User registers on-chain**
   - `newUser(string name, UserType userType)` is called from the frontend to register the wallet address as a `Patient` or `Admin`.

2. **Upload flow (client)**
   - User selects a file in the browser.
   - The client constructs an Arweave transaction using `arweave.createTransaction({ data: fileData })` and adds tags (e.g., Content-Type).
   - The transaction is converted into a JSON-like payload and signed using MetaMask (via `personal_sign`).
   - The signature is attached to the Arweave transaction object (`transaction.setSignature({...})`).
   - The client uploads the transaction via `arweave.transactions.getUploader(transaction)` and tracks progress.

3. **Store metadata on-chain**
   - After upload completes, the client stores metadata on the `DMROS` contract by calling `storeRecord(fileName, arweaveTxId, encryptedKey, patientAddress)`.
   - Smart contract stores `Record` struct with `recordName`, `recordID`, `encryptedKey`, `arweaveTxId`, `recordOwner`, and `timestamp`.

---

## Example: Interacting with the contract (ethers.js)

Below is an illustrative snippet showing how you might call `newUser` and `storeRecord` from a web client (assumes you have contract ABI and address):

```javascript
import { ethers } from 'ethers';

// provider injected by MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contractAddress = '0x...'; // deployed DMROS contract address
const abi = [ /* minimal ABI: newUser, storeRecord */ ];

const dmros = new ethers.Contract(contractAddress, abi, signer);

// register user
await dmros.newUser("Alice", 0); // 0 = Patient, 1 = Admin

// store record metadata
await dmros.storeRecord("lab-results.pdf", "ARWEAVE_TX_ID", "ENCRYPTED_KEY_BASE64", "0xPatientAddress");
```

Note: The contract uses `uint256` IDs generated via keccak256 in the contract, and the `storeRecord` method enforces that Admins must provide a valid patient address for ownership.

---

## Environment & prerequisites

- Node.js 18+
- MetaMask extension (for signing)
- Arweave network access (the client uses `arweave.net`)
- For contract deployment: an Ethereum account with testnet or mainnet funds (or a local Hardhat node)

**Common packages:**
- next, react, react-dom
- arweave
- ethers
- axios

---

## Contributing

Contributions are welcome. Please open issues or pull requests describing the change. For code contributions:

1. Fork the repo
2. Create a topic branch
3. Run formatting and linting (project uses ESLint / Next.js defaults)
4. Test locally before PR

---

## License

Project-level LICENSE: MIT (see LICENSE file)

Contract SPDX identifier: GPL-3.0 (in `client/contract/dmros.sol`)

---
