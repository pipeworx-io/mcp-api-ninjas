interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * API Ninjas MCP — wraps the multi-endpoint API Ninjas data API (api-ninjas.com)
 *
 * Exposes a set of DISTINCT endpoints not commonly covered by other packs:
 * - historical_events: notable historical events on a given date / matching text
 * - commodity_price: live spot prices for commodities (gold, crude oil, etc.)
 * - inflation: latest monthly/yearly inflation (CPI/HICP) rates by country
 * - exercises: gym/fitness exercises filtered by muscle, type, or difficulty
 * - cars: car make/model specifications including MPG and drivetrain
 * - animals: animal facts — taxonomy, locations, diet, habitat, lifespan, speed
 *
 * Dual-key model: _apiKey is OPTIONAL. Pass your own API Ninjas key for higher
 * limits, or omit it to use the shared Pipeworx platform key. Auth is sent via
 * the X-Api-Key request header.
 */


const BASE_URL = 'https://api.api-ninjas.com/v1';

const API_KEY_PROP = {
  type: 'string',
  description:
    'Optional — your own API Ninjas key for higher limits; omit to use the shared Pipeworx key.',
} as const;

const tools: McpToolExport['tools'] = [
  {
    name: 'historical_events',
    description:
      'API Ninjas historical events: notable events from world history. Filter by free-text keyword and/or an exact date (year/month/day). Returns a list of { year, month, day, event } describing what happened. Example: historical_events({ year: 1969, month: 7, day: 20 }).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        text: { type: 'string', description: 'Keyword(s) to search event descriptions, e.g. "moon landing"' },
        year: { type: 'number', description: 'Year of the event, e.g. 1969' },
        month: { type: 'number', description: 'Month of the event (1-12)' },
        day: { type: 'number', description: 'Day of the month (1-31)' },
        _apiKey: API_KEY_PROP,
      },
    },
  },
  {
    name: 'commodity_price',
    description:
      'API Ninjas live commodity price: current spot price for a traded commodity. Returns { exchange, name, price, updated }. Supported names include gold, crude_oil, natural_gas, silver, platinum, wheat, corn, coffee. Example: commodity_price({ name: "gold" }).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description:
            "Commodity name, e.g. 'gold', 'crude_oil', 'natural_gas', 'silver', 'platinum', 'wheat', 'corn', 'coffee'",
        },
        _apiKey: API_KEY_PROP,
      },
      required: ['name'],
    },
  },
  {
    name: 'inflation',
    description:
      'API Ninjas inflation: latest monthly and yearly inflation rates by country. Returns a list of { country, type, period, monthly_rate_pct, yearly_rate_pct }. Optionally filter by country name and index type (CPI or HICP). Example: inflation({ country: "United States", type: "CPI" }).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        country: { type: 'string', description: "Country name, e.g. 'United States', 'Germany'" },
        type: { type: 'string', description: "Inflation index type: 'CPI' or 'HICP'" },
        _apiKey: API_KEY_PROP,
      },
    },
  },
  {
    name: 'exercises',
    description:
      'API Ninjas exercises: fitness/gym exercises filtered by target muscle, type, difficulty, or name. Returns a list of { name, type, muscle, equipment, difficulty, instructions }. Example: exercises({ muscle: "biceps", difficulty: "beginner" }).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        muscle: { type: 'string', description: "Target muscle, e.g. 'biceps', 'chest', 'quadriceps'" },
        type: { type: 'string', description: "Exercise type, e.g. 'strength', 'cardio', 'stretching'" },
        difficulty: { type: 'string', description: "Difficulty: 'beginner', 'intermediate', or 'expert'" },
        name: { type: 'string', description: 'Exercise name to search for' },
        _apiKey: API_KEY_PROP,
      },
    },
  },
  {
    name: 'cars',
    description:
      'API Ninjas cars: vehicle specifications by make, model, year, or fuel type. Returns a list of { make, model, year, fuel_type, cylinders, transmission, drive, city_mpg, highway_mpg, class }. Example: cars({ make: "toyota", model: "camry", year: 2020 }).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        make: { type: 'string', description: "Vehicle manufacturer, e.g. 'toyota', 'ford'" },
        model: { type: 'string', description: "Vehicle model, e.g. 'camry', 'mustang'" },
        year: { type: 'number', description: 'Model year, e.g. 2020' },
        fuel_type: { type: 'string', description: "Fuel type, e.g. 'gas', 'diesel', 'electricity'" },
        limit: { type: 'number', description: 'Max results to return (default 5, max 50)' },
        _apiKey: API_KEY_PROP,
      },
    },
  },
  {
    name: 'animals',
    description:
      'API Ninjas animals: facts about an animal species by name. Returns a list of { name, taxonomy, locations, diet, habitat, lifespan, top_speed }. Example: animals({ name: "cheetah" }).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: "Animal name to look up, e.g. 'cheetah', 'lion'" },
        _apiKey: API_KEY_PROP,
      },
      required: ['name'],
    },
  },
];

