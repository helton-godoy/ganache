#!/usr/bin/env python3
import os
import re

def scan_files(root_dir, skip_dirs):
    matches = {} # story_id -> list of {file, line, context}
    
    # Regex for @ref Story-X.Y or @ref X-Y
    regex = re.compile(r'@ref\s+(?:Story-)?(\d+[\.-]\d+)(.*)')
    
    for root, dirs, files in os.walk(root_dir):
        # filtering
        dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith('.')]
        
        for file in files:
            if not file.endswith(('.rs', '.ts', '.tsx', '.js', '.jsx')):
                continue
                
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    for line_num, line in enumerate(f, 1):
                        match = regex.search(line)
                        if match:
                            story_id = match.group(1).replace('-', '.')
                            context = match.group(2).strip()
                            if context.startswith('-'):
                                context = context[1:].strip()
                            
                            if story_id not in matches:
                                matches[story_id] = []
                            
                            rel_path = os.path.relpath(path, root_dir)
                            matches[story_id].append({
                                'file': rel_path,
                                'line': line_num,
                                'context': context
                            })
            except Exception as e:
                print(f"Error reading {path}: {e}")
                
    return matches

def generate_markdown(matches, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Traceability Matrix\n\n")
        f.write("Generated automatically. Do not edit manually.\n\n")
        
        # Sort by Story ID
        sorted_ids = sorted(matches.keys(), key=lambda x: [int(p) for p in re.split(r'[\.-]', x) if p.isdigit()])
        
        for sid in sorted_ids:
            f.write(f"## Story {sid}\n\n")
            f.write("| File | Line | Context |\n")
            f.write("| --- | --- | --- |\n")
            
            for item in matches[sid]:
                f.write(f"| `{item['file']}` | {item['line']} | {item['context']} |\n")
            
            f.write("\n")

def main():
    root_dir = os.getcwd()
    output_file = os.path.join(root_dir, 'docs', 'traceability.md')
    skip_dirs = {'node_modules', 'target', '.git', 'dist', 'build'}
    
    print("Scanning for @ref tags...")
    matches = scan_files(root_dir, skip_dirs)
    
    print(f"Found references for {len(matches)} stories.")
    generate_markdown(matches, output_file)
    print(f"Generated {output_file}")

if __name__ == "__main__":
    main()
