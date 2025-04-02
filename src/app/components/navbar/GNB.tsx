'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, MoreVertical, LogOut, User } from 'lucide-react';
import styles from './GNB.module.css';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

interface NavItem {
  label: string;
  href: string;
  highlighted?: boolean;
  isExternal?: boolean; // 외부 링크 여부를 위한 속성 추가
}

const navItems: NavItem[] = [
  { label: '명령어', href: '/commands' },
  { label: '커뮤니티', href: 'https://discord.gg/kW3tXNEWNs'},
  { label: '대시보드', href: '/dashboard' },
  {
    label: '초대하기',
    href: 'https://discord.com/oauth2/authorize?client_id=1310753814319468565&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Fdev.jobsickes.shop%2Finvitethanks&integration_type=0&scope=identify+bot+applications.commands',
    highlighted: true,
    isExternal: true, // 외부 링크 처리
  },
];

const moreItems: NavItem[] = [
  { label: '공지사항', href: '/announcements' },
  { label: '상태 확인', href: '/status' },
];

export default function GNB() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarPanelRef = useRef<HTMLDivElement>(null);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 사이드바 애니메이션을 위한 로직
  const toggleSidebar = () => {
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };
  
  const openSidebar = () => {
    // 먼저 isOpen을 true로 설정하여 컴포넌트가 렌더링되도록 함
    setIsOpen(true);
    // 그 다음 tick에서 애니메이션을 활성화
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
    // 애니메이션 적용을 위해 body 스크롤 방지
    document.body.style.overflow = 'hidden';
  };
  
  const closeSidebar = () => {
    setIsAnimating(false);
    // 애니메이션이 끝나면 완전히 닫기
    setTimeout(() => {
      setIsOpen(false);
      document.body.style.overflow = '';
    }, 300); // 애니메이션 시간과 동일하게 설정
  };
  
  // 오버레이 클릭 시 사이드바 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };
  
  const toggleMoreMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
    setShowUserMenu(false);
  };

  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
    setShowMoreMenu(false);
  };

  const handleLogin = () => {
    signIn('discord', { callbackUrl: window.location.href });
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
    setShowUserMenu(false);
  };

  // 새 탭에서 열기 처리
  const handleExternalLinkClick = (href: string) => {
    window.open(href, '_blank', 'noopener noreferrer');
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : styles.navbarTop}`}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            {/* Left side - Bot Logo and Name */}
            <div className={styles.logoSection}>
              <Link href="/" className={styles.logo}>
                <Image
                  src="/bot-avatar.png"
                  alt="Bot Profile"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className={styles.botName}>멜로</span>
              </Link>
            </div>

            {/* Right side - Navigation Items (Desktop) */}
            <div className={styles.navItemsDesktop}>
              {navItems.map((item) => (
                item.isExternal ? (
                  <button
                    key={item.label}
                    onClick={() => handleExternalLinkClick(item.href)} // 클릭 시 새 탭에서 열기
                    className={`${styles.navItem} ${item.highlighted ? styles.highlightedNavItem : ''}`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`${styles.navItem} ${item.highlighted ? styles.highlightedNavItem : ''}`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              {/* User authentication */}
              {status === 'authenticated' && session?.user ? (
                <div className={styles.userButtonContainer} ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className={styles.userProfileBtn}
                    aria-label="User menu"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt="User profile"
                        width={24}
                        height={24}
                        className={styles.userAvatar}
                      />
                    ) : (
                      <User size={20} />
                    )}
                    <span className={styles.userName}>{session.user.name || '사용자'}</span>
                  </button>

                  {showUserMenu && (
                    <div className={styles.userMenu}>
                      <button
                        onClick={handleLogout}
                        className={styles.userMenuItem}
                      >
                        <LogOut size={16} />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className={`${styles.navItem} ${styles.loginButton}`}
                >
                  로그인
                </button>
              )}
              {/* More Menu (Desktop) */}
              <div className={styles.moreButtonContainer} ref={moreMenuRef}>
                <button
                  onClick={toggleMoreMenu}
                  className={styles.moreButton}
                  aria-label="More options"
                >
                  <MoreVertical size={20} />
                </button>

                {showMoreMenu && (
                  <div className={styles.moreMenu}>
                    {moreItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={styles.moreMenuItem}
                        onClick={() => setShowMoreMenu(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div>
              <button
                onClick={toggleSidebar}
                className={styles.mobileMenuButton}
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className={styles.sidebar}>
          <div 
            className={`${styles.overlay} ${isAnimating ? styles.overlayActive : ''}`} 
            aria-hidden="true" 
            onClick={handleOverlayClick}
          />
          
          <div 
            ref={sidebarPanelRef}
            className={`${styles.sidebarPanel} ${isAnimating ? styles.sidebarPanelActive : ''}`}
          >
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarTitle}>메뉴</span>
              <button
                onClick={closeSidebar}
                className={styles.closeButton}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.sidebarContent}>
              {navItems.map((item) => (
                item.isExternal ? (
                  <button
                    key={item.label}
                    onClick={() => {
                      handleExternalLinkClick(item.href); // 클릭 시 새 탭에서 열기
                      closeSidebar(); // 사이드바 닫기
                    }}
                    className={`${styles.sidebarItem} ${item.highlighted ? styles.highlightedNavItem : ''}`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`${styles.sidebarItem} ${item.highlighted ? styles.highlightedNavItem : ''}`}
                    onClick={closeSidebar}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              
              {/* More items directly in sidebar on mobile */}
              <div className={styles.sidebarDivider}>
                {moreItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={styles.sidebarItem}
                    onClick={closeSidebar}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {/* Authentication in sidebar */}
              <div className={styles.sidebarDivider}>
                {status === 'authenticated' && session?.user ? (
                  <>
                    <div className={styles.userInfo}>
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt="User profile"
                          width={24}
                          height={24}
                          className={styles.userAvatar}
                        />
                      ) : (
                        <User size={20} />
                      )}
                      <span>{session.user.name || '사용자'}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        closeSidebar();
                      }}
                      className={styles.sidebarItem}
                    >
                      <LogOut size={16} className={styles.sidebarItemIcon} />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleLogin();
                      closeSidebar();
                    }}
                    className={`${styles.sidebarItem} ${styles.loginButtonMobile}`}
                  >
                    로그인
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}