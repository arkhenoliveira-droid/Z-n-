import argparse
import os
import sys
from arweave.wallet import Wallet
from arweave.transaction import Transaction

def main():
    parser = argparse.ArgumentParser(description="Archive an IPFS CID to Arweave.")
    parser.add_argument("--wallet-file", required=True, help="Path to the Arweave wallet JSON file.")
    parser.add_argument("--cid", required=True, help="The IPFS CID to archive.")
    args = parser.parse_args()

    try:
        # 1. Load wallet
        wallet = Wallet(args.wallet_file)
        print(f"   - Wallet loaded. Address: {wallet.address}")

        # 2. Create a transaction with the CID as data
        tx = Transaction(wallet, data=args.cid.encode('utf-8'))

        # 3. Add tags for discoverability
        tx.add_tag('Content-Type', 'text/plain')
        tx.add_tag('App-Name', 'AurumGrid-IPFS-Arweave-Demo')
        tx.add_tag('IPFS-CID', args.cid)

        # 4. Sign and send the transaction
        tx.sign()
        print("   - Transaction signed.")
        tx.send()
        print(f"   - ✅ Transaction sent! TX ID: {tx.id}")
        print(f"   - View on Viewblock: https://viewblock.io/arweave/tx/{tx.id}")

    except Exception as e:
        print(f"   - ❌ An error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()