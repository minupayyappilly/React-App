# Import the necessary modules from FastAPI
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import os
from fastapi.middleware.cors import CORSMiddleware

# Create a FastAPI application instance
app = FastAPI()

# Define the allowed origins for CORS (Cross-Origin Resource Sharing)
origins = ["*"]

# Add CORS middleware to the FastAPI application with the specified configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Specify the allowed origins for CORS
    allow_credentials=True,  # Allow cookies from the frontend
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Specify the allowed HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Get the current working directory
current_dir = os.path.dirname(os.path.realpath(__file__))
# Define the dataset directory relative to the current working directory
dataset_dir = os.path.join(current_dir, "dataset")

# Define a route to handle requests for retrieving categories
@app.get("/")
async def get_categories():
    categories = []

    # Construct the full path to obj_names.txt
    obj_names_path = os.path.join(dataset_dir, 'obj_names.txt')

    # Check if the obj_names.txt file exists
    if os.path.exists(obj_names_path):
        with open(obj_names_path, 'r') as file:
            for line in file:
                # Split the line and add categories to the list
                categories.extend(line.strip().split())
    else:
        # Raise an HTTPException with a 404 status code if the category list is not found
        raise HTTPException(status_code=404, detail="Category List Not Found")

    print(categories)
    return categories

# Define a route to handle requests for retrieving images in a category
@app.get("/images/{category}")
async def get_images(category: str):
    images_path = os.path.join(dataset_dir, category, "images")
    images = os.listdir(images_path)
    return images

# Define a route to handle requests for retrieving a specific image
@app.get("/image/{category}/{image_name}")
async def get_image(category: str, image_name: str):
    image_path = os.path.join(dataset_dir, category, "images", image_name)
    # Check if the image file exists
    if not os.path.exists(image_path):
        # Raise an HTTPException with a 404 status code if the image is not found
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path)

# Define a route to handle requests for retrieving annotations for a specific image
@app.get("/annotations/{category}/{image_name}")
async def get_annotations(category: str, image_name: str):
    # Remove the image extension (.jpg) from the image_name to match the annotation filename
    base_image_name, _ = os.path.splitext(image_name)
    annotation_file = os.path.join(dataset_dir, category, "annotations", f"{base_image_name}.txt")
    annotations = []
    # Check if the annotation file exists
    if os.path.exists(annotation_file):
        with open(annotation_file, 'r') as file:
            for line in file:
                parts = line.strip().split()
                # Parse the annotation and add it to the list
                annotations.append({
                    "class": parts[0],
                    "x_center": float(parts[1]),
                    "y_center": float(parts[2]),
                    "width": float(parts[3]),
                    "height": float(parts[4])
                })
    else:
        # Raise an HTTPException with a 404 status code if the annotation file is not found
        raise HTTPException(status_code=404, detail="Annotation file not found")
    return annotations

# Run the FastAPI application in debug mode
if __name__ == "__main__":
    app.run(debug=True)
