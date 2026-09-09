from datetime import datetime, timezone
import json
from pathlib import Path

from mcp.server import MCPServer


PROJECT_ROOT = Path(__file__).resolve().parents[1]
STATE_PATH = Path(__file__).resolve().parent / "state.json"
DOC_NAMES = ["README.md", "PRD.md", "Architecture.md", "Design.md", "Phase.md", "Rules.md", "api.md", "memory.md"]

mcp = MCPServer("revive-project-context")


def _read_state() -> dict:
    if not STATE_PATH.exists():
        return {"updated_at": None, "summary": "", "next_step": ""}
    return json.loads(STATE_PATH.read_text(encoding="utf-8"))


@mcp.tool()
def project_status() -> str:
    """Return the current ReVive phase, useful project files, and saved continuation checkpoint."""
    state = _read_state()
    existing_docs = [name for name in DOC_NAMES if (PROJECT_ROOT / name).exists()]
    return json.dumps({
        "project": "ReVive",
        "root": str(PROJECT_ROOT),
        "phase": "Phase 2 Collector MVP, beginning Phase 3 AI and pricing intelligence",
        "documents": existing_docs,
        "checkpoint": state,
    }, indent=2)


@mcp.tool()
def read_project_document(name: str) -> str:
    """Read one approved project document by name, such as Phase.md or PRD.md."""
    if name not in DOC_NAMES:
        raise ValueError(f"Document is not in the approved list: {name}")
    path = PROJECT_ROOT / name
    if not path.exists():
        raise FileNotFoundError(name)
    return path.read_text(encoding="utf-8")


@mcp.tool()
def save_checkpoint(summary: str, next_step: str) -> str:
    """Save non-secret project progress so another MCP client can continue the work."""
    STATE_PATH.write_text(json.dumps({
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "summary": summary,
        "next_step": next_step,
    }, indent=2), encoding="utf-8")
    return "Project checkpoint saved. Do not store API keys, passwords, or platform tokens here."


@mcp.resource("revive://phase")
def phase_resource() -> str:
    """Expose the current ReVive development phase as a readable resource."""
    return project_status()


if __name__ == "__main__":
    mcp.run()
