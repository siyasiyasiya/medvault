'use client'
// import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import PatientUI from '../components/PatientUI';
import styles from './dashboard.module.css';

export default function Dashboard() {
//   const { user, isLoading, error } = useUser(); 
  const router = useRouter();
  const [accountType, setAccountType] = useState(null);
  const [user, setUser] = useState(null);
//   if (isLoading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     console.error(error);
//     return <p>Error fetching user data.</p>;
//   }

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const res = await fetch('/api/getusersession');  // API call to the newly created route
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAccountType(data.accountType);
        } else {
          console.log('Not authenticated');
        }
      } catch (error) {
        console.log('Error fetching session:', error);
      }
    };

    fetchUserSession();
  }, []);

  console.log('Account Type:', accountType);
  console.log("user:", user);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      {accountType === 'Patient' && <PatientUI user={user} />}
      {accountType === 'Healthcare_Admin' && <HealthcareAdminUI user={user} />}
      {!accountType && (
        <p>You do not have an account type assigned. Please contact support.</p>
      )}
    </div>
  );
}

// Healthcare Admin UI Component
function HealthcareAdminUI({ user }) {
  return (
    <div>
      <h2>Welcome, Healthcare Admin</h2>
      <p>Here you can manage patient data and medical records.</p>
      <button style={buttonStyle}>Manage Patients</button>
      <button style={buttonStyle}>Manage Records</button>
    </div>
  );
}

// // Patient UI Component
// function PatientUI({ user }) {
//   return (
//     <div>
//       <h2>Welcome, {user?.name}</h2>
//       <p>Here you can view and manage your medical records.</p>
//       <button style={buttonStyle}>View Records</button>
//       <button style={buttonStyle}>Request Appointment</button>
//     </div>
//   );
// }

// Basic inline styling for buttons
const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  margin: '10px',
};

