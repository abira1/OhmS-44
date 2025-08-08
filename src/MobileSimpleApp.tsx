import React, { useState, useEffect } from 'react';

// Simplified mobile-first app without complex dependencies
const MobileSimpleApp: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    hasTouch: false
  });

  useEffect(() => {
    // Simple device detection
    const updateDeviceInfo = () => {
      setDeviceInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        hasTouch: 'ontouchstart' in window
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    
    // Mark as loaded after a short delay
    setTimeout(() => setIsLoaded(true), 500);

    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>OhmS-44</div>
          <div style={{ fontSize: '16px', marginTop: '10px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>⚡ OhmS-44</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>Where Energy Meets Excellence</p>
      </header>

      {/* Device Info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>📱 Device Info</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Screen Size:</span>
            <span>{deviceInfo.width} × {deviceInfo.height}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mobile Device:</span>
            <span style={{ color: deviceInfo.isMobile ? '#4CAF50' : '#f44336' }}>
              {deviceInfo.isMobile ? 'YES' : 'NO'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Touch Support:</span>
            <span style={{ color: deviceInfo.hasTouch ? '#4CAF50' : '#f44336' }}>
              {deviceInfo.hasTouch ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{
        background: 'rgba(76, 175, 80, 0.2)',
        border: '2px solid #4CAF50',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
        <h3 style={{ margin: '0 0 10px 0' }}>Mobile App Working!</h3>
        <p style={{ margin: 0, opacity: 0.9 }}>
          This simplified version proves React can render on your mobile device.
        </p>
      </div>

      {/* Navigation Sections */}
      <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
        {[
          { icon: '📅', title: 'Routine', desc: 'Class schedules and timetables' },
          { icon: '👥', title: 'Classmates', desc: 'Student directory and contacts' },
          { icon: '✅', title: 'Attendance', desc: 'Attendance tracking and records' },
          { icon: '📢', title: 'Notices', desc: 'Important announcements' }
        ].map((section, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => alert(`${section.title} section clicked!`)}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{section.icon}</div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{section.title}</h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>{section.desc}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gap: '15px' }}>
        <button
          onClick={() => window.location.href = '/mobile-debug.html'}
          style={{
            padding: '15px',
            border: 'none',
            borderRadius: '10px',
            background: '#ff9800',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🔧 Debug Tools
        </button>
        
        <button
          onClick={() => {
            localStorage.setItem('force-simple-mode', 'false');
            window.location.href = '/';
          }}
          style={{
            padding: '15px',
            border: 'none',
            borderRadius: '10px',
            background: '#9D4EDD',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🚀 Try Full App
        </button>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '20px',
        opacity: 0.7,
        fontSize: '14px'
      }}>
        <p>OhmS-44 Mobile Simple Mode</p>
        <p>If you see this, React is working on your device! 🎉</p>
      </footer>
    </div>
  );
};

export default MobileSimpleApp;