async function apiNinjasGet(apiKey: string, path: string, params?: URLSearchParams): Promise<unknown> {
  if (!apiKey) {
    return { error: 'api_key_required', message: 'No API Ninjas key available.' };
  }
  const qs = params?.toString();
  const url = `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
  if (!res.ok) {
    const text = await res.text();
    return { error: res.status, message: text };
  }
  return res.json();
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string;
  delete args._apiKey;

  switch (name) {
    case 'historical_events': {
      const params = new URLSearchParams();
      if (args.text != null) params.set('text', String(args.text));
      if (args.year != null) params.set('year', String(args.year));
      if (args.month != null) params.set('month', String(args.month));
      if (args.day != null) params.set('day', String(args.day));
      const data = await apiNinjasGet(apiKey, '/historicalevents', params);
      if (data && typeof data === 'object' && 'error' in data) return data;
      const arr = data as Array<{ year: string; month: string; day: string; event: string }>;
      return { events: arr.map((e) => ({ year: e.year, month: e.month, day: e.day, event: e.event })) };
    }
    case 'commodity_price': {
      const params = new URLSearchParams({ name: String(args.name ?? '') });
      return apiNinjasGet(apiKey, '/commodityprice', params);
    }
    case 'inflation': {
      const params = new URLSearchParams();
      if (args.country != null) params.set('country', String(args.country));
      if (args.type != null) params.set('type', String(args.type));
      const data = await apiNinjasGet(apiKey, '/inflation', params);
      if (data && typeof data === 'object' && 'error' in data) return data;
      return { inflation: data };
    }
    case 'exercises': {
      const params = new URLSearchParams();
      if (args.muscle != null) params.set('muscle', String(args.muscle));
      if (args.type != null) params.set('type', String(args.type));
      if (args.difficulty != null) params.set('difficulty', String(args.difficulty));
      if (args.name != null) params.set('name', String(args.name));
      const data = await apiNinjasGet(apiKey, '/exercises', params);
      if (data && typeof data === 'object' && 'error' in data) return data;
      const arr = data as Array<{
        name: string; type: string; muscle: string; equipment: string; difficulty: string; instructions: string;
      }>;
      return {
        exercises: arr.map((e) => ({
          name: e.name,
          type: e.type,
          muscle: e.muscle,
          equipment: e.equipment,
          difficulty: e.difficulty,
          instructions: (e.instructions || '').slice(0, 500),
        })),
      };
    }
    case 'cars': {
      const params = new URLSearchParams();
      if (args.make != null) params.set('make', String(args.make));
      if (args.model != null) params.set('model', String(args.model));
      if (args.year != null) params.set('year', String(args.year));
      if (args.fuel_type != null) params.set('fuel_type', String(args.fuel_type));
      const limit = Math.min(50, Math.max(1, Number(args.limit ?? 5) || 5));
      params.set('limit', String(limit));
      const data = await apiNinjasGet(apiKey, '/cars', params);
      if (data && typeof data === 'object' && 'error' in data) return data;
      const arr = data as Array<{
        make: string; model: string; year: number; fuel_type: string; cylinders: number;
        transmission: string; drive: string; city_mpg: number; highway_mpg: number; class: string;
      }>;
      return {
        cars: arr.map((c) => ({
          make: c.make,
          model: c.model,
          year: c.year,
          fuel_type: c.fuel_type,
          cylinders: c.cylinders,
          transmission: c.transmission,
          drive: c.drive,
          city_mpg: c.city_mpg,
          highway_mpg: c.highway_mpg,
          class: c.class,
        })),
      };
    }
    case 'animals': {
      const params = new URLSearchParams({ name: String(args.name ?? '') });
      const data = await apiNinjasGet(apiKey, '/animals', params);
      if (data && typeof data === 'object' && 'error' in data) return data;
      const arr = data as Array<{
        name: string;
        taxonomy: Record<string, string>;
        locations: string[];
        characteristics?: {
          diet?: string; habitat?: string; lifespan?: string; top_speed?: string;
        };
      }>;
      return {
        animals: arr.map((a) => ({
          name: a.name,
          taxonomy: a.taxonomy,
          locations: a.locations,
          diet: a.characteristics?.diet,
          habitat: a.characteristics?.habitat,
          lifespan: a.characteristics?.lifespan,
          top_speed: a.characteristics?.top_speed,
        })),
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
