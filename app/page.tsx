'use client';
import { useState } from 'react';
import ProfileCard from './ProfileCard';
import ConnectButton from './components/ConnectButton';
import MintCard from './components/MintCard';

export default function Home() {
  const [profileData, setProfileData] = useState({
    name: "Monad",
    title: "Monad currently Testnet",
    handle: "monad_xyz",
    avatarUrl: "https://cdn.discordapp.com/attachments/1347255078981074997/1392105527236104243/monad_logo.png?ex=686e52cd&is=686d014d&hm=40e7b82868a759a1c5c78c0de8eb084d6a99c985408f5b59e052ea8f60d6fd37&"
  });
  const [nftMintCount, setNftMintCount] = useState(0);

  const handleProfileUpdate = (newData: Partial<typeof profileData>) => {
    setProfileData(prev => ({ ...prev, ...newData }));
    setNftMintCount(prev => prev + 1);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      gap: '20px',
      position: 'relative',
      background: `
        radial-gradient(circle at 20% 30%, rgba(29, 161, 242, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(192, 55, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(0, 255, 170, 0.05) 0%, transparent 50%),
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.03)"/></svg>'),
        linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)
      `,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 20px 20px, 100% 100%'
    }}>
      <ConnectButton />
      
      {/* Monad Logo and Heading */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '10px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundImage: 'url(https://cdn.discordapp.com/attachments/1347255078981074997/1392105527236104243/monad_logo.png?ex=686e52cd&is=686d014d&hm=40e7b82868a759a1c5c78c0de8eb084d6a99c985408f5b59e052ea8f60d6fd37&)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 0 20px rgba(29, 161, 242, 0.3))',
          animation: 'logoFloat 3s ease-in-out infinite'
        }} />
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #1da1f2 0%, #c037ff 50%, #00ffaa 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          margin: '0',
          letterSpacing: '2px',
          textShadow: '0 0 30px rgba(29, 161, 242, 0.3)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          MONAD PROFILE CARD
        </h1>
      </div>
      
      {nftMintCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '20px',
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          color: '#00ff88',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          🎨 Profile NFTs Minted: {nftMintCount}
        </div>
      )}
      <ProfileCard
        name={profileData.name}
        title={profileData.title}
        handle={profileData.handle}
        status="Online"
        contactText=''
        avatarUrl={profileData.avatarUrl}
        showUserInfo={true}
        enableTilt={true}
        onContactClick={() => window.open(`https://x.com/${profileData.handle}`, '_blank')}
        onProfileUpdate={handleProfileUpdate}
      />
      <MintCard />
    </div>
  );
}
