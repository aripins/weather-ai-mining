import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // Timeout lebih lama untuk backend lokal
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor untuk debugging koneksi
api.interceptors.request.use(
  (config) => {
    console.log(`📤 Request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, {
      status: response.status,
      hasData: !!response.data,
      hasRecommendations: !!response.data?.mining_recommendations,
      productivity_score: response.data?.mining_recommendations?.productivity_score
    });
    return response.data;
  },
  (error) => {
    console.error('❌ API Connection Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code
    });
    
    // Petunjuk troubleshooting
    if (error.code === 'ECONNREFUSED') {
      console.warn('🚨 TROUBLESHOOTING: Backend tidak berjalan di localhost:5000');
      console.warn('   Lakukan langkah berikut:');
      console.warn('   1. Buka terminal baru');
      console.warn('   2. cd ke folder backend/');
      console.warn('   3. Jalankan: npm install (jika belum)');
      console.warn('   4. Jalankan: node server.js');
      console.warn('   5. Pastikan muncul pesan "Weather AI Backend running on port 5000"');
    }
    
    return Promise.resolve(getFallbackWeatherData(error));
  }
);

// ==================== API FUNCTIONS ====================

export const fetchWeatherData = async () => {
  try {
    console.log('🔄 Fetching general weather data...');
    const data = await api.get('/weather/general');
    
    // Validasi data dari backend
    if (!data || data.error) {
      throw new Error(data?.message || 'Invalid response from backend');
    }
    
    return {
      ...data,
      source: data.source || 'backend',
      isFallback: false,
      connectionStatus: 'connected'
    };
  } catch (error) {
    console.error('Failed to fetch general weather:', error);
    return getFallbackWeatherData({ 
      message: 'General weather fetch failed',
      location: 'Papua Mining Area' 
    });
  }
};

export const fetchWeatherByLocation = async (lat, lon) => {
  try {
    console.log(`📍 Fetching weather for coordinates: ${lat}, ${lon}`);
    const data = await api.get('/weather/by-location', {
      params: { lat, lon }
    });
    
    return {
      ...data,
      isFallback: false,
      connectionStatus: 'connected'
    };
  } catch (error) {
    console.error('Location fetch failed:', error);
    return getFallbackWeatherData({ 
      location: `Coordinates: ${lat}, ${lon}`,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) }
    });
  }
};

export const fetchWeatherByName = async (location) => {
  try {
    console.log(`🔍 Fetching weather for: ${location}`);
    const data = await api.get('/weather/by-name', {
      params: { location }
    });
    
    return {
      ...data,
      isFallback: false,
      connectionStatus: 'connected'
    };
  } catch (error) {
    console.error('Location name fetch failed:', error);
    return getFallbackWeatherData({ location });
  }
};

export const searchLocations = async (query) => {
  try {
    console.log(`🔎 Searching locations: ${query}`);
    return await api.get('/locations/search', {
      params: { q: query }
    });
  } catch (error) {
    console.error('Location search failed:', error);
    return { 
      count: 0, 
      suggestions: [],
      message: 'Backend connection failed'
    };
  }
};

export const getAllLocations = async () => {
  try {
    return await api.get('/locations');
  } catch (error) {
    console.error('Get all locations failed:', error);
    return { 
      count: 0, 
      locations: [],
      message: 'Backend connection failed'
    };
  }
};

export const getRegions = async () => {
  try {
    return await api.get('/regions');
  } catch (error) {
    console.error('Get regions failed:', error);
    return { 
      total_locations: 0, 
      regions: {},
      message: 'Backend connection failed'
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

function getFallbackWeatherData(context = {}) {
  console.warn('⚠️ Using fallback data due to:', context.message || 'connection error');
  
  const isPapua = context.location && (
    context.location.toLowerCase().includes('papua') ||
    context.location.toLowerCase().includes('jayapura') ||
    context.location.toLowerCase().includes('timika')
  );
  
  const baseTemp = isPapua ? 30.5 : 28.5;
  const baseRain = isPapua ? Math.random() * 8 : 2.3;
  const baseWind = isPapua ? 3.5 : 4.2;
  const now = new Date();
  
  // Generate dynamic forecast
  const forecast_hours = {};
  for (let i = 0; i < 5; i++) {
    const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
    
    forecast_hours[hourStr] = {
      temperature: parseFloat((baseTemp + (Math.random() * 4 - 2)).toFixed(1)),
      humidity: 70 + Math.random() * 15,
      rainfall: parseFloat((baseRain * (0.8 + Math.random() * 0.4)).toFixed(1)),
      wind_speed: parseFloat((baseWind + (Math.random() * 3 - 1.5)).toFixed(1))
    };
  }
  
  const weatherData = {
    temperature: parseFloat(baseTemp.toFixed(1)),
    humidity: isPapua ? 82 : 75,
    rainfall: parseFloat(baseRain.toFixed(1)),
    wind_speed: parseFloat(baseWind.toFixed(1)),
    pressure: 1013,
    description: getWeatherDescription(baseRain),
    location: context.location || "Mining Site (FALLBACK)",
    visibility: 8 + Math.random() * 8,
    cloud_cover: 40 + Math.random() * 30,
    dew_point: calculateDewPoint(baseTemp, isPapua ? 82 : 75),
    source: 'fallback',
    forecast_hours,
    last_updated: new Date().toISOString(),
    isFallback: true,
    connectionError: true,
    errorMessage: context.message || 'Backend connection failed',
    
    // Mining recommendations dengan productivity_score yang variatif
    mining_recommendations: generateFallbackRecommendations(baseTemp, baseRain, baseWind, isPapua)
  };
  
  // Add coordinates if provided
  if (context.coordinates) {
    weatherData.coordinates = context.coordinates;
  }
  
  return weatherData;
}

function generateFallbackRecommendations(temp, rain, wind, isPapua) {
  let status = "SIMULASI";
  let productivity_score = 50; 
  let recommendations = ["⚠️ DATA SIMULASI: Backend tidak terhubung"];
  let alerts = ["Koneksi backend terputus. Gunakan data ini hanya untuk pengujian."];
  let equipment_impact = ["All equipment: Data simulation mode"];
  
  if (rain > 10) {
    status = "RISIKO TINGGI (SIMULASI)";
    productivity_score = 40;
    recommendations = ["Hujan lebat terdeteksi (simulasi)", "Tunda operasi luar ruangan"];
    alerts.push("Curah hujan >10mm (simulasi)");
    equipment_impact = ["Alat berat: HENTIKAN (simulasi)", "Excavator: RISIKO SLIP"];
  } else if (rain > 5) {
    status = "HATI-HATI (SIMULASI)";
    productivity_score = 65;
    recommendations = ["Hujan sedang (simulasi)", "Kurangi kecepatan alat"];
    alerts.push("Curah hujan >5mm (simulasi)");
    equipment_impact = ["Dump Truck: Kurangi kecepatan 30%", "Wheel Loader: Gunakan chain"];
  }
  
  if (wind > 35) {
    productivity_score = Math.max(0, productivity_score - 15);
    recommendations.push("Angin kencang (simulasi)");
    alerts.push("Kecepatan angin >35 km/h (simulasi)");
    equipment_impact.push("Crane: HENTIKAN operasi");
  }
  
  if (isPapua) {
    recommendations.unshift("📡 SIMULASI AREA PAPUA");
    if (temp > 32) {
      recommendations.push("Suhu tinggi khas Papua (simulasi)");
    }
  }
  
  return {
    status,
    productivity_score,
    recommendations: [...new Set(recommendations)],
    alerts: [...new Set(alerts)],
    equipment_impact: [...new Set(equipment_impact)],
    operational_hours: { 
      day_shift: 8, 
      night_shift: status.includes("RISIKO") ? 0 : 8,
      total: status.includes("RISIKO") ? 0 : 16 
    },
    safety_level: status.includes("RISIKO") ? "DANGER" : 
                  status.includes("HATI-HATI") ? "CAUTION" : "SIMULATION",
    data_source: 'Local Simulation (Backend Disconnected)',
    decision_confidence: 'LOW (Simulation)',
    disclaimer: 'DATA SIMULASI - Backend tidak tersambung'
  };
}

function getWeatherDescription(rainfall) {
  if (rainfall > 20) return 'Heavy Rain ⛈️ (Simulation)';
  if (rainfall > 10) return 'Moderate Rain 🌧️ (Simulation)';
  if (rainfall > 5) return 'Light Rain 🌦️ (Simulation)';
  if (rainfall > 0) return 'Drizzle 🌧️ (Simulation)';
  return 'Clear 🌤️ (Simulation)';
}

function calculateDewPoint(temp, humidity) {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  return parseFloat(((b * alpha) / (a - alpha)).toFixed(1));
}

// Test connection function untuk debugging
export const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    const response = await api.get('/health');
    console.log('✅ Backend health:', response);
    return {
      connected: true,
      status: 'OK',
      message: response.message,
      data: response
    };
  } catch (error) {
    console.error('❌ Backend connection test failed:', error.message);
    return {
      connected: false,
      status: 'ERROR',
      message: error.message,
      error: error
    };
  }
};

export default api;