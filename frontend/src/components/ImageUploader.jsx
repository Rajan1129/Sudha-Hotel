import { useState } from 'react';
import Icon from './Icon';
import { uploadFile } from '../api/upload';
import { getImageUrl } from '../api/client';

export default function ImageUploader({ value, onChange, label = 'Upload Image', multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileSelect(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');

    try {
      if (multiple) {
        const urls = [];
        for (const file of Array.from(files)) {
          const res = await uploadFile(file);
          if (res?.url) urls.push(res.url);
        }
        onChange([...(Array.isArray(value) ? value : []), ...urls]);
      } else {
        const res = await uploadFile(files[0]);
        if (res?.url) onChange(res.url);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage(indexToRemove) {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((_, idx) => idx !== indexToRemove));
    } else {
      onChange('');
    }
  }

  const currentValues = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  return (
    <div className="flex flex-col gap-space-2xs w-full">
      {label && <label className="text-label-sm text-secondary uppercase font-bold">{label}</label>}

      {/* Image Previews */}
      {currentValues.length > 0 && (
        <div className="flex flex-wrap gap-space-xs pb-space-2xs">
          {currentValues.map((imgUrl, idx) => (
            <div key={imgUrl + idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm group">
              <img src={getImageUrl(imgUrl)} alt={`Uploaded preview ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center shadow-md hover:bg-error/90 active:scale-90"
                title="Remove image"
              >
                <Icon name="close" className="text-[14px]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Drop / Select Area */}
      <label className="relative flex flex-col items-center justify-center p-space-md rounded-xl border-2 border-dashed border-outline-variant/50 hover:border-primary/60 bg-surface-container-low cursor-pointer transition-colors text-center group">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-1 group-hover:scale-110 transition-transform">
          <Icon name={uploading ? 'sync' : 'cloud_upload'} className={`text-[22px] ${uploading ? 'animate-spin' : ''}`} />
        </div>
        <span className="text-label-md font-bold text-primary">
          {uploading ? 'Uploading image...' : 'Click or Drag to Upload File'}
        </span>
        <span className="text-label-sm text-on-surface-variant">PNG, JPG, WEBP, GIF up to 10MB</span>
      </label>

      {error && <p className="text-label-sm text-error font-medium">{error}</p>}
    </div>
  );
}
