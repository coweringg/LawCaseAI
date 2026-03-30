# <p align="center">LawCaseAI ⚖️🤖</p>

<p align="center">
  <strong>AI-powered legal case management for modern law firms</strong>
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
**LawCaseAI** is a comprehensive SaaS platform designed specifically for law firms in the United States to revolutionize case management through Artificial Intelligence. 

Managing complex legal proceedings often involves navigating mountains of documents and data. LawCaseAI solves this by providing an intelligent, centralized command center that automates document analysis, streamlines team collaboration, and handles enterprise-grade billing, allowing legal professionals to focus on winning cases rather than administrative friction.

---

## ✨ Key Features

- 🤖 **AI-Driven Case Intelligence**: Interactive chat within each case, utilizing uploaded documents (PDFs, transcripts, data) as context for precise, fact-based answers.
- 📁 **Universal Command Center**: High-performance storage and processing for PDFs, MP4, MP3, and more, powered by Cloudflare R2.
- 🏢 **Enterprise Hierarchy**: Robust multi-tenant system with organization management, seat-based licensing, and firm codes.
- 📚 **Integrated Knowledge Base**: A central repository that feeds directly into the AI to ensure institutional knowledge is always accessible.
- 💳 **Seamless Billing**: Full integration with **Paddle Billing**, supporting Personal, Firm, and Enterprise plans with cryptographic webhook handling.
- 🛡️ **Advanced Admin Dashboard**: High-level control over multi-tenant analytics, seat quotas, treasury monitoring, and global telemetry.
- 🔐 **Secure Role-Based Access**: Enterprise security with granular roles (Admin, Member, Viewer) and session management.

---

## 🛠️ Tech Stack

### Frontend & UI
| Technology | Description |
| :--- | :--- |
| **Next.js 16.2** | High-performance React framework (Pages Router) |
| **TypeScript** | Type-safe application development |
| **TailwindCSS** | Utility-first styling for premium UI/UX |
| **Framer Motion** | Fluid micro-interactions and hardware-accelerated animations |
| **Zustand** | Lightweight and scalable state management |

### Backend & Core
| Technology | Description |
| :--- | :--- |
| **Node.js & Express** | Scalable RESTful API architecture |
| **Mongoose / MongoDB** | Flexible NoSQL document database for complex legal data |
| **Paddle SDK** | Global payment infrastructure and tax compliance |
| **Cloudflare R2** | S3-compatible, high-performance object storage |

### DevOps & Infrastructure
- **Deployment**: Vercel (Frontend/Serverless) + Render (Backend Services)
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

## 🚀 Experience the Product

Interested in seeing LawCaseAI in action? Visit our live production environment:

👉 **[Launch LawCaseAI Demo](https://lawcaseai-gamma.vercel.app/)**

---

## 📈 Project Status

🟢 **Production Ready** — Actively developed and maintained.

<p align="center">
  <i>Built with excellence for the legal industry.</i>
</p>