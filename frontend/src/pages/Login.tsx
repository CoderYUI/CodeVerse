import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { UserRole } from '../types';
import '../styles/Login.css';
import { authAPI } from '../utils/api';

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #1a237e;
  color: white;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
`;

const RoleToggle = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

// Use $active instead of active to avoid React DOM attribute warning
const RoleButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem;
  border: none;
  background-color: ${props => props.$active ? '#1a237e' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.$active ? '#1a237e' : '#f0f0f0'};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1a237e;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #283593;
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  margin-bottom: 1rem;
  text-align: center;
`;

const Loading = styled.div`
  margin: 10px 0;
  text-align: center;
  color: #1a237e;
`;

const SignupLink = styled.p`
  text-align: center;
  margin-top: 1rem;
  
  a {
    color: #1a237e;
    text-decoration: underline;
    cursor: pointer;
  }
`;

// New styled components for pre-registered info
const PreRegisteredInfo = styled.div`
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0 20px;
`;

const PreRegisteredTitle = styled.h3`
  color: #2e7d32;
  font-size: 1.1rem;
  margin: 0 0 10px;
`;

const PreRegisteredData = styled.div`
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 8px;
  
  strong {
    font-weight: 600;
  }
`;

const PreRegisteredComplaints = styled.div`
  margin-top: 10px;
`;



// Add these new styled components for the trial account message
const TrialAccountMessage = styled.div`
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0 20px;
  font-size: 0.9rem;
`;

