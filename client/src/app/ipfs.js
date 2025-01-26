import { create } from 'ipfs-http-client';

const ipfsClient = create('https://ipfs.infura.io:5001/api/v0'); // You can also use your own IPFS node

export const uploadToIPFS = async (file) => {
  try {
    const added = await ipfsClient.add(file);
    console.log('File uploaded to IPFS with CID:', added.path);
    return added.path;  // This is the CID
  } catch (err) {
    console.error('Error uploading file to IPFS:', err);
    throw new Error('Failed to upload file to IPFS');
  }
};