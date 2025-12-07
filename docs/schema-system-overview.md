# GameWeenies Configuration Dashboard  
# Schema System Overview & Integration Map  
# (Phase 2 — Architecture Document)

**Document Purpose**  
This document explains how the entire **Schema → Validator → Loader → Default Config Generator** pipeline works.  
It is a *conceptual architecture overview*, not an implementation guide.  
All diagrams are ASCII for printing, readability, and long-term portability.

---

# 1. High-Level Flow Diagram

This diagram shows how configuration knowledge flows through the system.

 ┌──────────────────┐
 │   Module Schema   │      (JSON written by human or module author)
 │  /modules/<mod>/  │
 │   schema.json     │
 └─────────┬────────┘
           │
           ▼
 ┌──────────────────┐
 │  Schema Validator │      (Phase 2 Task 2)
 │ validateSchema()  │
 └─────────┬────────┘
           │ produces
   ┌───────┴────────────────────────────────────────────┐
   │    • Validated schema (normalized)                  │
   │    • Validation errors (if any)                     │
   └───────┬────────────────────────────────────────────┘
           │
           ▼
 ┌──────────────────┐
 │   Module Loader   │      (Phase 2 Task 3)
 │ loadAllModules()  │
 │ loadSingleModule()│
 └─────────┬────────┘
           │ produces
   ┌───────┴────────────────────────────────────────────┐
   │ LoadedModule object per module:                     │
   │   • status: valid / invalid / missing-schema       │
   │   • rawSchema                                      │
   │   • validatedSchema (SchemaLike | null)            │
   │   • validationErrors                               │
   │   • warnings                                       │
   └───────┬────────────────────────────────────────────┘
           │ only if status === "valid"
           ▼
 ┌──────────────────────────────────────────────────────┐
 │  Default Config Generator                             │ (Phase 2 Task 4)
 │  generateDefaultConfig(validatedSchema)               │
 └─────────┬────────────────────────────────────────────┘
           │ produces
   ┌───────┴────────────────────────────────────────────┐
   │ DefaultConfigResult                                 │
   │   • config   → generated default configuration      │
   │   • warnings → structural/inference issues          │
   └─────────────────────────────────────────────────────┘

---

# 2. Subsystem Responsibilities

## 2.1 Schema Files
Source-of-truth for module configuration structure.

- Written in JSON
- Must follow `/schemas/core/schema-format.json`
- Live under `/modules/<modname>/schema.json`

They describe:

- Field types  
- Constraints  
- Defaults  
- UI hints  
- Nested object structure  
- Arrays  
- Valid enum values  

Schemas do **not** contain executable logic — only structure.

---

## 2.2 Validator (Phase 2 Task 2)

The validator:

- Verifies schema correctness against schema-format.json  
- Normalizes schema (e.g., ensures properly structured object trees)  
- Returns `errors[]` instead of throwing  
- Guarantees stable output for next stages  

Validator output:

```
{
  isValid: boolean,
  validatedSchema: ... | undefined,
  errors: string[] | []
}
```

---

## 2.3 Module Loader (Phase 2 Task 3)

The loader discovers all modules and processes each one:

- Finds module directories  
- Detects missing schema.json  
- Reads / parses schema files  
- Runs the validator  
- Produces a canonical `LoadedModule` object  

Loader output structure:

```
LoadedModule {
  id: string
  path: string
  status: "valid" | "invalid" | "missing-schema" | "error"
  rawSchema: any | null
  validatedSchema: SchemaLike | null
  validationErrors: ValidationError[]
  warnings: string[]
}
```

It never throws — even catastrophically malformed modules are contained.

---

## 2.4 Default Configuration Generator (Phase 2 Task 4)

Consumes **validated schema only**.

It produces:

- A default configuration object for that module
- A list of warnings describing inference issues or malformed schema regions

Core behaviors:

- String → ""
- Number → 0
- Boolean → false
- Enum → first available option
- Array → empty array (`[]`) (MVP rule)
- Object → recursively generate fields
- Defaults override MVP rules
- Structural problems → warnings, no throws

Output:

```
{
  config: { ... },
  warnings: string[]
}
```

This is the final product consumed by the backend and UI.

---

# 3. Dependency Map

schema-format.json
        │
        ▼
  Validator
        │
        ▼
  Module Loader
        │
        ▼
Validated Schema (SchemaLike)
        │
        ▼
Default Config Generator

Each component depends **only on the one before it**, and each stage produces a clean, stable object for the next.

This ensures:

- Strong separation of concerns  
- Minimal risk of cross-module bugs  
- Maximum testability  
- Easy horizontal scaling  
- Robust future expansion  

---

# 4. Stability Guarantees

## 4.1 Validator Stability
- The validator enforces the universal rules.
- If schema-format evolves, validator evolves — downstream systems remain stable.

## 4.2 Loader Stability
- Loader isolates bad schemas without affecting good ones.
- Loader output shape is guaranteed—even when everything is broken.

## 4.3 Default Generator Stability
- Generator never throws.
- Always returns `{ config, warnings }`.
- Compatible with any valid SchemaLike structure.

---

# 5. Future Expansion Points

This pipeline was intentionally designed with long-term growth in mind.

Potential post-MVP enhancements:

### 5.1 Intelligent Default Derivation
Automatically infer defaults based on:

- Field name conventions  
- Value patterns  
- UI metadata  

### 5.2 Templated Arrays
Allow module creators to define array templates:

```
"default_items": { ...template... }
```

### 5.3 Conditional Defaults
Defaults that depend on other schema values.

### 5.4 Module Versioning
Enable versioned schemas with migrations.

### 5.5 Caching Layer
Speed up loader performance for large sets of modules.

---

# 6. Integration Summary (One-Sentence Version)

**Schemas define structure → Validator makes them safe → Loader maps them to LoadedModule → Generator produces usable defaults.**

---

End of Document
