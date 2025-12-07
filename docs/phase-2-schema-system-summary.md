# Phase 2 — Schema System Summary (Detailed Engineering Document)
**GameWeenies Configuration Dashboard (GCD)**  
Version: **MVP Schema System Complete**  
Tag Target: **v0.2.0-schema-system**

---

# 1. Overview

The **Schema System** is one of the foundational subsystems of the GameWeenies Configuration Dashboard (GCD).  
It defines:

- **How modules describe their configuration structure**  
- **How the system validates those schemas**  
- **How modules are discovered and loaded**  
- **How the system generates default configuration files**  

This subsystem powers every future part of the project:

- Backend processing  
- UI generation  
- Config writing  
- Syncing with game servers  
- Future mod-module expansion  

It ensures uniformity, safety, consistency, and predictability across all mod configuration types.

---

# 2. High-Level Architecture

The Schema System is built from four major components:

```
schema-format.json
        ↓
Schema Validator
        ↓
Module Loader
        ↓
Default Config Generator
        ↓
Phase 3 Backend + Phase 4 UI
```

Each component feeds into the next, forming a reliable pipeline.

---

# 3. Schema Format (MVP)

The schema format is defined in:

```
/schemas/core/schema-format.json
```

This file describes the **structure of all schema definitions** written by GCD module authors.

### Supported Field Types (MVP)

| Type | Description |
|------|-------------|
| `string` | Plain string fields |
| `number` | Numeric fields with min/max |
| `boolean` | True/false values |
| `enum` | Dropdown/select values |
| `array` | Lists of uniform item types |
| `object` | Nested structured configs |

### Validation Rules Allowed (MVP)

- `required` (boolean)
- `min` / `max` (numeric constraints)
- `regex` (string pattern constraint)
- `default` (type-safe default)
- `options` (enum values)
- `items` (array item schema)
- `fields` / `properties` (nested objects)
- `description` / `helpText`
- `ui` (basic UI hints)

### Design Goals

- Human readable
- Machine strict
- Extensible
- UI-friendly
- Fully compatible with modular mod definitions

---

# 4. Schema Validator

Located in:

```
/schemas/core/validator/
```

The validator ensures:

- Schema definitions follow the format defined in `schema-format.json`
- Invalid schemas produce structured errors
- Valid schemas produce a **normalized, canonical schema**

### Validator Output

```
{
  status: "valid" | "invalid",
  validatedSchema: object | null,
  errors: ValidationError[]
}
```

### Error Structure

```
{
  message: string,
  path?: string,
  code?: string
}
```

### Validator Responsibilities

- Validate field types  
- Enforce min/max rules  
- Enforce regex syntax  
- Ensure default values match field types  
- Ensure enum options are correct  
- Recursively validate nested objects  
- Ensure arrays define item schemas  
- Guarantee predictable behavior for consumers  

The validator **never throws** — it returns structured failure results instead.

---

# 5. Module Loader

Located in:

```
/schemas/core/loader/
```

The Module Loader discovers and loads mod schemas from disk.

### Discovery Diagram

```
/modules/
    mockmod/
        schema.json
    quests/
        schema.json
    emptymod/
    invalidmod/
        schema.json
```

### Loading Pipeline

```
Discover module directories
        ↓
Check for schema.json
        ↓
Load raw JSON
        ↓
Parse JSON safely
        ↓
Validate schema via validator
        ↓
Return LoadedModule object
```

### LoadedModule Structure

```
{
  id: string,
  path: string,
  status: "valid" | "invalid" | "missing-schema" | "error",
  version: string | null,
  rawSchema: object | null,
  validatedSchema: SchemaLike | null,
  loadError?: Error
}
```

### Guarantees

- Loader never throws on a per-module basis  
- One bad module cannot break the system  
- Missing schema.json is non-fatal  
- Invalid schemas remain loadable for debugging  

---

# 6. Default Configuration Generator

Located in:

```
/schemas/core/config-generator/
```

This generator produces the **default config file** for any module using only its validated schema.

