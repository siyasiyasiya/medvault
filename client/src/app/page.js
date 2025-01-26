import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import {FaKey, FaGlobe, FaLink, FaUserLock, FaUserPlus, FaHospital, FaShieldAlt} from  "react-icons/fa"

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Home Section */}
        <div className={styles.contentWrapper}>
          <div className={styles.text}>
            <h1 className={styles.title}>Empower Your Health Data With <span>MedVault</span></h1>
            <p className={styles.subtitle}>Take full ownership of your medical records. Secure, private, and always in your control.</p>
            <div className={styles.buttons}>
              <a href="/api/auth/login" className={styles.button}>
                Get Started
              </a>
              <a href="/learn-more" className={styles.button}>
                Learn More
              </a>
            </div>
          </div>
          <img src="/logo.png" alt="MedVault Logo" className={styles.logo} />
        </div>

        {/* Feature Section */}
        <section className={styles.features}>
          <h2 className={styles.featuresTitle}>Why Choose MedVault?</h2>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <FaKey size={80}/>
              <h3>Full Ownership</h3>
              <p>You decide who can access your medical records.</p>
            </div>
            <div className={styles.featureItem}>
              <FaUserLock size={80}/>
              <h3>Decentralized</h3>
              <p>Built on blockchain for unparalleled security.</p>
            </div>
            <div className={styles.featureItem}>
              <FaGlobe size={80}></FaGlobe>
              <h3>Global Access</h3>
              <p>Access your data anytime, anywhere.</p>
            </div>
            <div className={styles.featureItem}>
              <FaLink size={80}></FaLink>
              <h3>Interoperability</h3>
              <p>Seamlessly connect with healthcare providers.</p>
            </div>
          </div>
        </section>

        {/* Explainer Section */}
        <section className={styles.explainerSection}>
          <h2 className={styles.explainerTitle}>How It Works</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineStep}>
              <FaUserPlus className={styles.icon} />
              <h3>Sign Up</h3>
              <p>Create your account and secure your records.</p>
            </div>
            <div className={styles.timelineConnector}></div>
            <div className={styles.timelineStep}>
              <FaHospital className={styles.icon} />
              <h3>Connect</h3>
              <p>Share records with healthcare providers in ease.</p>
            </div>
            <div className={styles.timelineConnector}></div>
            <div className={styles.timelineStep}>
              <FaShieldAlt className={styles.icon} />
              <h3>Control</h3>
              <p>Grant or revoke record access with a single click.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
