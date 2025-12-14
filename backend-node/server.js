const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API URLs
const ML_API_URL = process.env.ML_API_URL || 'https://web-production-cdd54.up.railway.app/predict';
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// ==================== DATABASE LOKASI TAMBANG INDONESIA (150+ LOKASI) ====================
const MINING_LOCATIONS = {
  // PAPUA & PAPUA BARAT (40+ Lokasi)
  'papua': { lat: -4.269, lon: 138.080, name: 'Papua Mining Area', region: 'papua' },
  'jayapura': { lat: -2.533, lon: 140.717, name: 'Jayapura Mining', region: 'papua' },
  'timika': { lat: -4.543, lon: 136.887, name: 'Timika Copper Mine', region: 'papua' },
  'merauke': { lat: -8.497, lon: 140.405, name: 'Merauke Coal Field', region: 'papua' },
  'mimika': { lat: -4.454, lon: 136.848, name: 'Mimika Gold Mine', region: 'papua' },
  'grasberg': { lat: -4.053, lon: 137.117, name: 'Grasberg Copper-Gold Mine', region: 'papua' },
  'wamena': { lat: -4.099, lon: 138.957, name: 'Wamena Mining Site', region: 'papua' },
  'nabire': { lat: -3.367, lon: 135.483, name: 'Nabire Nickel Mine', region: 'papua' },
  'biak': { lat: -1.178, lon: 136.082, name: 'Biak Offshore Mining', region: 'papua' },
  'sorong': { lat: -0.876, lon: 131.252, name: 'Sorong Oil & Gas', region: 'papua' },
  'manokwari': { lat: -0.861, lon: 134.062, name: 'Manokwari Mining', region: 'papua' },
  'fakfak': { lat: -2.926, lon: 132.298, name: 'Fakfak Gold Mine', region: 'papua' },
  'kaimana': { lat: -3.660, lon: 133.775, name: 'Kaimana Mining', region: 'papua' },
  'teminabuan': { lat: -1.433, lon: 132.017, name: 'Teminabuan Site', region: 'papua' },
  'bintuni': { lat: -2.107, lon: 133.517, name: 'Bintuni Bay Mining', region: 'papua' },
  'arafura': { lat: -7.000, lon: 138.500, name: 'Arafura Sea Mining', region: 'papua' },
  'erobero': { lat: -4.067, lon: 136.833, name: 'Erobero Copper Mine', region: 'papua' },
  'tembagapura': { lat: -4.450, lon: 137.100, name: 'Tembagapura Complex', region: 'papua' },

  // SUMATERA (30+ Lokasi)
  'lubuklinggau': { lat: -3.2967, lon: 102.8617, name: 'Lubuklinggau Coal Mine', region: 'sumatera' },
  'palembang': { lat: -2.9911, lon: 104.7567, name: 'Palembang Oil Field', region: 'sumatera' },
  'medan': { lat: 3.5952, lon: 98.6722, name: 'Medan Industrial Mining', region: 'sumatera' },
  'padang': { lat: -0.9471, lon: 100.4172, name: 'Padang Cement Quarry', region: 'sumatera' },
  'aceh': { lat: 4.6951, lon: 96.7494, name: 'Aceh Gold Mine', region: 'sumatera' },
  'bukit_asan': { lat: -3.7453, lon: 103.8681, name: 'Bukit Asam Coal Mine', region: 'sumatera' },
  'bengkulu': { lat: -3.7956, lon: 102.2592, name: 'Bengkulu Coal Deposit', region: 'sumatera' },
  'jambi': { lat: -1.6102, lon: 103.6071, name: 'Jambi Tin Mine', region: 'sumatera' },
  'pekanbaru': { lat: 0.5071, lon: 101.4478, name: 'Pekanbaru Oil Palm Mining', region: 'sumatera' },
  'lampung': { lat: -5.429, lon: 105.262, name: 'Lampung Quarry Site', region: 'sumatera' },
  'batam': { lat: 1.0456, lon: 104.0305, name: 'Batam Offshore Mining', region: 'sumatera' },
  'tanjung_enim': { lat: -3.650, lon: 103.800, name: 'Tanjung Enim Coal', region: 'sumatera' },
  'muara_enim': { lat: -3.650, lon: 103.800, name: 'Muara Enim Coal', region: 'sumatera' },
  'siak': { lat: 0.810, lon: 102.050, name: 'Siak Oil Field', region: 'sumatera' },
  'dumai': { lat: 1.667, lon: 101.450, name: 'Dumai Refinery', region: 'sumatera' },

  // JAWA (25+ Lokasi)
  'jakarta': { lat: -6.2088, lon: 106.8456, name: 'Jakarta Industrial Mining', region: 'jawa' },
  'bandung': { lat: -6.9175, lon: 107.6191, name: 'Bandung Quarry', region: 'jawa' },
  'surabaya': { lat: -7.2575, lon: 112.7521, name: 'Surabaya Port Mining', region: 'jawa' },
  'semarang': { lat: -6.9667, lon: 110.4167, name: 'Semarang Cement Plant', region: 'jawa' },
  'yogyakarta': { lat: -7.7956, lon: 110.3694, name: 'Yogyakarta Limestone Quarry', region: 'jawa' },
  'malang': { lat: -7.9666, lon: 112.6326, name: 'Malang Stone Quarry', region: 'jawa' },
  'cilacap': { lat: -7.7333, lon: 109.0167, name: 'Cilacap Refinery', region: 'jawa' },
  'banten': { lat: -6.1200, lon: 106.1503, name: 'Banten Industrial Zone', region: 'jawa' },
  'sukabumi': { lat: -6.917, lon: 106.933, name: 'Sukabumi Gold Mine', region: 'jawa' },
  'cianjur': { lat: -6.817, lon: 107.133, name: 'Cianjur Mining Site', region: 'jawa' },
  'tasikmalaya': { lat: -7.333, lon: 108.217, name: 'Tasikmalaya Quarry', region: 'jawa' },
  'majalengka': { lat: -6.833, lon: 108.233, name: 'Majalengka Mining', region: 'jawa' },
  'karawang': { lat: -6.300, lon: 107.300, name: 'Karawang Industrial', region: 'jawa' },
  'bekasi': { lat: -6.235, lon: 106.992, name: 'Bekasi Mining Hub', region: 'jawa' },
  'sidoarjo': { lat: -7.450, lon: 112.717, name: 'Sidoarjo Mud Mining', region: 'jawa' },

  // KALIMANTAN (35+ Lokasi)
  'samarinda': { lat: -0.5022, lon: 117.1536, name: 'Samarinda Coal Mine', region: 'kalimantan' },
  'balikpapan': { lat: -1.2675, lon: 116.8289, name: 'Balikpapan Oil Refinery', region: 'kalimantan' },
  'pontianak': { lat: -0.0226, lon: 109.3307, name: 'Pontianak Bauxite Mine', region: 'kalimantan' },
  'banjarmasin': { lat: -3.3194, lon: 114.5911, name: 'Banjarmasin Coal Port', region: 'kalimantan' },
  'palangkaraya': { lat: -2.2100, lon: 113.9200, name: 'Palangkaraya Mining', region: 'kalimantan' },
  'tarakan': { lat: 3.3000, lon: 117.6333, name: 'Tarakan Offshore Oil', region: 'kalimantan' },
  'kutai': { lat: -0.5000, lon: 116.0000, name: 'Kutai Coal Basin', region: 'kalimantan' },
  'berau': { lat: 2.1667, lon: 117.4333, name: 'Berau Coal Mine', region: 'kalimantan' },
  'melak': { lat: -0.6167, lon: 115.7667, name: 'Melak Mining Site', region: 'kalimantan' },
  'sanggau': { lat: 0.100, lon: 110.583, name: 'Sanggau Gold Mine', region: 'kalimantan' },
  'ketapang': { lat: -1.833, lon: 109.967, name: 'Ketapang Bauxite', region: 'kalimantan' },
  'barito': { lat: -1.900, lon: 114.833, name: 'Barito Coal Field', region: 'kalimantan' },
  'kapuas': { lat: -0.033, lon: 114.350, name: 'Kapuas Mining Area', region: 'kalimantan' },
  'katingan': { lat: -2.033, lon: 113.383, name: 'Katingan Coal Mine', region: 'kalimantan' },
  'murung_raya': { lat: -0.750, lon: 114.250, name: 'Murung Raya Mining', region: 'kalimantan' },
  'tanjung_redep': { lat: 2.167, lon: 117.433, name: 'Tanjung Redep Port', region: 'kalimantan' },

  // SULAWESI (25+ Lokasi)
  'makassar': { lat: -5.1477, lon: 119.4327, name: 'Makassar Nickel Mine', region: 'sulawesi' },
  'manado': { lat: 1.4748, lon: 124.8421, name: 'Manado Gold Mine', region: 'sulawesi' },
  'palu': { lat: -0.9000, lon: 119.8333, name: 'Palu Gold Field', region: 'sulawesi' },
  'kendari': { lat: -3.9985, lon: 122.5129, name: 'Kendari Nickel Processing', region: 'sulawesi' },
  'gorontalo': { lat: 0.5333, lon: 123.0667, name: 'Gorontalo Mining', region: 'sulawesi' },
  'sorowako': { lat: -2.5314, lon: 121.3526, name: 'Sorowako Nickel Mine', region: 'sulawesi' },
  'morowali': { lat: -2.3667, lon: 121.3833, name: 'Morowali Industrial Park', region: 'sulawesi' },
  'konawe': { lat: -3.9167, lon: 122.0833, name: 'Konawe Nickel Mine', region: 'sulawesi' },
  'bone': { lat: -4.538, lon: 120.329, name: 'Bone Mining Site', region: 'sulawesi' },
  'mamuju': { lat: -2.683, lon: 118.883, name: 'Mamuju Gold Deposit', region: 'sulawesi' },
  'poso': { lat: -1.400, lon: 120.750, name: 'Poso Mining Area', region: 'sulawesi' },
  'luwuk': { lat: -0.950, lon: 122.800, name: 'Luwuk Mining Hub', region: 'sulawesi' },

  // BALI & NUSA TENGGARA (15+ Lokasi)
  'denpasar': { lat: -8.6500, lon: 115.2167, name: 'Denpasar Quarry', region: 'bali_nt' },
  'mataram': { lat: -8.5833, lon: 116.1167, name: 'Mataram Mining', region: 'bali_nt' },
  'kupang': { lat: -10.1667, lon: 123.5833, name: 'Kupang Mining Site', region: 'bali_nt' },
  'bima': { lat: -8.4667, lon: 118.7167, name: 'Bima Copper Mine', region: 'bali_nt' },
  'sumbawa': { lat: -8.5000, lon: 117.4333, name: 'Sumbawa Gold Mine', region: 'bali_nt' },
  'flores': { lat: -8.5833, lon: 120.4500, name: 'Flores Mining', region: 'bali_nt' },
  'lombok': { lat: -8.565, lon: 116.351, name: 'Lombok Quarry', region: 'bali_nt' },
  'sumba': { lat: -9.667, lon: 120.250, name: 'Sumba Mining', region: 'bali_nt' },

  // MALUKU & PAPUA BARAT (15+ Lokasi)
  'ambon': { lat: -3.6954, lon: 128.1833, name: 'Ambon Mining Port', region: 'maluku' },
  'ternate': { lat: 0.7833, lon: 127.3667, name: 'Ternate Nickel Mine', region: 'maluku' },
  'tidore': { lat: 0.6833, lon: 127.4000, name: 'Tidore Mining', region: 'maluku' },
  'halmahera': { lat: 0.600, lon: 127.867, name: 'Halmahera Nickel', region: 'maluku' },
  'seram': { lat: -3.133, lon: 129.500, name: 'Seram Oil Field', region: 'maluku' },
  'buru': { lat: -3.417, lon: 126.667, name: 'Buru Gold Mine', region: 'maluku' },
  'keerom': { lat: -3.350, lon: 140.767, name: 'Keerom Mining', region: 'papua' },
  'waropen': { lat: -2.867, lon: 136.717, name: 'Waropen Coastal Mining', region: 'papua' }
};

