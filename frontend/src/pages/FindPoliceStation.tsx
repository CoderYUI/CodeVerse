import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import '../styles/FindPoliceStation.css';

const Container = styled.div`
  min-height: 100vh;
  padding: 8rem 2rem 2rem;
  background: #f8f9fa;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1a237e;
  margin-bottom: 2rem;
  text-align: center;
`;

const MapContainer = styled.div`
  height: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const StationList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const StationCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
`;

const StationName = styled.h3`
  font-size: 1.4rem;
  color: #1a237e;
  margin-bottom: 1rem;
`;

const StationInfo = styled.p`
  color: #666;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 20px;
    height: 20px;
    color: #1a237e;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  margin: 2rem 0;
`;

interface PoliceStation {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
}

const FindPoliceStation: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // In a real app, you would fetch nearby police stations from your backend
          fetchNearbyStations(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError('Please enable location access to find nearby police stations.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  const fetchNearbyStations = async (lat: number, lng: number) => {
    try {
      // This is a mock implementation. In a real app, you would:
      // 1. Call your backend API with the user's location
      // 2. Your backend would use Google Places API or similar to find nearby police stations
      // 3. Return the list of stations with their details
      
      // Mock data for demonstration
      const mockStations: PoliceStation[] = [
        {
          id: '1',
          name: 'Central Police Station',
          address: '123 Main Street, City Center',
          phone: '+91 1234567890',
          location: { lat: lat + 0.01, lng: lng + 0.01 },
        },
        {
          id: '2',
          name: 'North Police Station',
          address: '456 North Avenue, North District',
          phone: '+91 2345678901',
          location: { lat: lat - 0.01, lng: lng + 0.01 },
        },
        {
          id: '3',
          name: 'South Police Station',
          address: '789 South Road, South District',
          phone: '+91 3456789012',
          location: { lat: lat + 0.01, lng: lng - 0.01 },
        },
      ];

      setStations(mockStations);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch nearby police stations. Please try again later.');
      setLoading(false);
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const defaultCenter = {
    lat: 20.5937, // Default to India's center
    lng: 78.9629,
  };

  return (
    <Container>
      <Content>
        <Title>Find Nearest Police Station</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {loading ? (
          <LoadingMessage>Loading nearby police stations...</LoadingMessage>
        ) : (
          <>
            <MapContainer>
              {/* Google Maps implementation will be added later */}
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}>
                Map will be implemented with Google Maps API
              </div>
            </MapContainer>

            <StationList>
              {stations.map((station) => (
                <StationCard key={station.id}>
                  <StationName>{station.name}</StationName>
                  <StationInfo>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {station.address}
                  </StationInfo>
                  <StationInfo>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                    {station.phone}
                  </StationInfo>
                </StationCard>
              ))}
            </StationList>
          </>
        )}
      </Content>
    </Container>
  );
};

export default FindPoliceStation; 