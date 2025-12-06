Project Glossary – GameWeenies Configuration Dashboard (GCD)

Phase  
A major stage in the project roadmap, representing a large functional area.  
Examples: Schema System, Backend Core, UI Framework.

Task  
A contained piece of work within a Phase.  
Example: Define schema format, build config transformer.

Subtask  
A step within a Task. Should be as small and linear as possible.

Module  
A folder defining how a specific game mod's configuration files should be interpreted and displayed within the dashboard. Contains schema, metadata, and optional custom UI descriptors.

Schema  
A JSON-based definition describing the structure, types, constraints, and UI suggestions for configuring a mod. Drives dynamic UI rendering.

Dynamic UI  
The system that reads a schema and automatically generates UI controls for editing mod configuration files.

Premium UI  
A custom UI built on top of the schema for mods needing advanced contextual visualization (e.g., SkiesShop GUI builder).

MVP  
Minimum Viable Product. The simplest implementation that allows basic functionality.

Premium Feature  
A more advanced version of an MVP concept, implemented after core functionality is stable.

Config Source  
The raw configuration file(s) for a mod stored on a game server (YAML, TOML, CFG, JSON, etc.)

Config Transformation  
The process of converting external config formats into a normalized JSON structure for the UI and back again for deployment.

Deployment Layer  
The system responsible for transferring config files to/from game servers (SSH/SFTP).

Versioning  
The ability to store, diff, and roll back previous config states.

Drift Detection  
Comparing the server's active config with the stored config to detect differences.

RBAC  
Role-Based Access Control. Determines who can edit or view specific servers or mods.

Hybrid Navigation Model  
A UI model that supports both guided workflows and fast navigation for power users.

Monorepo  
A single repository containing backend, frontend, modules, schemas, and docs for the entire GCD project.

Main Brain  
The primary architectural guidance chat (this one) that coordinates all task-based coding chats.
