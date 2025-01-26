import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import KeyIcon from '@mui/icons-material/Key';
import PublicIcon from '@mui/icons-material/Public';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import HubIcon from '@mui/icons-material/Hub';

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
              <Link href="/api/auth/login" className={styles.button}>
                Get Started
              </Link>
              <Link href="/learn-more" className={styles.button}>
                Learn More
              </Link>
            </div>
          </div>
          <img src="/logo.png" alt="MedVault Logo" className={styles.logo} />
        </div>

        {/* Feature Section */}
        <section className={styles.features}>
          <h2 className={styles.featuresTitle}>Why Choose MedVault?</h2>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              {/* <KeyIcon style={{ fontSize: 80 }}></KeyIcon> */}
              <h3>Full Ownership</h3>
              <p>You decide who can access your medical records.</p>
            </div>
            <div className={styles.featureItem}>
              {/* <HubIcon style={{ fontSize: 80 }}></HubIcon> */}
              <h3>Decentralized</h3>
              <p>Built on blockchain for unparalleled security.</p>
            </div>
            <div className={styles.featureItem}>
              {/* <PublicIcon style={{ fontSize: 80 }}></PublicIcon> */}
              <h3>Global Access</h3>
              <p>Access your data anytime, anywhere.</p>
            </div>
            <div className={styles.featureItem}>
              {/* <ConnectWithoutContactIcon style={{ fontSize: 80 }}></ConnectWithoutContactIcon> */}
              <h3>Interoperability</h3>
              <p>Seamlessly connect with healthcare providers.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
