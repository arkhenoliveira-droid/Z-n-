import time
import random

class Client:
    """
    A mock client to simulate interacting with the Lattica P2P network.
    """
    def __init__(self):
        print("[LATTICA] Client initialized. Ready to connect to network.")
        self._is_connected = True

    def post(self, endpoint, json=None):
        """
        Simulates sending a POST request to a service endpoint on the network.
        """
        if not self._is_connected:
            return {"error": "Not connected to Lattica network."}

        print(f"[LATTICA] ==> Routing request to endpoint: {endpoint}")
        print(f"[LATTICA] ==> Payload: {json}")

        # Simulate network latency
        time.sleep(random.uniform(0.1, 0.3))

        # Return a canned response based on the prompt
        prompt = json.get("prompt", "")
        if "quantum tunneling" in prompt.lower():
            completion = "Quantum tunneling is a phenomenon where a particle passes through a potential energy barrier higher than its kinetic energy, which is impossible in classical mechanics."
        else:
            completion = "This is a generic, simulated response from the Orion LLM."

        print(f"[LATTICA] <== Response received from peer.")
        return {"completion": completion}