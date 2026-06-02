import { useState, useEffect } from "react";
import { listFiles, uploadFile, deleteFile, clearAll } from "../features/chatbot/api";
import type { FileEntry } from "../features/chatbot/schema";

export default function FilesPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchFiles() {
    setError(null);
    try {
      setFiles(await listFiles());
    } catch (err) {
      setError(String(err));
    }
  }

  useEffect(() => { fetchFiles(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await uploadFile(file);
      await fetchFiles();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(filename: string) {
    setError(null);
    try {
      await deleteFile(filename);
      await fetchFiles();
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleClear() {
    setError(null);
    try {
      await clearAll();
      await fetchFiles();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div>
      <h1>Files</h1>
      
      <div className="file-upload-wrapper">
        <label 
          htmlFor="file-picker" 
          className={`btn-upload-label ${loading ? "disabled" : ""}`}
        >
          {loading ? "Uploading..." : "Browse Files"}
        </label>
        <input 
          id="file-picker"
          type="file" 
          accept=".pdf,.txt,.md,.pptx,.docx" 
          onChange={handleUpload} 
          disabled={loading} 
          className="file-upload-input"
        />
        <button className="btn-danger" onClick={handleClear}>
          Clear All
        </button>
      </div>

        {error && <p className="error">{error}</p>}
        {files.length === 0 ? (
          <p>No files loaded.</p>
        ) : (
        <>
          {files.map((f) => (
            <div className="file-row" key={f.fileName}>
              <span className="file-name">{f.fileName}</span>
              <span className="file-type">{f.type}</span>
              <button className="btn-danger" onClick={() => handleDelete(f.fileName)}>
                Delete
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}