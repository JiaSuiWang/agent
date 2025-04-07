#!/usr/bin/env python3

import os
import re
from datetime import datetime

# ANSI color codes
COLORS = {
    'red': '\033[91m',
    'green': '\033[92m',
    'yellow': '\033[93m',
    'blue': '\033[94m',
    'magenta': '\033[95m',
    'cyan': '\033[96m',
    'white': '\033[97m',
    'reset': '\033[0m',
}

def colorize(text, color):
    """Add color to text."""
    return f"{COLORS[color]}{text}{COLORS['reset']}"

def parse_changes_file(file_path):
    """Parse the changes file and extract file contents."""
    if not os.path.exists(file_path):
        print(f"Error: Changes file not found: {file_path}")
        return None

    files = {}
    current_file = None
    current_content = []

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        # Check for file header
        if line.startswith("File: "):
            if current_file:
                files[current_file] = ''.join(current_content)
                current_content = []
            current_file = line[6:].strip()
        elif current_file and not line.startswith("=" * 80):
            current_content.append(line)

    # Add the last file
    if current_file:
        files[current_file] = ''.join(current_content)

    return files

def restore_files(files):
    """Restore files to their original locations."""
    restored = 0
    errors = 0
    error_details = {}

    # Get the current working directory
    cwd = os.getcwd()

    for file_path, content in files.items():
        try:
            # Convert path to be relative to the current working directory
            abs_path = os.path.abspath(os.path.join(cwd, file_path))
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            
            # Write content to file
            with open(abs_path, 'w', encoding='utf-8') as f:
                f.write(content)
            restored += 1
            print(f"Restored: {file_path}")
        except Exception as e:
            errors += 1
            error_details[file_path] = str(e)
            print(f"Error restoring {file_path}: {str(e)}")

    return restored, errors, error_details

def main():
    # Get the latest changes file
    changes_dir = "changes_output"
    if not os.path.exists(changes_dir):
        print(f"Error: Changes directory not found: {changes_dir}")
        return

    # List all changes files and get the latest one
    changes_files = [f for f in os.listdir(changes_dir) if f.startswith("changes_") and f.endswith(".txt")]
    if not changes_files:
        print("No changes files found.")
        return

    latest_file = max(changes_files)
    changes_file = os.path.join(changes_dir, latest_file)

    print(f"Reading changes from: {colorize(changes_file, 'blue')}")
    
    # Parse the changes file
    files = parse_changes_file(changes_file)
    if not files:
        return

    print(f"\nFound {colorize(str(len(files)), 'cyan')} files to restore")
    
    # Restore files
    restored, errors, error_details = restore_files(files)

    # Print results
    print("\nRestoration Statistics:")
    print(f"Successfully restored: {colorize(str(restored), 'green')}")
    print(f"Failed to restore: {colorize(str(errors), 'red')}")

    if errors > 0:
        print("\nFiles with errors:")
        for file_name, error_msg in error_details.items():
            print(f"- {colorize(file_name, 'red')}")
            print(f"  Reason: {error_msg}")

if __name__ == "__main__":
    main() 

