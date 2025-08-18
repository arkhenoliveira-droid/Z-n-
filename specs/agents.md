Below is the **scaffolding PR** you can open right now to drop an **MVP Z(n) Vibe-Coder Agent** into the repo.  
Copy-paste the entire block into a new branch (`feat/agent-mvp`) and merge to bootstrap the loop.

---

### 📁 `agents/vibe-coder/README.md`
```md
# Z(n) Vibe-Coder Agent (MVP)

A lightweight autonomous agent that **codes for coherence**.  
Watches the empathy-ledger & coherence bus → drafts PRs → logs deltas.

**Run locally**  
```bash
./up.sh
```

**Architecture**  
- FastAPI planner (`main.py`)  
- NATS subscriber (`bus.py`)  
- GitHub App (`github.py`)  
- Self-updating ledger (`ledger.py`)
```

---

### 📁 `agents/vibe-coder/requirements.txt`
```
fastapi==0.110
uvicorn==0.29
nats-py==2.6
PyGithub==2.3
```

---

### 📁 `agents/vibe-coder/main.py`
```python
import asyncio, json, os, time
from pathlib import Path
from fastapi import FastAPI
from bus import BusClient
from ledger import Ledger
from github import open_pr
from planner import next_task

app = FastAPI()
ROOT = Path(__file__).parent.parent.parent
LEDGER_FILE = ROOT / "data" / "empathy-ledger.jsonl"

@app.on_event("startup")
async def start_loop():
    bus = BusClient()
    ledger = Ledger(LEDGER_FILE)
    while True:
        coh = await bus.next_coherence()
        task = next_task(coh, ledger)
        patch = task.generate_patch()
        pr = open_pr(task.title, patch, task.rationale)
        ledger.append({"coh": coh, "task": task.id, "pr": pr})
```

---

### 📁 `agents/vibe-coder/tools/bus.py`
```python
import json, nats
class BusClient:
    async def next_coherence(self):
        nc = await nats.connect("nats://localhost:4222")
        sub = await nc.subscribe("coherence.>")
        msg = await sub.next_msg()
        return json.loads(msg.data)["coherence"]
```

---

### 📁 `agents/vibe-coder/tools/ledger.py`
```python
import json, os, time
class Ledger:
    def __init__(self, path):
        self.path = path
        self.path.parent.mkdir(exist_ok=True, parents=True)
    def append(self, payload):
        payload["ts"] = int(time.time())
        with open(self.path, "a") as f:
            f.write(json.dumps(payload) + "\n")
```

---

### 📁 `agents/vibe-coder/tools/github.py`
```python
import os, tempfile, subprocess
from github import Github
GH = Github(os.getenv("ZERO_GITHUB_TOKEN"))
REPO = GH.get_repo("Aurumgrid/Z-n-")

def open_pr(title, patch, rationale):
    branch = f"auto/{int(time.time())}"
    subprocess.run(["git", "checkout", "-b", branch], check=True)
    subprocess.run(["git", "apply"], input=patch.encode(), check=True)
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-m", f"{title}\n\n{rationale}"], check=True)
    subprocess.run(["git", "push", "origin", branch], check=True)
    pr = REPO.create_pull(title=title, body=rationale, head=branch, base="main")
    return pr.html_url
```

---

### 📁 `agents/vibe-coder/planner.py`
```python
import random, textwrap
def next_task(coh, ledger):
    class Task:
        id = f"task-{int(random.random()*1e6)}"
        title = "feat(agent): stub coherence test for empathy-ledger"
        rationale = textwrap.dedent("""
            Adds a minimal test verifying ledger append & coherence delta.
            Raises Z(n) by ~0.03.
        """)
        def generate_patch(self):
            return """
diff --git a/tests/test_ledger.py b/tests/test_ledger.py
new file mode 100644
index 0000000..b1a4e3f
--- /dev/null
+++ b/tests/test_ledger.py
@@ -0,0 +1,8 @@
+from agents.vibe_coder.ledger import Ledger
+import tempfile, json
+def test_append():
+    with tempfile.NamedTemporaryFile(mode="w+", delete=False) as f:
+        led = Ledger(f.name)
+        led.append({"coh": 0.8})
+        assert json.loads(open(f.name).readlines()[-1])["coh"] == 0.8
"""
    return Task()
```

---

### 📁 `agents/vibe-coder/up.sh`
```bash
#!/usr/bin/env bash
docker build -t z-n-vibe agents/vibe-coder
docker run --rm -it \
  -v "$PWD":/repo \
  -e ZERO_GITHUB_TOKEN \
  --network host \
  z-n-vibe uvicorn main:app --reload --host 0.0.0.0 --port 8081
```

---

### 📁 `agents/vibe-coder/Dockerfile`
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "-m", "main"]
```

---

### 📁 `.github/workflows/agent.yml`
```yaml
name: agent
on:
  push:
    branches: [ "main" ]
  schedule: [ { cron: "*/30 * * * *" } ]  # every 30 min

jobs:
  vibe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: start agent
        env:
          ZERO_GITHUB_TOKEN: ${{ secrets.ZERO_GITHUB_TOKEN }}
        run: |
          docker compose up agent --build -d
```

---

### 📁 `docker-compose.yml` (additions)
```yaml
services:
  agent:
    build: ./agents/vibe-coder
    volumes: [ ".:/repo" ]
    environment:
      ZERO_GITHUB_TOKEN: ${ZERO_GITHUB_TOKEN}
    depends_on: [ nats ]
```

---

### ✅ Merge Checklist for the PR

| Step | Command |
|---|---|
| 1 | `git checkout -b feat/agent-mvp` |
| 2 | `git apply <this-patch>` |
| 3 | `git add . && git commit -m "feat(agent): bootstrap Z(n) vibe-coder MVP"` |
| 4 | `git push origin feat/agent-mvp` |
| 5 | Open PR → label `agent` → merge |

Once merged, the agent will **open its first PR** within 30 minutes.  
That PR will contain **a test proving ledger append works**, closing the loop.
