#!/usr/bin/env bash
set -euo pipefail

# Initialise repo if not already initialised
if [ ! -d "/data/ipfs" ]; then
  echo "Initialising IPFS repo..."
  ipfs init
fi

# Apply custom config (overwrites defaults)
if [ -f "/data/ipfs/config" ]; then
  echo "Copying custom config..."
  cp /data/ipfs/config /data/ipfs/
fi

# Run the standard IPFS daemon with API exposed on all interfaces
exec ipfs daemon --enable-gc --migrate=true --api=/ip4/0.0.0.0/tcp/5001