# NyayaCop - AI-Powered Legal Assistance Platform

![SAARTHI Logo](frontend/public/assets/nyayacop-logo.svg)

## Overview

NyayaCop is an AI-powered legal assistance platform designed to help victims easily file complaints with police departments and navigate the legal system in India. The platform leverages artificial intelligence to classify complaints, suggest relevant IPC sections, and guide users through the complaint filing process, all while ensuring the integrity and security of data through blockchain verification.

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Frontend](#frontend)
6. [Backend](#backend)
7. [AI Integration](#ai-integration)
8. [Blockchain Component](#blockchain-component)
9. [Database Structure](#database-structure)
10. [Deployment](#deployment)
11. [APIs](#apis)
12. [Security Features](#security-features)
13. [Testing](#testing)
14. [Future Enhancements](#future-enhancements)
15. [Troubleshooting](#troubleshooting)
16. [Credits and Contributors](#credits-and-contributors)
17. [Presentation Resources](#presentation-resources)

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Styled Components & CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Map Integration**: Leaflet.js

### Backend
- **Framework**: Flask (Python)
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB
- **SMS Notifications**: Twilio API
- **API Documentation**: Swagger

### AI Component
- **Language Model**: Google Gemini API
- **Text Analysis**: Custom NLP models
- **Legal Classification**: Supervised learning on IPC sections

### Blockchain Component
- **Framework**: Truffle Suite
- **Network**: Ethereum (Ganache for development)
- **Smart Contract**: Solidity
- **Web3 Interface**: Web3.js

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions

## Architecture

NyayaCop follows a modern microservices architecture with the following components:

The architecture includes:
- A React-based frontend deployed on Vercel
- A Flask-based backend API deployed on Render
- MongoDB Atlas for database storage
- Ethereum blockchain for data integrity verification
- Google Gemini API for AI-powered legal analysis

The components work together to provide a seamless experience for both victims filing complaints and police officers managing cases.

## Features

### For Victims
- Phone number-based authentication with OTP
- File complaints in multiple languages
- AI-powered legal guidance
- Real-time tracking of complaint status
- Location-based police station finder
- SMS notifications for status updates
- Legal guides and resources

### For Police Officers
- Secure login with email and password
- Dashboard to manage and update complaints
- AI assistance for legal classification of complaints
- Tools to add case notes and update status
- Blockchain verification of complaint integrity
- Pre-registration of victims from in-person complaints

## Project Structure

The project is organized into three main components:

- **frontend/**: React frontend application
- **backend/**: Flask backend API server
- **blockchain_dev/**: Blockchain integration components

## Frontend

The frontend is built with React and TypeScript using Vite as the build tool. It provides interfaces for both victims and police officers with different features for each user role.

### Key Components

1. **Authentication**
   - OTP-based authentication for victims
   - Email/password authentication for police
   - JWT token management

2. **Complaint Filing**
   - Multi-step form with language selection
   - Location detection and police station mapping
   - Real-time AI feedback on legal classification

3. **Dashboard**
   - Status tracking for victims
   - Complaint management for police officers
   - Case notes and updates interface

4. **Legal Resources**
   - IPC sections library
   - Legal guides and FAQs
   - Legal rights information

## Backend

The backend is built with Flask and interacts with MongoDB for data storage. It handles authentication, complaint management, and integration with external services.

### Key Features

1. **Authentication System**
   - JWT token generation and verification
   - OTP generation and verification for victims
   - Password hashing for police accounts

2. **Complaint Management**
   - Creation, retrieval, and updates of complaints
   - Status tracking and notifications
   - Integration with AI for classification

3. **Police Interface**
   - Case management and updates
   - Victim pre-registration system
   - Note-taking and status updates

4. **Notification System**
   - Twilio integration for SMS notifications
   - Event-based notifications for status changes
   - Fallback mechanisms for development

## AI Integration

SAARTHI integrates with Google's Gemini API to provide intelligent legal assistance. The AI component performs several key functions:

1. **Legal Classification**
   - Analyzes complaint text to identify relevant IPC sections
   - Determines if the offense is cognizable or non-cognizable
   - Provides confidence scores for suggested sections

2. **Summary Generation**
   - Creates concise summaries of lengthy complaints
   - Extracts key information for police review
   - Identifies important details like dates, locations, and parties involved

3. **Multilingual Support**
   - Processes complaints in multiple Indian languages
   - Translates and preserves context for legal analysis
   - Provides responses in the user's preferred language

## Blockchain Component

The blockchain component ensures the integrity and immutability of filed complaints. It uses Ethereum smart contracts to store hashes of complaint data.

### Implementation

1. **Smart Contract**
   - Stores hashes of complaint data on the blockchain
   - Provides verification methods to check data integrity
   - Implements proper access control

2. **Integration with MongoDB**
   - Hashes complaint data from MongoDB
   - Stores the hash on the blockchain
   - Records the transaction hash and block information

3. **Verification System**
   - Allows verification of complaint integrity
   - Provides proof of when a complaint was filed
   - Ensures no tampering of complaint data

## Database Structure

SAARTHI uses MongoDB with the following collections:

### Collections

1. **victims**
   - User accounts for complaint filers
   - Authentication information
   - Personal details

2. **police**
   - Police officer accounts
   - Authentication credentials
   - Station assignments

3. **complaints**
   - Complaint text and details
   - Status and updates
   - References to victims and police officers
   - Blockchain verification data

4. **pre_registered_victims**
   - Victims registered by police officers
   - Temporary accounts until OTP verification
   - Associated complaint references

5. **case_notes**
   - Investigation updates
   - Timeline of actions
   - Visibility settings (public/private)

6. **notifications**
   - SMS notification history
   - Delivery status
   - Message content

## Deployment

SAARTHI uses a modern CI/CD pipeline for deployment:

### Frontend Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Configure build settings
3. Set environment variables
4. Handle SPA routing with `vercel.json`

### Backend Deployment (Render)

1. Connect GitHub repository to Render
2. Configure build settings
3. Set environment variables
4. Ensure CORS is properly configured

### Database Deployment (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Configure network access for Render and development environments
3. Set up database user credentials
4. Initialize collections and indexes

### Blockchain Deployment

For the hackathon, we used Ganache for local blockchain development. In production, this would be deployed to a testnet or mainnet.

## APIs

SAARTHI exposes several REST APIs:

### Authentication APIs

- `POST /api/auth/send-otp` - Send OTP for victim authentication
- `POST /api/auth/verify-otp` - Verify OTP and authenticate victim
- `POST /api/auth/police/login` - Police officer login
- `POST /api/auth/police/register` - Register new police officer
- `GET /api/auth/verify-token` - Verify JWT token validity
- `GET /api/auth/user` - Get current user details

### Complaint APIs

- `POST /api/complaints` - File a new complaint
- `GET /api/complaints` - List complaints (filtered by role)
- `GET /api/complaints/:id` - Get a specific complaint
- `PATCH /api/complaints/:id` - Update complaint status
- `POST /api/complaints/analyze` - Analyze complaint text with AI
- `POST /api/complaints/:id/notes` - Add case notes
- `GET /api/complaints/:id/notes` - Get case notes

### Police APIs

- `GET /api/police/stations` - List police stations
- `GET /api/police/ipc-sections` - Get IPC sections
- `POST /api/auth/police/register-victim` - Pre-register a victim

## Security Features

SAARTHI implements several security measures:

1. **Authentication**
   - JWT-based authentication with proper expiration
   - OTP-based verification for victims
   - Password hashing using Werkzeug's generate_password_hash

2. **Data Protection**
   - MongoDB connection secured with SRV protocol
   - Sensitive data stored with proper encryption
   - Blockchain verification for data integrity

3. **API Security**
   - CORS properly configured for production
   - Rate limiting on sensitive endpoints
   - Input validation and sanitization

4. **Access Control**
   - Role-based access control (RBAC)
   - Proper authorization checks on all endpoints
   - Visibility controls for case notes

## Testing

The project includes several testing components:

1. **Frontend Testing**
   - Component testing with React Testing Library
   - End-to-end testing with Cypress

2. **Backend Testing**
   - Unit tests for API endpoints
   - Integration tests for database operations

3. **Blockchain Testing**
   - Smart contract tests with Truffle
   - Integration tests for blockchain storage and verification

## Future Enhancements

Planned future enhancements include:

1. **Advanced AI Features**
   - Sentiment analysis for urgency detection
   - Evidence classification and organization
   - Prediction of case outcomes based on historical data

2. **Mobile Application**
   - Native mobile apps for Android and iOS
   - Offline complaint drafting
   - Push notifications for updates

3. **Integration with Government Systems**
   - CCTNS (Crime and Criminal Tracking Network and Systems) integration
   - e-Courts integration for case tracking
   - Digital evidence management

4. **Enhanced Security**
   - Multi-factor authentication for police
   - End-to-end encryption for sensitive communications
   - Advanced anomaly detection for fraud prevention

## Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**
   - Ensure `FRONTEND_URLS` in backend environment variables includes your frontend URL
   - Check that `app.py` has proper CORS configuration
   - Verify API requests include proper headers

2. **Authentication Issues**
   - Check JWT token expiration and validation
   - Ensure proper token storage in localStorage
   - Verify OTP generation and validation flow

3. **Blockchain Integration**
   - Ensure Ganache is running for local development
   - Check MongoDB connection for blockchain data storage
   - Verify smart contract deployment and ABI configuration

4. **Deployment Issues**
   - Verify environment variables in production
   - Check build commands and output directories
   - Ensure database connection strings are correct

## Credits and Contributors

SAARTHI was built as part of a hackathon project by:

- **Frontend Development**: [Your Name]
- **Backend Development**: [Your Name]
- **Blockchain Integration**: [Your Name]
- **AI Implementation**: [Your Name]
- **UI/UX Design**: [Your Name]

## Presentation Resources

For hackathon presentations, we've prepared:

1. **Demo Video**: [Link to video demonstration]
2. **Slide Deck**: [Link to presentation slides]
3. **Live Demo**: [Link to deployed application]
4. **Source Code**: [GitHub repository link]

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MongoDB
- Truffle Suite
- Google Gemini API key

### Installation

1. Clone the repository
2. Set up the backend with required environment variables
3. Set up the frontend with required environment variables
4. Set up the blockchain component
5. Run the application (backend and frontend)
6. Open your browser and navigate to the frontend URL

## Contributors:
1. Bhaskar Ojha  [Backend]
2. Anushka Dubey [Frontend]
3. S Dhanush  [Blockchain]
   

