#!/usr/bin/env bash
set -euo pipefail

if [ ! -d "/data/ipfs" ]; then
  echo "Initialising IPFS repo..."
  ipfs init
fi

if [ -f "/data/ipfs/config" ]; then
  echo "Applying custom config..."
  cp /data/ipfs/config /data/ipfs/
fi

exec ipfs daemon --enable-gc --api=/ip4/0.0.0.0/tcp/5001