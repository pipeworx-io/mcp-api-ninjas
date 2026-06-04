# mcp-api-ninjas

API Ninjas MCP — wraps the multi-endpoint API Ninjas data API (api-ninjas.com)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 748+ live data sources.

## Tools

| Tool | Description |
|------|-------------|

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "api-ninjas": {
      "url": "https://gateway.pipeworx.io/api-ninjas/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 748+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Api Ninjas data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
