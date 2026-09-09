# ReVive MCP

The project context MCP is registered in `.vscode/mcp.json` and implemented in `mcp/server.py`.

It uses the official Python MCP SDK documented at https://github.com/modelcontextprotocol/python-sdk and https://py.sdk.modelcontextprotocol.io/.

The MCP stores only project progress in `mcp/state.json`. Never store API keys, passwords, refresh tokens, or platform credentials in project files or MCP state.
