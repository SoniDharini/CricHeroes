import os
import glob

def resolve_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    if '<<<<<<< Updated upstream' not in content:
        return
        
    lines = content.split('\n')
    new_lines = []
    
    state = 'NORMAL' # NORMAL, IN_UPSTREAM, IN_STASHED
    
    for line in lines:
        if line.startswith('<<<<<<< Updated upstream'):
            state = 'IN_UPSTREAM'
        elif line.startswith('======='):
            if state == 'IN_UPSTREAM':
                state = 'IN_STASHED'
            else:
                new_lines.append(line)
        elif line.startswith('>>>>>>> Stashed changes'):
            if state == 'IN_STASHED':
                state = 'NORMAL'
            else:
                new_lines.append(line)
        else:
            if state == 'NORMAL' or state == 'IN_STASHED':
                new_lines.append(line)
                
    with open(filepath, 'w') as f:
        f.write('\n'.join(new_lines))
    print(f"Resolved conflicts in {filepath}")

if __name__ == '__main__':
    for root, dirs, files in os.walk('.'):
        if 'venv' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith('.py') or file.endswith('.txt'):
                resolve_file(os.path.join(root, file))
