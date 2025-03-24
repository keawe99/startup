import React, { useState } from "react";
import axios from "axios";

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);
    formData.append("userId", "user123"); // Replace with actual user ID

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Handle success (e.g., show a message, redirect)
      console.log("Image uploaded:", response.data.imageUrl);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <h2>Upload Photo</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageChange} />
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Description"
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadPage;
