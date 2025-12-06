🚀 Overview

The GameWeenies Configuration Dashboard (GCD) is a powerful tool for managing, editing, and deploying configuration files for game mods across multiple servers.

It provides:

A dynamic, schema-driven UI

Beautiful, contextual editors

Safe versioning & rollback

Multi-mod, multi-server support

Automated deployment (SSH/SFTP)

Rich audit logs and RBAC

Extensible module system

🧱 Tech Stack
Frontend

React

Vite

TailwindCSS

Backend

Node.js

NestJS

Prisma ORM

SQLite (MVP) → PostgreSQL (Premium)

Schema & Modules

JSON-based schema definitions

Supports YAML, TOML, CFG, JSON config files via transformers

📁 Repository Structure
/backend/        # NestJS backend
/frontend/       # React frontend
/modules/        # Mod definition folders (schema.json, metadata.json)
.schemas/        # Project-level schema types/validators (Phase 2)
/scripts/        # Build, deploy, and automation scripts
/docs/           # Documentation
LICENSE
README.md
.gitignore

🔧 Development
Install dependencies
cd backend && npm install
cd ../frontend && npm install

Run backend
cd backend
npm run start:dev

Run frontend
cd frontend
npm run dev

🛠 Git Workflow
Branch Naming
phase<phase>-task<task>-<short-description>


Example:

phase2-task1-schema-definition-format

Commit Format (Conventional Commits)

Examples:

feat(schema): add type definitions
fix(deployment): resolve sftp retry issue
chore(repo): update dependencies

Version Tags

Semantic Versioning:

v0.1.0
v0.2.0
v1.0.0

📄 License

MIT License