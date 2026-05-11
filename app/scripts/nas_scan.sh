#!/bin/bash
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
source "$SCRIPT_DIR/lib_nas.sh"

CURRENT_TIME=$(date +%s)

if ! mountpoint -q "$MOUNT_POINT"; then
    echo "Error: $MOUNT_POINT not mounted."
    exit 1
fi

echo "Starting full scan of $MOUNT_POINT..."

# 1. Faster Scan using Find and transaction
SCAN_TEMP="/app/data/scan_temp.tsv"
# Ensure we are using the correct path inside container if needed, 
# but for now let's use the DB_PATH's directory.
SCAN_TEMP="$(dirname "$DB_PATH")/scan_temp.tsv"

echo "Generating file list..."
find "$MOUNT_POINT" -printf "%p\t%h\t%f\t%s\t%T@\t%y\n" | awk -F'\t' 'BEGIN {OFS="\t"} { n=$3; ext=""; if ($6 == "f" && n ~ /\./) { sub(/.*\./, "", n); ext=tolower(n); } print $1, $2, $3, ext, $4, $5, $6 }' > "$SCAN_TEMP"

echo "Importing to database..."
sqlite3 "$DB_PATH" <<EOF
BEGIN TRANSACTION;
CREATE TEMPORARY TABLE temp_files (path TEXT, parent_path TEXT, name TEXT, extension TEXT, size INTEGER, mtime FLOAT, type TEXT);
.separator "\t"
.import "$SCAN_TEMP" temp_files
INSERT OR REPLACE INTO files (path, parent_path, name, extension, size, mtime, last_seen, is_dir)
SELECT path, parent_path, name, extension, size, mtime, $CURRENT_TIME, CASE WHEN type = 'd' THEN 1 ELSE 0 END
FROM temp_files;
COMMIT;
EOF

rm "$SCAN_TEMP"

# 2. Cleanup missing files
sqlite3 "$DB_PATH" "DELETE FROM files WHERE last_seen < $CURRENT_TIME;"

echo "Scan complete. Database updated."