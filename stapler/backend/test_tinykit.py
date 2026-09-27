import sys
sys.path.insert(0, ".")

from dotenv import load_dotenv
load_dotenv()

from backend.tinykit_client import TinyKitClient

client = TinyKitClient(
    pb_url="http://localhost:8091",
    email="wassimselama@gmail.com",
    password="waselkoz2007"
)
auth = client.authenticate()
print(f"Auth: {auth}")

project = client.create_project(name="test-redesign", domain="test.local")
pid = project.get("id", "NO ID")
print(f"Project ID: {pid}")

code = client.generate_code(name="test-redesign", prompt="Create a simple hello world HTML page")
print(f"Code generated: {len(code.get('code', ''))} chars")
print(f"Code preview: {code.get('code', '')[:300]}")

client.close()
print("TinyKit test passed")
