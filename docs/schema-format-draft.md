Schema Format Draft – GCD

Purpose  
Define the JSON-based schema format that describes mod configuration structure and UI representation.

Core Concepts  
- Fields
- Types
- Validation
- Grouping
- UI hints
- Defaults

(MVP) Schema should support:
- string
- number
- boolean
- enum (select)
- array (simple types)
- object (nested structure)
- description/help text
- min/max (number)
- regex (string)
- required flag

Extra Concepts for Premium:
- conditional visibility
- advanced UI widgets
- custom rendering
- layout hints

Example Field Properties (not code):
- id
- label
- type
- default
- description
- validation
- ui (hint for component rendering)

Schema is the backbone of:
- Dynamic UI generation
- Data validation
- Config transformation
