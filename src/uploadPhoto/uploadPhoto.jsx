import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadPage = ({ username, userId }) => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

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
    formData.append("userId", userId); // Send userId

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Image uploaded:", response.data.imageUrl);
      navigate("/landingPage");
    } catch (error) {
      console.error("Upload failed:", error);
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
