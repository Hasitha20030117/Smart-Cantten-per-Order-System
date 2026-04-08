import { CheckCircle, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

function FileDropzone({ onFileSelect, accept = "image/*,.pdf", maxSize = 5 }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const validateFile = (selectedFile) => {
    const acceptedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
    const acceptedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const lowerCaseName = selectedFile.name.toLowerCase();
    const maxSizeBytes = maxSize * 1024 * 1024;

    const hasAcceptedMimeType = acceptedMimeTypes.includes(selectedFile.type);
    const hasAcceptedExtension = acceptedExtensions.some((extension) =>
      lowerCaseName.endsWith(extension)
    );

    if (!hasAcceptedMimeType && !hasAcceptedExtension) {
      setError("Only PNG, JPG, JPEG, or PDF files are allowed.");
      return false;
    }

    if (selectedFile.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSize}MB.`);
      return false;
    }

    setError("");
    return true;
  };

  const handleFile = useCallback(
    (selectedFile) => {
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile);
        onFileSelect(selectedFile);
      } else {
        setFile(null);
        onFileSelect(null);
      }
    },
    [onFileSelect]
  );

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (event.dataTransfer.files?.[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  const handleChange = (event) => {
    if (event.target.files?.[0]) {
      handleFile(event.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <label
          htmlFor="file-upload"
          className={`flex h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-white/80 px-6 text-center transition-all ${
            dragActive
              ? "border-accent-green bg-accent-green/10"
              : "border-slate-300 hover:border-accent-teal/40 hover:bg-white"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mb-4 h-12 w-12 text-slate-500" />
          <p className="font-semibold text-slate-900">Click to upload or drag and drop</p>
          <p className="mt-2 text-sm text-slate-500">PNG, JPG or PDF up to {maxSize}MB</p>
          <input id="file-upload" type="file" className="hidden" accept={accept} onChange={handleChange} />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-3xl border border-accent-green/40 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-8 w-8 text-accent-teal" />
            <div>
              <p className="font-semibold text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default FileDropzone;
