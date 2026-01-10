import React, { useState, useEffect } from 'react';
import { Share, Download, X } from 'lucide-react';
import './InstallPWA.css';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (PWA)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');

        setIsStandalone(isStandaloneMode);

        if (isStandaloneMode) return;

        // Check for iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        // Capture install prompt for Android/Chrome
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
    };

    if (isStandalone) return null;
    if (!isIOS && !deferredPrompt) return null; // Don't show if installed or not installable on non-iOS

    return (
        <>
            <button className="pwa-install-btn" onClick={handleInstallClick}>
                <Download size={20} />
                <span>Add to Home Screen</span>
            </button>

            {showIOSInstructions && (
                <div className="ios-instructions-overlay" onClick={() => setShowIOSInstructions(false)}>
                    <div className="ios-instructions-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowIOSInstructions(false)}>
                            <X size={20} />
                        </button>

                        <div className="ios-icon-preview">
                            <img src="/pwa-192x192.png" alt="App Icon" />
                        </div>

                        <h3>Install LevelUp</h3>
                        <p>Install this application on your home screen for quick and easy access when you're on the go.</p>

                        <div className="instruction-steps">
                            <div className="step">
                                <span className="step-number">1</span>
                                <p>Tap the <Share size={16} className="inline-icon" /> <strong>Share</strong> button in your browser menu bar.</p>
                            </div>
                            <div className="step">
                                <span className="step-number">2</span>
                                <p>Scroll down and choose <strong className="nowrap">Add to Home Screen</strong>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InstallPWA;
