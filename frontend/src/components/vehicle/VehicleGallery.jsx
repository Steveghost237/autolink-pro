import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { galleryFor } from '../../utils/vehicleDetails';

/* Mosaïque photos de la fiche véhicule : grande image + 4 vignettes */
export default function VehicleGallery({ vehicle }) {
  const photos = galleryFor(vehicle);
  const [main, setMain] = useState(photos[0]);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-3">
      {/* Photo principale */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-72 lg:h-[400px]">
        <img src={main} alt={vehicle.name}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
        <button
          className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3.5 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 transition-colors">
          <Camera size={14} /> Voir les {photos.length} photos
        </button>
      </div>

      {/* Vignettes */}
      <div className="hidden lg:grid grid-cols-2 gap-3">
        {photos.slice(1, 5).map((p, i) => (
          <button key={p + i} onClick={() => setMain(p)}
            className={`relative rounded-xl overflow-hidden bg-slate-100 transition-all ${
              main === p ? 'ring-2 ring-teal-500 ring-offset-2' : 'hover:opacity-90'
            }`}>
            <img src={p} alt={`${vehicle.name} — vue ${i + 2}`}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
          </button>
        ))}
      </div>
    </div>
  );
}