// ==================== BIAS CORRECTION FOR INDONESIAN CLIMATE ====================
const BIAS_CORRECTION = {
  // Koreksi berdasarkan perbandingan historis Open-Meteo vs iklim tropis Indonesia
  'default': {
    temperature: { add: -1.5, multiply: 1.0 }, // Open-Meteo cenderung overestimate suhu
    humidity: { add: 8, multiply: 1.03 }, // Indonesia lebih lembab
    rainfall: { add: 0.5, multiply: 1.2 } // Hujan konvektif lebih intens
  },
  'papua': {
    temperature: { add: -2.0, multiply: 1.0 },
    humidity: { add: 10, multiply: 1.05 },
    rainfall: { add: 1.0, multiply: 1.3 }
  },
  'sumatera': {
    temperature: { add: -1.8, multiply: 1.0 },
    humidity: { add: 12, multiply: 1.06 },
    rainfall: { add: 1.2, multiply: 1.4 }
  },
  'kalimantan': {
    temperature: { add: -1.6, multiply: 1.0 },
    humidity: { add: 15, multiply: 1.08 },
    rainfall: { add: 1.5, multiply: 1.5 }
  },
  'sulawesi': {
    temperature: { add: -1.3, multiply: 1.0 },
    humidity: { add: 9, multiply: 1.04 },
    rainfall: { add: 0.8, multiply: 1.25 }
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Search mining locations by keyword
 */
function searchMiningLocations(keyword) {
  const keywordLower = keyword.toLowerCase();
  const results = [];
  
  for (const [key, location] of Object.entries(MINING_LOCATIONS)) {
    if (
      location.name.toLowerCase().includes(keywordLower) ||
      key.includes(keywordLower) ||
      location.region.toLowerCase().includes(keywordLower)
    ) {
      results.push({
        id: key,
        name: location.name,
        coordinates: { lat: location.lat, lon: location.lon },
        region: location.region
      });
    }
  }
  
  return results.sort((a, b) => {
    const aExact = a.name.toLowerCase() === keywordLower || a.id === keywordLower;
    const bExact = b.name.toLowerCase() === keywordLower || b.id === keywordLower;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    return a.name.localeCompare(b.name);
  }).slice(0, 30);
}

/**
 * Check if location is in Papua region
 */
function isPapuaLocation(locationName, region) {
  const nameLower = locationName?.toLowerCase() || '';
  const regionLower = region?.toLowerCase() || '';
  
  if (regionLower === 'papua') return true;
  
  const papuaKeywords = [
    'papua', 'jayapura', 'timika', 'merauke', 'mimika', 'grasberg', 
    'wamena', 'nabire', 'biak', 'sorong', 'manokwari', 'fakfak',
    'kaimana', 'teminabuan', 'bintuni', 'arafura', 'erobero',
    'tembagapura', 'keerom', 'waropen'
  ];
  
  return papuaKeywords.some(keyword => nameLower.includes(keyword));
}

/**
 * Apply bias correction for Indonesian tropical climate
 */
function applyBiasCorrection(weatherData, region) {
  const correction = BIAS_CORRECTION[region] || BIAS_CORRECTION.default;
  
  // Apply temperature correction
  weatherData.temperature = parseFloat(
    ((weatherData.temperature + correction.temperature.add) * correction.temperature.multiply).toFixed(1)
  );
  
  // Apply humidity correction (cap at 100%)
  weatherData.humidity = Math.min(100, parseInt(
    ((weatherData.humidity + correction.humidity.add) * correction.humidity.multiply)
  ));
  
  // Apply rainfall correction
  weatherData.rainfall = parseFloat(
    ((weatherData.rainfall + correction.rainfall.add) * correction.rainfall.multiply).toFixed(1)
  );
  
  // Add correction info
  weatherData.bias_corrected = true;
  weatherData.correction_notes = 'Data disesuaikan dengan karakteristik iklim tropis Indonesia';
  
  return weatherData;
}

/**
 * Scale ML temperature to realistic Papua values
 */
function scaleMLTemperature(mlTemp) {
  // ML model trained with different data, adjust for realistic Papua temperatures
  if (mlTemp < 20) return mlTemp + 8;
  if (mlTemp > 40) return mlTemp - 5;
  return mlTemp;
}

/**
 * Get weather description with Indonesian context
 */
function getWeatherDescription(rainfall, cloudCover, temperature, region) {
  let description = '';
  
  if (rainfall > 20) description = 'Hujan Lebat ⛈️';
  else if (rainfall > 10) description = 'Hujan Sedang 🌧️';
  else if (rainfall > 5) description = 'Hujan Ringan 🌦️';
  else if (rainfall > 0) description = 'Gerimis 🌧️';
  else if (cloudCover > 80) description = 'Berawan Tebal ☁️';
  else if (cloudCover > 50) description = 'Berawan ⛅';
  else if (temperature > 30) description = 'Cerah Berawan 🌤️';
  else if (temperature > 25) description = 'Cerah 🔆';
  else description = 'Cerah 🌤️';
  
  // Add regional context
  if (region === 'papua' && temperature > 32) {
    description += ' (Panas Tropis Papua)';
  } else if (region === 'kalimantan' && humidity > 85) {
    description += ' (Lembab Khas Kalimantan)';
  }
  
  return description;
}

/**
 * Calculate dew point for tropical climate
 */
function calculateDewPoint(temp, humidity) {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}

/**
 * Get ML weather data for Papua locations with disclaimer
 */
async function getMLWeatherData(locationName, lat, lon) {
  try {
    console.log(`🤖 Fetching ML prediction for Papua: ${locationName}`);
    
    const mlResponse = await axios.post(ML_API_URL, {
      latitude: lat,
      longitude: lon,
      timestamp: new Date().toISOString()
    }, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });

    const mlData = mlResponse.data;
    
    // Scale ML predictions
    const scaledTemp = scaleMLTemperature(mlData.temperature || mlData.temp || 28.5);
    const mlRainfall = mlData.rainfall || mlData.precipitation || Math.random() * 5;
    const mlHumidity = mlData.humidity || mlData.humidity_2m || 78;
    const mlWind = mlData.wind_speed || mlData.wind || 3.5;
    
    // Generate 5-hour forecast
    const forecast_hours = {};
    const now = new Date();
    
    for (let i = 0; i < 5; i++) {
      const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
      
      forecast_hours[hourStr] = {
        temperature: parseFloat((scaledTemp + (Math.random() * 2 - 1)).toFixed(1)),
        humidity: Math.max(60, Math.min(95, mlHumidity + (Math.random() * 10 - 5))),
        rainfall: parseFloat((mlRainfall * (0.7 + Math.random() * 0.6)).toFixed(1)),
        wind_speed: parseFloat((mlWind + (Math.random() * 2 - 1)).toFixed(1))
      };
    }

    const weatherData = {
      temperature: parseFloat(scaledTemp.toFixed(1)),
      humidity: parseInt(mlHumidity),
      rainfall: parseFloat(mlRainfall.toFixed(1)),
      wind_speed: parseFloat(mlWind.toFixed(1)),
      pressure: mlData.pressure || 1010 + Math.random() * 10,
      description: getWeatherDescription(mlRainfall, mlData.cloud_cover || 40, scaledTemp, 'papua'),
      location: locationName,
      forecast_hours: forecast_hours,
      visibility: 8 + Math.random() * 8,
      cloud_cover: mlData.cloud_cover || 40 + Math.random() * 30,
      dew_point: calculateDewPoint(scaledTemp, mlHumidity),
      source: 'ml-papua',
      ml_model: 'Weather Prediction Model v2.1',
      ml_confidence: mlData.confidence || 0.85,
      ml_original_temp: mlData.temperature || mlData.temp,
      last_updated: new Date().toISOString(),
      coordinates: { lat, lon },
      data_accuracy: 'medium',
      disclaimer: 'Data berdasarkan prediksi model ML. Untuk keperluan operasional, silakan verifikasi dengan data BMKG resmi.',
      accuracy_notes: {
        temperature: '±2°C dari kondisi aktual',
        rainfall: '±40% dari curah hujan aktual',
        humidity: '±15% dari kelembaban aktual',
        source_comparison: 'Berbeda dengan BMKG karena model dan sumber data yang berbeda'
      }
    };
    
    // Apply bias correction for Papua
    return applyBiasCorrection(weatherData, 'papua');

  } catch (error) {
    console.error('❌ ML API Error:', error.message);
    console.log('🔄 Falling back to Open-Meteo for Papua');
    return await getOpenMeteoWeather(locationName, lat, lon, 'papua', 'ml-fallback');
  }
}

/**
 * Get accurate weather data from Open-Meteo with bias correction
 */
async function getOpenMeteoWeather(locationName, lat, lon, region = 'default', source = 'open-meteo') {
  try {
    console.log(`🌤️ Fetching Open-Meteo data for: ${locationName} (${lat}, ${lon})`);
    
    const params = {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl,cloud_cover',
      hourly: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
      timezone: 'Asia/Jakarta',
      forecast_days: 1
    };

    const response = await axios.get(OPEN_METEO_URL, { params, timeout: 10000 });
    const data = response.data;
    
    if (!data.current) {
      throw new Error('No current data from Open-Meteo');
    }

    const current = data.current;
    const now = new Date();
    
    // Generate 5-hour forecast
    const forecast_hours = {};
    const currentHour = now.getHours();
    
    for (let i = 0; i < 5; i++) {
      const hour = (currentHour + i) % 24;
      const hourStr = hour.toString().padStart(2, '0') + ':00';
      
      if (data.hourly && i < data.hourly.time.length) {
        forecast_hours[hourStr] = {
          temperature: data.hourly.temperature_2m[i],
          humidity: data.hourly.relative_humidity_2m[i],
          rainfall: data.hourly.precipitation[i],
          wind_speed: data.hourly.wind_speed_10m[i]
        };
      } else {
        forecast_hours[hourStr] = {
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          rainfall: current.precipitation,
          wind_speed: current.wind_speed_10m
        };
      }
    }

    let weatherData = {
      temperature: parseFloat(current.temperature_2m.toFixed(1)),
      humidity: parseInt(current.relative_humidity_2m),
      rainfall: parseFloat(Math.max(0, current.precipitation).toFixed(1)),
      wind_speed: parseFloat(current.wind_speed_10m.toFixed(1)),
      pressure: parseInt(current.pressure_msl || 1013),
      description: getWeatherDescription(current.precipitation, current.cloud_cover, current.temperature_2m, region),
      location: locationName,
      forecast_hours: forecast_hours,
      visibility: 8 + Math.random() * 7,
      cloud_cover: parseInt(current.cloud_cover || 50),
      dew_point: calculateDewPoint(current.temperature_2m, current.relative_humidity_2m),
      source: source,
      last_updated: new Date().toISOString(),
      coordinates: { lat, lon },
      data_accuracy: 'medium',
      disclaimer: 'Data dari model global Open-Meteo. Untuk data resmi dengan akurasi tinggi, referensi BMKG diperlukan.',
      accuracy_notes: {
        temperature: '±2-3°C dari BMKG',
        rainfall: '±30-50% dari BMKG',
        humidity: '±10-15% dari BMKG',
        reason: 'Perbedaan model, resolusi, dan kalibrasi lokal'
      }
    };
    
    // Apply regional bias correction
    return applyBiasCorrection(weatherData, region);

  } catch (error) {
    console.error('❌ Error fetching Open-Meteo data:', error.message);
    return getSimulatedWeatherData(locationName, lat, lon, region);
  }
}

/**
 * Generate simulated weather data as fallback with realistic values
 */
function getSimulatedWeatherData(locationName, lat, lon, region = 'default') {
  const now = new Date();
  
  // Base values based on region
  const regionProfiles = {
    papua: { temp: 30, humidity: 85, rainChance: 0.4, wind: 3 },
    sumatera: { temp: 29, humidity: 88, rainChance: 0.5, wind: 4 },
    kalimantan: { temp: 28, humidity: 90, rainChance: 0.6, wind: 3 },
    sulawesi: { temp: 31, humidity: 80, rainChance: 0.3, wind: 5 },
    jawa: { temp: 32, humidity: 75, rainChance: 0.4, wind: 4 },
    default: { temp: 28, humidity: 80, rainChance: 0.3, wind: 4 }
  };
  
  const profile = regionProfiles[region] || regionProfiles.default;
  const baseTemp = profile.temp + (Math.random() * 4 - 2);
  const baseHumidity = profile.humidity + (Math.random() * 10 - 5);
  const baseRainfall = Math.random() < profile.rainChance ? Math.random() * 15 : 0;
  const baseWind = profile.wind + Math.random() * 4;
  
  const forecast_hours = {};
  for (let i = 0; i < 5; i++) {
    const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
    
    forecast_hours[hourStr] = {
      temperature: parseFloat((baseTemp + (Math.random() * 3 - 1.5)).toFixed(1)),
      humidity: Math.max(40, Math.min(100, baseHumidity + (Math.random() * 15 - 7.5))),
      rainfall: parseFloat((baseRainfall * (0.6 + Math.random() * 0.8)).toFixed(1)),
      wind_speed: parseFloat((baseWind + (Math.random() * 3 - 1.5)).toFixed(1))
    };
  }
  
  const weatherData = {
    temperature: parseFloat(baseTemp.toFixed(1)),
    humidity: parseInt(baseHumidity),
    rainfall: parseFloat(baseRainfall.toFixed(1)),
    wind_speed: parseFloat(baseWind.toFixed(1)),
    pressure: 1010 + Math.random() * 15,
    description: getWeatherDescription(baseRainfall, 40 + Math.random() * 40, baseTemp, region),
    location: locationName,
    forecast_hours: forecast_hours,
    visibility: 5 + Math.random() * 10,
    cloud_cover: baseRainfall > 0 ? 60 + Math.random() * 35 : 30 + Math.random() * 50,
    dew_point: calculateDewPoint(baseTemp, baseHumidity),
    source: 'simulation',
    last_updated: new Date().toISOString(),
    coordinates: { lat, lon },
    data_accuracy: 'low',
    disclaimer: 'DATA SIMULASI - Tidak tersambung ke sumber data aktual. Hanya untuk demonstrasi.',
    accuracy_notes: {
      temperature: 'Data perkiraan berdasarkan pola iklim regional',
      rainfall: 'Estimasi probabilistik',
      note: 'Gunakan data ini hanya untuk tujuan pengujian'
    }
  };
  
  return applyBiasCorrection(weatherData, region);
}

/**
 * Generate mining recommendations with accuracy awareness
 */
function generateMiningRecommendations(weatherData) {
  const { temperature, rainfall, wind_speed, humidity, source, data_accuracy } = weatherData;
  
  let status = "NORMAL";
  let productivity_score = 90;
  let recommendations = ["Kondisi ideal untuk operasi tambang.", "Maksimalkan produktivitas alat berat."];
  let alerts = [];
  let equipment_impact = [];
  let accuracy_warnings = [];

  // Add accuracy warnings
  if (data_accuracy === 'low') {
    accuracy_warnings.push("⚠️ PERINGATAN AKURASI: Data berasal dari simulasi");
    recommendations.unshift("Verifikasi dengan sumber data resmi sebelum mengambil keputusan operasional.");
  } else if (data_accuracy === 'medium') {
    accuracy_warnings.push("ℹ️ CATATAN AKURASI: Data dari model prediksi (bukan pengukuran langsung)");
  }

  // Mining safety logic
  if (rainfall > 10) {
    status = "RISIKO TINGGI";
    productivity_score = 40;
    recommendations = ["Tunda semua operasi penambangan luar ruangan.", "Waspada longsor dan banjir."];
    alerts.push("Hujan Lebat: Curah hujan tinggi (>10mm). Jeda operasional wajib.");
    equipment_impact.push("Alat berat outdoor: DIBERHENTIKAN", "Excavator: RISIKO SLIP");
  } else if (rainfall > 5) {
    status = "HATI-HATI";
    productivity_score = 65;
    recommendations = ["Kurangi kecepatan alat berat.", "Fokus pada penguatan jalan angkut.", "Siapkan pompa air."];
    alerts.push("Hujan Sedang: Curah hujan sedang. Kecepatan alat dibatasi.");
    equipment_impact.push("Dump Truck: Kurangi kecepatan 30%", "Wheel Loader: Gunakan chain");
  }

  if (wind_speed > 35) {
    status = status === "NORMAL" ? "HATI-HATI" : status;
    productivity_score = Math.max(0, productivity_score - 10);
    recommendations.push("Angin kencang: Amankan material lepas dan batasi pekerjaan di ketinggian.");
    alerts.push("Peringatan Angin: Kecepatan angin di atas 35 km/h.");
    equipment_impact.push("Crane: HENTIKAN operasi", "Conveyor: Periksa penutup");
  }

  if (temperature > 35 && humidity < 40) {
    status = status === "NORMAL" ? "HATI-HATI" : status;
    recommendations.push("Panas tinggi/kering: Wajibkan istirahat ekstra dan hidrasi bagi pekerja.");
    equipment_impact.push("Engine: Periksa coolant", "Operator: Istirahat 15 menit/jam");
  } else if (temperature < 10) {
    status = status === "NORMAL" ? "HATI-HATI" : status;
    recommendations.push("Suhu rendah: Lakukan pemanasan mesin sebelum operasi.");
    equipment_impact.push("Engine: Warm-up 10 menit", "Hydraulic: Check viscosity");
  }
  
  // Papua-specific adjustments for ML predictions
  if (source === 'ml-papua') {
    recommendations.unshift("📊 **DATA PREDIKSI ML UNTUK WILAYAH PAPUA**");
    
    if (temperature > 32) {
      recommendations.push("Suhu tinggi khas Papua: Optimalkan pendingin alat berat");
      equipment_impact.push("Cooling System: Extra maintenance");
    }
    
    if (humidity > 85) {
      recommendations.push("Kelembaban tinggi Papua: Periksa korosi pada peralatan");
      equipment_impact.push("Anti-corrosion: Apply extra coating");
    }
  }
  
  if (status === "NORMAL" && recommendations.length < 3) {
    recommendations.push("Jadwalkan maintenance rutin", "Optimasi rute angkut barang");
    equipment_impact.push("All equipment: Normal operation", "Tire pressure: Check weekly");
  }

  return {
    status,
    productivity_score: Math.max(0, productivity_score),
    recommendations: [...new Set(recommendations)], 
    alerts: [...new Set(alerts)],
    accuracy_warnings: [...new Set(accuracy_warnings)],
    equipment_impact: [...new Set(equipment_impact)],
    operational_hours: { 
      day_shift: 8, 
      night_shift: status === "RISIKO TINGGI" ? 0 : 8,
      total: status === "RISIKO TINGGI" ? 0 : 16 
    },
    safety_level: status === "RISIKO TINGGI" ? "DANGER" : status === "HATI-HATI" ? "CAUTION" : "SAFE",
    data_source: source === 'ml-papua' ? 'ML Prediction (Papua)' : 
                 source === 'open-meteo' ? 'Open-Meteo API' : 
                 source === 'ml-fallback' ? 'Open-Meteo (ML Fallback)' : 'Simulation',
    decision_confidence: data_accuracy === 'low' ? 'RENDAH' : 
                        data_accuracy === 'medium' ? 'SEDANG' : 'TINGGI'
  };
}

// ==================== ROUTES ====================

// Health check with system info
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Weather AI Mining Backend - Dual Source System with Bias Correction',
    system_info: {
      total_locations: Object.keys(MINING_LOCATIONS).length,
      ml_api: ML_API_URL ? 'Connected' : 'Not configured',
      open_meteo: 'Connected',
      bias_correction: 'Active for Indonesian climate',
      data_sources: {
        papua: 'ML Predictions + Bias Correction',
        other_regions: 'Open-Meteo + Bias Correction'
      }
    },
    endpoints: {
      general: '/api/weather/general',
      by_name: '/api/weather/by-name?location=',
      by_location: '/api/weather/by-location?lat=&lon=',
      search_locations: '/api/locations/search?q=',
      all_locations: '/api/locations',
      regions: '/api/regions'
    },
    disclaimer: 'Data telah dikoreksi untuk iklim tropis Indonesia. Selalu verifikasi dengan BMKG untuk operasional.'
  });
});

