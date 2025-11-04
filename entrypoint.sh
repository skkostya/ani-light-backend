#!/bin/sh
set -e

npx typeorm-ts-node-commonjs migration:run -d dist/database/data-source.js || {
  echo "❌ Migration failed!"
  exit 1
}

exec node dist/main.js

