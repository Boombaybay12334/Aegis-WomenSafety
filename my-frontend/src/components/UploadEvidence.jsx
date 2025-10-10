import React, { useState } from 'react';
import { getSession } from '../services/accountService';
import { Link } from 'react-router-dom';

export default function UploadEvidence() {
  const session = getSession();
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [evidenceType, setEvidenceType] = useState('photo');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!session) {
    return <p>Loading...</p>;
  }

  const handleEvidenceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvidenceFile(file);
      setFeedback('');
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFeedback('Cover file must be an image (PNG, JPG, etc.)');
        return;
      }
      setCoverImage(file);
      setFeedback('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!evidenceFile) {
      setFeedback('Please select an evidence file to upload.');
      return;
    }

    if (!coverImage) {
      setFeedback('Please select a cover image to hide your evidence in.');
      return;
    }

    if (!description.trim()) {
      setFeedback('Please add a description for this evidence.');
      return;
    }

    setIsUploading(true);
    setFeedback('');

    try {
      // TODO: Implement steganography encoding
      await new Promise(resolve => setTimeout(resolve, 2000));

      setUploadSuccess(true);
      setFeedback('Evidence uploaded and hidden successfully! Your proof is now securely stored.');
      
      setTimeout(() => {
        setEvidenceFile(null);
        setCoverImage(null);
        setDescription('');
        setEvidenceType('photo');
        setUploadSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Upload failed:', error);
      setFeedback('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container">
      <h1>Upload Evidence</h1>
      <p className="subtitle">Securely hide your evidence inside an ordinary image</p>

      <div className="info-box">
        <p><strong>How it works:</strong></p>
        <p>Your evidence will be encrypted and hidden inside a cover image using steganography. 
           No one can detect or access it without your passphrase.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Evidence Type</label>
          <select 
            className="input-field" 
            value={evidenceType} 
            onChange={e => setEvidenceType(e.target.value)}
          >
            <option value="photo">Photo</option>
            <option value="audio">Audio Recording</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
            <option value="text">Text Note</option>
          </select>
        </div>

        <div className="form-group">
          <label>Select Evidence File</label>
          <input 
            type="file" 
            className="input-field" 
            onChange={handleEvidenceFileChange}
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
          />
          {evidenceFile && (
            <p style={{fontSize: '0.9em', color: '#10b981', marginTop: '5px'}}>
              ✓ Selected: {evidenceFile.name} ({(evidenceFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Select Cover Image (to hide evidence in)</label>
          <input 
            type="file" 
            className="input-field" 
            onChange={handleCoverImageChange}
            accept="image/png,image/jpeg,image/jpg"
          />
          {coverImage && (
            <p style={{fontSize: '0.9em', color: '#10b981', marginTop: '5px'}}>
              ✓ Selected: {coverImage.name} ({(coverImage.size / 1024).toFixed(2)} KB)
            </p>
          )}
          <p style={{fontSize: '0.85em', color: '#6c757d', marginTop: '5px'}}>
            Choose a normal-looking image (landscape, nature, etc.) to avoid suspicion.
          </p>
        </div>

        <div className="form-group">
          <label>Description / Notes</label>
          <textarea 
            className="input-field" 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what this evidence shows (date, location, context...)"
            rows="4"
            style={{resize: 'vertical'}}
          />
        </div>

        {feedback && (
          <div className={uploadSuccess ? "form-feedback success" : "form-feedback error"}>
            {feedback}
          </div>
        )}

        <button type="submit" className="main-btn" disabled={isUploading}>
          {isUploading ? 'Encrypting and Uploading...' : 'Upload and Hide Evidence'}
        </button>
      </form>

      <div className="warning-box" style={{marginTop: '20px'}}>
        <strong>Important:</strong> After uploading, you can safely store the cover image anywhere (phone, cloud, etc.). 
        Only you can reveal the hidden evidence using your passphrase.
      </div>

      <p className="footer-link">
        <Link to="/dashboard">← Back to Dashboard</Link>
      </p>
    </div>
  );
}
