import os
import json
from datetime import datetime

# Define the base directory path for local mock storage
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BUCKET_DIR = os.path.join(BASE_DIR, "mock_bucket")

# Helper function to ensure the storage folder exists
def ensure_bucket_exists():
    if not os.path.exists(BUCKET_DIR):
        os.makedirs(BUCKET_DIR, exist_ok=True)

# Run folder check on module import
ensure_bucket_exists()

# Security function: Prevents Path Traversal attacks (e.g. using '../../')
def is_safe_path(basedir, path, follow_symlinks=True):
    if follow_symlinks:
        matchpath = os.path.abspath(path)
    else:
        matchpath = os.path.realpath(path)
    return basedir == os.path.commonpath((basedir, matchpath))

# Function to save a JSON object into a local file
def save_json_file(file_name: str, data: dict):
    ensure_bucket_exists()
    file_path = os.path.join(BUCKET_DIR, file_name)
    
    # Check if the requested file path stays inside the bucket folder
    if not is_safe_path(BUCKET_DIR, file_path):
        raise ValueError("Unsafe file path detected")
        
    try:
        with open(file_path, "w") as f:
            json.dump(data, f)
        return True
    except Exception as e:
        print(f"Error saving file: {e}")
        return False

# Function to list all saved weather files with their sizes and creation dates
def list_all_files():
    ensure_bucket_exists()
    files_info = []
    
    try:
        for filename in os.listdir(BUCKET_DIR):
            file_path = os.path.join(BUCKET_DIR, filename)
            
            if os.path.isfile(file_path):
                size = os.path.getsize(file_path)
                created_time = os.path.getctime(file_path)
                created_at_iso = datetime.fromtimestamp(created_time).isoformat()
                
                files_info.append({
                    "name": filename,
                    "size": size,
                    "created_at": created_at_iso
                })
    except Exception as e:
        print(f"Error listing files: {e}")
            
    return files_info

# Function to read and return JSON content of a specific file
def read_json_file(file_name: str):
    ensure_bucket_exists()
    file_path = os.path.join(BUCKET_DIR, file_name)
    
    # Path Traversal Check for safe file reading
    if not is_safe_path(BUCKET_DIR, file_path):
        return None
    
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return None
        
    try:
        with open(file_path, "r") as f:
            content = json.load(f)
        return content
    except Exception as e:
        print(f"Error reading file: {e}")
        return None
