import React from 'react';
import { useNavigate } from 'react-router-dom';
import { brand, fonts } from '../theme';
import { primaryButton } from '../components/common/styles';

interface MessagePageProps {
  title: string;
  children?: React.ReactNode;
}

export const MessagePage: React.FC<MessagePageProps> = ({ title, children }) => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 32, maxWidth: 520 }}>
        <h1 style={{ fontFamily: fonts.display, fontSize: 24, color: brand.forest, margin: '0 0 12px' }}>{title}</h1>
        {children && <p style={{ fontSize: 14, color: brand.stone, lineHeight: 1.7, margin: '0 0 24px' }}>{children}</p>}
        <button type="button" onClick={() => navigate('/')} style={primaryButton}>Back to Home</button>
      </div>
    </div>
  );
};
