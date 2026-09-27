"""
TinyKit API Client — PocketBase-only mode
Creates projects directly in PocketBase, generates code via OpenCode.
No separate frontend app required.
"""

import httpx
import uuid
from typing import Optional


class TinyKitClient:
    def __init__(self, base_url: str = "http://localhost:5173", pb_url: str = "http://localhost:8091", email: str = None, password: str = None):
        self.pb_url = pb_url.rstrip("/")
        self.email = email
        self.password = password
        self.token: Optional[str] = None
        self.client = httpx.Client(timeout=httpx.Timeout(10.0, read=600.0))

    def authenticate(self) -> bool:
        if self.token:
            return True
        if not self.email or not self.password:
            raise ValueError("Email and password required for authentication")

        resp = self.client.post(
            f"{self.pb_url}/api/collections/_superusers/auth-with-password",
            json={"identity": self.email, "password": self.password}
        )
        if resp.status_code == 200:
            self.token = resp.json().get("token")
            return True
        raise RuntimeError(f"Auth failed: {resp.status_code} {resp.text}")

    def _headers(self) -> dict:
        self.authenticate()
        return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}

    def create_project(self, name: str, domain: str = None) -> dict:
        if not domain:
            domain = f"agent-{uuid.uuid4().hex[:8]}.local"

        # Create directly in PocketBase _tk_projects collection
        resp = self.client.post(
            f"{self.pb_url}/api/collections/_tk_projects/records",
            headers=self._headers(),
            json={
                "name": name,
                "domain": domain,
                "kit": "custom",
                "frontend_code": "",
            }
        )
        if resp.status_code == 200:
            return resp.json()
        raise RuntimeError(f"Create project failed: {resp.status_code} {resp.text}")

    def _write_code_to_project(self, project_id: str, code: str) -> bool:
        try:
            resp = self.client.patch(
                f"{self.pb_url}/api/collections/_tk_projects/records/{project_id}",
                headers=self._headers(),
                json={"frontend_code": code}
            )
            return resp.status_code == 200
        except Exception as e:
            print(f"[TINYKIT] Warning: failed to write code to project: {e}")
            return False

    def generate_code(self, name: str, prompt: str, domain: str = None, timeout: float = 1200.0) -> dict:
        from backend.opencode_client import OpenCodeClient

        project = self.create_project(name=name, domain=domain)
        project_id = project["id"]
        print(f"[TINYKIT] Created project {project_id}")

        from backend.agents import DEVELOPER_SYS
        opencode = OpenCodeClient()
        code = opencode.chat(prompt, system_prompt=DEVELOPER_SYS, title="tinykit-dev", agent_role="developer")

        if not code or not code.strip():
            raise RuntimeError("OpenCode returned empty code")

        code = code.strip()
        if code.startswith("```html"):
            code = code[7:]
        elif code.startswith("```"):
            code = code[3:]
        if code.endswith("```"):
            code = code[:-3]
        code = code.strip()

        self._write_code_to_project(project_id, code)
        print(f"[TINYKIT] Stored {len(code)} chars in project {project_id}")

        self.cleanup_old_projects(keep_last=10)

        return {
            "code": code,
            "project_id": project_id,
            "tool_calls": [],
            "usage": {}
        }

    def cleanup_old_projects(self, keep_last: int = 10):
        try:
            self.authenticate()
            resp = self.client.get(
                f"{self.pb_url}/api/collections/_tk_projects/records",
                headers=self._headers(),
                params={"sort": "-created", "perPage": 100}
            )
            if resp.status_code != 200:
                return
            records = resp.json().get("items", [])
            if len(records) <= keep_last:
                return
            to_delete = records[keep_last:]
            for rec in to_delete:
                self.client.delete(
                    f"{self.pb_url}/api/collections/_tk_projects/records/{rec['id']}",
                    headers=self._headers()
                )
            print(f"[TINYKIT] Cleaned up {len(to_delete)} old projects")
        except Exception as e:
            print(f"[TINYKIT] Cleanup failed: {e}")

    def close(self):
        self.client.close()
