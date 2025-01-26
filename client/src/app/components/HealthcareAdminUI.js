import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaUpload, FaFile, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios'; // For API requests
import styles from './DashboardUI.module.css';

export default function HealthcareAdminUI({ user }) {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch the list of uploaded files from the backend (or blockchain)
//     const fetchFiles = async () => {
//       try {
//         // Replace with your actual API endpoint to fetch files from blockchain
//         const response = await axios.get('/api/getPatientFiles');
//         setFiles(response.data.files);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching files:', error);
//         setLoading(false);
//       }
//     };

//     fetchFiles();
//   }, [user]);

  // Navigate to the upload page
  const handleUploadClick = () => {
    router.push('/upload-record');  // Redirect to the file upload page
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h2>Welcome, {user?.user_metadata?.company_name}</h2>
        <p>Here you can view and manage your medical records.</p>

        {/* Upload Record Button */}
        <button className={styles.button} onClick={handleUploadClick}>
          <FaUpload /> Upload Record
        </button>

        {/* View Files Section */}
        {/* <section>
          <h3>Your Uploaded Files</h3>
          {loading ? (
            <p>Loading your files...</p>
          ) : (
            <ul>
              {files.length > 0 ? (
                files.map((file, index) => (
                  <li key={index}>
                    <div>
                      <FaFile /> <strong>{file.name}</strong> - {file.size} MB
                    </div>
                    <div>
                      <FaShieldAlt /> Accessible by: {file.accessControl}
                    </div>
                  </li>
                ))
              ) : (
                <p>No files uploaded yet.</p>
              )}
            </ul>
          )}
        </section> */}
      </div>
    </div>
  );
}
