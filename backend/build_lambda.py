import os
import shutil
import zipfile
import subprocess
import sys

def build():
    print("Starting optimized AWS Lambda packaging...")
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(backend_dir, "dist")
    archive_name = os.path.join(backend_dir, "aws_lambda_artifact.zip")
    
    # 1. Clean up old build artifacts
    if os.path.exists(dist_dir):
        shutil.rmtree(dist_dir)
    if os.path.exists(archive_name):
        os.remove(archive_name)
        
    os.makedirs(dist_dir)
    
    # 2. Install dependencies directly into the dist directory
    print("Cross-compiling Linux dependencies from requirements.txt...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", 
            "--target", dist_dir, 
            "--platform", "manylinux2014_x86_64",
            "--implementation", "cp",
            "--python-version", "3.12",
            "--only-binary=:all:",
            "-r", os.path.join(backend_dir, "requirements.txt"),
            "--no-cache-dir"
        ])
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        return

    # 3. Clean up unwanted files to make it ultra-small (remove __pycache__, etc.)
    print("Optimizing package size (removing __pycache__)...")
    for root, dirs, files in os.walk(dist_dir):
        for d in list(dirs):
            if d == "__pycache__" or d == "tests":
                try:
                    shutil.rmtree(os.path.join(root, d))
                except Exception:
                    pass
                dirs.remove(d)
                
        for file in files:
            # Remove any local virtual env configuration if accidentally copied, and testing files
            if file.endswith(".pyc") or file.endswith(".pyo"):
                try:
                    os.remove(os.path.join(root, file))
                except Exception:
                    pass

    # 4. Copy main.py to the dist directory
    print("Bundling main.py...")
    shutil.copy2(os.path.join(backend_dir, "main.py"), os.path.join(dist_dir, "main.py"))
    
    # 5. Create the zip archive
    print("Creating ZIP archive...")
    with zipfile.ZipFile(archive_name, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, dist_dir)
                zipf.write(abs_path, rel_path)
                
    # 6. Clean up dist dir
    shutil.rmtree(dist_dir)
    
    size_mb = os.path.getsize(archive_name) / (1024 * 1024)
    print("\n" + "="*40)
    print(f"SUCCESS! AWS Lambda artifact created at:")
    print(f"-> {archive_name}")
    print(f"Final Artifact Size: {size_mb:.2f} MB")
    print("Ready for deployment. Handler setting: main.handler")
    print("="*40)

if __name__ == "__main__":
    build()
