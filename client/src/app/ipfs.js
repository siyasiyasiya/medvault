import { useState } from 'react';
import { create } from 'ipfs-http-client';

// Connect to an IPFS node (Pinata or Infura)
const ipfsClient = create({
  url: 'https://ipfs.infura.io:5001/api/v0' // Use Infura's IPFS API
});

const UploadToIPFS = () => {
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  // Handle file upload to IPFS
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      // Add file to IPFS
      const added = await ipfsClient.add(file);
      setIpfsHash(added.path);  // The file's IPFS hash
    } catch (error) {
      console.error('Error uploading file to IPFS: ', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Upload Your Medical Record</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload to IPFS'}
      </button>
      {ipfsHash && (
        <div>
          <p>File uploaded to IPFS successfully!</p>
          <p>IPFS Hash: {ipfsHash}</p>
          <a href={`https://ipfs.infura.io/ipfs/${ipfsHash}`} target="_blank" rel="noopener noreferrer">
            View file on IPFS
          </a>
        </div>
      )}
    </div>
  );
};

export default UploadToIPFS;
