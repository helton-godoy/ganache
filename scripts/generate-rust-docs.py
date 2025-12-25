#!/usr/bin/env python3
import os
import re
import sys

def parse_rust_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc_block = []
    items = []
    
    # Simple state machine
    # capturing /// comments
    # associated with pub fn, struct, enum, const, type, trait
    
    current_doc = []
    
    for line in lines:
        stripped = line.strip()
        
        # Check for doc comment
        if stripped.startswith('///'):
            content = stripped[3:]
            if content.startswith(' '):
                content = content[1:]
            current_doc.append(content)
            continue
            
        # Check for attributes (ignore them but don't break doc association usually, 
        # but strictly speaking docs should be above attributes or attributes above docs. 
        # modifying to allow attributes between docs and item)
        if stripped.startswith('#['):
            continue
            
        # Check for public item
        # Regex for pub ...
        # match pub followed by space, then keyword
        match = re.match(r'^\s*pub\s+(fn|struct|enum|trait|type|const|static|mod)\s+.*', line)
        if match:
            if current_doc:
                # We have a doc block for this item
                item_signature = line.strip()
                if item_signature.endswith('{'):
                    item_signature = item_signature[:-1].strip()
                
                items.append({
                    'doc': '\n'.join(current_doc),
                    'signature': item_signature
                })
                current_doc = []
            continue
            
        # If we hit here, and line is not empty, we break the doc association
        if stripped:
            current_doc = []
            
    return items

def generate_markdown(crate_name, crate_path, output_dir):
    output_file = os.path.join(output_dir, f"{crate_name}.md")
    
    all_items = []
    
    for root, dirs, files in os.walk(crate_path):
        for file in files:
            if file.endswith(".rs"):
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, crate_path)
                items = parse_rust_file(path)
                if items:
                    all_items.append({'file': rel_path, 'items': items})
    
    if not all_items:
        return
        
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"# Documentation: {crate_name}\n\n")
        
        for file_entry in all_items:
            f.write(f"## File: `{file_entry['file']}`\n\n")
            for item in file_entry['items']:
                f.write(f"{item['doc']}\n\n")
                f.write(f"```rust\n{item['signature']}\n```\n\n")
                f.write("---\n\n")

def main():
    root_dir = os.getcwd()
    core_dir = os.path.join(root_dir, 'core')
    output_dir = os.path.join(root_dir, 'docs', 'api', 'rust')
    
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(core_dir):
        print(f"Core directory not found at {core_dir}")
        return

    # Find crates (directories in core/), excluding build artifacts
    for item in os.listdir(core_dir):
        # Skip target directory (Cargo build artifacts)
        if item == 'target':
            continue
        item_path = os.path.join(core_dir, item)
        if os.path.isdir(item_path):
            generate_markdown(item, item_path, output_dir)
            print(f"Generated docs for {item}")

if __name__ == "__main__":
    main()
