import { CloudRain, Droplets, Gauge, Thermometer, Wind } from 'lucide-react';

const WeatherCard = ({ data }) => {
  if (!data) return null;

  const cards = [
    {
      icon: <Thermometer className="w-6 h-6" />,
      label: 'Temperature',
      value: `${data.temperature}°C`,
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      label: 'Humidity',
      value: `${data.humidity}%`,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <CloudRain className="w-6 h-6" />,
      label: 'Rainfall',
      value: `${data.rainfall} mm`,
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: <Wind className="w-6 h-6" />,
      label: 'Wind Speed',
      value: `${data.wind_speed} km/h`,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Gauge className="w-6 h-6" />,
      label: 'Pressure',
      value: `${data.pressure} hPa`,
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
      {/* Header - Simplified */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{data.location}</h2>
          <p className="text-gray-400 capitalize">{data.description}</p>
        </div>
        <span className="text-4xl">
          {data.rainfall > 10 ? '🌧️' : data.rainfall > 0 ? '🌦️' : data.temperature > 30 ? '☀️' : '⛅'}
        </span>
      </div>

      {/* Weather Metrics */}
      <div className="space-y-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${card.color} bg-opacity-20 border border-white/10`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-gray-300">{card.icon}</div>
              <span className="font-medium text-gray-300">{card.label}</span>
            </div>
            <span className="font-bold text-white text-xl">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Forecast</h3>
          <span className="text-xs text-gray-400">Next 3 hours</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(data.forecast_hours || {}).slice(0, 3).map(([time, forecast]) => (
            <div key={time} className="text-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <div className="font-medium text-gray-400">{time}</div>
              <div className="text-lg font-bold text-white">{forecast.temperature}°C</div>
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <CloudRain className="w-3 h-3 mr-1" />
                {forecast.rainfall}mm
              </div>
            </div>
          ))}
        </div>
        
        {}
      </div>
    </div>
  );
};

export default WeatherCard;