#!/usr/bin/env python3

import subprocess
import os
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

def get_staged_files():
    """Get list of staged files from git."""
    result = subprocess.run(['git', 'diff', '--cached', '--name-only'], 
                          capture_output=True, text=True)
    if result.returncode != 0:
        print("Error getting staged files:", result.stderr)
        return []
    return result.stdout.strip().split('\n')

def read_file_content(file_path):
    """Read content of a file."""
    try:
        # Get the absolute path of the workspace
        workspace_root = subprocess.run(['git', 'rev-parse', '--show-toplevel'],
                                     capture_output=True, text=True).stdout.strip()
        full_path = os.path.join(workspace_root, file_path)
        
        if not os.path.exists(full_path):
            return ("error", f"File not found at path: {full_path}")
            
        # Check if file is binary
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                return ("success", content)
        except UnicodeDecodeError:
            return ("error", f"Binary file detected - {file_path} is not a text file")
    except Exception as e:
        return ("error", f"Error reading file {file_path}: {str(e)}")

def colorize(text, color):
    """Add color to text."""
    return f"{COLORS[color]}{text}{COLORS['reset']}"

def main():
    # Get staged files
    staged_files = get_staged_files()
    if not staged_files:
        print("No staged files found.")
        return

    # Create output directory if it doesn't exist
    output_dir = "changes_output"
    os.makedirs(output_dir, exist_ok=True)

    # Generate output filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(output_dir, f"changes_{timestamp}.txt")

    # Counters for statistics
    total_files = len(staged_files)
    successful_files = 0
    error_files = 0
    error_details = {}  # Dictionary to store file names and their error messages

    # Write changes to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"Changes collected at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        for file_path in staged_files:
            if not file_path:  # Skip empty lines
                continue
                
            f.write(f"\n{'='*80}\n")
            f.write(f"File: {file_path}\n")
            f.write(f"{'='*80}\n\n")
            
            status, content = read_file_content(file_path)
            f.write(content)
            f.write("\n")

            # Update counters and collect error details
            if status == "error":
                error_files += 1
                error_details[file_path] = content
            else:
                successful_files += 1

    # Print statistics with colors
    print("\nFile Processing Statistics:")
    print(f"Total files processed: {colorize(str(total_files), 'cyan')}")
    print(f"Successfully processed: {colorize(str(successful_files), 'green')}")
    print(f"Files with errors: {colorize(str(error_files), 'red')}")
    
    if error_files > 0:
        print("\nFiles with errors:")
        for file_name, error_msg in error_details.items():
            # Color code based on error type
            if "Binary file detected" in error_msg:
                color = "yellow"  # Yellow for binary files
            elif "File not found" in error_msg:
                color = "red"     # Red for missing files
            else:
                color = "magenta" # Magenta for other errors
                
            print(f"- {colorize(file_name, color)}")
            print(f"  Reason: {error_msg}")
    
    print(f"\nChanges have been written to: {colorize(output_file, 'blue')}")

if __name__ == "__main__":
    main() 
