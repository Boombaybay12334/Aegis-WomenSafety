import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/">Aegis</Link>
          </div>
          <ul className="navbar-menu">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a></li>
            <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
            <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a></li>
            <li><a href="tel:1091" className="helpline-link">Women Helpline: 1091</a></li>
            <li><Link to="/login" className="navbar-login-btn">Login</Link></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section fullscreen-section" id="home">
        <div className="hero-content">
          <h1>Your Anonymous Safe Box for Evidence</h1>
          <p className="tagline">
            Securely store evidence and alert authorities without revealing your identity. Aegis gives you back control and safety.
          </p>
          <Link to="/signup" className="hero-cta-button">Create a Secure Account</Link>
        </div>
      </section>

      <section className="features-section fullscreen-section" id="features">
        <h2 className="section-title">Core Features for Your Safety</h2>
        <div className="feature-cards-container">
          <div className="feature-card">
            <div className="feature-icon">👁️‍🗨️</div>
            <h3>Invisible Evidence Storage</h3>
            <p>Aegis uses steganography to hide your sensitive files. This breaks the cycle of an abuser finding and destroying your proof.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Blockchain Notary</h3>
            <p>We create a tamper-proof timestamp of your evidence on a public blockchain, providing a court-admissible chain of custody.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Zero-Trust Security</h3>
            <p>Your data is encrypted and split into pieces. No one, not even us, can access your files without your explicit action.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works-section fullscreen-section" id="how-it-works">
        <h2 className="section-title">A Secure Path to Justice in 3 Steps</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create Anonymous Account</h3>
            <p>Use only a secret passphrase you memorize. No email, no phone number, no personal information required.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Store Invisible Evidence</h3>
            <p>Conceal photos, audio, or documents inside ordinary images, making them undetectable to an abuser on your device.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Send Untraceable SOS Alerts</h3>
            <p>Anonymously send your GPS location and evidence access to authorities from our secure servers, not your phone.</p>
          </div>
        </div>
      </section>

      <footer className="homepage-footer">
        <p>Aegis is a secure platform designed for safety. If you are in immediate danger, please call your local emergency number.</p>
        <p>&copy; 2025 The DUO - Aegis Project. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
