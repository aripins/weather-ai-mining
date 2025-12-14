import { HardHat, Info } from 'lucide-react';
import { useState } from 'react';

const Header = ({ location }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Info */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-3 rounded-2xl">
              <HardHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Weather AI Mining
              </h1>
              <p className="text-xs text-gray-400 hidden md:block">
                Smart weather predictions for mining operations
              </p>
            </div>
          </div>

          {/* Right Section - Simplified */}
          <div className="flex items-center space-x-4">
            {/* Info Button */}
            <div className="relative">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                title="Tentang Aplikasi"
              >
                <Info className="w-5 h-5 text-gray-300" />
              </button>
              
              {/* Info Panel */}
              {showInfo && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 z-50">
                  <h3 className="font-bold text-white mb-2">Weather AI Mining</h3>
                  <p className="text-sm text-gray-300">
                    Platform prediksi cuaca cerdas untuk operasional pertambangan di seluruh Indonesia.
                    Menggabungkan data real-time dengan analisis risiko operasional.
                  </p>
                  <div className="mt-3 text-xs text-gray-400">
                    <p className="font-medium mb-1">Cara Penggunaan:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Cari lokasi tambang menggunakan search bar</li>
                      <li>Lihat rekomendasi operasional di tab Mining Ops</li>
                      <li>Gunakan chatbot untuk bantuan lebih lanjut</li>
                    </ol>
                  </div>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="mt-3 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;