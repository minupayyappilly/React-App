import React, { useState, useEffect, useRef } from 'react'; // Import React and necessary hooks
import './App.css'; // Import CSS file for styling

function App() {
  // Define state variables using useState hook
  const [images, setImages] = useState([]); // State for holding image data
  const [categorylist, setCategory] = useState(['dog','animal']); // State for holding category list
  const [selectedCategory, setSelectedCategory] = useState('dog'); // State for selected category
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000'; // Backend URL

  // useEffect hook to fetch categories from the backend when the component mounts or backend URL changes
  useEffect(() => {
    fetch(`${backendUrl}/`)
      .then(response => response.json())
      .then(setCategory); // Set category list state with the fetched data
  }, [backendUrl]);

  // useEffect hook to fetch images when selected category changes or backend URL changes
  useEffect(() => {
    fetch(`${backendUrl}/images/${selectedCategory}`)
      .then(response => response.json())
      .then(setImages); // Set images state with the fetched data
  }, [selectedCategory, backendUrl]);

  return (
    <div className="App">
      <h1>Object Detection Dataset Visualization</h1>

      {/* Render dropdown box with categories */}
      <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
        {/* Map over categorylist and render options */}
        {categorylist.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <div className="images">
        {/* Map over images and render ImageWithAnnotations component */}
        {images.map(image => (
          <ImageWithAnnotations key={image} image={image} category={selectedCategory} backendUrl={backendUrl} />
        ))}
      </div>
    </div>
  );
}

// Component to display image with annotations
function ImageWithAnnotations({ image, category, backendUrl }) {
  const canvasRef = useRef(null); // Reference to the canvas element

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = `${backendUrl}/image/${category}/${image}`;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Fetch annotations for the image and draw them on the canvas
      fetch(`${backendUrl}/annotations/${category}/${image}`)
        .then(response => response.json())
        .then(annotations => {
          annotations.forEach(annotation => {
            drawAnnotation(ctx, annotation, img.width, img.height);
          });
        });
    };
  }, [image, category, backendUrl]); // Run effect when image, category, or backend URL changes

  // Function to draw annotation rectangles on the canvas
  function drawAnnotation(ctx, annotation, imageWidth, imageHeight) {
    const { x_center, y_center, width, height } = annotation;

    const rectX = (x_center - width / 2) * imageWidth;
    const rectY = (y_center - height / 2) * imageHeight;
    const rectWidth = width * imageWidth;
    const rectHeight = height * imageHeight;

    ctx.strokeStyle = '#FF0000'; // Set stroke color
    ctx.lineWidth = 2; // Set line width
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight); // Draw rectangle
  }

  return <canvas ref={canvasRef}></canvas>; // Render canvas element
}

export default App; // Export the App component as the default export