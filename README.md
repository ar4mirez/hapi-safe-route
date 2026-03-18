# hapi-safe-route

[![npm version](https://img.shields.io/npm/v/@ar4mirez/hapi-safe-route.svg)](https://www.npmjs.com/package/@ar4mirez/hapi-safe-route)
[![CI](https://github.com/ar4mirez/hapi-safe-route/actions/workflows/ci.yml/badge.svg)](https://github.com/ar4mirez/hapi-safe-route/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Register routes in a safer way, avoiding server crash on duplicate routes.

## Requirements

- Node.js >= 18
- `@hapi/hapi` ^21

## Installation

```bash
npm install @ar4mirez/hapi-safe-route
```

## Usage

```js
const Hapi = require('@hapi/hapi');

const init = async () => {
  const server = new Hapi.Server({ host: 'localhost', port: 3000 });

  await server.register(require('@ar4mirez/hapi-safe-route'));
  await server.initialize();

  const { safeRoute } = server.plugins['@ar4mirez/hapi-safe-route'];

  // Register routes safely — no crash on duplicates
  const registered = await safeRoute([
    {
      method: 'GET',
      path: '/hello',
      handler: (request, h) => h.response({ hello: 'world' })
    },
    {
      method: 'POST',
      path: '/echo',
      handler: (request, h) => h.response(request.payload)
    }
  ]);

  console.log(`Registered ${registered.length} new routes`);

  // Calling safeRoute again with the same routes silently skips them
  // and returns an empty array instead of throwing
  const duplicates = await safeRoute([
    { method: 'GET', path: '/hello', handler: (request, h) => h.response('duplicate') }
  ]);
  console.log(duplicates.length); // 0

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();
```

## API

### `safeRoute(routes)`

Asynchronous function exposed via `server.plugins['@ar4mirez/hapi-safe-route'].safeRoute`.

| Parameter | Type  | Description                                    |
|-----------|-------|------------------------------------------------|
| `routes`  | array | Array of hapi route configuration objects      |

**Returns:** `Promise<Array>` — array of newly registered route objects. Returns an empty array if all provided routes already exist (no duplicates throw).

**Behavior:**
- Checks all existing server routes before attempting registration
- Silently skips any route whose `method + path` combination already exists
- Only registers and returns routes that are genuinely new
- Never throws due to duplicate route registration

## License

ISC © [Angel Ramirez](https://github.com/ar4mirez)
