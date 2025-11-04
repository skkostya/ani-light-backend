#!/bin/sh
set -e

yarn typeorm:up || {
  echo "❌ Migration failed!"
  exit 1
}

exec node dist/main.js