### Pipeline

```
validatedSchema
        ↓
generateDefaultConfig()
        ↓
{
  config: object,
  warnings: string[]
}
```

### Default Rules (MVP)

| Field Type | Default |
|------------|---------|
| string | "" |
| number | 0 |
| boolean | false |
| enum | first option in options[] |
| array | [] |
| object | recursively generated object |

### Features

- Fully recursive
- Never throws
- Returns fallback defaults instead of crashing
- Produces warnings for malformed schema definitions
- Compatible with all Phase 2 components
- Designed for future enhancement (intelligent defaults, UI-aware defaults, mod-provided defaults, etc.)

---

# 7. Integration Flow (End-to-End)

Here is the entire Schema System pipeline in one ASCII diagram:

```
                           ┌────────────────────────────┐
                           │ schema-format.json         │
                           └──────────────┬─────────────┘
                                          │
                                Defines allowed schema structure
                                          │
                           ┌──────────────▼─────────────┐
                           │ Schema Validator           │
                           └──────────────┬─────────────┘
                                          │
                         Validates and normalizes mod schemas
                                          │
                           ┌──────────────▼─────────────┐
                           │ Module Loader              │
                           └──────────────┬─────────────┘
                                          │
                  Discovers modules, loads schema.json, applies validator
                                          │
                           ┌──────────────▼─────────────┐
                           │ Default Config Generator   │
                           └──────────────┬─────────────┘
                                          │
                         Produces final default config + warnings
                                          │
                           ┌──────────────▼─────────────┐
                           │ Phase 3 Backend            │
                           └──────────────┬─────────────┘
                                          │
                        Provides config objects to downstream logic
                                          │
                           ┌──────────────▼─────────────┐
                           │ Phase 4 UI                 │
                           └────────────────────────────┘

```

---

# 8. System Guarantees (Contract of Invariants)

The Schema System guarantees:

### ✔ Mod schemas can never crash the system  
The validator and loader behave defensively.

### ✔ All modules produce predictable shapes  
Every module has:

- rawSchema  
- validatedSchema or null  
- status  
- warnings  

### ✔ Default configs are always generated  
Even malformed schemas produce defaults with warnings.

### ✔ Backward-compatible behavior  
Future schema extensions will not break existing modules.

### ✔ Centralized schema logic  
Backend and UI both rely on:
- The same validator  
- The same normalized schema structure  
- The same default generator  

This prevents divergence.

---

# 9. Notes for Phase 3 Backend Developers

Phase 3 developers should rely on:

- loadAllModules() to initialize all modules  
- loadedModule.validatedSchema for safe, predictable structures  
- generateDefaultConfig() for initial config creation  

They do **not** need to know:
- How module discovery works  
- How schema validation works  
- How recursion in the generator works  

Backend code simply consumes the outputs.

---

# 10. Notes for Phase 4 UI Developers

UI developers can rely on:

- Validated schemas being normalized  
- field.type always being correct  
- Arrays always having items  
- Objects always having fields  
- enums always having options[]  

This means the UI can be auto-generated using schema metadata.

---

# 11. Future Extensions (Premium Phase Features)

The Schema System was intentionally built to support upgrades:

### 🚀 Intelligent Defaults  
Automatic defaults inferred from field names (“port”, “host”, “timeout”, etc.).

### 🚀 UI Layout Metadata  
More advanced UI hinting for custom editors.

### 🚀 Schema Versioning  
Modules may define schema versions for migration.

### 🚀 Conditional Fields  
Fields that appear only if certain toggles are enabled.

All future enhancements integrate cleanly due to careful Phase 2 planning.

---

# 12. Phase 2 Completion

This document marks the completion of:

✔ Schema Format  
✔ Schema Validator  
✔ Module Loader  
✔ Default Config Generator  
✔ Integration Guarantees  

Next major subsystem activation:

## **Phase 3 — Backend Core**

And the Schema System is now ready to be tagged:

```
v0.2.0-schema-system
```

---

# ✔ End of Document
