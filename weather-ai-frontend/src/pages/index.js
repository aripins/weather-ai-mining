import {
  Activity, AlertTriangle, Bell, Bookmark,
  Clock,
  Cloud,
  Download, Droplets,
  HardHat, History,
  Mail,
  RefreshCw,
  Thermometer, Wind
} from 'lucide-react';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import Chatbot from '../components/Chatbot';
import Header from '../components/Header';
import MiningDashboard from '../components/MiningDashboard';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import WeatherChart from '../components/WeatherChart';
import { fetchWeatherByName, fetchWeatherData, testBackendConnection } from '../utils/api';

export default function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('weather');
  const [showChatbot, setShowChatbot] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [savedLocations, setSavedLocations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [searchCooldown, setSearchCooldown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);
  const [backendStatus, setBackendStatus] = useState({ connected: false, checking: true });

  // Load initial weather data dan cek koneksi backend
  useEffect(() => {
    checkBackendAndLoadData();
    loadSavedLocations();
  }, []);

  // Auto-refresh setiap 5 menit jika backend terhubung
  useEffect(() => {
    if (weatherData && backendStatus.connected) {
      const interval = setInterval(() => {
        addNotification('Data sedang diperbarui otomatis', 'info');
        loadInitialWeather();
      }, 300000); // 5 menit
      
      return () => clearInterval(interval);
    }
  }, [weatherData, backendStatus.connected]);

  // Fungsi cek koneksi backend
  const checkBackendAndLoadData = async () => {
    try {
      setBackendStatus({ connected: false, checking: true });
      const connection = await testBackendConnection();
      
      setBackendStatus({
        connected: connection.connected,
        checking: false,
        message: connection.message
      });
      
      if (connection.connected) {
        addNotification('✅ Backend terhubung', 'success');
        await loadInitialWeather();
      } else {
        addNotification('⚠️ Backend tidak terhubung, menggunakan data simulasi', 'warning');
        await loadInitialWeather(); // Akan load fallback data
      }
    } catch (err) {
      console.error('Error checking backend:', err);
      setBackendStatus({ connected: false, checking: false, message: err.message });
      await loadInitialWeather();
    }
  };

  // Fungsi notifikasi
  const addNotification = useCallback((message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Auto-hapus notifikasi setelah beberapa waktu
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, type === 'warning' || type === 'alert' ? 60000 : 30000);
  }, []);

  // Save current location
  const saveCurrentLocation = () => {
    if (weatherData?.location) {
      const newLocation = {
        id: Date.now(),
        name: weatherData.location,
        timestamp: new Date().toISOString(),
        temperature: weatherData.temperature,
        rainfall: weatherData.rainfall,
        source: weatherData.source
      };
      
      // Cek jika lokasi sudah ada
      const exists = savedLocations.find(loc => loc.name === weatherData.location);
      let updated;
      
      if (exists) {
        // Update timestamp jika sudah ada
        updated = savedLocations.map(loc => 
          loc.name === weatherData.location ? { ...loc, timestamp: new Date().toISOString() } : loc
        );
      } else {
        // Tambah baru, maksimal 10 lokasi
        updated = [newLocation, ...savedLocations.slice(0, 9)];
      }
      
      setSavedLocations(updated);
      localStorage.setItem('savedMiningLocations', JSON.stringify(updated));
      
      addNotification(`Lokasi "${weatherData.location}" disimpan`, 'success');
    }
  };

  // Load saved locations
  const loadSavedLocations = () => {
    try {
      const saved = localStorage.getItem('savedMiningLocations');
      if (saved) {
        setSavedLocations(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load saved locations:', err);
    }
  };

  // Remove saved location
  const removeSavedLocation = (id, e) => {
    e.stopPropagation();
    const updated = savedLocations.filter(loc => loc.id !== id);
    setSavedLocations(updated);
    localStorage.setItem('savedMiningLocations', JSON.stringify(updated));
    addNotification('Lokasi dihapus dari riwayat', 'info');
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (!weatherData) return;
    
    try {
      const headers = ['Parameter', 'Value', 'Unit', 'Timestamp', 'Source'];
      const rows = [
        ['Temperature', weatherData.temperature, '°C', new Date().toISOString(), weatherData.source],
        ['Humidity', weatherData.humidity, '%', new Date().toISOString(), weatherData.source],
        ['Rainfall', weatherData.rainfall, 'mm', new Date().toISOString(), weatherData.source],
        ['Wind Speed', weatherData.wind_speed, 'km/h', new Date().toISOString(), weatherData.source],
        ['Pressure', weatherData.pressure, 'hPa', new Date().toISOString(), weatherData.source],
        ['Visibility', weatherData.visibility?.toFixed(1) || 'N/A', 'km', new Date().toISOString(), weatherData.source],
        ['Location', weatherData.location, '', new Date().toISOString(), weatherData.source],
        ['Backend Status', backendStatus.connected ? 'Connected' : 'Disconnected', '', new Date().toISOString(), 'system'],
        ['Productivity Score', weatherData.mining_recommendations?.productivity_score || 'N/A', '%', new Date().toISOString(), 'mining']
      ];
      
      const csvContent = [
        'Weather AI Mining - Export Data',
        `Generated: ${new Date().toLocaleString()}`,
        `Backend Connection: ${backendStatus.connected ? 'Connected' : 'Disconnected'}`,
        '',
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `mining-weather-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification('Data berhasil diekspor ke CSV', 'success');
      
      setDataHistory(prev => [{
        id: Date.now(),
        type: 'export',
        location: weatherData.location,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      addNotification('Gagal mengekspor data', 'error');
    }
  };

  // Load initial weather data
  const loadInitialWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeatherData();
      
      console.log('📥 Loaded weather data:', {
        source: data.source,
        isFallback: data.isFallback,
        productivity_score: data.mining_recommendations?.productivity_score,
        location: data.location
      });
      
      setWeatherData(data);
      setLastUpdated(new Date().toLocaleTimeString());
      
      // Add to history
      setDataHistory(prev => [{
        id: Date.now(),
        type: data.isFallback ? 'fallback' : 'update',
        location: data.location,
        timestamp: new Date().toISOString(),
        source: data.source
      }, ...prev.slice(0, 9)]);

      // Check for alerts jika bukan fallback
      if (!data.isFallback) {
        if (data.rainfall > 10) {
          addNotification('HUJAN LEBAT: Operasi luar ruangan dihentikan', 'alert');
        } else if (data.rainfall > 5) {
          addNotification('Hujan sedang terdeteksi, kurangi kecepatan alat', 'warning');
        }
        
        if (data.wind_speed > 35) {
          addNotification('ANGIN KENCANG: Amankan peralatan tinggi', 'alert');
        }
      }
      
    } catch (err) {
      console.error('Failed to load initial weather:', err);
      setError('Gagal memuat data cuaca. ' + err.message);
      addNotification('Error loading weather data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (location) => {
    if (searchCooldown) {
      addNotification('Tunggu 5 detik sebelum pencarian berikutnya', 'info');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeatherByName(location);
      
      setWeatherData(data);
      setLastUpdated(new Date().toLocaleTimeString());
      
      addNotification(`Data cuaca untuk ${data.location || location} dimuat`, 'success');

      // Set cooldown
      setSearchCooldown(true);
      setTimeout(() => setSearchCooldown(false), 5000);

    } catch (err) {
      console.error('Search error:', err);
      setError('Lokasi tidak ditemukan: ' + err.message);
      addNotification(`Gagal menemukan lokasi: ${location}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    addNotification('Memperbarui data cuaca...', 'info');
    loadInitialWeather();
  };

  // Retry backend connection
  const retryBackendConnection = async () => {
    addNotification('Mencoba menghubungkan ke backend...', 'info');
    await checkBackendAndLoadData();
  };

  const tabs = [
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'mining', label: 'Mining Ops', icon: HardHat },
    { id: 'forecast', label: 'Forecast', icon: Activity },
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'weather':
        return (
          <div className="max-w-6xl mx-auto"> 
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/20 p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Weather Analytics</h2>
                      <p className="text-gray-400">Real-time weather trends and predictions</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                      <span className="text-gray-300">
                        {backendStatus.connected ? 'Backend Connected' : 'Backend Disconnected'}
                      </span>
                      {lastUpdated && (
                        <span className="text-gray-500 text-xs ml-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {lastUpdated}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow"> 
                    <WeatherChart data={weatherData} />
                  </div>
                </div>
              </div>
              <div>
                <WeatherCard data={weatherData} />
              </div>
            </div>
          </div>
        );
      
      case 'mining':
        return (
          <div className="max-w-6xl mx-auto">
            <MiningDashboard 
              weatherData={weatherData} 
              backendStatus={backendStatus}
            />
          </div>
        );
      
      case 'forecast':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">5-Hour Forecast</h2>
                  <p className="text-gray-400">Hourly weather predictions for mining planning</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={refreshData}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-all flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                  {!backendStatus.connected && (
                    <button 
                      onClick={retryBackendConnection}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 hover:text-red-200 transition-all flex items-center space-x-2"
                    >
                      <span>Reconnect Backend</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {weatherData && weatherData.forecast_hours && Object.entries(weatherData.forecast_hours).map(([time, forecast], index) => (
                  <div key={index} className="text-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="text-gray-400 text-sm">{time}</div>
                    <div className="text-3xl my-3">
                      {forecast.rainfall > 5 ? '🌧️' : forecast.rainfall > 0 ? '🌦️' : '☀️'}
                    </div>
                    <div className="text-xl font-bold text-white">{forecast.temperature}°C</div>
                    <div className="text-sm text-gray-400 mt-1">Rain: {forecast.rainfall}mm</div>
                    <div className="text-sm text-gray-400">Wind: {forecast.wind_speed} km/h</div>
                    <div className="mt-2 text-xs text-gray-500 group-hover:text-gray-400">
                      {forecast.rainfall > 10 ? '⛔ Stop ops' : forecast.rainfall > 5 ? '⚠️ Reduce speed' : '✅ Normal'}
                    </div>
                  </div>
                ))}
              </div>
              {!weatherData?.forecast_hours && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📡</div>
                  <p>No forecast data available</p>
                  {backendStatus.connected ? (
                    <p className="text-sm mt-1">Try refreshing the data</p>
                  ) : (
                    <p className="text-sm mt-1">Backend connection required</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <Head>
        <title>Weather AI Mining | Smart Weather Prediction</title>
        <meta name="description" content="AI-powered weather predictions for mining operations" />
      </Head>

      <div className="relative z-10">
        <Header 
          location={userLocation}
          backendStatus={backendStatus}
        />

        <main className="container mx-auto px-4 py-8">
          {/* Backend Status Banner */}
          {!backendStatus.connected && !backendStatus.checking && (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/50 rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                    <div>
                      <h3 className="text-lg font-bold text-white">⚠️ BACKEND TIDAK TERHUBUNG</h3>
                      <p className="text-orange-200 text-sm">
                        Data yang ditampilkan adalah simulasi lokal. Productivity score akan bervariasi.
                      </p>
                      <p className="text-gray-300 text-xs mt-1">
                        Untuk data real-time, pastikan backend berjalan di localhost:5000
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={retryBackendConnection}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Connection</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <SearchBar onSearch={handleSearch} disabled={loading} />
            
            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={saveCurrentLocation}
                  disabled={!weatherData?.location || loading}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-gray-300 hover:text-white transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save Current Location"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button
                  onClick={exportToCSV}
                  disabled={!weatherData || loading}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-gray-300 hover:text-white transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-gray-300 hover:text-white transition-all flex items-center space-x-2 disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                {!backendStatus.connected && (
                  <button
                    onClick={retryBackendConnection}
                    disabled={backendStatus.checking}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 hover:text-red-200 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reconnect</span>
                  </button>
                )}
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-gray-400">
                  {backendStatus.checking ? 'Checking...' : 
                   backendStatus.connected ? 'Backend Connected' : 'Backend Disconnected'}
                </span>
              </div>
            </div>
            
            {/* Saved Locations */}
            {savedLocations.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <History className="w-4 h-4" />
                    <span>Riwayat Lokasi:</span>
                  </div>
                  <button
                    onClick={() => {
                      setSavedLocations([]);
                      localStorage.removeItem('savedMiningLocations');
                      addNotification('Semua riwayat dihapus', 'info');
                    }}
                    className="text-xs text-gray-500 hover:text-red-400"
                  >
                    Hapus Semua
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedLocations.map((loc) => (
                    <div key={loc.id} className="relative group">
                      <button
                        onClick={() => handleSearch(loc.name)}
                        disabled={loading}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all text-xs text-gray-300 hover:text-white flex items-center space-x-1 disabled:opacity-50"
                      >
                        <span>{loc.name}</span>
                        <span className="opacity-70">({loc.temperature}°C)</span>
                        {loc.source === 'fallback' && (
                          <span className="text-red-400 text-xs">[F]</span>
                        )}
                      </button>
                      <button
                        onClick={(e) => removeSavedLocation(loc.id, e)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-6xl mx-auto mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6" />
                  <span>{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-red-300 hover:text-white">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              <p className="mt-4 text-gray-400">Loading weather intelligence...</p>
              {backendStatus.checking ? (
                <p className="text-gray-500 text-sm mt-2">Checking backend connection...</p>
              ) : (
                <p className="text-gray-500 text-sm mt-2">Analysing mining conditions...</p>
              )}
            </div>
          ) : weatherData ? (
            <>
              {/* Weather Alerts - hanya jika bukan fallback */}
              {!weatherData.isFallback && (weatherData.rainfall > 10 || weatherData.wind_speed > 35) && (
                <div className="max-w-6xl mx-auto mb-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/50 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-orange-400 animate-bounce" />
                      <div>
                        <h3 className="text-lg font-bold text-white">WEATHER ALERT</h3>
                        <p className="text-orange-200">
                          {weatherData.mining_recommendations?.alerts?.[0] || 'Kondisi cuaca berbahaya'}
                        </p>
                      </div>
                    </div>
                    <div className="text-orange-300 text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {lastUpdated}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="max-w-6xl mx-auto mb-8">
                <div className="flex space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-4 rounded-xl text-center transition-all duration-300 ${
                          activeTab === tab.id 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        disabled={loading}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content */}
              {renderTabContent()}

              {/* Quick Stats */}
              <div className="max-w-6xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"> 
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center space-x-2 mb-2">
                    <Thermometer className="w-5 h-5 text-red-400" />
                    <span className="text-gray-400">Temperature</span>
                    {weatherData.isFallback && (
                      <span className="text-xs text-red-400 bg-red-500/20 px-1 rounded">F</span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white">{weatherData.temperature}°C</div>
                  <div className="text-xs text-gray-400">
                    {weatherData.source === 'ml-papua' ? 'Papua ML Data' : 
                     weatherData.isFallback ? 'Simulation Data' : 'Real-time Data'}
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center space-x-2 mb-2">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400">Humidity</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{weatherData.humidity}%</div>
                  <div className="text-xs text-gray-400">
                    {weatherData.humidity > 80 ? 'High' : weatherData.humidity < 30 ? 'Low' : 'Normal'}
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center space-x-2 mb-2">
                    <Cloud className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-400">Rainfall</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{weatherData.rainfall}mm</div>
                  <div className="text-xs text-gray-400">
                    {weatherData.rainfall > 10 ? 'Heavy Rain' : 
                     weatherData.rainfall > 5 ? 'Moderate Rain' : 
                     weatherData.rainfall > 0 ? 'Light Rain' : 'No Rain'}
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wind className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400">Wind Speed</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{weatherData.wind_speed} km/h</div>
                  <div className="text-xs text-gray-400">
                    {weatherData.wind_speed > 30 ? 'Strong' : 
                     weatherData.wind_speed < 5 ? 'Calm' : 'Normal'}
                  </div>
                </div>
              </div>
              
              {/* Data History */}
              {dataHistory.length > 0 && (
                <div className="max-w-6xl mx-auto mt-8">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <History className="w-5 h-5" />
                        <span>Recent Activity</span>
                      </h3>
                      <span className="text-gray-400 text-sm">{dataHistory.length} activities</span>
                    </div>
                    <div className="space-y-2">
                      {dataHistory.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              item.type === 'export' ? 'bg-green-500' :
                              item.type === 'fallback' ? 'bg-red-500' :
                              'bg-cyan-500'
                            }`}></div>
                            <div>
                              <div className="text-white text-sm">
                                {item.type === 'export' ? 'Data exported' : 
                                 item.type === 'fallback' ? 'Fallback data loaded' : 
                                 'Weather data updated'}
                              </div>
                              <div className="text-gray-400 text-xs">{item.location}</div>
                            </div>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Company Info */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-2 rounded-xl">
                    <HardHat className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Weather AI Mining
                  </h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Platform prediksi cuaca cerdas untuk operasional pertambangan di seluruh Indonesia.
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  ©Capstone Project ASAH 2025. FEBE & ML Team.
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Call Center</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm">f459d5y0274@student.devacademy.id</p>
                      <p className="text-xs text-gray-400">Response dalam 24 jam</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <div className="flex flex-col md:flex-row items-center justify-between text-sm">
                <p className="text-gray-500">
                  Real-time weather intelligence for mining operations • Updated: {lastUpdated}
                </p>
                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                  <div className="flex items-center space-x-2">
                    {weatherData?.mining_recommendations?.safety_level === 'SAFE' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                    {weatherData?.mining_recommendations?.safety_level === 'CAUTION' && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    )}
                    {weatherData?.mining_recommendations?.safety_level === 'DANGER' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    <span className="text-gray-400">
                      Safety: {weatherData?.mining_recommendations?.safety_level || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-400">
                      Backend: {backendStatus.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="fixed bottom-24 right-6 z-50 group"
      >
        <div className="relative">
          {notifications.filter(n => !n.read).length > 0 && (
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30"></div>
          )}
          
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110">
            <Bell className="w-6 h-6" />
          </div>
          
          {notifications.filter(n => !n.read).length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
              {Math.min(notifications.filter(n => !n.read).length, 9)}
            </div>
          )}
        </div>
      </button>

      {/* Chatbot Component */}
      <Chatbot 
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        weatherData={weatherData}
        backendStatus={backendStatus}
      />

      {/* Chatbot Button */}
      <button
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-ping opacity-20"></div>
          
          <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          
          {weatherData && (weatherData.rainfall > 10 || weatherData.wind_speed > 35) && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-3 h-3" />
            </div>
          )}
        </div>
      </button>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed bottom-36 right-6 z-50 w-80 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Notifications</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg ${
                    notification.type === 'alert' ? 'bg-red-500/20 border border-red-500/30' :
                    notification.type === 'warning' ? 'bg-orange-500/20 border border-orange-500/30' :
                    notification.type === 'success' ? 'bg-green-500/20 border border-green-500/30' :
                    notification.type === 'error' ? 'bg-red-500/20 border border-red-500/30' :
                    'bg-white/10 border border-white/10'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      notification.type === 'alert' ? 'bg-red-500' :
                      notification.type === 'warning' ? 'bg-orange-500' :
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{notification.message}</p>
                      <p className="text-gray-400 text-xs mt-1">{notification.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <button
              onClick={() => setNotifications([])}
              className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
            >
              Clear all notifications
            </button>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}