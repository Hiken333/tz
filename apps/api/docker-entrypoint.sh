#!/bin/sh
set -e
bun src/db/migrate.ts
if [ "${SEED_ON_START:-false}" = "true" ]; then
	bun src/db/seed.ts
fi
exec bun src/index.ts
