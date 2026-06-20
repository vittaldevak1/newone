import { useState, useEffect, useRef } from 'react';
import { auth, RecaptchaVerifier } from '../firebase';
import { signInWithPhoneNumber } from 'firebase/auth';
import { API_URL } from '../services/api';

export default function PhoneVerificationStep({ formData, setFormData }) {
  const [phone, setPhone] = useState(formData.phone || '');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(formData.phoneVerified || false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const recaptchaRef = useRef(null);
  const confirmationRef = useRef(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    return window.recaptchaVerifier;
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) {
      setError('Enter a valid phone number with country code (e.g. +91...)');
      return;
    }
    setError('');
    setSending(true);
    try {
      const appVerifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      confirmationRef.current = confirmation;
      setOtpSent(true);
      setCountdown(60);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Check your number.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setError('');
    setVerifying(true);
    try {
      await confirmationRef.current.confirm(otp);
      // Mark verified on backend
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error('Failed to save phone verification');
      const user = await res.json();
      setVerified(true);
      setFormData({ ...formData, phone, phoneVerified: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid OTP. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (verified) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', alignItems: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>Phone Verified</div>
        <div style={{ fontSize: '14px', color: 'var(--label-color)', textAlign: 'center' }}>
          {phone} has been verified successfully.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div id="recaptcha-container" />

      {!otpSent ? (
        <>
          <div style={{ fontSize: '14px', color: 'var(--ink-soft)', textAlign: 'center', marginBottom: '8px' }}>
            We'll send a 6-digit code to verify your phone number. This helps keep our community safe.
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={sending}
              style={{
                width: '100%', height: '50px', padding: '0 16px',
                borderRadius: '12px', border: '1.5px solid var(--input-border)',
                background: 'var(--input-bg)', color: 'var(--ink)',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <label style={{
              position: 'absolute', left: '16px', top: '-8px',
              fontSize: '11px', color: 'var(--accent)',
              background: 'var(--card-bg)', padding: '0 4px',
            }}>Phone Number</label>
          </div>
          <button
            onClick={handleSendOtp}
            disabled={sending || !phone}
            style={{
              width: '100%', height: '48px', borderRadius: '12px',
              border: 'none', background: sending ? 'var(--label-color)' : 'var(--accent)',
              color: 'white', fontSize: '15px', fontWeight: '600',
              cursor: sending ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {sending ? 'Sending...' : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: '14px', color: 'var(--ink-soft)', textAlign: 'center' }}>
            Code sent to <strong>{phone}</strong>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              autoFocus
              disabled={verifying}
              style={{
                width: '100%', height: '50px', padding: '0 16px',
                borderRadius: '12px', border: '1.5px solid var(--input-border)',
                background: 'var(--input-bg)', color: 'var(--ink)',
                fontSize: '20px', fontWeight: '600', letterSpacing: '8px',
                textAlign: 'center', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <label style={{
              position: 'absolute', left: '16px', top: '-8px',
              fontSize: '11px', color: 'var(--accent)',
              background: 'var(--card-bg)', padding: '0 4px',
            }}>OTP Code</label>
          </div>
          <button
            onClick={handleVerifyOtp}
            disabled={verifying || otp.length !== 6}
            style={{
              width: '100%', height: '48px', borderRadius: '12px',
              border: 'none', background: verifying ? 'var(--label-color)' : 'var(--accent)',
              color: 'white', fontSize: '15px', fontWeight: '600',
              cursor: verifying ? 'not-allowed' : 'pointer',
            }}
          >
            {verifying ? 'Verifying...' : 'Verify OTP'}
          </button>
          {countdown > 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--label-color)', textAlign: 'center' }}>
              Resend OTP in {countdown}s
            </div>
          ) : (
            <button
              onClick={handleSendOtp}
              disabled={sending}
              style={{
                background: 'none', border: 'none', color: 'var(--accent)',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                textAlign: 'center', padding: '4px',
              }}
            >
              Resend OTP
            </button>
          )}
        </>
      )}

      {error && (
        <div style={{
          padding: '10px', borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444',
          fontSize: '13px', textAlign: 'center',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
