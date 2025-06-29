import requests
import os
import zipfile
import xml.etree.ElementTree as ET
import re

# Load XML
tree = ET.parse('theoryexamhe-data.xml')
root = tree.getroot()

image_numbers = set()
for item in root.findall('./channel/item'):
    description = item.find('description').text
    if description:
        matches = re.findall(r'http://tqpic.mot.gov.il/(\\d+)\\.jpg', description)
        image_numbers.update(matches)

# Convert to sorted list
image_numbers = sorted(list(image_numbers))

print(image_numbers)