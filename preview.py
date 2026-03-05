import zipfile
import json
import os

zip_path = r'backend\data\raw\cricsheet\all_json.zip'
with zipfile.ZipFile(zip_path) as z:
    for filename in z.namelist():
        if filename.endswith('.json'):
            data = json.loads(z.read(filename).decode())
            with open('sample_cricsheet.json', 'w') as f:
                json.dump(data, f, indent=2)
            break
