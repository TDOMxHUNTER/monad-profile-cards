'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useReadContract, useSendTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import './MintCard.css';

interface MintCardProps {
  contractAddress?: string;
  className?: string;
  onProfileEdit?: boolean;
  profileData?: any;
}

const MintCard: React.FC<MintCardProps> = ({ 
  contractAddress = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
  className = "",
  onProfileEdit = false,
  profileData = null
}) => {
  const recipientAddress = "0x7bf2D50D2EC35ae6100BE9c4dbDadBE211Ae722E";
  const { isConnected, address, chain } = useAccount();
  const [mintAmount, setMintAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get user's MON balance
  const { data: balance } = useBalance({
    address: address,
    chainId: 10143, // Monad testnet
  });

  // Check if user has already minted (limit 1 per wallet)
  const { data: userMintCount } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ] as const,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContract, data: hash, error } = useWriteContract();
  const { sendTransaction, data: paymentHash, error: paymentError } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  const { isLoading: isPaymentConfirming, isSuccess: isPaymentConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash: paymentHash, 
    });

  // ERC721 mint function ABI with metadata (free mint)
  const mintABI = [
    {
      name: 'mintWithMetadata',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'metadata', type: 'string' }
      ],
      outputs: []
    }
  ] as const;

  const mintPrice = parseEther('1'); // 1 MON per NFT // unused for now
  
  // Check if user has enough balance
  const hasEnoughBalance = balance && balance.value >= mintPrice;
  const balanceInMon = balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0';
  
  // Check if user has already minted (limit 1 per wallet)
  const hasAlreadyMinted = userMintCount && userMintCount > 0;

  // Generate metadata for the NFT
  const generateMetadata = (profileData: any) => {
    const metadata = {
      name: `Profile Card - ${profileData?.name || 'Unknown'}`,
      description: `A unique profile card NFT for ${profileData?.name || 'user'} on Monad`,
      image: profileData?.avatarUrl || 'https://your-domain.com/avatar.png',
      attributes: [
        {
          trait_type: 'Name',
          value: profileData?.name || 'Unknown'
        },
        {
          trait_type: 'Title',
          value: profileData?.title || 'No Title'
        },
        {
          trait_type: 'Handle',
          value: profileData?.handle || 'unknown'
        },
        {
          trait_type: 'Mint Date',
          value: new Date().toISOString()
        },
        {
          trait_type: 'Chain',
          value: 'Monad Testnet'
        }
      ],
      external_url: `https://x.com/${profileData?.handle || 'unknown'}`,
      created_at: new Date().toISOString(),
      profile_version: profileData?.version || '1.0'
    };
    
    return JSON.stringify(metadata);
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!hasEnoughBalance) {
      alert(`Insufficient MON balance. You need 1 MON but have ${balanceInMon} MON`);
      return;
    }

    if (hasAlreadyMinted) {
      alert('You have already minted your profile NFT. Limit is 1 per wallet.');
      return;
    }

    if (chain?.id !== 10143) {
      alert('Please switch to Monad Testnet to mint');
      return;
    }

    try {
      setIsLoading(true);
      
      // First send payment to recipient
      await sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: mintPrice,
      });
      
      // Wait for payment confirmation before minting
      // The mint will happen in the useEffect when payment is confirmed
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle minting after payment is confirmed
  React.useEffect(() => {
    if (isPaymentConfirmed && address) {
      const mintNFT = async () => {
        try {
          const metadata = generateMetadata(profileData);
          
          await writeContract({
            address: contractAddress as `0x${string}`,
            abi: mintABI,
            functionName: 'mintWithMetadata',
            args: [address, metadata],
          });
        } catch (error) {
          console.error('Mint failed after payment:', error);
          alert('Payment successful but mint failed. Please contact support.');
          setIsLoading(false);
        }
      };
      
      mintNFT();
    }
  }, [isPaymentConfirmed, address, profileData]);

  // Reset loading state when mint is confirmed or fails
  React.useEffect(() => {
    if (isConfirmed) {
      setIsLoading(false);
      setShowSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } else if (error) {
      setIsLoading(false);
    }
  }, [isConfirmed, error]);

  // Reset loading state when payment fails
  React.useEffect(() => {
    if (paymentError) {
      setIsLoading(false);
    }
  }, [paymentError]);

  // No auto-mint on profile edit - user must manually mint

  return (
    <div className={`mint-card ${className}`}>
      <div className="mint-content">
        <h3>{onProfileEdit ? 'Profile Edit NFT' : 'Mint Your Profile NFT'}</h3>
        <p>{onProfileEdit ? 'Your profile changes have been minted as NFT!' : 'Create your unique profile NFT on Monad'}</p>

        {isConnected && (
          <div className="balance-display">
            <span className="balance-label">Your MON Balance:</span>
            <span className="balance-value">{balanceInMon} MON</span>
          </div>
        )}

        {isConnected && hasAlreadyMinted && (
          <div className="mint-limit-info">
            <span className="limit-icon">✅</span>
            <span className="limit-text">You have already minted your profile NFT</span>
          </div>
        )}

        <div className="price-display">
          <span className="price-label">Price:</span>
          <span className="price-value">1 MON</span>
        </div>

        <div className="mint-controls">
          <button
            className={`mint-button ${!isConnected || !hasEnoughBalance || hasAlreadyMinted ? 'disabled' : ''}`}
            onClick={handleMint}
            disabled={!isConnected || isLoading || isConfirming || isPaymentConfirming || !hasEnoughBalance || hasAlreadyMinted}
          >
            {isLoading || isPaymentConfirming
              ? 'Processing Payment...'
              : isConfirming
              ? 'Minting NFT...'
              : hasAlreadyMinted
              ? 'Already Minted (1 per wallet)'
              : !hasEnoughBalance && isConnected
              ? 'Insufficient MON Balance'
              : 'Mint Profile NFT for 1 MON'
            }
          </button>
        </div>

        {!isConnected && (
          <p className="connect-message">Connect your wallet to mint on Monad testnet</p>
        )}

        {isConnected && chain?.id !== 10143 && (
          <p className="error-message">⚠️ Please switch to Monad Testnet</p>
        )}

        {(error || paymentError) && (
          <p className="error-message">❌ Transaction failed. Please try again.</p>
        )}

        {showSuccess && (
          <div className="success-message">
            <p>✅ NFT minted successfully with MON!</p>
            {hash && (
              <a 
                href={`https://testnet.monadexplorer.com/tx/${hash}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#00ff88', textDecoration: 'underline', fontSize: '12px' }}
              >
                View on Monad Explorer
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MintCard;