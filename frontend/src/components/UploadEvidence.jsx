import React, { useState, useEffect } from 'react';
import { getSession } from '../services/accountService';
import { uploadEvidence } from '../services/evidenceService';
import { Link } from 'react-router-dom';

export default function UploadEvidence() {
  const session = getSession();
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [steganographyEnabled, setSteganographyEnabled] = useState(false);

  useEffect(() => {
    // Check if steganography is enabled in settings
    const isEnabled = localStorage.getItem('steganographyEnabled') === 'true';
    setSteganographyEnabled(isEnabled);
  }, []);

  if (!session) {
    return <p>Loading...</p>;
  }

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return '📷 Photo';
    if (file.type.startsWith('video/')) return '🎥 Video';
    if (file.type.startsWith('audio/')) return '🎵 Audio';
    if (file.type.includes('pdf')) return '📄 PDF';
    if (file.type.includes('document') || file.type.includes('word')) return '📝 Document';
    if (file.type.includes('text')) return '📃 Text';
    return '📎 File';
  };

  const handleEvidenceFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEvidenceFiles([...evidenceFiles, ...files]); // Add to existing files
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

  const removeFile = (index) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (evidenceFiles.length === 0) {
      setFeedback('Please select at least one evidence file to upload.');
      return;
    }

    if (steganographyEnabled && !coverImage) {
      setFeedback('Please select a cover image to hide your evidence in.');
      return;
    }

    // Description is now optional - no validation needed

    setIsUploading(true);
    setFeedback('');

    try {
      // Upload evidence using real encryption and backend
      const result = await uploadEvidence(evidenceFiles, coverImage, description);

      setUploadSuccess(true);
      
      if (steganographyEnabled) {
        setFeedback(`${result.filesUploaded} file(s) uploaded and hidden successfully! Your proof is now securely stored. Evidence ID: ${result.evidenceId}`);
      } else {
        setFeedback(`${result.filesUploaded} file(s) uploaded successfully! Your evidence is now securely stored. Evidence ID: ${result.evidenceId}`);
      }
      
      setTimeout(() => {
        setEvidenceFiles([]);
        setCoverImage(null);
        setDescription('');
        setUploadSuccess(false);
      }, 5000); // Increased timeout to show evidence ID

    } catch (error) {
      console.error('Upload failed:', error);
      setFeedback(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getTotalSize = () => {
    const total = evidenceFiles.reduce((sum, file) => sum + file.size, 0);
    return (total / 1024 / 1024).toFixed(2); // Convert to MB
  };

  return (
    <div className="container">
      <h1>Upload Evidence</h1>
      <p className="subtitle">
        {steganographyEnabled 
          ? 'Securely hide your evidence inside an ordinary image' 
          : 'Securely upload your evidence files'}
      </p>

      <div className="info-box">
        <p><strong>How it works:</strong></p>
        {steganographyEnabled ? (
          <p>Your evidence will be encrypted and hidden inside a cover image using steganography. 
             No one can detect or access it without your passphrase.</p>
        ) : (
          <p>Your evidence will be encrypted and stored securely. Only you can access it with your passphrase.</p>
        )}
      </div>

      {!steganographyEnabled && (
        <div className="warning-box" style={{backgroundColor: '#fff3cd', borderLeftColor: '#ffc107'}}>
          <strong>💡 Tip:</strong> Enable Steganography in Settings to hide evidence inside images for extra protection.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Evidence Files (Photos, Videos, Audio, Documents)</label>
          <input 
            type="file" 
            className="input-field" 
            onChange={handleEvidenceFileChange}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            multiple
          />
          <p style={{fontSize: '0.85em', color: '#6c757d', marginTop: '5px'}}>
            You can select multiple files of any type. Hold Ctrl/Cmd to select multiple files at once.
          </p>
          
          {evidenceFiles.length > 0 && (
            <div style={{marginTop: '15px'}}>
              <p style={{fontSize: '1em', color: '#10b981', fontWeight: '600', marginBottom: '10px'}}>
                ✓ {evidenceFiles.length} file(s) selected ({getTotalSize()} MB total)
              </p>
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '10px'
              }}>
                {evidenceFiles.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff',
                    borderRadius: '6px',
                    marginBottom: '5px',
                    transition: 'background-color 0.2s'
                  }}>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '0.9em', fontWeight: '600', color: '#1f2937'}}>
                        {getFileType(file)} {file.name}
                      </div>
                      <div style={{fontSize: '0.8em', color: '#6b7280', marginTop: '2px'}}>
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '1.3em',
                        padding: '0 10px',
                        transition: 'transform 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {steganographyEnabled && (
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
        )}

        <div className="form-group">
          <label>Description / Notes (Optional)</label>
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
          {isUploading 
            ? 'Encrypting and Uploading...' 
            : `Upload ${evidenceFiles.length > 0 ? evidenceFiles.length : ''} Evidence File${evidenceFiles.length !== 1 ? 's' : ''}`}
        </button>
      </form>

      <div className="warning-box" style={{marginTop: '20px'}}>
        <strong>Important:</strong> 
        {steganographyEnabled 
          ? ' After uploading, you can safely store the cover image anywhere (phone, cloud, etc.). Only you can reveal the hidden evidence using your passphrase.'
          : ' Your evidence is encrypted and stored securely. Only you can access it with your passphrase.'}
      </div>
    </div>
  );
}
