# AurumGrid – IPFS + Arweave Demo

This repository demonstrates a hybrid storage workflow where data is first added to IPFS, and its resulting Content Identifier (CID) is then permanently archived on the Arweave permaweb.

It includes a self-contained IPFS node and a Python script to handle the Arweave transaction, all orchestrated by a GitHub Actions CI pipeline.

## Features

- **Hybrid Storage:** Combines the strengths of IPFS (fast, content-addressed distribution) and Arweave (permanent, immutable storage).
- **Dockerised IPFS Node:** The same robust IPFS setup from the `ipfs-foundation` repo.
- **Python Arweave Client:** A simple, reusable script (`src/arweave_client.py`) for sending data to Arweave.
- **Automated CI/CD:** A GitHub Action that:
  1. Starts an IPFS node.
  2. Adds a test file to get a CID.
  3. Uses a Python script to post the CID to Arweave, using a wallet from GitHub Secrets.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.8+
- An Arweave wallet file (JSON) with some AR tokens for transaction fees.

### Local Setup

1.  **Clone the repo:**
    ```bash
    git clone git@github.com:<your-org>/aurumgrid-ipfs-arweave-demo.git
    cd aurumgrid-ipfs-arweave-demo
    ```
2.  **Set up environment variables:**
    ```bash
    cp .env.example .env
    ```
    Open `.env` and replace the placeholder with your actual Arweave wallet JSON content.
3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run the full workflow:**
    ```bash
    # Start the IPFS node in the background
    docker compose up -d

    # Run the archival script
    # This script will add a file to IPFS and post its CID to Arweave
    chmod +x ./scripts/archive-to-arweave.sh
    ./scripts/archive-to-arweave.sh
    ```

## CI / GitHub Actions

The workflow in `.github/workflows/ci.yml` automates the entire process. To make it work in your fork/repo, you must add your Arweave wallet JSON as a repository secret:

1.  Go to your repository's **Settings > Secrets and variables > Actions**.
2.  Click **New repository secret**.
3.  Name the secret `ARWEAVE_WALLET`.
4.  Paste the entire content of your Arweave wallet JSON file into the value field.

The CI will now run on every push, providing a live demonstration of the hybrid storage pattern.

## License

This scaffold is released under the **MIT License**. See `LICENSE` for details.