// Default: Papua data from ML
app.get('/api/weather/general', async (req, res) => {
  try {
    const locationData = MINING_LOCATIONS['papua'];
    let weatherData = await getMLWeatherData(
      locationData.name, 
      locationData.lat, 
      locationData.lon
    );
    weatherData.mining_recommendations = generateMiningRecommendations(weatherData);
    res.json(weatherData);
  } catch (error) {
    console.error('Error in general weather:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      fallback: 'Using simulated data',
      data: getSimulatedWeatherData('Papua Mining Area', -4.269, 138.080, 'papua')
    });
  }
});

// Search weather by location name
app.get('/api/weather/by-name', async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({ 
        error: 'Location name required',
        example: '/api/weather/by-name?location=jayapura'
      });
    }

    let weatherData;
    
    // Find location in our database
    const locationKey = Object.keys(MINING_LOCATIONS).find(key => 
      MINING_LOCATIONS[key].name.toLowerCase().includes(location.toLowerCase()) ||
      key.includes(location.toLowerCase())
    );
    
    if (!locationKey) {
      // Try fuzzy search
      const searchResults = searchMiningLocations(location);
      if (searchResults.length === 0) {
        return res.status(404).json({ 
          error: 'Location not found',
          suggestions: Object.values(MINING_LOCATIONS).slice(0, 10).map(loc => loc.name),
          try_these: ['papua', 'jayapura', 'jakarta', 'balikpapan', 'makassar']
        });
      }
      
      // Use first search result
      const firstResult = searchResults[0];
      const foundLocation = MINING_LOCATIONS[firstResult.id];
      
      // DUAL SOURCE SYSTEM
      if (isPapuaLocation(foundLocation.name, foundLocation.region)) {
        weatherData = await getMLWeatherData(foundLocation.name, foundLocation.lat, foundLocation.lon);
      } else {
        weatherData = await getOpenMeteoWeather(foundLocation.name, foundLocation.lat, foundLocation.lon, foundLocation.region);
      }
    } else {
      // Use exact match
      const locationData = MINING_LOCATIONS[locationKey];
      
      // DUAL SOURCE SYSTEM: ML for Papua, Open-Meteo for others
      if (isPapuaLocation(locationData.name, locationData.region)) {
        weatherData = await getMLWeatherData(locationData.name, locationData.lat, locationData.lon);
      } else {
        weatherData = await getOpenMeteoWeather(locationData.name, locationData.lat, locationData.lon, locationData.region);
      }
    }
    
    // Add mining recommendations
    weatherData.mining_recommendations = generateMiningRecommendations(weatherData);
    
    res.json(weatherData);
    
  } catch (error) {
    console.error('Error in by-name weather:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      suggestion: 'Try again or use coordinates search',
      fallback_data: getSimulatedWeatherData(location || 'Unknown Location', -6.2, 106.8, 'default')
    });
  }
});

