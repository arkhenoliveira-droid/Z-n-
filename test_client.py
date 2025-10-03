import requests
import json
import subprocess
import time
import sys
import os

def main():
    """
    An end-to-end test client for the lattica-tool-server.
    1. Starts the server in the background.
    2. Sends a code execution request.
    3. Validates the response.
    4. Shuts down the server.
    """
    server_executable = os.path.join(os.path.dirname(__file__), "lattica-tool-server/target/release/lattica-tool-server")
    if not os.path.exists(server_executable):
        print(f"Error: Server executable not found at '{server_executable}'")
        print("Please run 'cargo build --release' first.")
        sys.exit(1)

    print("--- Starting Lattica Tool Server for testing ---")
    # Start the server as a background process
    server_process = subprocess.Popen([server_executable], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Give the server a moment to start
    time.sleep(3)

    print("--- Server started. Sending RPC request... ---")

    rpc_url = "http://127.0.0.1:8080/rpc"
    payload = {
      "jsonrpc": "2.0",
      "method": "execute_code",
      "params": {
        "language": "rust",
        "code": 'fn main() { println!("hello from wasm"); }',
        "max_fuel": 1_000_000,
        "max_memory": 16 * 1024 * 1024,
        "timeout_ms": 2000
      },
      "id": 1
    }

    try:
        response = requests.post(rpc_url, json=payload, timeout=10)

        print(f"Response Status Code: {response.status_code}")
        response_data = response.json()
        print("Response JSON:")
        print(json.dumps(response_data, indent=2))

        # --- Validation ---
        assert response.status_code == 200
        assert "result" in response_data
        result = response_data["result"]
        assert result["stdout"] == "hello from wasm\n"
        assert result["stderr"] == ""
        assert result["exit_code"] == 0
        assert not result["timed_out"]
        assert result["fuel_used"] is not None

        print("\n--- ✅ End-to-End Test PASSED ---")

    except Exception as e:
        print(f"\n--- ❌ End-to-End Test FAILED ---")
        print(f"An error occurred: {e}")
        sys.exit(1)

    finally:
        print("\n--- Shutting down server ---")
        server_process.terminate()
        server_process.wait()
        print("Server shut down.")

if __name__ == "__main__":
    main()