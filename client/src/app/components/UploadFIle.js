// src/components/UploadFile.js
import { useState } from "react";
import { initializeBundlr, uploadToArweave } from "../utils/bundlr"; // Import bundlr.js

const UploadFile = () => {
    const [fileUrl, setFileUrl] = useState("");
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        // Initialize Bundlr with MetaMask
        const bundlr = await initializeBundlr();

        // Upload the file to Arweave via Bundlr
        const fileUrl = await uploadToArweave(file);
        setFileUrl(fileUrl);  // Set the uploaded file URL
    };

    return (
        <div>
            <h2>Upload File to Arweave</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {fileUrl && (
                <div>
                    <p>File uploaded: <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileUrl}</a></p>
                </div>
            )}
        </div>
    );
};

export default UploadFile;
