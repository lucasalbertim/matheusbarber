import React from 'react';
import styled from 'styled-components';
import { FaCode } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 20px 0;
  margin-top: auto;
  text-align: center;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const CompanyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
`;

const TechBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Copyright = styled.div`
  color: var(--text-light);
  font-size: 0.8rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <CompanyInfo>
          Desenvolvido por
          <TechBadge>
            <FaCode />
            Albertim Tech Solution
          </TechBadge>
        </CompanyInfo>
        <Copyright>
          © 2025 Albertim Tech Solution. Todos os direitos reservados.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;