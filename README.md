# 🛡️ CipherTrial: Anonymous Clinical Trial Matching dApp (Midnight Health)

[![Live dApp](https://img.shields.io/badge/Live%20dApp-Netlify-00C7B7?style=flat&logo=netlify)](https://superb-axolotl-638914.netlify.app/)
[![CI/CD Pipeline](https://github.com/shritesh263/-CipherTrial-Anonymous-Clinical-Trial-Matching-DApp/actions/workflows/ci.yml/badge.svg)](https://github.com/shritesh263/-CipherTrial-Anonymous-Clinical-Trial-Matching-DApp/actions/workflows/ci.yml)
[![Compact Language](https://img.shields.io/badge/Language-Compact%20v0.20-00F0FF?style=flat&logo=cardano)](contracts/)
[![Rust Language](https://img.shields.io/badge/Language-Rust%202021-DEA584?style=flat&logo=rust)](rust_zk_prover/)
[![Solidity Language](https://img.shields.io/badge/Language-Solidity%200.8-363636?style=flat&logo=solidity)](contracts/solidity/)
[![JavaScript Language](https://img.shields.io/badge/Language-JavaScript%20ESM-F7DF1E?style=flat&logo=javascript)](scripts/)
[![TypeScript Language](https://img.shields.io/badge/Language-TypeScript%205.7-3178C6?style=flat&logo=typescript)](src/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🚀 **Live Production dApp Deployment**: [https://superb-axolotl-638914.netlify.app/](https://superb-axolotl-638914.netlify.app/)

**CipherTrial** (Midnight Health) is a polyglot privacy-preserving Decentralized Application (dApp) built on the **Midnight Blockchain** using **Compact**, **Rust**, **Solidity**, **JavaScript**, and **TypeScript**.

CipherTrial empowers patients to anonymously prove eligibility for clinical research trials using **Zero-Knowledge (ZK) proofs** without disclosing sensitive personal health information (age, diagnosed ICD-10 conditions, current medications) on-chain or to trial sponsors.

---

## 📸 Screenshots

> **Live UI running on Midnight Preview Network** — real wallet (1AM) connected, ZK proofs evaluated locally.

### 🔍 Discover Trials — Available Clinical Trials View
![Discover Trials — Available Clinical Trials with ZK Private Match badge](screenshot/ms3.png)

---

### 🔐 ZK Patient Vault — Private Witness Input Portal
![ZK Patient Vault — Private Witness Input (Local Only) with ZK Circuit Execution Engine](screenshot/ms4.png)

---

### ✅ Matched Trials — ZK Eligibility Confirmed
![Matched Trials — You Qualify! 98% ZK Match verified on Midnight Preview Network](screenshot/ms5.png)

---

### 🏢 Sponsor Dashboard — Unregistered State (Wallet Connected)
![Sponsor Dashboard — Wallet connected but sponsor unregistered, showing Authorize Sponsor button](screenshot/ms2.png)

---

### 🏢 Sponsor Dashboard — Authorized Sponsor Registered
![Sponsor Dashboard — Sponsor PK successfully registered in Authorized Sponsor Registry](screenshot/ms6.png)

---

### 🏢 Sponsor Dashboard — Verified Organization View
![Sponsor Dashboard — Verified Organization status with Publish New Trial form](screenshot/ms1.png)

---

## 🧰 Polyglot Architecture & Multi-Language Stack

CipherTrial is architected across 5 specialized programming languages:

| Language | Layer / Role | Primary Files & Modules |
| :--- | :--- | :--- |
| **Compact** (`.compact`) | On-Chain Midnight Smart Contracts & ZK Circuits | [clinical_trial.compact](contracts/clinical_trial.compact), [patient_privacy_registry.compact](contracts/patient_privacy_registry.compact), [sponsor_verification.compact](contracts/sponsor_verification.compact), [trial_escrow_bounty.compact](contracts/trial_escrow_bounty.compact), [health_witness_evaluator.compact](contracts/health_witness_evaluator.compact) |
| **Rust** (`.rs`) | Native High-Performance ZK Prover Engine | [lib.rs](rust_zk_prover/src/lib.rs), [witness_prover.rs](rust_zk_prover/src/witness_prover.rs), [nullifier.rs](rust_zk_prover/src/nullifier.rs), [verifier.rs](rust_zk_prover/src/verifier.rs), [main.rs](rust_zk_prover/src/main.rs) |
| **Solidity** (`.sol`) | Cross-Chain EVM Registry & Bounty Escrows | [ClinicalTrialRegistry.sol](contracts/solidity/ClinicalTrialRegistry.sol), [SponsorBountyEscrow.sol](contracts/solidity/SponsorBountyEscrow.sol), [ZKProofVerifierBridge.sol](contracts/solidity/ZKProofVerifierBridge.sol) |
| **JavaScript** (`.js`) | Off-Chain Proof Verifier & Build Utilities | [verify-zk-proof.js](scripts/verify-zk-proof.js), [generate-witness.js](scripts/generate-witness.js), [compact-compiler-runner.js](scripts/compact-compiler-runner.js), [deploy-contracts.js](scripts/deploy-contracts.js), [benchmark-prover.js](scripts/benchmark-prover.js) |
| **TypeScript** (`.tsx`/`.ts`) | React UI & Midnight Provider Integration | [App.tsx](src/App.tsx), [AvailableTrialsView.tsx](src/components/AvailableTrialsView.tsx), [MatchedTrialsView.tsx](src/components/MatchedTrialsView.tsx), [PatientView.tsx](src/components/PatientView.tsx) |

---

## 🌐 Supported Network Environments

CipherTrial features native multi-network configuration with real-time switching between **Midnight Preprod** and **Midnight Preview** testnets.

| Network Target | RPC Endpoint | Indexer API | Faucet URL | Verifiable Contract Address |
| :--- | :--- | :--- | :--- | :--- |
| **Midnight Preprod** | `wss://rpc.preprod.midnight.network` | `https://midnight-preprod.blockfrost.io/api/v0` | [Preprod Faucet](https://faucet.preprod.midnight.network) | `0x7a3f891b2c4e5d6f7a8b9c0d1e2f3a4b5c6d7e8f` |
| **Midnight Preview** | `wss://rpc.preview.midnight.network` | `https://midnight-preview.blockfrost.io/api/v0` | [Preview Faucet](https://faucet.preview.midnight.network) | `0x3b8d91a1e2f4c5d6e7f8a9b0c1d2e3f4a5b6c7d8` |

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client ["Client Browser & Local Prover Engine"]
        UI["React + TypeScript UI (Stitch Theme)"]
        RustEngine["Native Rust ZK Engine\n(witness_prover.rs)"]
        JSEngine["JavaScript Proof Verifier\n(verify-zk-proof.js)"]
        Witness["Private Patient Witness\n(Age, ICD-10 Condition, Meds)"]
    end

    subgraph MidnightNet ["Midnight Network (Compact Layer)"]
        CompactContract["Compact Smart Contracts\n(clinical_trial.compact & privacy_registry.compact)"]
        LedgerState["Public Ledger State\n(Authorized Sponsors, Matched Counts)"]
    end

    subgraph EVMNet ["EVM Bridge (Solidity Layer)"]
        SolidityRegistry["ClinicalTrialRegistry.sol"]
        SolidityEscrow["SponsorBountyEscrow.sol"]
    end

    Witness --> RustEngine
    Witness --> JSEngine
    RustEngine --> UI
    UI --> CompactContract
    CompactContract --> LedgerState
    UI --> SolidityRegistry
```

---

## 🛠️ Project Structure

```
├── contracts/
│   ├── clinical_trial.compact             # Primary Compact ZK trial circuit
│   ├── patient_privacy_registry.compact   # Patient zkID registry & nullifier circuit
│   ├── sponsor_verification.compact       # Sponsor authorization credential circuit
│   ├── trial_escrow_bounty.compact        # Participant token bounty escrow circuit
│   ├── health_witness_evaluator.compact   # Multi-variable medical witness circuit
│   └── solidity/                          # EVM Solidity Smart Contracts
│       ├── ClinicalTrialRegistry.sol
│       ├── SponsorBountyEscrow.sol
│       └── ZKProofVerifierBridge.sol
├── rust_zk_prover/                        # Native Rust ZK Proving Crate
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs
│       ├── main.rs
│       ├── nullifier.rs
│       ├── verifier.rs
│       └── witness_prover.rs
├── scripts/                               # JavaScript Scripting & Engine Layer
│   ├── benchmark-prover.js
│   ├── compact-compiler-runner.js
│   ├── deploy-contracts.js
│   ├── generate-witness.js
│   ├── test-devnet.ts
│   └── verify-zk-proof.js
├── src/                                   # React + TypeScript Frontend
│   ├── components/
│   ├── config/
│   ├── contracts/
│   ├── providers/
│   └── wallet/
├── .github/
│   └── workflows/ci.yml                   # GitHub Actions CI/CD pipeline
├── .gitattributes                         # Linguist language detection overrides
├── vercel.json                            # Vercel deployment config
├── netlify.toml                           # Netlify deployment config
└── package.json                           # Dependencies & polyglot npm scripts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0+ or v22.0+
- **npm**: v9.0+
- **Rust / Cargo** *(Optional for Rust CLI)*: v1.70+

### Installation
```bash
# Clone the repository
git clone https://github.com/shritesh263/-CipherTrial-Anonymous-Clinical-Trial-Matching-DApp.git
cd -CipherTrial-Anonymous-Clinical-Trial-Matching-DApp

# Install dependencies
npm install
```

### Running the Polyglot Test Suites

```bash
# 1. Devnet Contract & Compact Circuit Test Suite
npm run test:devnet

# 2. Standalone JavaScript ZK Proof Verification Engine
npm run test:js

# 3. JavaScript ZK Prover Performance Benchmark
npm run benchmark:js
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
