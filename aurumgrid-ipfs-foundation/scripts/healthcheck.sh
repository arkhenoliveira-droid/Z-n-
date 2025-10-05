#!/usr/bin/env bash
set -euo pipefail

# 1️⃣ Verify the daemon is alive
echo "🔎 Checking IPFS daemon version…"
curl -s http://localhost:5001/api/v0/version | jq .

# 2️⃣ Add a test file, retrieve its CID, and fetch it back
TEST_FILE=$(mktemp)
echo "Hello from AurumGrid IPFS foundation $(date)" > "$TEST_FILE"

echo "📤 Adding test file..."
ADD_RES=$(curl -s -X POST -F file=@"$TEST_FILE" "http://localhost:5001/api/v0/add")
CID=$(echo "$ADD_RES" | jq -r .Hash)
echo "✅ Added CID: $CID"

echo "📥 Pulling file back…"
GET_RES=$(curl -s "http://localhost:5001/api/v0/cat?arg=$CID")
if diff -q "$TEST_FILE" <(echo "$GET_RES"); then
  echo "✅ Round‑trip succeeded"
else
  echo "❌ Round‑trip failed"
  exit 1
fi

# 3️⃣ Verify the node can reach at least one bootstrap peer
echo "🔗 Checking swarm peers…"
PEERS=$(curl -s "http://localhost:5001/api/v0/swarm/peers" | jq '.Peers | length')
if (( PEERS > 0 )); then
  echo "✅ Connected to $PEERS peers"
else
  echo "⚠️ No peers connected – may be a network issue"
fi

echo "🎉 All health checks passed!"