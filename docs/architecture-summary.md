Architecture Summary – GameWeenies Configuration Dashboard (GCD)

Frontend  
- React + Vite + TypeScript  
- TailwindCSS  
- Dynamic UI renderer driven by schema  
- Hybrid navigation: guided flows + high-speed power user tools  
- Premium mod-specific UI support (future)

Backend  
- Node.js + NestJS  
- Prisma ORM  
- SQLite (MVP) → PostgreSQL (Premium)  
- REST API (possible GraphQL later)  
- Config transformation service  
- Module loader system  
- Audit logging  
- Deployment layer (SSH/SFTP)

Database  
- Stores servers, mods, modules, configs, versions, users, and logs  
- SQLite for MVP simplicity  
- PostgreSQL upgrade for scaling

Module System  
Each mod has a folder with:  
- schema.json (describes structure + UI)  
- metadata.json (mod info)  
- transformers (optional advanced features)

Schema System  
A JSON-based specification describing fields, types, constraints, options, grouping, and UI hints.  
Forms the backbone of dynamic UI rendering.

Deployment Layer  
Handles remote server communication:  
- Fetch configuration files  
- Push updated configurations  
- Restart instructions (if needed)  
- Drift detection

Versioning Layer  
Stores config history per mod per server, supports:  
- Diff  
- Rollback  
- Viewing history  
- Annotating changes

RBAC  
Simple role model for MVP:  
- Owner  
- Editor  
- Viewer  
Premium features: granular per-server, per-mod permissions.

Infrastructure  
- GitHub Actions for CI  
- Testing pipeline  
- Deployment automation (future)

Goals  
- Beautiful, intuitive UI replacing raw JSON/YAML editing  
- Expandable system for new mods  
- Reliable versioning and deployment  
