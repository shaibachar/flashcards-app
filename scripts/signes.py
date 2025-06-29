import requests
import os
import zipfile
import xml.etree.ElementTree as ET
import re

# Load XML (assume it is already present in the same folder)
xml_filename = 'C:\\workspace\\flashcards-app\\scripts\\theoryexamhe-data.xml'
if not os.path.exists(xml_filename):
    print(f"XML file not found: {xml_filename}")
    exit(1)

try:
    tree = ET.parse(xml_filename)
    root = tree.getroot()
except Exception as e:
    print(f"Failed to parse XML: {e}")
    exit(1)

image_numbers = set()
for item in root.findall('./channel/item'):
    description = item.find('description').text
    if description:
        matches = re.findall(r'http://tqpic.mot.gov.il/(\d+)\.jpg', description)
        if not matches:
            matches = re.findall(r'http://tqpic.mot.gov.il/(\d+)\.jpg', description.replace('\\\\', '\\'))
        image_numbers.update(matches)

# Convert to sorted list
image_numbers = sorted(list(image_numbers))

print(f"Found {len(image_numbers)} images.")

base_url = "https://www.gov.il/BlobFolder/generalpage/tq_pic_01/he/TQ_PIC_"

# Output folder
output_dir = "sign_images"
os.makedirs(output_dir, exist_ok=True)

# Download images
for num in image_numbers:
    url = f"{base_url}{num}.jpg"
    print(f"Downloading: {url}")
    response = requests.get(url)
    if response.status_code == 200:
        with open(f"{output_dir}/{num}.jpg", "wb") as f:
            f.write(response.content)
    else:
        print(f"Failed: {url}")

# Create ZIP
zip_filename = "sign_images.zip"
with zipfile.ZipFile(zip_filename, 'w') as zipf:
    for filename in os.listdir(output_dir):
        filepath = os.path.join(output_dir, filename)
        zipf.write(filepath, filename)

print(f"All done! Created: {zip_filename}")
