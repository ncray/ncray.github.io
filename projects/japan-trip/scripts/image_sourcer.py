import os
import json
import requests
from PIL import Image
from io import BytesIO
from google import genai
from dotenv import load_dotenv
from tavily import TavilyClient
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import sys

# Load environment variables
load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

# Initialize Tavily
tavily = TavilyClient(api_key=TAVILY_API_KEY)

def search_images(query, num=5):
    response = tavily.search(
        query=query,
        search_depth="advanced",
        include_images=True,
        max_results=num
    )
    raw_images = response.get("images", [])
    items = []
    for img in raw_images:
        if isinstance(img, str):
            items.append({"link": img, "title": query})
        elif isinstance(img, dict) and "url" in img:
            items.append({"link": img["url"], "title": img.get("description", query)})
    return items

def download_and_compress(url, target_path, max_size_kb=200):
    try:
        response = requests.get(url, timeout=1.0)
        img = Image.open(BytesIO(response.content))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        quality = 95
        while True:
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=quality)
            if buffer.tell() / 1024 <= max_size_kb or quality <= 20:
                with open(target_path, "wb") as f:
                    f.write(buffer.getvalue())
                break
            quality -= 5
        return True
    except Exception as e:
        return False

def select_best_image(location_name, image_paths):
    model_id = "gemini-3.1-flash-lite-preview"
    images = []
    for path in image_paths:
        try:
            img = Image.open(path)
            images.append(img)
        except:
            continue
    if not images:
        return 0
    prompt = f"I am building a toddler-friendly travel planner for Japan. I have several images for '{location_name}'. Which one is the MOST REPRESENTATIVE of the actual experience for a young child? I want a high-quality shot that captures the core appeal (e.g., play areas, ball pits, sensory zones). Please respond with ONLY the index number (1 to {len(images)}) of the best image."
    try:
        response = client.models.generate_content(model=model_id, contents=[prompt] + images)
        index_str = "".join(filter(str.isdigit, response.text.strip()))
        return max(0, min(int(index_str or "1") - 1, len(images) - 1))
    except:
        return 0 

def process_location(location):
    print(f"Starting: {location}")
    try:
        if "toddler" in location.lower() or "play" in location.lower() or "sensory" in location.lower():
            query = f"{location} Japan high quality"
        else:
            query = f"{location} Japan representative tourist spot high quality"
        
        items = search_images(query, num=5)
        if not items:
            return f"No images found for {location}"

        temp_dir = f"temp_{location.lower().replace(' ', '_')}"
        os.makedirs(temp_dir, exist_ok=True)
        
        download_tasks = []
        for i, item in enumerate(items[:5]):
            path = os.path.join(temp_dir, f"img_{i}.jpg")
            download_tasks.append((item['link'], path, item))

        downloaded_paths = []
        metadata_list = []

        def handle_download(task):
            url, path, item = task
            if download_and_compress(url, path):
                return path, {"original_url": url, "title": item.get('title')}
            return None

        with ThreadPoolExecutor(max_workers=5) as executor:
            results = list(executor.map(handle_download, download_tasks))
            
        for res in results:
            if res:
                path, meta = res
                downloaded_paths.append(path)
                metadata_list.append(meta)

        if not downloaded_paths:
            return f"Failed to download images for {location}"

        best_index = select_best_image(location, downloaded_paths)
        final_filename = f"{location.lower().replace(' ', '_')}.jpg"
        # Correctly resolve the project's images directory relative to this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        images_dir = os.path.join(project_root, "images")
        final_path = os.path.join(images_dir, final_filename)
        os.makedirs(images_dir, exist_ok=True)
        
        with open(downloaded_paths[best_index], "rb") as src, open(final_path, "wb") as dst:
            dst.write(src.read())
        
        # Metadata update (needs locking or sequential finalization for safety)
        # For now, we return it to the main process
        result_metadata = {
            "location": location,
            "data": {
                **metadata_list[best_index],
                "local_path": f"images/{final_filename}"
            }
        }

        # Cleanup
        for path in downloaded_paths:
            if os.path.exists(path): os.remove(path)
        os.rmdir(temp_dir)
        
        print(f"Finished: {location}")
        return result_metadata

    except Exception as e:
        return f"Error processing {location}: {e}"

def main():
    locations = sys.argv[1:]
    if not locations:
        print("Usage: uv run image_sourcer.py 'Loc 1' 'Loc 2' ...")
        return

    # Process up to 5 locations at a time
    results = []
    with ProcessPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(process_location, locations))

    # Update metadata.json sequentially to avoid race conditions
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    metadata_path = os.path.join(project_root, "images", "metadata.json")
    if os.path.exists(metadata_path):
        with open(metadata_path, "r") as f:
            try: all_metadata = json.load(f)
            except: all_metadata = {}
    else:
        all_metadata = {}

    for res in results:
        if isinstance(res, dict) and "location" in res:
            all_metadata[res["location"]] = res["data"]
        else:
            print(res)

    with open(metadata_path, "w") as f:
        json.dump(all_metadata, f, indent=2)

if __name__ == "__main__":
    main()
