# GameWeenies Configuration Dashboard
## Development Workflow — “Main Brain Driven Development”

This document describes the **mandatory workflow** for developing every Task in every Phase of the project.  
It ensures:

- Clean architecture  
- Consistent project structure  
- Minimal technical debt  
- Predictable Git history  
- Synchronization between you, Main Brain, and Task Chats

---

## 1. Preparation for Every Task
Before starting any new task:

### 1.1 — Ensure you are on `main` and clean
```
git status
git checkout main
git pull origin main
```

### 1.2 — Create the feature branch
Use the naming convention:

```
phase<PhaseNumber>-task<TaskNumber>-<short-name>
```

Example:
```
git checkout -b phase2-task4-default-config-generator
```

### 1.3 — Notify Main Brain
Tell Main Brain:

**“Task X branch created and repo clean.”**

---

## 2. Task Chat Structure
Each task gets its own chat:

```
Phase N – Task M – <Task Name>
```

The first message you send in a Task Chat must be:

```
You are my coding assistant for:

Phase <N> → Task <M>: <Task Name>.

Context:
- Main Brain coordinates the entire architecture.
- This chat implements ONLY this task.
- All code must be ready-to-paste and fully commented.
- Work must proceed in small, linear steps.
- You must stop after each step and wait for my approval.
- You may not touch files outside the directories I specify.

Do you understand these constraints?
```

After confirmation, provide the task-specific requirements.

---

## 3. Design First
Before writing any code:

### 3.1 — Ask for a high-level design

### 3.2 — Bring design to Main Brain for approval

### 3.3 — Once approved, proceed with Step 1

---

## 4. Implementation Loop

For every code step:

1. You instruct the Task Chat:  
   “Proceed to Step N… stop after generating the file.”

2. Task Chat generates code  
3. You paste code locally  
4. Check for TypeScript errors  
5. If ANY errors → tell Main Brain  
6. Approve → move to next step

---

## 5. Completion Summary

Ask Task Chat for:

1. Files created/modified  
2. Purpose of each file  
3. Summary of behavior  
4. TODOs  
5. Confirmation task is complete  

Bring summary to Main Brain for final approval.

---

## 6. Git → PR → Labels → Milestone

After Main Brain approves:

```
git add .
git commit -m "feat(<area>): <description>"
git push -u origin <branch>
```

Open PR, add labels & milestone, notify Main Brain.

---

## 7. Merge and Move On
After merge:

```
git checkout main
git pull
```

Tell Main Brain:  
**“Task X merged.”**

---

## 8. Global Rules

- Never write code in Main Brain  
- Never skip design → approval  
- Always linear steps  
- All code must be fully commented  
- Never modify files outside allowed scope  
- Main Brain resolves architectural/TS issues  
