import React, { useEffect, useState } from 'react';

function VerifyEmail() {
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      fetch(`http://localhost:8000/auth/verify-email?token=${token}`)
        .then((response) => {
          if (response.ok) {
            setMessage('Email successfully verified!');
          } else {
            setMessage('Invalid or expired verification token.');
          }
        })
        .catch(() => {
          setMessage('An error occurred while verifying your email.');
        });
    } else {
      setMessage('No verification token provided.');
    }
  }, []);

  return <div>{message}</div>;
}

export default VerifyEmail;
