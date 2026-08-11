from PIL import Image
from rembg import remove
import os

dawat_input = r"d:\wamp64\www\clients\insights\public\images\dawaat.jpg"
dawat_output = r"d:\wamp64\www\clients\insights\public\images\dawaat.png"


print("Processing Dawat...")
img_dawat = Image.open(dawat_input)
out_dawat = remove(img_dawat)
out_dawat.save(dawat_output, "PNG")
print("Saved transparent Dawat to:", dawat_output)

