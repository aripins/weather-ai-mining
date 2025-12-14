// frontend/src/components/MiningDashboard.js - VERSI RESPONSIF
import { AlertTriangle, Brain, Clock, HardHat, Shield, TrendingUp, Truck, Wifi, WifiOff } from 'lucide-react';

const MiningDashboard = ({ weatherData, backendStatus }) => {
  if (!weatherData) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-amber-500"></div>
        <p className="mt-3 md:mt-4 text-gray-400 text-sm md:text-base">Loading mining dashboard...</p>
      </div>
    );
  }
  
  const miningData = weatherData.mining_recommendations || {};
  const isFallback = weatherData.isFallback || weatherData.source === 'fallback';
  const isPapuaML = weatherData.source === 'ml-papua';
  
  // Dynamic status color based on actual score
  const getStatusColor = (status, productivityScore) => {
    if (isFallback) return 'from-purple-500 to-pink-500';
    
    if (status?.includes('RISIKO') || status?.includes('DARURAT')) {
      return 'from-red-500 to-pink-500';
    } else if (status?.includes('HATI-HATI') || status?.includes('CAUTION')) {
      return productivityScore > 60 ? 'from-yellow-500 to-amber-500' : 'from-orange-500 to-red-500';
    } else {
      return productivityScore > 70 ? 'from-green-500 to-emerald-500' : 
             productivityScore > 50 ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-slate-500';
    }
  };
  
  const getStatusIcon = (status, productivityScore) => {
    if (isFallback) return '📡';
    
    if (status?.includes('RISIKO') || status?.includes('DARURAT')) return '🛑';
    if (status?.includes('HATI-HATI') || status?.includes('CAUTION')) {
      return productivityScore > 60 ? '⚠️' : '🚨';
    }
    return productivityScore > 70 ? '✅' : productivityScore > 50 ? 'ℹ️' : '🔍';
  };
  
  // Ensure productivity_score is a number and within range
  const productivityScore = Math.min(100, Math.max(0, 
    typeof miningData.productivity_score === 'number' ? 
    miningData.productivity_score : 
    (isFallback ? 50 : 90)
  ));
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Connection Status Banner - Mobile optimized */}
      {isFallback && (
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/50 rounded-xl md:rounded-3xl p-3 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="text-2xl md:text-4xl">📡</div>
              <div className="flex-1">
                <h2 className="text-base md:text-2xl font-bold text-white">SIMULATION MODE</h2>
                <p className="text-purple-200 text-xs md:text-base">
                  Backend tidak terhubung. Data simulasi.
                </p>
                <p className="text-gray-300 text-xs md:text-sm mt-1">
                  Productivity: <span className="font-bold">{productivityScore}%</span> • 
                  Data: <span className="font-bold">Local Simulation</span>
                </p>
              </div>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <div className="inline-flex items-center px-2 py-1 bg-purple-500/30 text-purple-300 rounded-full text-xs md:text-sm">
                <WifiOff className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span>Backend Offline</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Status Banner - Mobile optimized */}
      <div className={`bg-gradient-to-r ${getStatusColor(miningData.status, productivityScore)} bg-opacity-20 border border-white/20 rounded-xl md:rounded-3xl p-3 md:p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="text-2xl md:text-4xl">{getStatusIcon(miningData.status, productivityScore)}</div>
            <div className="flex-1">
              <h2 className="text-base md:text-2xl font-bold text-white">Mining Status</h2>
              <p className="text-gray-300 text-xs md:text-base">Based on current weather</p>
              
              {/* Data Source Badge - Mobile optimized */}
              <div className="flex items-center mt-1 md:mt-2 space-x-1 md:space-x-2 flex-wrap">
                {isPapuaML && (
                  <div className="inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-1 bg-purple-500/30 text-purple-300 text-xs rounded-full">
                    <Brain className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                    <span className="text-xs">AI Prediction</span>
                  </div>
                )}
                {isFallback ? (
                  <div className="inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-500/30 text-gray-300 text-xs rounded-full">
                    <span className="text-xs">Local Simulation</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-1 bg-green-500/30 text-green-300 text-xs rounded-full">
                    <Wifi className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                    <span className="text-xs">Backend Connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right mt-2 sm:mt-0">
            <div className="text-2xl md:text-3xl font-bold text-white">{productivityScore}%</div>
            <div className="text-gray-300 text-xs md:text-base">Productivity Score</div>
            <div className="text-gray-400 text-xs mt-0.5 md:mt-1">
              Data: {miningData.data_source || (isFallback ? 'Local Simulation' : 'Backend API')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recommendations Grid - Mobile optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recommendations */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-xl md:rounded-3xl border border-white/20 p-3 md:p-6">
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-6">
            <HardHat className="w-4 h-4 md:w-6 md:h-6 text-amber-400" />
            <h3 className="text-base md:text-xl font-bold text-white">Operational Recommendations</h3>
            <div className="ml-auto flex space-x-1 md:space-x-2">
              {isPapuaML && (
                <div className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                  AI
                </div>
              )}
              {isFallback && (
                <div className="text-xs bg-gray-500/20 text-gray-300 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                  Sim
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-3 md:space-y-4 max-h-60 md:max-h-none overflow-y-auto touch-scroll hide-scrollbar">
            {miningData.recommendations?.length > 0 ? (
              miningData.recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`flex items-start space-x-2 md:space-x-3 p-3 md:p-4 rounded-lg md:rounded-2xl ${
                    rec.includes('**') || rec.includes('DATA SIMULASI') ? 'bg-purple-500/10 border border-purple-500/30' :
                    rec.includes('🛑') || rec.includes('RISIKO') ? 'bg-red-500/10 border border-red-500/30' :
                    rec.includes('⚠️') || rec.includes('HATI-HATI') ? 'bg-yellow-500/10 border border-yellow-500/30' :
                    'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="text-xl md:text-2xl mt-0.5">
                    {rec.includes('🛑') ? '🛑' : 
                     rec.includes('⚠️') ? '⚠️' : 
                     rec.includes('📊') ? '📊' :
                     rec.includes('✅') ? '✅' : 
                     rec.includes('ℹ️') ? 'ℹ️' : 
                     rec.includes('📡') ? '📡' :
                     rec.includes('SIMULASI') ? '📡' :
                     index === 0 && isPapuaML ? '🤖' : 
                     '✅'}
                  </div>
                  <div className="flex-1">
                    <div className={`text-xs md:text-sm ${
                      rec.includes('**') || rec.includes('DATA SIMULASI') ? 'font-bold text-purple-300' : 
                      rec.includes('🛑') || rec.includes('RISIKO') ? 'text-red-200' :
                      rec.includes('⚠️') || rec.includes('HATI-HATI') ? 'text-yellow-200' :
                      'text-gray-300'
                    }`}>
                      {rec}
                    </div>
                    
                    {/* Context-specific notes */}
                    {rec.includes('angkut barang') && (
                      <div className="mt-1 md:mt-2 flex items-center space-x-1 md:space-x-2 text-xs text-amber-400">
                        <Truck className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Material transportation affected</span>
                      </div>
                    )}
                    
                    {rec.includes('Papua') && weatherData.ml_original_temp && (
                      <div className="mt-1 md:mt-2 text-gray-500 text-xs">
                        Data ML asli: {weatherData.ml_original_temp.toFixed(1)}°C → Disesuaikan: {weatherData.temperature}°C
                      </div>
                    )}
                    
                    {rec.includes('SIMULASI') && (
                      <div className="mt-1 md:mt-2 text-purple-400 text-xs">
                        ⚠️ This is simulated data.
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 md:py-8 text-gray-500">
                <div className="text-3xl md:text-4xl mb-2">📝</div>
                <p className="text-sm md:text-base">No recommendations available</p>
                <p className="text-xs md:text-sm mt-1">
                  {isFallback ? 'Connect to backend for real recommendations' : 'Weather conditions are normal'}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats & Alerts - Mobile optimized */}
        <div className="space-y-4 md:space-y-6">
          {/* Operational Hours */}
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-xl rounded-xl md:rounded-3xl border border-blue-500/30 p-3 md:p-6">
            <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-4">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />
              <h3 className="text-base md:text-xl font-bold text-white">Operational Hours</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center p-2 md:p-4 bg-white/5 rounded-lg md:rounded-2xl">
                <div className="text-gray-400 text-xs md:text-sm">Day Shift</div>
                <div className="text-xl md:text-3xl font-bold text-white">
                  {miningData.operational_hours?.day_shift || 8}h
                </div>
                <div className="text-gray-500 text-xs mt-0.5 md:mt-1">06:00 - 14:00</div>
              </div>
              <div className="text-center p-2 md:p-4 bg-white/5 rounded-lg md:rounded-2xl">
                <div className="text-gray-400 text-xs md:text-sm">Night Shift</div>
                <div className="text-xl md:text-3xl font-bold text-white">
                  {miningData.operational_hours?.night_shift || 8}h
                </div>
                <div className="text-gray-500 text-xs mt-0.5 md:mt-1">14:00 - 22:00</div>
              </div>
              <div className="text-center p-2 md:p-4 bg-white/5 rounded-lg md:rounded-2xl">
                <div className="text-gray-400 text-xs md:text-sm">Total</div>
                <div className="text-xl md:text-3xl font-bold text-white">
                  {miningData.operational_hours?.total || 16}h
                </div>
                <div className="text-gray-500 text-xs mt-0.5 md:mt-1">Daily Capacity</div>
              </div>
            </div>
            {isFallback && (
              <div className="mt-2 md:mt-4 text-center text-purple-300 text-xs md:text-sm">
                ⚠️ Shift hours based on simulation
              </div>
            )}
          </div>
          
          {/* Alerts */}
          {miningData.alerts && miningData.alerts.length > 0 ? (
            <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-xl rounded-xl md:rounded-3xl border border-red-500/50 p-3 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-4">
                <AlertTriangle className="w-4 h-4 md:w-6 md:h-6 text-red-400 animate-pulse" />
                <h3 className="text-base md:text-xl font-bold text-white">Safety Alerts</h3>
              </div>
              <div className="space-y-2 md:space-y-3 max-h-32 overflow-y-auto touch-scroll hide-scrollbar">
                {miningData.alerts.map((alert, index) => (
                  <div key={index} className="flex items-center space-x-1.5 md:space-x-2 p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="text-red-200 text-xs md:text-sm">{alert}</span>
                  </div>
                ))}
              </div>
              {isPapuaML && (
                <div className="mt-2 md:mt-4 text-purple-300 text-xs md:text-sm">
                  🔍 Alert berdasarkan analisis ML untuk kondisi Papua
                </div>
              )}
            </div>
          ) : null}
          
          {/* Productivity Meter */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-xl md:rounded-3xl border border-green-500/30 p-3 md:p-6">
            <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-4">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-green-400" />
              <h3 className="text-base md:text-xl font-bold text-white">Productivity</h3>
              {isPapuaML && (
                <div className="ml-auto text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                  ML
                </div>
              )}
            </div>
            <div className="space-y-3 md:space-y-4">
              <div>
                <div className="flex justify-between text-gray-400 text-xs md:text-sm mb-1 md:mb-2">
                  <span>Current Productivity</span>
                  <span>{productivityScore}%</span>
                </div>
                <div className="h-2 md:h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      productivityScore > 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      productivityScore > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${productivityScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-gray-500 text-xs mt-0.5 md:mt-1">
                  <span>Low</span>
                  <span>Optimal</span>
                </div>
              </div>
              <div className="text-gray-400 text-xs md:text-sm">
                {productivityScore > 70 ? 'High productivity expected' :
                 productivityScore > 40 ? 'Moderate productivity' :
                 'Low productivity expected'}
                {isFallback && ' (Simulation)'}
              </div>
              {isPapuaML && (
                <div className="text-gray-500 text-xs mt-1 md:mt-2">
                  Score dihitung berdasarkan prediksi ML untuk area Papua
                </div>
              )}
              {isFallback && (
                <div className="text-purple-300 text-xs mt-1 md:mt-2">
                  ⚠️ Simulated score. Connect backend for real analysis.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Equipment Recommendations - Mobile optimized */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-xl md:rounded-3xl border border-white/20 p-3 md:p-6">
        <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-6">
          <Shield className="w-4 h-4 md:w-6 md:h-6 text-amber-400" />
          <h3 className="text-base md:text-xl font-bold text-white">Equipment Guidelines</h3>
          <div className="flex-1 flex justify-end space-x-1 md:space-x-2">
            {isPapuaML && (
              <div className="inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                <Brain className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                <span className="text-xs">AI</span>
              </div>
            )}
            {isFallback && (
              <div className="inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">
                <span className="text-xs">Sim</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {/* Excavator */}
          <div className="p-2 md:p-4 bg-white/5 rounded-lg md:rounded-2xl hover:bg-white/10 transition-all">
            <div className="flex items-center space-x-2 mb-1.5 md:mb-3">
              <div className="text-xl md:text-2xl">🔄</div>
              <div className="font-bold text-white text-sm md:text-base">Excavator</div>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              {weatherData.rainfall > 10 
                ? 'Use rock bucket for wet material.'
                : 'Optimal conditions for excavation.'}
            </p>
            {isPapuaML && weatherData.visibility > 12 && (
              <div className="mt-1 md:mt-2 text-green-400 text-xs">
                ✅ Visibility bagus
              </div>
            )}
            {isFallback && (
              <div className="mt-1 md:mt-2 text-gray-500 text-xs">
                Rainfall: {weatherData.rainfall}mm
              </div>
            )}
          </div>
          
          {/* Dump Truck */}
          <div className="p-2 md:p-4 bg-white/5 rounded-lg md:rounded-2xl hover:bg-white/10 transition-all">
            <div className="flex items-center space-x-2 mb-1.5 md:mb-3">
              <div className="text-xl md:text-2xl">🚛</div>
              <div className="font-bold text-white text-sm md:text-base">Dump Truck</div>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              {weatherData.rainfall > 10 
                ? 'Reduce speed 30%. Check braking.'
                : 'Full payload operations.'}
            </p>
            {isPapuaML && weatherData.temperature > 30 && (
              <div className="mt-1 md:mt-2 text-yellow-400 text-xs">
                ⚠️ Kurangi beban 10%
              </div>
            )}
          </div>
          
          {/* Dozer */}
          <div className="p-2 md:p-4 bg-white/5 rounded-lg md:rounded-2xl hover:bg-white/10 transition-all">
            <div className="flex items-center space-x-2 mb-1.5 md:mb-3">
              <div className="text-xl md:text-2xl">🚜</div>
              <div className="font-bold text-white text-sm md:text-base">Dozer</div>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              {weatherData.rainfall > 10 
                ? 'Focus on drainage maintenance.'
                : 'Optimal for leveling operations.'}
            </p>
            {isPapuaML && weatherData.humidity > 80 && (
              <div className="mt-1 md:mt-2 text-blue-400 text-xs">
                💧 Periksa hidrolik
              </div>
            )}
          </div>
          
          {/* Water Management */}
          <div className="p-2 md:p-4 bg-white/5 rounded-lg md:rounded-2xl hover:bg-white/10 transition-all">
            <div className="flex items-center space-x-2 mb-1.5 md:mb-3">
              <div className="text-xl md:text-2xl">💧</div>
              <div className="font-bold text-white text-sm md:text-base">Water Management</div>
            </div>
            <p className="text-gray-400 text-xs md:text-sm">
              {weatherData.rainfall > 10 
                ? 'Activate all pumps.'
                : 'Normal water spraying.'}
            </p>
            {isPapuaML && weatherData.rainfall === 0 && weatherData.temperature > 30 && (
              <div className="mt-1 md:mt-2 text-orange-400 text-xs">
                🔥 Tingkatkan penyemprotan
              </div>
            )}
          </div>
        </div>
        
        {/* Data Source Note - Mobile optimized */}
        {(isPapuaML || isFallback) && (
          <div className={`mt-4 md:mt-6 pt-3 md:pt-6 border-t ${isPapuaML ? 'border-purple-500/30' : 'border-gray-500/30'}`}>
            <div className="flex items-start space-x-2 md:space-x-3">
              {isPapuaML ? (
                <>
                  <Brain className="w-3.5 h-3.5 md:w-5 md:h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-purple-300 text-sm md:text-base">Catatan Khusus Papua</h4>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5 md:mt-1">
                      Rekomendasi dari model ML untuk Papua.
                      {weatherData.ml_original_temp && ` Suhu disesuaikan dari ${weatherData.ml_original_temp.toFixed(1)}°C ke ${weatherData.temperature}°C.`}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl md:text-2xl mt-0.5">📡</div>
                  <div>
                    <h4 className="font-bold text-gray-300 text-sm md:text-base">Simulation Mode Active</h4>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5 md:mt-1">
                      Equipment recommendations are based on simulated weather data.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Backend Connection Prompt - Mobile optimized */}
        {isFallback && backendStatus && !backendStatus.connected && (
          <div className="mt-4 md:mt-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/50 rounded-lg md:rounded-2xl p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 md:space-x-3">
                <WifiOff className="w-4 h-4 md:w-6 md:h-6 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm md:text-base">Connect Backend</h4>
                  <p className="text-blue-200 text-xs md:text-sm">
                    Productivity scores will be more accurate with backend connection.
                  </p>
                </div>
              </div>
              <div className="text-right mt-1 sm:mt-0">
                <div className="text-gray-400 text-xs">
                  Current: Simulation Mode
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  Score: {productivityScore}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiningDashboard;