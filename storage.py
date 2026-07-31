import os
import json
from datetime import datetime

# Environment variables for Cloud Storage (AWS S3 or GCS)
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Base directory for local mock storage fallback
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BUCKET_DIR = os.path.join(BASE_DIR, "mock_bucket")

def ensure_bucket_exists():
    """Ensure local mock bucket directory exists for local fallback mode."""
    if not os.path.exists(BUCKET_DIR):
        os.makedirs(BUCKET_DIR, exist_ok=True)

ensure_bucket_exists()

def is_safe_path(basedir, path, follow_symlinks=True):
    """Security check to prevent Path Traversal attacks."""
    if follow_symlinks:
        matchpath = os.path.abspath(path)
    else:
        matchpath = os.path.realpath(path)
    return basedir == os.path.commonpath((basedir, matchpath))

def save_json_file(file_name: str, data: dict) -> bool:
    """
    Save JSON data to AWS S3, GCS, or Local Mock Storage depending on env config.
    """
    # 1. AWS S3 Storage Mode
    if AWS_S3_BUCKET_NAME:
        try:
            import boto3
            s3 = boto3.client("s3", region_name=AWS_REGION)
            s3.put_object(
                Bucket=AWS_S3_BUCKET_NAME,
                Key=file_name,
                Body=json.dumps(data, indent=2),
                ContentType="application/json"
            )
            return True
        except Exception as e:
            print(f"Error saving to AWS S3: {e}")
            return False

    # 2. Google Cloud Storage (GCS) Mode
    elif GCS_BUCKET_NAME:
        try:
            from google.cloud import storage
            client = storage.Client()
            bucket = client.bucket(GCS_BUCKET_NAME)
            blob = bucket.blob(file_name)
            blob.upload_from_string(json.dumps(data, indent=2), content_type="application/json")
            return True
        except Exception as e:
            print(f"Error saving to GCS: {e}")
            return False

    # 3. Local Mock Storage Mode (Fallback for local dev)
    else:
        ensure_bucket_exists()
        file_path = os.path.join(BUCKET_DIR, file_name)
        if not is_safe_path(BUCKET_DIR, file_path):
            raise ValueError("Unsafe file path detected")
        try:
            with open(file_path, "w") as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving locally: {e}")
            return False

def list_all_files() -> list:
    """
    List all stored files with size and creation timestamp (ISO 8601).
    """
    files_info = []

    # 1. AWS S3 Mode
    if AWS_S3_BUCKET_NAME:
        try:
            import boto3
            s3 = boto3.client("s3", region_name=AWS_REGION)
            response = s3.list_objects_v2(Bucket=AWS_S3_BUCKET_NAME)
            for obj in response.get("Contents", []):
                files_info.append({
                    "name": obj["Key"],
                    "size": obj["Size"],
                    "created_at": obj["LastModified"].isoformat()
                })
            return sorted(files_info, key=lambda x: x["created_at"], reverse=True)
        except Exception as e:
            print(f"Error listing AWS S3 files: {e}")
            return []

    # 2. GCS Mode
    elif GCS_BUCKET_NAME:
        try:
            from google.cloud import storage
            client = storage.Client()
            bucket = client.bucket(GCS_BUCKET_NAME)
            for blob in bucket.list_blobs():
                files_info.append({
                    "name": blob.name,
                    "size": blob.size,
                    "created_at": blob.time_created.isoformat() if blob.time_created else None
                })
            return sorted(files_info, key=lambda x: x["created_at"], reverse=True)
        except Exception as e:
            print(f"Error listing GCS files: {e}")
            return []

    # 3. Local Mock Storage Mode
    else:
        ensure_bucket_exists()
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
            return sorted(files_info, key=lambda x: x["created_at"], reverse=True)
        except Exception as e:
            print(f"Error listing local files: {e}")
            return []

def read_json_file(file_name: str):
    """
    Retrieve and parse JSON content of a specific weather file.
    """
    # 1. AWS S3 Mode
    if AWS_S3_BUCKET_NAME:
        try:
            import boto3
            s3 = boto3.client("s3", region_name=AWS_REGION)
            obj = s3.get_object(Bucket=AWS_S3_BUCKET_NAME, Key=file_name)
            return json.loads(obj["Body"].read().decode("utf-8"))
        except Exception as e:
            print(f"Error reading AWS S3 file: {e}")
            return None

    # 2. GCS Mode
    elif GCS_BUCKET_NAME:
        try:
            from google.cloud import storage
            client = storage.Client()
            bucket = client.bucket(GCS_BUCKET_NAME)
            blob = bucket.blob(file_name)
            content = blob.download_as_string()
            return json.loads(content)
        except Exception as e:
            print(f"Error reading GCS file: {e}")
            return None

    # 3. Local Mock Storage Mode
    else:
        ensure_bucket_exists()
        file_path = os.path.join(BUCKET_DIR, file_name)
        if not is_safe_path(BUCKET_DIR, file_path):
            return None
        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            return None
        try:
            with open(file_path, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading local file: {e}")
            return None
