import { Gauge, Wrench } from 'lucide-react'

export default function CarBadge({ car, compact = false }) {
  if (!car) return null

  if (compact) return (
    <span className="inline-flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-zinc-300">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: car.color || '#888' }} />
      {car.brand} {car.model}
    </span>
  )

  return (
    <div className="glass-light rounded-xl overflow-hidden">
      {/* Car photo */}
      {car.photo_url && (
        <div className="w-full relative" style={{ height: 160 }}>
          <img
            src={car.photo_url}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: car.color || '#888', boxShadow: '0 0 0 2px rgba(255,255,255,0.2)' }} />
            <span className="text-white font-bold">{car.brand} {car.model}</span>
            <span className="text-zinc-300 text-sm">{car.year}</span>
          </div>
        </div>
      )}

      <div className="p-3 space-y-2">
        {!car.photo_url && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: car.color || '#888' }} />
            <span className="font-semibold">{car.brand} {car.model}</span>
            <span className="text-zinc-400 text-sm">{car.year}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          {car.horsepower && (
            <span className="flex items-center gap-1"><Gauge size={13} />{car.horsepower} HP</span>
          )}
          {car.mods?.length > 0 && (
            <span className="flex items-center gap-1"><Wrench size={13} />{car.mods.length} mod</span>
          )}
        </div>
        {car.mods?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {car.mods.map(m => (
              <span key={m} className="text-[11px] bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
