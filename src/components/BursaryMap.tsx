"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Fix for default marker icon issue with Webpack/Next.js
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Bursary interface - Ensure this matches the actual data structure
interface Bursary {
  _id: string;
  title: string;
  location?: string;
  description?: string;
  awardAmount?: number;
  organization?: {
      _id?: string;
      title?: string;
      name?: string;
   };
  applicationUrl?: string;
  matchScore?: number;
  aiGeneratedSummary?: string;
  eligibilityCriteria?: string;
}

interface BursaryMapProps {
  bursaries: Bursary[];
}

interface MarkerData {
  id: string;
  position: L.LatLngTuple;
  bursary: Bursary; // Store the full bursary data for the popup
}

// Helper function to format currency (reuse if you have a util function elsewhere)
const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined) return "N/A";
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(amount);
};

// Delay function to respect API rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const BursaryMap: React.FC<BursaryMapProps> = ({ bursaries }) => {
  console.log('[BursaryMap] Received bursaries prop:', bursaries);
  const [geocodedMarkers, setGeocodedMarkers] = useState<MarkerData[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [initialMapCenter] = useState<L.LatLngTuple>([56.1304, -106.3468]);
  const [initialMapZoom] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<L.LatLngTuple>(initialMapCenter);
  const [mapZoom, setMapZoom] = useState(initialMapZoom);

  useEffect(() => {
    // Configure Leaflet icons
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);

  // Geocoding effect
  useEffect(() => {
    const geocodeBursaries = async () => {
      console.log('[BursaryMap] geocodeBursaries effect triggered. Bursaries:', bursaries);
      if (!bursaries || bursaries.length === 0) {
        console.log('[BursaryMap] No bursaries or empty array, clearing markers.');
        setGeocodedMarkers([]);
        return;
      }

      setIsLoading(true);
      const newMarkers: MarkerData[] = [];
      let firstValidPosition: L.LatLngTuple | null = null;

      console.log(`[BursaryMap] Starting geocoding for ${bursaries.length} bursaries...`);

      for (const bursary of bursaries) {
        console.log(`[BursaryMap] Processing bursary: ${bursary.title} (ID: ${bursary._id}), Location: ${bursary.location}`);
        if (bursary.location && bursary.location.trim() !== "") {
          const locationString = bursary.location.trim();
          let position: L.LatLngTuple | null = null;

          // 1. Check cache
          let cachedPosition: L.LatLngTuple | null = null;
          try {
            const cacheKey = `geocode_${locationString.toLowerCase()}`;
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
              const parsedCoords = JSON.parse(cachedData);
              if (Array.isArray(parsedCoords) && parsedCoords.length === 2 && !isNaN(parsedCoords[0]) && !isNaN(parsedCoords[1])) {
                cachedPosition = parsedCoords as L.LatLngTuple;
                console.log(`[BursaryMap] Using cached coordinates for "${locationString}": ${cachedPosition}`);
              } else {
                 console.warn(`[BursaryMap] Invalid cached data found for "${locationString}"`);
                 localStorage.removeItem(cacheKey);
              }
            }
          } catch (cacheError) {
            console.error(`[BursaryMap] Error accessing localStorage for "${locationString}":`, cacheError);
          }

          if (cachedPosition) {
            position = cachedPosition;
          } else {
            // 2. Geocode if not in cache
            console.log(`[BursaryMap] Attempting to geocode location (not cached): "${locationString}"`);
            try {
              // Basic check for lat/lon format (e.g., "43.65, -79.38")
              const coords = locationString.split(',').map(s => parseFloat(s.trim()));
              if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                position = [coords[0], coords[1]];
                console.log(`[BursaryMap] Using direct coordinates for "${locationString}": ${position}`);
              } else {
                  // Use Nominatim API for other location strings
                  const query = encodeURIComponent(locationString);
                  // IMPORTANT: Add your application name to the User-Agent header for Nominatim
                  console.log(`[BursaryMap] Calling Nominatim for query: "${locationString}"`);
                  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
                      headers: {
                          'User-Agent': 'BursaryMatchingPlatform/1.0 (Contact: seyit@example.com)'
                      }
                  });

                  if (!response.ok) {
                   console.warn(`[BursaryMap] Nominatim request FAILED for "${locationString}" - Status: ${response.status} ${response.statusText}`);
                   await delay(1100); // Wait even if error
                   continue; // Skip this bursary if geocoding fails
                  }

                  const data = await response.json();
                  console.log(`[BursaryMap] Nominatim response for "${locationString}":`, data);

                  if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    position = [parseFloat(lat), parseFloat(lon)];
                    console.log(`[BursaryMap] Geocoded "${locationString}" successfully to: ${position}`);
                  } else {
                    console.warn(`[BursaryMap] Could not geocode "${locationString}" - Nominatim returned no results.`);
                  }
                  
                  // Wait 1.1 seconds before the next request to comply with Nominatim's usage policy (1 req/sec)
                  await delay(1100);
              }

              // 3. Cache the result if successful
              if (position) {
                 try {
                    const cacheKey = `geocode_${locationString.toLowerCase()}`;
                    localStorage.setItem(cacheKey, JSON.stringify(position));
                    console.log(`[BursaryMap] Cached coordinates for "${locationString}": ${position}`);
                  } catch (cacheError) {
                    console.error(`[BursaryMap] Error saving to localStorage for "${locationString}":`, cacheError);
                  }
              }

            } catch (error) {
              console.error(`[BursaryMap] Error processing location "${locationString}":`, error);
              await delay(1100); // Wait even if error during processing
            }
          } // End geocoding block

          // Add marker if position was found (from cache or geocoding)
          if (position) {
             newMarkers.push({ id: bursary._id, position, bursary });
             if (!firstValidPosition) firstValidPosition = position;
          }

        } else {
          console.log(`[BursaryMap] Skipping bursary ${bursary.title} - No location provided.`);
        }
      } // End loop

      console.log('[BursaryMap] Finished geocoding loop. newMarkers:', newMarkers);
      setGeocodedMarkers(newMarkers);

      setIsLoading(false);
       console.log(`[BursaryMap] Finished geocoding. Found ${newMarkers.length} locations.`);
    };

    geocodeBursaries();
  }, [bursaries]); // Re-run when bursaries change (geocoding will now use cache)

  // Memoized calculation for filtered markers based on locationFilter
  const filteredMarkers = useMemo(() => {
    if (!locationFilter) {
      console.log('[BursaryMap] Filter cleared, showing all geocoded markers:', geocodedMarkers);
      return geocodedMarkers; // No filter, return all geocoded markers
    }
    const filterLower = locationFilter.toLowerCase();
    const result = geocodedMarkers.filter(markerData =>
      markerData.bursary.location?.toLowerCase().includes(filterLower)
    );
    console.log('[BursaryMap] Filtered markers:', result);
    return result;
  }, [geocodedMarkers, locationFilter]);

  // Handlers to update map state when user moves it
  const handleMapMove = (event: L.LeafletEvent) => {
    const map = event.target;
    setMapCenter(map.getCenter().toArray());
    setMapZoom(map.getZoom());
  };

  return (
    <div className="relative space-y-4">
       {/* Location Filter Input */}
       <div className="relative">
           <input
              type="text"
              placeholder="Filter by location (e.g., Toronto, BC)..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-800 dark:text-white shadow-sm"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
       </div>

        {/* Loading Overlay */}
       {isLoading && (
           <div className="absolute inset-0 bg-gray-500/30 flex items-center justify-center z-10 rounded-xl">
               <p className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-gray-700 dark:text-gray-300">Geocoding locations...</p>
           </div>
       )}
        <MapContainer
          key={mapCenter.join("_") + mapZoom} // Re-render on manual move/zoom if needed
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: "600px", width: "100%", borderRadius: "12px", zIndex: 0 }}
          onMoveEnd={handleMapMove}
          onZoomEnd={handleMapMove}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* Static Test Marker */}
          <Marker position={[44.6820, -63.7443]}>
            <Popup>
              Test Marker - Nova Scotia
            </Popup>
          </Marker>

          {/* Render filtered markers */}
          {filteredMarkers.length > 0 ? (
             filteredMarkers.map((markerData) => (
                <Marker key={markerData.id} position={markerData.position}>
                  <Popup minWidth={280}>
                      <div className="p-1 font-sans space-y-2">
                         <h3 className="text-md font-bold mb-1 text-purple-800 dark:text-purple-300">
                           {markerData.bursary.title}
                         </h3>
                         {markerData.bursary.organization?.title && (
                             <p className="text-sm text-gray-600 dark:text-gray-400">
                                 Offered by: {markerData.bursary.organization.title}
                             </p>
                         )}
                         <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                           {formatCurrency(markerData.bursary.awardAmount)}
                         </p>
                         {markerData.bursary.location && (
                           <p className="text-xs text-gray-500 dark:text-gray-500">
                              📍 {markerData.bursary.location}
                           </p>
                         )}
                         {/* --- AI Info --- */}
                         {markerData.bursary.matchScore !== undefined && (
                           <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                             Match Score: {Math.round(markerData.bursary.matchScore * 100)}%
                           </p>
                         )}
                         {/* --- Brief Description --- */}
                         {markerData.bursary.description && (
                           <p className="text-xs text-gray-700 dark:text-gray-300">
                             {markerData.bursary.description.substring(0, 120)}{markerData.bursary.description.length > 120 ? '...' : ''}
                           </p>
                         )}
                         {/* --- AI Summary --- */}
                         {markerData.bursary.aiGeneratedSummary && (
                           <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                             Summary: {markerData.bursary.aiGeneratedSummary.substring(0, 100)}{markerData.bursary.aiGeneratedSummary.length > 100 ? '...' : ''}
                           </p>
                         )}
                          {/* --- Eligibility --- */}
                         {markerData.bursary.eligibilityCriteria && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">Eligibility:</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {markerData.bursary.eligibilityCriteria.substring(0, 150)}{markerData.bursary.eligibilityCriteria.length > 150 ? '...' : ''}
                              </p>
                            </div>
                         )}
                         {/* --- Apply Link --- */}
                         <div className="flex space-x-2 mt-3">
                           {markerData.bursary.applicationUrl && (
                             <a
                               href={markerData.bursary.applicationUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="inline-block px-3 py-1 bg-purple-800 text-white text-sm rounded-md hover:bg-purple-900 transition-colors shadow-sm"
                             >
                               Apply Now
                             </a>
                           )}
                           {/* Learn More Link Removed */}
                         </div>
                       </div>
                  </Popup>
                </Marker>
             ))
          ) : (
             !isLoading && <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-3 rounded shadow">No bursaries found at that location.</p>
          )}
        </MapContainer>
     </div>
  );
};

export default BursaryMap; 