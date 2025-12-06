Architecture Decisions – GCD (ADR Log)

ADR-001 — Backend Language: Node.js  
Reason: Deployment environment, JS ecosystem strength, NestJS benefits.

ADR-002 — Backend Framework: NestJS  
Reason: Structure, scalability, TypeScript alignment, modularity.

ADR-003 — Database: SQLite → PostgreSQL  
Reason: Local simplicity, ease of migration, long-term scalability.

ADR-004 — Schema Format: JSON  
Reason: Standardization, ease of validation, frontend compatibility.

ADR-005 — Transform Strategy: Normalize all config formats to JSON  
Reason: Simplifies UI rendering and ensures consistent validation.

ADR-006 — Dynamic UI First  
Reason: Flexibility, modularity, ability to support any mod without code changes.

ADR-007 — Premium UI Later  
Reason: Allows contextual visual editors (e.g., SkiesShop) without delaying MVP.

ADR-008 — Git Strategy: Feature branches by phase/task  
Reason: Consistency across coding chats, clean history, clear ownership.

ADR-009 — Repo Structure: Monorepo  
Reason: Shared logic, simple tooling, consistent build pipelines.

ADR-010 — Deployment Layer: SSH/SFTP  
Reason: Universal compatibility across remote game servers.
