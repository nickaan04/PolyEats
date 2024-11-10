import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VerifyEmail() {
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      fetch(`http://localhost:8000/auth/verify-email?token=${token}`)
        .then((response) => {
          if (response.ok) {
            setMessage('Email successfully verified! Redirecting....');
            // Redirect after a delay
            setTimeout(() => {
              navigate('http://localhost:5173'); // Change the path if you want to redirect elsewhere
            }, 2000); // 2-second delay for feedback
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
  }, [navigate]);

  return <div>{message}</div>;
}

export default VerifyEmail;
