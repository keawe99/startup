import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // keep in sync with the server limit
const MAX_DESCRIPTION = 500; // keep in sync with the server limit

const formatSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Show the chosen photo before it is uploaded; free the preview when it changes
  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleImageChange = (event) => {
    setImage(event.target.files[0] || null);
    setError("");
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
      await axios.post("/api/upload", formData);
      navigate("/landingPage");
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.error || "Upload failed, try again");
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <h2 className="auth-title">Upload a photo</h2>

      <form className="upload-card" onSubmit={handleSubmit}>
        <label className={`dropzone${previewUrl ? " has-preview" : ""}`}>
          {previewUrl ? (
            <img src={previewUrl} alt="Selected photo preview" className="upload-preview" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="dropzone-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="dropzone-title">Click or drag a photo here</span>
              <span className="dropzone-hint">JPEG, PNG, GIF or WebP, up to 5 MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            disabled={uploading}
            aria-label="Choose a photo"
          />
        </label>

        {image && (
          <p className="upload-file-info">
            {image.name} · {formatSize(image.size)} · click the photo to change it
          </p>
        )}

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="upload-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Tell people about these kicks..."
            maxLength={MAX_DESCRIPTION}
            rows={4}
          />
          <span className="upload-count">
            {description.length} / {MAX_DESCRIPTION}
          </span>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="upload-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate("/landingPage")}
            disabled={uploading}
          >
            Cancel
          </button>
          <button type="submit" disabled={uploading || !image}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;
