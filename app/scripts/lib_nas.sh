#!/bin/bash
# lib_nas.sh - Shared logic for eeti-nas scripts

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
# Preserve environment variables before sourcing config.env
ENV_DB_URL="$DATABASE_URL"
ENV_MOUNT_POINT="$MOUNT_POINT"

source "$SCRIPT_DIR/config.env"

# Resolve paths (Environment takes precedence)
if [ -n "$ENV_DB_URL" ]; then
    # Convert sqlite:////path to /path
    DB_PATH=$(echo "$ENV_DB_URL" | sed 's|^sqlite:///||')
else
    DB_PATH="${DB_PATH:-$SCRIPT_DIR/$DB_RELATIVE_PATH}"
fi

MOUNT_POINT="${ENV_MOUNT_POINT:-$MOUNT_POINT}"
MOUNT_POINT="${MOUNT_POINT:-/mnt/Drive1}"
THUMB_PATH="${THUMB_PATH:-$SCRIPT_DIR/$THUMB_DIR}"

# Ensure directories exist
mkdir -p "$(dirname "$DB_PATH")"
mkdir -p "$THUMB_PATH"

# Initialize DB if not exists
sqlite3 "$DB_PATH" <<EOF
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE,
    parent_path TEXT,
    name TEXT,
    extension TEXT,
    size INTEGER,
    mtime INTEGER,
    last_seen INTEGER,
    is_dir BOOLEAN DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_parent ON files(parent_path);
EOF