const MockOtpInfo = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: #e2e3e5;
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: monospace;
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('victim');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [preRegistered, setPreRegistered] = useState(false);
  const [preRegisteredData, setPreRegisteredData] = useState<any>(null);
  const [additionalInfo, setAdditionalInfo] = useState<any>({});
  const [address, setAddress] = useState('');
  
  useEffect(() => {
    // Clear form when role changes
    setEmail('');
    setPassword('');
    setPhone('');
    setOtp('');
    setName('');
    setOtpSent(false);
    setIsNewUser(false);
    setPreRegistered(false);
    setPreRegisteredData(null);
    setError(null);
    setAdditionalInfo({});
    setAddress('');
  }, [role]);

  const handlePoliceLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting login with email: ${email}`);
      const response = await authAPI.login(email, password);
      
      console.log('Login successful:', response.data.user.name);
      
      // Add a small delay to ensure the token is stored before navigation
      setTimeout(() => {
        navigate('/dashboard/police');
      }, 200);
    } catch (error: any) {
      console.error('Login error details:', error);
      
      // Handle specific error messages from the backend
      if (error.response?.data?.error) {
        setError(`Authentication failed: ${error.response.data.error}`);
      } else {
        setError(`Login failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      setError('Phone number is required');
      return;
    }
    
    // Format phone number for consistency
    let formattedPhone = phone;
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }
    
    console.log(`Sending OTP to: ${formattedPhone}`);
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.sendOTP(formattedPhone);
      
      setOtpSent(true);
      setIsNewUser(!response.data.exists && !response.data.pre_registered);
      
      // Check if user is pre-registered
      setPreRegistered(response.data.pre_registered);
      setPreRegisteredData(response.data.pre_registered_data);
      
      // If pre-registered, auto-fill the name
      if (response.data.pre_registered_data && response.data.pre_registered_data.name) {
        setName(response.data.pre_registered_data.name);
      }
      
      // If pre-registered and has address, auto-fill address
      if (response.data.pre_registered_data && response.data.pre_registered_data.address) {
        setAddress(response.data.pre_registered_data.address);
      }
      
      // If in development mode and mock_otp is returned, auto-fill it
      if (response.data.mock_otp) {
        setOtp(response.data.mock_otp);
        console.log(`Using mock OTP: ${response.data.mock_otp}`);
        
        // Show OTP message for development
        setAdditionalInfo({
          ...additionalInfo,
          devMode: true,
          mockOtp: response.data.mock_otp
        });
      }
      
      // Store the formatted phone number
      setPhone(formattedPhone);
    } catch (error: any) {
      console.error('OTP error:', error);
      setError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !otp) {
      setError('Phone number and OTP are required');
      return;
    }
    
    if (isNewUser && !name) {
      setError('Name is required for new users');
      return;
    }
    
    console.log(`Verifying OTP for phone: ${phone}, code: ${otp}`);
    
    setLoading(true);
    setError(null);
    
    // Prepare additional info
    const userAdditionalInfo = { ...additionalInfo };
    if (address) {
      userAdditionalInfo.address = address;
    }
    
    try {
      await authAPI.verifyOTP(phone, otp, name, userAdditionalInfo);
      
      // Redirect to dashboard
      navigate('/dashboard/victim');
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LeftPanel>
        <img src="/public/assets/lady-justice.svg" alt="NyayaCop Logo" style={{ width: '250px', marginBottom: '2rem' }} />
        <h1>AI Legal Copilot for FIR Filing</h1>
        <br></br>
        <p>Transform your legal experience with AI-powered assistance</p>
      </LeftPanel>

      <RightPanel>
        <Form onSubmit={role === 'police' ? handlePoliceLogin : (otpSent ? handleVerifyOTP : handleSendOTP)}>
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to continue</Subtitle>

          <RoleToggle>
            <RoleButton
              type="button"
              $active={role === 'victim'}
              onClick={() => setRole('victim')}
            >
              Victim
            </RoleButton>
            <RoleButton
              type="button"
              $active={role === 'police'}
              onClick={() => setRole('police')}
            >
              Police Officer
            </RoleButton>
          </RoleToggle>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {role === 'police' ? (
            // Police login form
            <>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            // Victim login form with OTP
            <>
              {!otpSent ? (
                // Phone number input to send OTP
                <Input
                  type="tel"
                  placeholder="Phone Number (e.g., 9876543210)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              ) : (
                // OTP verification form
                <>
                  {/* Display pre-registered info if available */}
                  {preRegistered && preRegisteredData && (
                    <PreRegisteredInfo>
                      <PreRegisteredTitle>Welcome back!</PreRegisteredTitle>
                      <PreRegisteredData>
                        <strong>Name:</strong> {preRegisteredData.name}
                      </PreRegisteredData>
                      {preRegisteredData.address && (
                        <PreRegisteredData>
                          <strong>Address:</strong> {preRegisteredData.address}
                        </PreRegisteredData>
                      )}
                      
                      {/* Remove displaying sensitive complaint content for privacy */}
                      {preRegisteredData.complaints && preRegisteredData.complaints.length > 0 && (
                        <PreRegisteredComplaints>
                          <strong>You have {preRegisteredData.complaints.length} previous complaint(s)</strong>
                          {/* Removed the detailed complaint text for privacy concerns */}
                        </PreRegisteredComplaints>
                      )}
                    </PreRegisteredInfo>
                  )}

                  {isNewUser && (
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  )}
                  
                  {/* Always show name field for pre-registered users, but pre-filled */}
                  {preRegistered && (
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled
                    />
                  )}
                  
                  {/* Optional address field */}
                  {(isNewUser || preRegistered) && (
                    <Input
                      type="text"
                      placeholder="Your Address (Optional)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  )}
                  
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoComplete="one-time-code" // Improved for mobile
                    inputMode="numeric" // Ensures numeric keyboard on mobile
                    pattern="[0-9]*" // Ensures only numbers are entered
                  />

                  {additionalInfo.devMode && additionalInfo.mockOtp && (
                    <TrialAccountMessage>
                      <strong>Note:</strong> In development mode, your OTP has been auto-filled.
                      <MockOtpInfo>
                        OTP: <strong>{additionalInfo.mockOtp}</strong>
                      </MockOtpInfo>
                    </TrialAccountMessage>
                  )}
                </>
              )}
            </>
          )}

          {loading ? (
            <Loading>Processing...</Loading>
          ) : (
            <SubmitButton type="submit">
              {role === 'police' 
                ? 'Sign In' 
                : (otpSent ? 'Verify OTP' : 'Send OTP')}
            </SubmitButton>
          )}
          
          {role === 'police' && (
            <SignupLink>
              Don't have an account? <a onClick={() => navigate('/signup')}>Sign up</a>
            </SignupLink>
          )}
          
          {role === 'victim' && otpSent && (
            <SignupLink>
              <a onClick={() => setOtpSent(false)}>Change phone number</a>
            </SignupLink>
          )}
        </Form>
      </RightPanel>
    </LoginContainer>
  );
};

export default Login;