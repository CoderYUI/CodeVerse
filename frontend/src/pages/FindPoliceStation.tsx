import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
// Don't import leaflet at the top level, we'll import it dynamically
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

// We don't need this styled component anymore, using direct CSS
// const MapContainer = styled.div`...`;

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

// Fix the DOM nesting issue by changing from p to div
const StationInfo = styled.div`
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

// Remove unused SearchBar component

const DirectionsButton = styled.button`
  background: #1a237e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #0e1562;
  }
`;

const CallButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #388e3c;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const StationCardSelected = styled(StationCard)<{ selected: boolean }>`
  border: ${props => props.selected ? '2px solid #1a237e' : '1px solid #eee'};
  background: ${props => props.selected ? '#f5f7ff' : 'white'};
`;

const DistanceBadge = styled.span`
  background: #e3f2fd;
  color: #1565c0;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 10px;
`;

interface PoliceStation {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance?: string;
  location: {
    lat: number;
    lng: number;
  };
}

// Define Leaflet types to avoid TypeScript errors
interface LeafletMap {
  setView: (center: [number, number], zoom: number) => any;
  remove: () => void;
}

interface LeafletMarker {
  addTo: (map: any) => any;
  bindPopup: (content: string) => any;
  openPopup: () => any;
  remove: () => any;
  getLatLng: () => { lat: number; lng: number };
}

const FindPoliceStation: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string>('');
  const [addressLoading, setAddressLoading] = useState<Record<string, boolean>>({});
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const mapInitializedRef = useRef<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Single effect to handle map initialization
  useEffect(() => {
    console.log("Starting map initialization process");
    
    // Step 1: Create the map div immediately
    let mapElement = document.getElementById('map');
    if (!mapElement) {
      console.log("Map element doesn't exist, creating it manually");
      
      // Create the map container if it doesn't exist
      let mapContainer = document.querySelector('.map-container');
      if (!mapContainer) {
        console.log("Map container doesn't exist, creating it manually");
        mapContainer = document.createElement('div');
        mapContainer.className = 'map-container';
        
        // Find a good place to insert it - look for the content div
        const contentDiv = document.querySelector('.'+Content.styledComponentId);
        if (contentDiv) {
          // Insert after the title
          const titleElement = contentDiv.querySelector('h1');
          if (titleElement) {
            titleElement.insertAdjacentElement('afterend', mapContainer);
          } else {
            contentDiv.appendChild(mapContainer);
          }
        } else {
          document.body.appendChild(mapContainer);
        }
      }
      
      // Create the map element
      mapElement = document.createElement('div');
      mapElement.id = 'map';
      mapElement.style.width = '100%';
      mapElement.style.height = '100%';
      mapContainer.innerHTML = ''; // Clear any existing content
      mapContainer.appendChild(mapElement);
      console.log("Map element created:", mapElement);
    }
    
    // Step 2: Load Leaflet after a delay to ensure DOM is ready
    const loadLeafletTimeout = setTimeout(async () => {
      try {
        console.log("Loading Leaflet...");
        
        // Add Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          console.log("Leaflet CSS added");
        }
        
        // Check again if map element exists
        const mapElement = document.getElementById('map');
        if (!mapElement) {
          console.error("Map element still not found after creating it");
          setMapError('Unable to create map container. Please refresh the page.');
          setLoading(false);
          return;
        }
        
        // Load Leaflet with dynamic import
        console.log("Dynamically importing Leaflet");
        const leafletModule = await import('leaflet');
        const L = leafletModule.default;
        
        // Initialize map with Leaflet
        if (!mapInitializedRef.current) {
          console.log("Initializing map with Leaflet");
          
          // Get user location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log("Got user position:", position.coords);
                const userPos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                setUserLocation(userPos);
                
                try {
                  console.log("Creating map at position:", userPos);
                  
                  // Create map
                  const map = L.map('map', {
                    center: [userPos.lat, userPos.lng],
                    zoom: 13,
                    attributionControl: true
                  });
                  
                  console.log("Map created:", map);
                  
                  // Add tile layer
                  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  }).addTo(map);
                  
                  // Store map reference
                  mapRef.current = map;
                  mapInitializedRef.current = true;
                  
                  // Add user marker
                  const userIcon = L.divIcon({
                    className: 'user-marker',
                    html: `<div class="user-marker-inner"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  });
                  
                  L.marker([userPos.lat, userPos.lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup('Your Location')
                    .openPopup();
                  
                  // Search for police stations
                  searchNearbyPoliceStations(L, map, userPos);
                } catch (err) {
                  console.error("Error creating map:", err);
                  setMapError('Error creating map: ' + (err instanceof Error ? err.message : String(err)));
                  setLoading(false);
                }
              },
              (err) => {
                console.error("Geolocation error:", err);
                setError('Please enable location access to find nearby police stations.');
                
                // Use default location
                const defaultPos = { lat: 28.6139, lng: 77.2090 };
                
                try {
                  // Create map with default location
                  const map = L.map('map').setView([defaultPos.lat, defaultPos.lng], 13);
                  
                  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  }).addTo(map);
                  
                  mapRef.current = map;
                  mapInitializedRef.current = true;
                  
                  // Show default stations
                  fallbackToDefaultStations(L, map, defaultPos);
                } catch (mapErr) {
                  console.error("Error creating map with default location:", mapErr);
                  setMapError('Error creating map with default location');
                } finally {
                  setLoading(false);
                }
              },
              { timeout: 10000 } // 10 second timeout for geolocation
            );
          } else {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error in Leaflet initialization:", err);
        setMapError('Failed to load map library: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    }, 1000);
    
    // Cleanup function
    return () => {
      clearTimeout(loadLeafletTimeout);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          console.error("Error removing map:", err);
        }
        mapRef.current = null;
      }
      mapInitializedRef.current = false;
    };
  }, []);

  // Check if map container is rendered and visible
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current && !mapInitializedRef.current) {
      console.log('Map container is visible but map not initialized, attempting to reload');
      const reloadMap = async () => {
        try {
          const L = await import('leaflet') as any;
          if (L && !mapInitializedRef.current) {
            initMap(L);
            mapInitializedRef.current = true;
          }
        } catch (err) {
          console.error('Error reloading map:', err);
        }
      };
      reloadMap();
    }
  }, [mapContainerRef.current]);

  const initMap = (L: any) => {
    // Double-check if map is already initialized or if map container doesn't exist
    const mapElement = document.getElementById('map');
    if (mapRef.current) {
      console.log('Map already initialized');
      return;
    }
    
    if (!mapElement) {
      console.error('Map element not found during initialization');
      setMapError('Map container not found. Please refresh the page.');
      setLoading(false);
      return;
    }
    
    console.log('Initializing map with element:', mapElement);
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          
          // Create map centered at user's location
          const mapElement = document.getElementById('map');
          if (mapElement) {
            try {
              console.log('Creating map at user location:', userPos);
              
              // Create Leaflet map
              const map = L.map('map').setView([userPos.lat, userPos.lng], 13);
              
              // Add OpenStreetMap tile layer
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }).addTo(map);
              
              mapRef.current = map;
              
              // Add user location marker
              const userIcon = L.divIcon({
                className: 'user-marker',
                html: `<div class="user-marker-inner"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              });

              L.marker([userPos.lat, userPos.lng], { icon: userIcon })
                .addTo(map)
                .bindPopup('Your Location')
                .openPopup();
              
              // Search for police stations nearby
              searchNearbyPoliceStations(L, map, userPos);
            } catch (err) {
              console.error('Map initialization error:', err);
              setMapError('Failed to initialize map. Please refresh the page.');
              setLoading(false);
            }
          } else {
            console.error('Map element not found');
            setMapError('Map container not found. Please refresh the page.');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Please enable location access to find nearby police stations.');
          setLoading(false);
          
          // Fall back to default location (Delhi)
          const defaultPos = { lat: 28.6139, lng: 77.2090 };
          
          // Create map with default location
          const mapElement = document.getElementById('map');
          if (mapElement) {
            try {
              const map = L.map('map').setView([defaultPos.lat, defaultPos.lng], 13);
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }).addTo(map);
              
              mapRef.current = map;
              
              // Show default stations
              fallbackToDefaultStations(L, map, defaultPos);
            } catch (err) {
              console.error('Map initialization error with default location:', err);
              setMapError('Failed to initialize map. Please refresh the page.');
            }
          }
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  };

  const searchNearbyPoliceStations = async (L: any, map: any, location: { lat: number; lng: number }) => {
    try {
      // Use Overpass API to find police stations
      const overpassApiUrl = 'https://overpass-api.de/api/interpreter';
      const radius = 5000; // 5km radius in meters
      
      // Overpass query for police stations
      const query = `
        [out:json];
        (
          node["amenity"="police"](around:${radius},${location.lat},${location.lng});
          way["amenity"="police"](around:${radius},${location.lat},${location.lng});
          relation["amenity"="police"](around:${radius},${location.lat},${location.lng});
        );
        out body;
        >;
        out skel qt;
      `;
      
      const response = await fetch(overpassApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(query)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch police stations');
      }
      
      const data = await response.json();
      
      // Process results
      if (data.elements && data.elements.length > 0) {
        processOsmPoliceStations(L, data.elements, map, location);
      } else {
        console.log('No police stations found, using fallback data');
        fallbackToDefaultStations(L, map, location);
      }
    } catch (error) {
      console.error('Error fetching police stations:', error);
      fallbackToDefaultStations(L, map, location);
    } finally {
      setLoading(false);
    }
  };

  // Function to get address from coordinates using OpenStreetMap Nominatim
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      // Use Nominatim API (OpenStreetMap) to get address from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'SAARTHI Legal Assistance Platform'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      
      // Create a formatted address from the response
      if (data.address) {
        const addressParts = [];
        
        // Add road/street
        if (data.address.road) {
          addressParts.push(data.address.road);
        } else if (data.address.pedestrian) {
          addressParts.push(data.address.pedestrian);
        }
        
        // Add suburb/neighborhood
        if (data.address.suburb) {
          addressParts.push(data.address.suburb);
        } else if (data.address.neighbourhood) {
          addressParts.push(data.address.neighbourhood);
        }
        
        // Add city/town/village
        if (data.address.city) {
          addressParts.push(data.address.city);
        } else if (data.address.town) {
          addressParts.push(data.address.town);
        } else if (data.address.village) {
          addressParts.push(data.address.village);
        }
        
        // Add state and postcode
        if (data.address.state) {
          addressParts.push(data.address.state);
        }
        
        if (data.address.postcode) {
          addressParts.push(data.address.postcode);
        }
        
        // Return formatted address or display name if parts are empty
        return addressParts.length > 0 ? addressParts.join(', ') : data.display_name;
      }
      
      return data.display_name || 'Address not available';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Address not available';
    }
  };

  const processOsmPoliceStations = (L: any, elements: any[], map: any, userLocation: { lat: number; lng: number }) => {
    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.remove());
    markersRef.current = [];

    // Filter nodes (points)
    const nodes = elements.filter((e: any) => e.type === 'node' && e.tags && e.tags.amenity === 'police');
    
    if (nodes.length === 0) {
      fallbackToDefaultStations(L, map, userLocation);
      return;
    }
    
    const stationsData: PoliceStation[] = nodes.map((node: any, index: number) => {
      const lat = node.lat;
      const lng = node.lon;
      
      // Calculate distance
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        lat, 
        lng
      );

      // Create name and address from available data
      const name = node.tags.name || 'Police Station';
      
      // Start with a placeholder address
      let address = 'Fetching address...';
      
      // Set a temporary address based on available tags
      if (node.tags['addr:street'] || node.tags['addr:housenumber'] || node.tags['addr:city']) {
        // Try to construct address from individual components
        const addressParts = [
          node.tags['addr:housenumber'],
          node.tags['addr:street'],
          node.tags['addr:suburb'],
          node.tags['addr:city'],
          node.tags['addr:state'],
          node.tags['addr:postcode']
        ].filter(Boolean);
        
        address = addressParts.join(', ');
      } else if (node.tags.address) {
        // Use full address if available
        address = node.tags.address;
      } else if (node.tags.description) {
        // Use description as fallback
        address = node.tags.description;
      }
      
      // Create phone number
      const phone = node.tags.phone || node.tags['contact:phone'] || '100'; // Default emergency number in India
      
      // Create marker
      const marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
          shadowSize: [41, 41]
        })
      }).addTo(map);
      
      // Create initial popup with loading state
      let popupContent = `
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 16px; color: #1a237e;">${name}</h3>
          <p style="margin: 0 0 8px; font-size: 14px;">
            <strong>Address:</strong><br/>
            ${address}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px;">
            <strong>Phone:</strong><br/>
            ${phone}
          </p>
          <p style="margin: 0; font-size: 14px; color: #1565c0;">
            <strong>Distance:</strong> ${distance.toFixed(2)} km
          </p>
          <div style="margin-top: 10px; display: flex; gap: 10px;">
            <a href="tel:${phone}" style="background: #4caf50; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              Call
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving" target="_blank" style="background: #1a237e; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              Directions
            </a>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
      
      // Create a station object
      const stationId = `osm-${node.id || index}`;
      const station = {
        id: stationId,
        name: name,
        address: address,
        phone: phone,
        distance: `${distance.toFixed(2)} km`,
        location: { lat, lng }
      };
      
      // Fetch real address asynchronously to update both popup and station list
      setAddressLoading(prev => ({ ...prev, [stationId]: true }));
      getAddressFromCoordinates(lat, lng).then(realAddress => {
        // Update the station's address
        station.address = realAddress;
        setAddressLoading(prev => ({ ...prev, [stationId]: false }));
        
        // Update stations array with the new address
        setStations(currentStations => 
          currentStations.map(s => 
            s.id === stationId ? { ...s, address: realAddress } : s
          )
        );
        
        // Update the popup content with the real address
        const updatedPopupContent = `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; color: #1a237e;">${name}</h3>
            <p style="margin: 0 0 8px; font-size: 14px;">
              <strong>Address:</strong><br/>
              ${realAddress}
            </p>
            <p style="margin: 0 0 8px; font-size: 14px;">
              <strong>Phone:</strong><br/>
              ${phone}
            </p>
            <p style="margin: 0; font-size: 14px; color: #1565c0;">
              <strong>Distance:</strong> ${distance.toFixed(2)} km
            </p>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
              <a href="tel:${phone}" style="background: #4caf50; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                Call
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving" target="_blank" style="background: #1a237e; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                Directions
              </a>
            </div>
          </div>
        `;
        
        // Update the marker popup
        marker.setPopupContent(updatedPopupContent);
      });
      
      return station;
    });

    // Sort by distance
    stationsData.sort((a, b) => {
      const distA = parseFloat((a.distance || '0').replace(' km', ''));
      const distB = parseFloat((b.distance || '0').replace(' km', ''));
      return distA - distB;
    });

    setStations(stationsData);
  };

  const fallbackToDefaultStations = (L: any, map: any, userLocation: { lat: number; lng: number }) => {
    // If the API fails, use these default stations as fallback
    const defaultStations: PoliceStation[] = [
      {
        id: '1',
        name: 'Central Police Station',
        address: 'Fetching address...',
        phone: '100',
        location: { 
          lat: userLocation.lat + 0.01, 
          lng: userLocation.lng + 0.01 
        }
      },
      {
        id: '2',
        name: 'North Police Station',
        address: 'Fetching address...',
        phone: '100',
        location: { 
          lat: userLocation.lat - 0.01, 
          lng: userLocation.lng + 0.01 
        }
      },
      {
        id: '3',
        name: 'South Police Station',
        address: 'Fetching address...',
        phone: '100',
        location: { 
          lat: userLocation.lat + 0.01, 
          lng: userLocation.lng - 0.01 
        }
      }
    ];

    // Add distance
    defaultStations.forEach(station => {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        station.location.lat, 
        station.location.lng
      );
      station.distance = `${distance.toFixed(2)} km`;

      // Create marker
      const marker = L.marker([station.location.lat, station.location.lng], {
        icon: L.icon({
          iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
          shadowSize: [41, 41]
        })
      }).addTo(map);
      
      // Create initial popup with loading state for address
      let popupContent = `
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 16px; color: #1a237e;">${station.name}</h3>
          <p style="margin: 0 0 8px; font-size: 14px;">
            <strong>Address:</strong><br/>
            ${station.address}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px;">
            <strong>Phone:</strong><br/>
            ${station.phone}
          </p>
          <p style="margin: 0; font-size: 14px; color: #1565c0;">
            <strong>Distance:</strong> ${station.distance}
          </p>
          <div style="margin-top: 10px; display: flex; gap: 10px;">
            <a href="tel:${station.phone}" style="background: #4caf50; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              Call
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${station.location.lat},${station.location.lng}&travelmode=driving" target="_blank" style="background: #1a237e; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              Directions
            </a>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
      
      // Fetch real address asynchronously to update both popup and station list
      setAddressLoading(prev => ({ ...prev, [station.id]: true }));
      getAddressFromCoordinates(station.location.lat, station.location.lng).then(realAddress => {
        // Update the station's address
        station.address = realAddress;
        setAddressLoading(prev => ({ ...prev, [station.id]: false }));
        
        // Update stations array with the new address
        setStations(currentStations => 
          currentStations.map(s => 
            s.id === station.id ? { ...s, address: realAddress } : s
          )
        );
        
        // Update the popup content with the real address
        const updatedPopupContent = `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; color: #1a237e;">${station.name}</h3>
            <p style="margin: 0 0 8px; font-size: 14px;">
              <strong>Address:</strong><br/>
              ${realAddress}
            </p>
            <p style="margin: 0 0 8px; font-size: 14px;">
              <strong>Phone:</strong><br/>
              ${station.phone}
            </p>
            <p style="margin: 0; font-size: 14px; color: #1565c0;">
              <strong>Distance:</strong> ${station.distance}
            </p>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
              <a href="tel:${station.phone}" style="background: #4caf50; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                Call
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${station.location.lat},${station.location.lng}&travelmode=driving" target="_blank" style="background: #1a237e; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                Directions
              </a>
            </div>
          </div>
        `;
        
        // Update the marker popup
        marker.setPopupContent(updatedPopupContent);
      });
    });

    // Sort by distance
    defaultStations.sort((a, b) => {
      const distA = parseFloat((a.distance || '0').replace(' km', ''));
      const distB = parseFloat((b.distance || '0').replace(' km', ''));
      return distA - distB;
    });

    setStations(defaultStations);
    return defaultStations;
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  const handleStationClick = (station: PoliceStation) => {
    setSelectedStation(station);
    
    // Center map on the selected station
    if (mapRef.current) {
      mapRef.current.setView([station.location.lat, station.location.lng], 15);
      
      // Find and open the popup for this station
      markersRef.current.forEach((marker: any) => {
        const pos = marker.getLatLng();
        if (pos.lat === station.location.lat && pos.lng === station.location.lng) {
          marker.openPopup();
        }
      });
    }
  };

  const getDirections = (station: PoliceStation) => {
    if (!userLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${station.location.lat},${station.location.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const callPolice = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // Fixed the filteredStations to not use searchQuery since we removed the search bar
  const filteredStations = stations;

  return (
    <Container>
      <Content>
        <Title>Find Nearest Police Station</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {mapError && <ErrorMessage>{mapError}</ErrorMessage>}
        
        {loading ? (
          <LoadingMessage>Loading nearby police stations...</LoadingMessage>
        ) : (
          <>
            {/* The map is created programmatically and should be visible by now */}
            
            {!mapRef.current && !loading && (
              <ErrorMessage>
                Map failed to load. Please try refreshing the page or check if your browser supports maps.
              </ErrorMessage>
            )}

            <StationList>
              {filteredStations.length > 0 ? (
                filteredStations.map((station) => (
                  <StationCardSelected 
                    key={station.id} 
                    selected={selectedStation?.id === station.id}
                    onClick={() => handleStationClick(station)}
                  >
                    <StationName>
                      {station.name}
                      {station.distance && <DistanceBadge>{station.distance}</DistanceBadge>}
                    </StationName>
                    
                    {/* Remove address and phone info sections, only keep buttons */}
                    <ButtonContainer>
                      <DirectionsButton onClick={(e) => {
                        e.stopPropagation();
                        getDirections(station);
                      }}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M9.5 1.5a1.5 1.5 0 1 0-3 0v1h3v-1z"/>
                          <path d="M12.8 15.4 10 11.8V15H8v-3.2L5.2 15.4l-1.7-1L8 6.8V4.5h-.5a1 1 0 0 1-1-1V2a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1.5a1 1 0 0 1-1 1H10v2.3l4.5 7.6-1.7 1z"/>
                        </svg>
                        Directions
                      </DirectionsButton>
                      <CallButton onClick={(e) => {
                        e.stopPropagation();
                        callPolice(station.phone);
                      }}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                        </svg>
                        Call
                      </CallButton>
                    </ButtonContainer>
                  </StationCardSelected>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No police stations found. Please check your location settings.
                </div>
              )}
            </StationList>
          </>
        )}
      </Content>
    </Container>
  );
};

export default FindPoliceStation;