'use client'

import React, { useState } from 'react';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import styles from './uploadrecords.module.css';

// Initialize IPFS client (using Pinata or Infura)
const ipfsClient = create({
  url: 'https://ipfs.infura.io:5001/api/v0' // or use Pinata's API URL
});

export default function UploadRecords() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);

  // Handle file input
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Handle description input
  const handleDescriptionChange = (e) => setDescription(e.target.value);

  // Handle file upload to IPFS
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      // Upload the file to IPFS
      const addedFile = await ipfsClient.add(file);
      const fileHash = addedFile.path; // This is the IPFS CID (hash)

      console.log('File uploaded to IPFS with CID:', fileHash);

      // Call the smart contract to store the IPFS hash and metadata
      await storeMetadataInSmartContract(fileHash, description);
      
      setUploadStatus('Upload successful!');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Call the smart contract to store the IPFS hash and description
  const storeMetadataInSmartContract = async (fileHash, description) => {
    const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");
    const wallet = new ethers.Wallet('YOUR_WALLET_PRIVATE_KEY', provider);
    const contractAddress = 'YOUR_CONTRACT_ADDRESS';
    const abi = [ /* ABI array of storeRecord method */ ];

    const contract = new ethers.Contract(contractAddress, abi, wallet);

    try {
      const tx = await contract.storeRecord(fileHash, description);
      console.log('Smart contract transaction:', tx);
      await tx.wait();  // Wait for transaction to be mined
      console.log('Record successfully stored in smart contract!');
    } catch (error) {
      console.error('Failed to store metadata in smart contract:', error);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <h1 className={styles.heading}>Upload Medical Record</h1>

      <div className={styles.walletConnect}>
        <p>Wallet connected: {walletAddress}</p>
      </div>

      <div className={styles.uploadFormContainer}>
        <p>Choose a file to upload:</p>
        <input
          type="file"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
        <textarea
          className={styles.textarea}
          placeholder="Enter description for the record"
          value={description}
          onChange={handleDescriptionChange}
        />
        <button
          className={styles.uploadButton}
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>

        {uploadStatus && (
          <p className={styles.uploadStatus}>{uploadStatus}</p>
        )}
      </div>
    </div>
  );
}