import urllib.request
import os

# Change working directory to the directory of this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

downloads = [
    {
        "url": "https://cloudmosaic.ai/Images/Force-ERP.jpeg",
        "dest": "public/images/Force-ERP.jpeg"
    },
    {
        "url": "https://cloudmosaic.ai/Images/brainzyx.jpg",
        "dest": "public/images/brainzyx.jpg"
    }
]

for item in downloads:
    try:
        print(f"Downloading {item['url']} -> {item['dest']}...")
        os.makedirs(os.path.dirname(item['dest']), exist_ok=True)
        urllib.request.urlretrieve(item['url'], item['dest'])
        print("Done!")
    except Exception as e:
        print(f"Error downloading {item['url']}: {e}")

