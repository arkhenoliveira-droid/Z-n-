# AurumGrid – IPFS Foundation

A **production‑ready, self‑contained IPFS node** that can be spun up with a single
`docker compose up -d`. The repository also contains a GitHub Actions CI pipeline
that validates the node’s health on every push.

## Table of Contents

- [Features](#features)
- [Quick Start (local)](#quick-start-local)
- [CI / GitHub Actions](#ci--github-actions)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

| ✅ | Description |
|---|--------------|
| **Dockerised** | Runs on any platform that supports Docker. |
| **Custom config** | Pre‑seeded `ipfs-config.json` (CORS, bootstrap, gateway). |
| **Health‑check script** | Adds a test file, reads it back, and validates swarm peers. |
| **CI** | GitHub Action builds the image, starts the stack, runs health checks. |
| **Extensible** | Add more services (e.g., pinning, monitoring) via `docker‑compose`. |

---

## Quick Start (local)

```bash
# 1️⃣ Clone the repo
git clone git@github.com:<your‑org>/aurumgrid-ipfs-foundation.git
cd aurumgrid-ipfs-foundation

# 2️⃣ (Optional) Create a .env file if you need custom vars
cp .env.example .env
# Edit .env if you added secrets

# 3️⃣ Build and start the stack
docker compose up -d

# 4️⃣ Verify it works
curl -s http://localhost:5001/api/v0/version | jq .
```

The IPFS HTTP API is reachable at `http://localhost:5001` and the public gateway
at `http://localhost:8080/ipfs/<CID>`.

---

## CI / GitHub Actions

The workflow lives in `.github/workflows/ci.yml`. On every push to `main` it:

1. Builds the custom Docker image.
2. Starts the stack with `docker compose`.
3. Waits for the API to become healthy.
4. Executes `scripts/healthcheck.sh`.
5. Tears the stack down.

A status badge can be added to this README:

```markdown
![CI](https://github.com/<org>/aurumgrid-ipfs-foundation/actions/workflows/ci.yml/badge.svg)
```

---

## Configuration

- **`config/ipfs-config.json`** – edit to change CORS, bootstrap peers, ports, etc.
- **`docker-compose.yml`** – add more services (e.g., `ipfs-cluster`, Prometheus).
- **Environment variables** – listed in `.env.example`. Add more as needed.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| API never responds | Container failed to start (see `docker logs ipfs-foundation`) | Ensure ports 5001/8080 are free, check `.env` for malformed values. |
| No peers after start | Outbound network blocked (cloud provider firewall) | Open outbound TCP 4001, 4002, 4003 or enable NAT traversal. |
| CI fails on health check | Race condition – API not ready | Increase the wait loop in `ci.yml` (`for i in {1..20}`) or add `--timeout` flag. |

---

## License

This scaffold is released under the **MIT License**. See `LICENSE` for details.