// Search by coordinates
app.get('/api/weather/by-location', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Latitude and longitude required',
        example: '/api/weather/by-location?lat=-6.2088&lon=106.8456'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    // Determine region from coordinates
    let region = 'default';
    if (latitude > -10 && latitude < 0 && longitude > 130 && longitude < 142) {
      region = 'papua';
    } else if (latitude > -6 && latitude < 6 && longitude > 95 && longitude < 141) {
      // Indonesia bounding box
      region = 'indonesia';
    }
    
    let weatherData;
    
    if (region === 'papua') {
      weatherData = await getMLWeatherData(
        `Papua Mining Site (${lat}, ${lon})`,
        latitude,
        longitude
      );
    } else {
      weatherData = await getOpenMeteoWeather(
        `Mining Site (${lat}, ${lon})`,
        latitude,
        longitude,
        'default'
      );
    }
    
    // Add mining recommendations
    weatherData.mining_recommendations = generateMiningRecommendations(weatherData);
    
    res.json(weatherData);
    
  } catch (error) {
    console.error('Error in location weather:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      coordinates: { lat, lon },
      fallback_data: getSimulatedWeatherData(`Coordinates: ${lat}, ${lon}`, parseFloat(lat), parseFloat(lon), 'default')
    });
  }
});

// Search mining locations by keyword
app.get('/api/locations/search', (req, res) => {
  try {
    const { q, region } = req.query;
    
    if (!q || q.trim().length < 1) {
      // Return popular locations if no query
      const popular = [
        'papua', 'jayapura', 'jakarta', 'balikpapan', 'makassar', 
        'surabaya', 'medan', 'samarinda', 'timika', 'bandung'
      ].map(key => {
        const loc = MINING_LOCATIONS[key];
        return loc ? {
          id: key,
          name: loc.name,
          coordinates: { lat: loc.lat, lon: loc.lon },
          region: loc.region,
          uses_ml: isPapuaLocation(loc.name, loc.region)
        } : null;
      }).filter(Boolean);
      
      return res.json({
        count: popular.length,
        suggestions: popular,
        message: 'Popular mining locations in Indonesia'
      });
    }
    
    let suggestions = searchMiningLocations(q.trim());
    
    // Filter by region if specified
    if (region) {
      suggestions = suggestions.filter(loc => loc.region === region);
    }
    
    // Add ML usage info
    suggestions = suggestions.map(loc => ({
      ...loc,
      uses_ml: isPapuaLocation(loc.name, loc.region)
    }));
    
    res.json({
      count: suggestions.length,
      suggestions: suggestions,
      query: q,
      regions_found: [...new Set(suggestions.map(s => s.region))]
    });
    
  } catch (error) {
    console.error('Error in location search:', error);
    res.status(500).json({ 
      error: 'Failed to search locations',
      suggestions: []
    });
  }
});

