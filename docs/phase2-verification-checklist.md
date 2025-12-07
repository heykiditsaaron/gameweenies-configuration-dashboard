# Phase 2 Verification Checklist  
# GameWeenies Configuration Dashboard  
(Hybrid: Formal Structure + Human-Friendly Notes)

This document verifies that Phase 2 of the GameWeenies Configuration Dashboard (GCD) is correct, stable, and ready for future expansion.  
It is designed for both manual use *today* and partial automation *later*.

---

# 1. Quick Manual Verification Checklist  
(High-level, fast to run, minimal thinking required)

Run each item in order.  
If anything fails, consult Section 4: Failure Analysis.

---

## 1.1 Validate All Schemas  
Command:

```
ts-node schemas/core/validator/tests/mockmod.test.ts
```

Expected:

- Console shows: **status: valid**
- Error list: **empty**

Pass Criteria:

✔ No exceptions  
✔ Schema is reported as valid  
✔ Errors array is empty or only contains warnings (not applicable for MVP)

---

## 1.2 Test Module Loader (Single Module)  

```
ts-node schemas/core/loader/tests/runLoadSingleModuleMockMod.ts
```

Expected output includes:

- Module name: **mockmod**
- status: **valid**
- validatedSchema: **non-null object**
- warnings: **[]**
- validationErrors: **[]**

Pass Criteria:

✔ Loader does not throw  
✔ Module surfaces correct structure  
✔ validatedSchema is preserved and readable  

---

## 1.3 Test Loader (All Modules)

```
ts-node schemas/core/loader/tests/runLoadAllModules.ts
```

Expected:

- List of modules
- Each module shows:
  - id
  - status
  - rawSchema
  - validatedSchema (if valid)
  - warnings
  - validationErrors

Pass Criteria:

✔ Script runs successfully  
✔ No crash from malformed modules  
✔ mockmod appears as **valid**  

---

## 1.4 Test Default Config Generator (Single Module)

```
ts-node schemas/core/config-generator/tests/runGenerateForMockMod.ts
```

Expected:

- “Generated Default Config:” followed by a JS object  
- “Warnings:” array exists  
- Warnings should typically be **empty** in MVP  

Pass Criteria:

✔ Script runs  
✔ Output contains config object  
✔ No exceptions or undefined output  

---

## 1.5 Test Default Config Generator (All Modules)

```
ts-node schemas/core/config-generator/tests/runGenerateForAllModules.ts
```

Expected:

- Generator runs for each valid module  
- Prints config + warnings  
- No hard crashes even for missing/invalid modules  

Pass Criteria:

✔ Loader + generator integration validated  
✔ Generator handles multiple modules gracefully  

---

# 2. Subsystem Verification Matrix  
(Detailed, technical validation — used for regression testing)

This section ensures each subsystem fulfills its contract.

---

## 2.1 Schema Format (Phase 2 Task 1)

### Required Behaviors  
- JSON only  
- Supports MVP field types  
- Supports nested objects  
- Supports arrays  
- Supports enums  
- Supports defaults  
- Supports validation rules  
- Supports UI hints  

### Verification Points  
✔ schema-format.json loads without errors  
✔ Fields match the spec documentation  
✔ Example mockmod schema validates successfully  

---

## 2.2 Validator (Phase 2 Task 2)

### Required Behaviors  
- Validates schema-format JSON  
- Returns structured error array  
- Never throws on user schemas  
- Produces normalized validated schema  
- Compatible with SchemaLike type  

### Verification Points  
✔ validator test scripts run  
✔ validateSchema returns expected shape  
✔ ValidationError structures are correct  
✔ regex, min/max, required rules are enforced  

---

## 2.3 Module Loader (Phase 2 Task 3)

### Required Behaviors  
- Enumerates modules under /modules  
- Detects missing schema.json  
- Distinguishes valid vs invalid modules  
- Does not throw on malformed JSON  
- Produces LoadedModule objects  
- validatedSchema typed as SchemaLike  

### Verification Points  
✔ runLoadSingleModuleMockMod outputs valid status  
✔ runLoadAllModules shows no loader crashes  
✔ missing-schema modules produce correct warnings  
✔ validatedSchema passes into generator  

---

## 2.4 Default Config Generator (Phase 2 Task 4)

### Required Behaviors  
- Accepts validated SchemaLike  
- Generates deterministic config objects  
- Applies explicit defaults  
- Applies MVP implied defaults when needed  
- Supports nested objects  
- Supports arrays (empty in MVP)  
- Supports enums (first option)  
- Accumulates warnings  
- Never throws  

### Verification Points  
✔ runGenerateForMockMod works  
✔ Output matches schema structure exactly  
✔ Warnings exist only when schema is malformed  
✔ Arrays always default to []  
✔ Objects recurse cleanly  

---

# 3. Automated CI Placeholders  
(Not implemented yet — these tell your future CI what to do)

---

## 3.1 Schema Lint Step (Future)

```
# placeholder: future CI command
npx ts-node schemas/core/validator/tests/mockmod.test.ts
```

CI Expected Result:

- Exit code 0  
- JSON printed or captured  
- Errors list empty  

---

## 3.2 Loader Integrity Check (Future)

```
# placeholder: future CI command
npx ts-node schemas/core/loader/tests/runLoadAllModules.ts
```

CI Expected:

- No thrown exceptions  
- Every module printed  

---

## 3.3 Default Generator Snapshot Test (Future)

```
# placeholder: Generate default config JSON snapshots
# Compare against previous version
```

CI Expected:

- Snapshot differences alerted during PR reviews  

---

# 4. Failure Analysis Guide  
(What to do if a check fails)

---

## 4.1 Validator Fails  
Possible causes:

- schema-format.json updated without updating validator  
- module schema malformed  
- new field types added without support  

Fix:

- Inspect errors array  
- Update validator rules  
- Update schema-format  

---

## 4.2 Loader Fails  
Possible causes:

- FS path issues  
- Broken JSON  
- Missing schema.json  
- Incorrect type imports  

Fix:

- Check module dir structure  
- Validate imports  
- Run loader on single module  

---

## 4.3 Generator Fails  
Possible causes:

- validatedSchema is null  
- Unsupported field type added  
- Recursion broke due to malformed structure  

Fix:

- Inspect warnings  
- Check generator type behavior  
- Validate SchemaLike compatibility  

---

# 5. Future Expansion Slots  
Reserved for upcoming phases (3, 4, 5):

- Backend schema-serving API tests  
- Schema caching validation  
- UI auto-generation verification  
- Logging + metrics consistency checks  
- Multi-user permission impacts on config loading  

---

End of Document  
