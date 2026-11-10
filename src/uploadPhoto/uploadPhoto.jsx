import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // keep in sync with the server limit

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
    setError("");
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!image) {
      setError("Choose a photo first");
      return;
    }
    if (image.size > MAX_IMAGE_BYTES) {
      setError("Image must be 5 MB or smaller");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);

    setUploading(true);
    setError("");
    try {
      const response = await axios.post("/api/upload", formData);
      console.log("Image uploaded:", response.data.imageUrl);
      navigate("/landingPage");
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.error || "Upload failed, try again");
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Photo</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
        />
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Description"
          maxLength={500}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
};

export default UploadPage;
