'use client'
import { useState, useEffect } from 'react';
import Arweave from 'arweave';
import { ethers } from 'ethers';
import styles from './uploadrecords.module.css';

export default function UploadRecords({ user }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Arweave client
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
  });

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const userAddress = accounts[0];
        setWalletAddress(userAddress);
        setIsConnected(true);
        alert('Connected with: ' + userAddress);
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
        alert('Please install MetaMask!');
      }
    } else {
      alert('MetaMask not found. Please install MetaMask!');
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload file to Arweave
  const uploadFileToArweave = async () => {
    if (!walletAddress) {
      alert('Please connect your MetaMask wallet first.');
      return;
    }
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
  
    try {
      setUploadStatus('Uploading file to Arweave...');
      setProgress(0);
  
      // Convert file to ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(fileBuffer);
  
      // Create Arweave transaction
      const transaction = await arweave.createTransaction({ data: fileData });
      transaction.addTag('Content-Type', file.type);
  
      // Prepare the data for MetaMask signing
      const transactionData = JSON.stringify({
        data: Array.from(transaction.data),
        tags: transaction.tags.map((tag) => ({
          name: tag.get('name', { decode: true, string: true }),
          value: tag.get('value', { decode: true, string: true }),
        })),
      });
  
      // Request MetaMask signature
      const signedTransaction = await window.ethereum.request({
        method: 'personal_sign',
        params: [transactionData, walletAddress],
      });
  
      // Attach signature to the transaction
      transaction.setSignature({
        owner: walletAddress,
        signature: signedTransaction,
      });
  
      // Post transaction to Arweave
      const uploader = await arweave.transactions.getUploader(transaction);
  
      // Track upload progress
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        setProgress((uploader.pctComplete || 0).toFixed(2));
      }
  
      if (uploader.isComplete) {
        const fileURL = `https://arweave.net/${transaction.id}`;
        setUploadStatus(`File uploaded successfully: ${fileURL}`);
      } else {
        setUploadStatus('Failed to upload file.');
      }
    } catch (err) {
      console.error('Error uploading file to Arweave:', err);
      setUploadStatus('Error occurred during file upload.');
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <h1 className={styles.heading}>Welcome, {user?.name}</h1>
      <div className={styles.walletConnect}>
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className={styles.connectButton}
          >
            Connect MetaMask
          </button>
        ) : (
          <p>Wallet connected: {walletAddress}</p>
        )}
      </div>

      {walletAddress && (
        <div className={styles.uploadFormContainer}>
          <p>Select a file to upload to Arweave:</p>
          <input
            type="file"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          <button
            onClick={uploadFileToArweave}
            className={styles.uploadButton}
            disabled={!file}
          >
            Upload File
          </button>
          {progress > 0 && (
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBar}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {uploadStatus && <p className={styles.successMessage}>{uploadStatus}</p>}
    </div>
  );
}
