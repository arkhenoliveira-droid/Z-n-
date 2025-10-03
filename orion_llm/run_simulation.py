import subprocess
import sys
import os

# Add the project directory to the Python path to allow importing 'lattica'
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from lattica_client import lattica

def main():
    """
    Orchestrates the full simulation of registering, serving, and querying the Orion LLM.
    """
    print("--- STARTING ORION LLM DEPLOYMENT SIMULATION ---")
    print("-" * 50)

    # --- Step 1: Register the model with the mock Parallax tool ---
    print("\n[SIMULATION] Step 1: Registering the model manifest...")
    manifest_path = os.path.join(project_root, "orion-13b.json")
    register_script = os.path.join(project_root, "parallax", "register")

    try:
        subprocess.run([register_script, "--manifest", manifest_path], check=True)
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"[SIMULATION] Error during registration step: {e}")
        sys.exit(1)

    print("-" * 50)

    # --- Step 2: Serve the model with the mock Parallax tool ---
    print("\n[SIMULATION] Step 2: Serving the model...")
    serve_script = os.path.join(project_root, "parallax", "serve")
    model_name = "orion-13b"

    try:
        # We run this in the background for a real scenario, but here we just run it
        subprocess.run([serve_script, "--model", model_name], check=True)
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"[SIMULATION] Error during serving step: {e}")
        sys.exit(1)

    print("-" * 50)

    # --- Step 3: Use the Lattica client to query the served model ---
    print("\n[SIMULATION] Step 3: Querying the model via Lattica client...")

    # Initialize the client
    client = lattica.Client()

    # Send a request
    response = client.post(
        f"/{model_name}/v1/chat",
        json={"prompt": "Explain quantum tunneling in two sentences."}
    )

    print("\n[SIMULATION] Final response from Orion LLM:")
    print(f'>>> {response.get("completion", "No completion found.")}')

    print("-" * 50)
    print("--- SIMULATION COMPLETE ---")

if __name__ == "__main__":
    main()