#!/bin/bash

# scripts/analyze-review-readiness.sh
# Checks if code is ready for Adversarial Review

# Exit codes:
# 0: Ready
# 1: Not Ready / Error

CHECK_TODOS=false
CHECK_FILE_LIST=false
FILE_ARG=""
STORY_ARG=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --check-todos)
            CHECK_TODOS=true
            FILE_ARG="$2"
            shift 2
            ;;
        --check-file-list)
            CHECK_FILE_LIST=true
            STORY_ARG="$2"
            FILE_ARG="$3"
            shift 3
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 --check-todos <file> | --check-file-list <story_file> <file_to_check>"
            exit 1
            ;;
    esac
done

if [ "$CHECK_TODOS" = true ]; then
    if [ ! -f "$FILE_ARG" ]; then
        echo "Error: File $FILE_ARG not found"
        exit 1
    fi
    # Search for TODO or FIXME (case insensitive)
    if grep -nEi "TODO|FIXME" "$FILE_ARG"; then
        echo "FAIL: Found TODO/FIXME in $FILE_ARG"
        exit 1
    else
        echo "PASS: No TODOs in $FILE_ARG"
        exit 0
    fi
fi

if [ "$CHECK_FILE_LIST" = true ]; then
    if [ ! -f "$STORY_ARG" ]; then
        echo "Error: Story file $STORY_ARG not found"
        exit 1
    fi
    
    # Extract File List section
    # Assuming "### File List" is the header
    # We look for the filename in the lines following that header.
    # We just grep the whole file for the filename for simplicity first, 
    # but strictly we should check valid context.
    # However, standard practice is just listing them.
    
    # Improved check: Check if file basename or path is in the file list section
    if grep -A 1000 "### File List" "$STORY_ARG" | grep -q "$(basename "$FILE_ARG")"; then
        echo "PASS: File found in Story File List"
        exit 0
    else
        echo "FAIL: File $FILE_ARG not found in Story File List ($STORY_ARG)"
        exit 1
    fi
fi

exit 0
