Modules Overview – GCD

Purpose  
Modules define how each game mod’s configuration files are interpreted and displayed in the dashboard.

Structure (MVP)  
/modules/<modName>/
  metadata.json
  schema.json

metadata.json:
- mod name
- version (optional)
- description
- supported config file(s)

schema.json:
- Defines structure of fields
- Specifies type, default, validation rules
- Provides UI hints for rendering

Premium Features (Future)  
- Custom UI descriptors
- Visual builder modes
- Per-field override renderers
- Embedded assets (icons, previews)

Behavior  
1. Schema defines the structure for UI rendering.  
2. Backend loads module schemas dynamically.  
3. Config transformer converts YAML/TOML/CFG → JSON → YAML/TOML/CFG.  
4. UI renders controls based on schema.  

Goal  
Enable new mods to be added quickly without code changes.
