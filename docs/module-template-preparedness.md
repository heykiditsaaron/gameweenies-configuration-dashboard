# GCD ARCHITECTURAL DIRECTIVE — MODULE TEMPLATE PREPAREDNESS
Version: 1.0  
Status: Active  
Approved by: Aaron (Project Owner)  
Authored by: Chief Engineer  
Date: [Insert Current Date]

## 1. Purpose
This directive establishes a long-term architectural requirement for the
GameWeenies Configuration Dashboard (GCD) to remain compatible with future
module templating, module generation, and optional community-created modules,
*without requiring their implementation at this stage*.

This directive protects architectural flexibility and prevents future decisions
from unintentionally blocking template-based or community-based module creation.

## 2. Scope
This directive applies to:
- Module descriptors
- Schema loader output
- Module catalog normalization
- Module metadata fields
- Module discovery behavior
- Backend API assumptions
- UI module rendering assumptions
- Future registry or publishing concepts

This directive **does not** require the implementation of:
- Template generators (CLI or UI)
- Module registries
- Community module publishing
- Remote module fetching
- Schema authoring tools

These may be considered in later phases but are *not part of MVP*.

## 3. Directive Summary
GCD must remain structurally and behaviorally compatible with the eventual
addition of module templates, custom module creation, and optional
community-contributed modules.  
The architecture must not introduce constraints that prevent these capabilities.

In short:
> **Do not commit to templates now, but architect so that templates remain
> possible without refactoring.**

## 4. Architectural Requirements

### 4.1 Module Descriptor Flexibility
Module descriptor structures must:
- Allow additional metadata fields in the future
- Support optional extension fields without breaking normalization
- Remain JSON-based and externally modifiable
- Avoid strict or brittle schema assumptions

### 4.2 Loader Agnosticism
The loader must:
- Remain agnostic to module source (local, generated, contributed, remote)
- Consume descriptors without requiring a fixed filesystem layout
- Avoid hard-coded restrictions that imply “modules only come from the dev”

### 4.3 Catalog Normalization Extensibility
Normalization logic must:
- Accept future fields without breaking
- Preserve metadata even if unused in MVP
- Remain centralized and deterministic

### 4.4 No Hard Constraints in UI or Backend
Neither backend services nor UI components may assume:
- Modules are static
- Only official modules exist
- Only the developer supplies modules
- Modules cannot be created or modified by users
- Modules originate only from a single predefined folder

### 4.5 Reserved Space for Future Features
GCD must preserve the potential for later implementation of:
- Module template generator (CLI or UI)
- Module publishing and sharing
- Organization-specific private modules
- Public module registry
- Versioned module ecosystems

These *must not* be built in MVP, but the system must not block them.

## 5. Non-Goals (Explicitly NOT Required Now)
The following are **not part of Phase 3, Phase 4, or MVP**:
- UI for creating modules
- Community marketplace
- Template library
- CLI scaffolding commands
- Module validation systems
- Module rating or moderation
- Remote module registry syncing

These may be considered in later phases only.

## 6. Rationale
This directive ensures:
- MVP remains lightweight and focused
- Future scalability is preserved
- Users can eventually add modules for games the project owner does not play
- Community contribution remains an option without obligation
- The architecture avoids technical debt that restricts ecosystem growth

This design philosophy aligns with modern extensible platforms such as:
VSCode, Minecraft mod loaders, Factorio mods, Datadog integrations, and Steam
Workshop–enabled tools.

## 7. Enforcement
During future development phases, all architectural decisions should be checked
against the following question:

> “Does this decision prevent us from later adding module templates or
> community-built modules?”

If yes → revise the decision.  
If no → proceed.

The directive is considered binding until explicitly superseded or replaced.

## 8. Amendment Process
This directive can be amended by Aaron (Project Owner) or Chief Engineer.
Amendments must be documented as new directive versions:
Version 1.1, 1.2, etc.

---

# END OF DIRECTIVE
