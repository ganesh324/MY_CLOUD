#!/bin/bash
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
source "$SCRIPT_DIR/lib_nas.sh"

echo "Watching $MOUNT_POINT for changes..."

inotifywait -m -r -e close_write,moved_to,moved_from,delete,create --format '%e %w%f' "$MOUNT_POINT" | while read -r event file
do
    # Extract metadata
    parent=$(dirname "$file")
    name=$(basename "$file")
    
    # Determine if it's a directory
    is_dir=0
    if [ -d "$file" ]; then
        is_dir=1
        ext=""
    else
        ext="${file##*.}"
        # If no dot, ext will be the same as file, so clear it if it doesn't look like an extension
        if [[ "$ext" == "$file" ]]; then ext=""; fi
    fi
    
    now=$(date +%s)

    case "$event" in
        CLOSE_WRITE*|MOVED_TO*|CREATE*)
            stats=$(stat -c "%s|%Y" "$file" 2>/dev/null)
            if [ $? -eq 0 ]; then
                IFS="|" read -r size mtime <<< "$stats"
                sqlite3 "$DB_PATH" "INSERT OR REPLACE INTO files (path, parent_path, name, extension, size, mtime, last_seen, is_dir) VALUES ('$file', '$parent', '$name', '$ext', $size, $mtime, $now, $is_dir);"
                echo "Added/Updated: $name (dir: $is_dir)"
            fi
            ;;
        DELETE*|MOVED_FROM*)
            sqlite3 "$DB_PATH" "DELETE FROM files WHERE path = '$file';"
            echo "Removed: $name"
            ;;
    esac
done