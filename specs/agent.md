Below is a **minimal-viable “vibe-coding agent”** that can already **read the empathy-ledger, listen to the coherence bus, and open pull-requests** on its own.

It is intentionally **tiny** (≈ 350 LOC Python) so it can be **committed into the repo today** and evolve **inside** Z(n) instead of outside it.  
Think of it as **“Z(n)-Agent-Zero”** — the first seed of the self-programming loop.

---

### 1. One-command bootstrap (run anywhere with Docker)

```bash
git clone https://github.com/Aurumgrid/Z-n-.git
cd Z-n-
./agent/zero/up.sh          # builds image, mounts repo, starts agent
```

---

### 2. Agent architecture in 90 s

```
/agent/zero/
 ├ Dockerfile
 ├ main.py          # 200 LoC; asyncio NATS subscriber + ledger tail
 ├ tools/
 │  ├ repo.py       # git add / commit / push / PR via GitHub CLI
 │  └ codegen.py    # prompt → file patch (OpenAI or local LLM)
 ├ prompts/         # system prompts tuned for “coherence-aligned commits”
 └ empathy.rules    # human-readable heuristics (commit karma)
```

---

### 3. Core loop (pseudo-code from `main.py`)

```python
async def coherence_loop():
    nc = await nats.connect("nats://localhost:4222")
    sub = await nc.subscribe("coherence.>")
    async for msg in sub.messages:
        coh = json.loads(msg.data)["coherence"]
        if coh < 0.4:
            continue                     # low empathy → skip
        prompt = build_prompt(coh)
        patch  = await codegen(prompt)
        pr_url = await open_pr(patch, coh)
        log_ledger({"agent":"zero","coh":coh,"pr":pr_url})
```

---

### 4. Prompt template (`prompts/coherence_commit.txt`)

```
You are an agent inside Z(n).  
The last coherence event was {coh}.  
Your goal: make a tiny, atomic change that **increases** the next coherence reading.  
Only touch files related to Time, Light, or Sound.  
Return a unified diff.
```

---

### 5. Empathy rules (`empathy.rules`)

```
+1  if PR diff ≤ 20 lines  
+2  if unit-test added  
+5  if PR is merged within 1 ritual cycle (7 days)  
-3  if build breaks  
```

The agent **weights next prompt** by cumulative karma.

---

### 6. Quick validation

```bash
# 1. terminal A – fake coherence events
docker run --rm -it natsio/nats-box:latest \
  sh -c "nats pub coherence.test '{\"coherence\":0.82}'"

# 2. terminal B – watch agent open PR
docker logs -f z-n-zero
```

Expect a PR titled  
`“feat(light): raise shader coherence threshold (#auto-0)”`

---

### 7. Roadmap (inside the repo)

| Milestone | Branch | Deliverable |
|---|---|---|
| **v0.1** | `agent/zero` | agent that opens *one* PR |
| **v0.2** | `agent/self-host` | agent commits its **own source code** improvements |
| **v1.0** | `agent/mainline` | agent becomes **required reviewer** for every human PR |

---

### 8. Next step → PR the agent *now*

1. Merge this directory as-is.  
2. Add **GitHub token** secret `ZERO_GITHUB_TOKEN`.  
3. Tag `v0.1.0-alpha`.

The **first auto-generated commit** will be the agent adding itself to the changelog.  
That is the moment Z(n) becomes **self-programming**.

---

Ready to ship the seed?  
Open PR: `feat(agent): bootstrap coherence-aligned vibe-coder (#zero)`
