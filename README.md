# <p align="center">LawCaseAI ⚖️🤖</p>

<p align="center">
  <strong>AI-assisted LegalTech project for legal document workflows</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Mongoose-8.23.0-47A248?style=for-the-badge&logo=mongodb" alt="Mongoose" />
  <img src="https://img.shields.io/badge/Paddle-Billing-9370DB?style=for-the-badge&logo=paddle" alt="Paddle" />
  <img src="https://img.shields.io/badge/Cloudflare-R2_Storage-F38020?style=for-the-badge&logo=cloudflare" alt="Cloudflare" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="https://lawcaseai-gamma.vercel.app/">
    <img src="https://img.shields.io/badge/LIVE_DEMO-EXPLORE_NOW-blueviolet?style=for-the-badge&logo=rocket" alt="Live Demo" />
  </a>
</p>

---

## 🏛️ What is LawCaseAI?
**LawCaseAI** is a public full-stack LegalTech project focused on AI-assisted legal document review.

---

## ✨ Key Features

- 🤖 **AI-Driven Case Intelligence**: Interactive chat within each case, utilizing uploaded documents (PDFs, transcripts, data) as context for precise, fact-based answers.
- 📁 **File Management**: Storage and processing for PDFs, MP4, MP3, and more, powered by Cloudflare R2.
- 🏢 **Multi-Tenant Organizations**: Organization management with seat-based licensing and firm codes.
- 📚 **Integrated Knowledge Base**: A central repository that feeds directly into the AI to ensure institutional knowledge is always accessible.
- 💳 **Seamless Billing**: Full integration with **Paddle Billing**, supporting Personal, Firm, and Enterprise plans with cryptographic webhook handling.
- 🛡️ **Admin Dashboard**: Multi-tenant analytics, seat quotas, and monitoring.
- 🔐 **Secure Role-Based Access**: Enterprise security with granular roles (Admin, Member, Viewer) and session management.

---

## 🛠️ Tech Stack

### 💻 Frontend & UI
| Technology | Description |
| :--- | :--- |
| **Next.js 16** | High-performance React framework |
| **React 19** | Modern UI component library with latest features |
| **TypeScript** | Type-safe application development |
| **TanStack React Query** | Powerful asynchronous state management and data fetching |
| **Framer Motion** | Fluid micro-interactions and hardware-accelerated animations |
| **Tailwind CSS** | Utility-first styling for premium UI/UX |

### ⚙️ Backend & Core
| Technology | Description |
| :--- | :--- |
| **Node.js & Express** | Scalable RESTful API architecture |
| **TypeScript** | End-to-end type safety across backend services |
| **MongoDB & Mongoose** | Flexible NoSQL document database & ODM for complex legal data |

### 🧠 AI, Storage & Payments
| Service / Tool | Description |
| :--- | :--- |
| **OpenRouter API** | Advanced LLM routing and gateway for AI case intelligence |
| **Cloudflare R2** | S3-compatible, high-performance object storage for case files |
| **Paddle** | Global payment infrastructure, billing, and tax compliance |

### 🔒 Security, Auth & Validation
| Component | Description |
| :--- | :--- |
| **JWT** | Secure, stateless JSON Web Token authentication |
| **Zod** | Runtime schema validation and strict type safety |
| **Express Validator** | Middleware for payload inspection and route validation |
| **Helmet** | Hardened HTTP security headers and CSP rules |
| **Rate Limiting** | Automated request throttling (`express-rate-limit`) to prevent DDoS |
| **Sanitization** | Active NoSQL injection and XSS payload cleansing (`express-mongo-sanitize`, `xss`) |

### 🚀 DevOps & Monitoring
- **Deployment**: Vercel (Frontend) + Render (Backend Services)
- **Monitoring**: Real-time AI telemetry and cost tracking

---

## 🏗️ Architecture Highlights

Designed for performance and technical excellence:

- **Dual Environment Strategy**: Intelligent Sandbox/Production switching controlled via a single environment variable, ensuring safe testing.
- **Cryptographic Security**: Every Paddle webhook is verified using strict SDK signature validation to prevent spoofing.
- **AI Telemetry & Cost Control**: Granular tracking of AI usage to monitor costs and performance metrics across different organizations.
- **Multi-Tenant Seat Management**: Enterprise-ready architecture allowing organizations to manage members, invitations, and seat quotas dynamically.
- **Content Security Policy (CSP)**: Hardened security headers and auditing to protect sensitive legal documents.

---

## 🚀 Live Demo

Check out the deployed demo:

👉 **[Launch LawCaseAI Demo](https://lawcaseai-gamma.vercel.app/)**

---

## 📈 Project Status

🟢 **Public project** · Active development · Deployed demo
