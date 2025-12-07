# Main Brain Development Workflow — Quick Cheatsheet

## 1. Before Starting Any Task
```
git checkout main
git pull
git checkout -b phase<Phase>-task<Task>-<short-name>
```
Tell Main Brain: **“Task X branch created and repo clean.”**

---

## 2. Start a New Task Chat
Use the Standard Intro Prompt:

“You are my coding assistant for Phase <N> → Task <M>…”

---

## 3. Design Phase
- Ask Task Chat for a high-level design.
- Bring design to Main Brain for approval.
- After approval: “Proceed to Step 1.”

---

## 4. Implementation Loop
For each step:
1. Tell Task Chat: “Do Step N, stop and wait.”
2. Paste code locally.
3. If TypeScript errors → **Main Brain first**.
4. Approve and continue.

---

## 5. Completion Summary
Ask Task Chat for:
- File list
- Behavior summary
- TODOs
- Confirmation of completion

Bring to Main Brain for approval.

---

## 6. Git → PR Workflow
```
git add .
git commit -m "feat(<area>): <message>"
git push -u origin <branch>
```

Open PR → Add labels/milestone → Tell Main Brain → Merge.

---

## 7. Finish
```
git checkout main
git pull
```

Tell Main Brain: **“Task X merged.”**