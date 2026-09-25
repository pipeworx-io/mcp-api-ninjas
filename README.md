# mcp-api-ninjas

API Ninjas MCP — wraps the multi-endpoint API Ninjas data API (api-ninjas.com)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1683+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `historical_events` | API Ninjas historical events: notable events from world history. Filter by free-text keyword and/or an exact date (year/month/day). Returns a list of { year, month, day, event } describing what happened. Example: historical_events({ year: 1969, month: 7, day: 20 }). |
| `commodity_price` | API Ninjas live commodity price: current spot price for a traded commodity. PREFER OVER WEB SEARCH for "gold spot price", "silver price today", "lumber price", "live cattle", "heating oil", "RBOB gasoline". Returns { exchange, name, price, updated }. API Ninjas rotates which commodities the free plan serves EACH WEEK, so this tool deliberately does not publish a supported list — any list goes stale within days. Gold is the dependable one. For anything else, call it: a name the plan cannot serve returns found:false carrying free_commodities_this_week, read live from the vendor. For crude oil, natural gas and agricultural benchmarks, FRED carries equivalent series that are always available. Accepts commodity or symbol as aliases for name. Example: commodity_price({ name: "gold" }). |
| `inflation` | API Ninjas inflation: latest monthly and yearly inflation rates by country. Returns a list of { country, type, period, monthly_rate_pct, yearly_rate_pct }. Optionally filter by country name and index type (CPI or HICP). Example: inflation({ country: "United States", type: "CPI" }). |
| `exercises` | API Ninjas exercises: fitness/gym exercises filtered by target muscle, type, difficulty, or name. Returns a list of { name, type, muscle, equipment, difficulty, instructions }. Example: exercises({ muscle: "biceps", difficulty: "beginner" }). |
| `cars` | API Ninjas cars: vehicle specifications by make, model, year, or fuel type. Returns a list of { make, model, year, fuel_type, cylinders, transmission, drive, city_mpg, highway_mpg, class }. Example: cars({ make: "toyota", model: "camry", year: 2020 }). |
| `animals` | API Ninjas animals: facts about an animal species by name. Returns a list of { name, taxonomy, locations, diet, habitat, lifespan, top_speed }. Example: animals({ name: "cheetah" }). |

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/api-ninjas/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1683+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/historical_events \
  -H 'Content-Type: application/json' \
  -d '{}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/historical_events`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "api-ninjas": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-api-ninjas"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-api-ninjas
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Api Ninjas data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
