Questions & Clarifications – GCD

This document stores recurring questions and their authoritative answers.
It prevents repeated clarifications across tasks and ensures consistency.

Q: What is a module?
A: A module defines how a mod's config files are structured and displayed, using schemas and metadata.

Q: What is the purpose of a schema?
A: It describes mod config structure, validation rules, and UI hints for rendering dynamic editors.

Q: Can config files be hot-reloaded?
A: Some mods support this, but most require a server restart. GCD must support both cases.

Q: What formats do mod configs come in?
A: YAML, TOML, CFG, and JSON. We normalize everything to JSON internally.

Q: What is the goal of the UI?
A: To eliminate raw editing of JSON/YAML configs by providing intuitive, contextual editors.

Q: Can modules define custom UI?
A: Yes — Premium features allow visual or mod-specific UI, while MVP relies on schema-defined dynamic UI.

Q: Does each server have separate configs?
A: Yes. Same mod, many servers → each server may have different config states.

Q: Are versioning and deployment required in MVP?
A: Yes for both, but simplified. Premium adds advanced diffing, rollback, and drift detection.

Q: Is GCD multitenant?
A: No. GCD is intended for a single administrator + optional editors.

Q: What is the long-term vision?
A: A powerful, context-rich dashboard with expandable, mod-specific UI capabilities.
