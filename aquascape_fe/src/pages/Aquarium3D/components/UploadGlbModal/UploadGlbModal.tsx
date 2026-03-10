import React, { useState, useRef } from "react";
import { Modal, Progress, Input, Button, message } from "antd";
import { 
  CloudUploadOutlined, 
  CloseOutlined, 
  FileTextOutlined, 
  CheckCircleFilled, 
  LinkOutlined
} from "@ant-design/icons";
import "./UploadGlbModal.scss";
import { uploadGlb } from "@app/core/services/uploadAPI";

interface UploadGlbModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const UploadGlbModal: React.FC<UploadGlbModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [assetName, setAssetName] = useState("");
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const glbInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleGlbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGlbFile(file);
      if (!assetName) {
        setAssetName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreviewImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!glbFile || !previewImage || !assetName) {
      message.error("Please provide Asset Name, GLB file, and Preview Image.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      await uploadGlb({
        name: assetName,
        glbFile: glbFile,
        previewImage: previewImage,
        onProgress: (percent) => {
          setProgress(percent);
        },
      });
      message.success("Asset uploaded successfully!");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error("Upload failed", error);
      message.error("Failed to upload asset.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setAssetName("");
    setGlbFile(null);
    setPreviewImage(null);
    setProgress(0);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      closeIcon={<CloseOutlined className="modal-close-icon" />}
      width={480}
      className="upload-glb-modal"
      centered
    >
      <div className="modal-header">
        <div className="header-icon">
          <CloudUploadOutlined />
        </div>
        <div className="header-text">
          <h2>Upload files</h2>
          <p>Select and upload the files of your choice</p>
        </div>
      </div>

      <div className="modal-body">
        <div className="asset-name-section">
          <label>Asset Name</label>
          <Input 
            placeholder="Enter asset name" 
            value={assetName} 
            onChange={(e) => setAssetName(e.target.value)} 
            className="custom-input"
          />
        </div>

        <div className="upload-areas">
          {/* GLB Upload Area */}
          <div 
            className={`dropzone-area ${glbFile ? 'has-file' : ''}`} 
            onClick={() => glbInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".glb" 
              ref={glbInputRef} 
              style={{ display: 'none' }} 
              onChange={handleGlbChange} 
            />
            <div className="upload-icon">
              <CloudUploadOutlined />
            </div>
            <div className="upload-text">
              {glbFile ? (
                <p className="file-ready">GLB File: <strong>{glbFile.name}</strong></p>
              ) : (
                <>
                  <p>Choose a <strong>GLB</strong> file or drag & drop</p>
                  <span>3D model format, up to 50 MB.</span>
                </>
              )}
            </div>
            <Button className="browse-btn">Browse GLB</Button>
          </div>

          {/* Image Upload Area */}
          <div 
            className={`dropzone-area preview-area ${previewImage ? 'has-file' : ''}`} 
            onClick={() => imageInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/*" 
              ref={imageInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageChange} 
            />
            <div className="upload-icon">
              <FileTextOutlined />
            </div>
            <div className="upload-text">
              {previewImage ? (
                <p className="file-ready">Image: <strong>{previewImage.name}</strong></p>
              ) : (
                <>
                  <p>Choose a <strong>Preview Image</strong></p>
                  <span>JPEG, PNG formats</span>
                </>
              )}
            </div>
            <Button className="browse-btn">Browse Image</Button>
          </div>
        </div>

        {/* Selected Files List (Simulation of the list in design) */}
        {(glbFile || previewImage) && (
          <div className="file-list">
            {glbFile && (
              <div className="file-item">
                <div className="file-icon glb"><div className="icon-badge">GLB</div></div>
                <div className="file-info">
                  <div className="file-top">
                    <span className="file-name">{glbFile.name}</span>
                    <CloseOutlined className="remove-icon" onClick={(e) => { e.stopPropagation(); setGlbFile(null); }} />
                  </div>
                  <div className="file-meta">
                    {(glbFile.size / 1024).toFixed(1)} KB • {uploading ? 'Uploading...' : 'Ready'}
                  </div>
                  {uploading && <Progress percent={progress} size="small" showInfo={false} strokeColor="#3b82f6" />}
                </div>
              </div>
            )}
            {previewImage && (
              <div className="file-item">
                <div className="file-icon img"><div className="icon-badge">IMG</div></div>
                <div className="file-info">
                  <div className="file-top">
                    <span className="file-name">{previewImage.name}</span>
                    <CloseOutlined className="remove-icon" onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }} />
                  </div>
                  <div className="file-meta">
                    {(previewImage.size / 1024).toFixed(1)} KB • Completed <CheckCircleFilled className="success-icon" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="url-section">
          <label>Import from URL Link <LinkOutlined className="info-icon" /></label>
          <div className="url-input-wrapper">
            <LinkOutlined className="prefix-icon" />
            <Input placeholder="Paste file URL" className="custom-input" />
          </div>
        </div>

        <Button 
          type="primary" 
          className="upload-submit-btn" 
          disabled={!glbFile || !previewImage || !assetName || uploading}
          onClick={handleUpload}
          loading={uploading}
        >
          {uploading ? 'UPLOADING...' : 'UPLOAD ASSET'}
        </Button>
      </div>
    </Modal>
  );
};

export default UploadGlbModal;
