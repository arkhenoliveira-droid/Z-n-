#!/usr/bin/env bash
set -euo pipefail

echo "📦 Starting IPFS to Arweave archival process..."

# 1. Add a file to IPFS to get a CID
echo "   - Adding a test file to IPFS..."
TEST_FILE=$(mktemp)
echo "AurumGrid hybrid storage demo - $(date)" > "$TEST_FILE"
ADD_RES=$(curl -s -X POST -F file=@"$TEST_FILE" "http://localhost:5001/api/v0/add")
CID=$(echo "$ADD_RES" | jq -r .Hash)
echo "   - ✅ IPFS CID created: $CID"

# 2. Check for Arweave wallet
if [ -z "${ARWEAVE_WALLET}" ]; then
  echo "   - ❌ ERROR: ARWEAVE_WALLET environment variable is not set."
  echo "   - Skipping archival step."
  exit 1
fi

# 3. Write the wallet key to a temporary file
echo "   - Preparing Arweave wallet..."
WALLET_FILE=$(mktemp)
echo "${ARWEAVE_WALLET}" > "$WALLET_FILE"

# 4. Call the Python client to archive the CID
echo "   - Archiving CID to Arweave via Python client..."
python3 src/arweave_client.py \
  --wallet-file "$WALLET_FILE" \
  --cid "$CID"

# 5. Clean up temporary files
rm "$TEST_FILE"
rm "$WALLET_FILE"

echo "✅ Archival process complete."