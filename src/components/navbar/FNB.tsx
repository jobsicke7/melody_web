// components/Footer/Footer.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './FNB.module.css';
import { FaDiscord } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

interface FooterProps {
  logoUrl: string;
  discordUrl: string;
  emailAddress: string;
}

const Footer: React.FC<FooterProps> = ({ 
  logoUrl = '/team_logo.png', 
  discordUrl = 'https://discord.gg/kW3tXNEWNs',
  emailAddress = 'contact@jobsickes.shop'
}) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.logoSection}>
          <Image 
            src={logoUrl} 
            alt="TEAM Melody Logo" 
            width={180} 
            height={40} 
            className={styles.logo}
            style={{ maxWidth: '100%', height: 'auto' }} // 가로 크기 제한 및 종횡비 유지
          />
            <p className={styles.copyright}>© 2025 TEAM Melody.</p>
          </div>
          
          <div className={styles.linksContainer}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>약관 및 방침</h4>
              <nav className={styles.linkList}>
                <Link href="/terms" className={styles.link}>서비스 이용약관</Link>
                <Link href="/privacy" className={styles.link}>개인정보 처리 방침</Link>
              </nav>
            </div>
            
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>지원/문의</h4>
              <nav className={styles.linkList}>
                <a href={discordUrl} className={styles.link} target="_blank" rel="noopener noreferrer">
                  <FaDiscord className={styles.icon} /> 디스코드 서버
                </a>
                <a href={`mailto:${emailAddress}`} className={styles.link}>
                  <MdEmail className={styles.icon} /> {emailAddress}
                </a>
              </nav>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.buildInfo}>
            Thanks to everyone | Ver 0.9
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;