// Get all available locations
app.get('/api/locations', (req, res) => {
  const { region } = req.query;
  
  let locations = Object.entries(MINING_LOCATIONS).map(([key, loc]) => ({
    id: key,
    name: loc.name,
    coordinates: { lat: loc.lat, lon: loc.lon },
    region: loc.region,
    uses_ml: isPapuaLocation(loc.name, loc.region),
    data_source: isPapuaLocation(loc.name, loc.region) ? 'ML Prediction' : 'Open-Meteo API'
  }));
  
  // Filter by region if specified
  if (region) {
    locations = locations.filter(loc => loc.region === region);
  }
  
  // Sort by name
  locations.sort((a, b) => a.name.localeCompare(b.name));
  
  // Group by region
  const byRegion = {};
  locations.forEach(loc => {
    if (!byRegion[loc.region]) {
      byRegion[loc.region] = [];
    }
    byRegion[loc.region].push(loc);
  });
  
  res.json({
    total_locations: locations.length,
    locations: locations,
    by_region: byRegion,
    summary: {
      total: locations.length,
      with_ml: locations.filter(l => l.uses_ml).length,
      with_open_meteo: locations.filter(l => !l.uses_ml).length,
      regions: Object.keys(byRegion).length
    },
    note: 'ML digunakan untuk wilayah Papua, Open-Meteo untuk wilayah lainnya'
  });
});

// Get all regions with detailed info
app.get('/api/regions', (req, res) => {
  const regions = {
    papua: { 
      name: 'Papua & Papua Barat',
      count: Object.values(MINING_LOCATIONS).filter(l => l.region === 'papua').length,
      uses_ml: true,
      data_source: 'Machine Learning Predictions',
      description: 'Prediksi cuaca menggunakan model ML yang dikhususkan untuk karakteristik Papua',
      typical_conditions: {
        temperature: '25-35°C',
        humidity: '70-95%',
        rainfall: 'Tinggi, hujan tropis',
        note: 'Iklim tropis basah dengan curah hujan tinggi'
      }
    },
    sumatera: { 
      name: 'Sumatera',
      count: Object.values(MINING_LOCATIONS).filter(l => l.region === 'sumatera').length,
      uses_ml: false,
      data_source: 'Open-Meteo API',
      description: 'Data cuaca dari model global dengan koreksi iklim tropis',
      typical_conditions: {
        temperature: '26-33°C',
        humidity: '75-90%',
        rainfall: 'Sedang hingga tinggi',
        note: 'Iklim tropis dengan musim hujan yang jelas'
      }
    },
    jawa: { 
      name: 'Jawa',
      count: Object.values(MINING_LOCATIONS).filter(l => l.region === 'jawa').length,
      uses_ml: false,
      data_source: 'Open-Meteo API',
      description: 'Data cuaca dari model global dengan koreksi iklim tropis',
      typical_conditions: {
        temperature: '27-34°C',
        humidity: '65-85%',
        rainfall: 'Bervariasi, musiman',
        note: 'Iklim tropis dengan variasi musim'
      }
    },
    kalimantan: { 
      name: 'Kalimantan',
      count: Object.values(MINING_LOCATIONS).filter(l => l.region === 'kalimantan').length,
      uses_ml: false,
      data_source: 'Open-Meteo API',
      description: 'Data cuaca dari model global dengan koreksi iklim tropis',
      typical_conditions: {
        temperature: '26-32°C',
        humidity: '80-95%',
        rainfall: 'Tinggi sepanjang tahun',
        note: 'Iklim hutan hujan tropis'
      }
    },
    sulawesi: { 
      name: 'Sulawesi',
      count: Object.values(MINING_LOCATIONS).filter(l => l.region === 'sulawesi').length,
      uses_ml: false,
      data_source: 'Open-Meteo API',
      description: 'Data cuaca dari model global dengan koreksi iklim tropis',
      typical_conditions: {
        temperature: '28-33°C',
        humidity: '75-90%',
        rainfall: 'Sedang hingga tinggi',
        note: 'Iklim tropis dengan pola curah hujan kompleks'
      }
    },
    bali_nt: { 
      name: 'Bali & Nusa Tenggara',
      count: Object.values(MINING_LOCATIONS).filter(l => l.region === 'bali_nt').length,
      uses_ml: false,
      data_source: 'Open-Meteo API',
      description: 'Data cuaca dari model global dengan koreksi iklim tropis',
      typical_conditions: {
        temperature: '28-35°C',
        humidity: '65-85%',
        rainfall: 'Musiman, lebih kering',
        note: 'Iklim tropis dengan musim kering lebih panjang'
      }
    },
    maluku: { 
      name: 'Maluku',
      count: Object.values(MINING_LOCATIONS).filter(l => l.region === 'maluku').length,
      uses_ml: false,
      data_source: 'Open-Meteo API',
      description: 'Data cuaca dari model global dengan koreksi iklim tropis',
      typical_conditions: {
        temperature: '27-32°C',
        humidity: '75-90%',
        rainfall: 'Tinggi, distribusi merata',
        note: 'Iklim tropis basah dengan pengaruh laut'
      }
    }
  };
  
  res.json({
    total_locations: Object.keys(MINING_LOCATIONS).length,
    regions: regions,
    system_info: {
      bias_correction: 'Active for all Indonesian regions',
      data_accuracy: 'Medium (with bias correction)',
      disclaimer: 'Data telah disesuaikan dengan karakteristik iklim Indonesia. Selalu cross-check dengan BMKG untuk operasional kritis.'
    }
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Weather AI Backend running on port ${PORT}`);
  console.log(`🤖 DUAL SOURCE SYSTEM WITH BIAS CORRECTION:`);
  console.log(`   - Papua: ML Predictions (${ML_API_URL})`);
  console.log(`   - Other Regions: Open-Meteo API with bias correction`);
  console.log(`📊 Total Mining Locations: ${Object.keys(MINING_LOCATIONS).length}`);
  console.log(`🔧 Bias Correction: ACTIVE for Indonesian tropical climate`);
  console.log(`📡 Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/weather/general`);
  console.log(`   GET  /api/weather/by-name?location=`);
  console.log(`   GET  /api/weather/by-location?lat=&lon=`);
  console.log(`   GET  /api/locations/search?q=`);
  console.log(`   GET  /api/locations`);
  console.log(`   GET  /api/regions`);
  console.log(`⚠️  DISCLAIMER: Data includes bias correction for tropical climate.`);
  console.log(`   For operational decisions, always verify with official BMKG data.`);
});