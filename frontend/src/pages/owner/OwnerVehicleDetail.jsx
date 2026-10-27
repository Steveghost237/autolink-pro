import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { OwnerLayout } from '../../components/ownerdash';
import {
  VehicleHero, VehicleStats, AuditTimeline,
  BookingCalendar, InspectionPanel, InspectorChat,
} from '../../components/ownervehicle';
import { vehiclesAPI, bookingsAPI } from '../../services/api';
import { Loader } from 'lucide-react';

export default function OwnerVehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    try {
      const [v, b] = await Promise.all([
        vehiclesAPI.detail(id),
        bookingsAPI.list({ page_size: 100 }),
      ]);
      setVehicle(v.data);
      setBookings((b.data.results || b.data || []).filter(x => x.vehicle === Number(id)));
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!vehicle) return (
    <OwnerLayout>
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader size={28} className="animate-spin mb-3 text-teal-500" />
        <p className="text-sm font-bold">{online ? 'Chargement du dossier technique…' : 'API injoignable — actualisez la page.'}</p>
      </div>
    </OwnerLayout>
  );

  const missions = bookings.filter(b => b.status === 'completed').length || vehicle.total_bookings || 0;
  const occupancy = bookings.filter(b => ['confirmed', 'active'].includes(b.status)).length ? 78 : 45;
  const rating = 4.6 + ((vehicle.id || 0) % 4) / 10;

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <VehicleHero v={vehicle} />
        <VehicleStats
          earned={vehicle.total_earned || 0}
          occupancy={occupancy}
          rating={rating}
          missions={missions}
        />
        <AuditTimeline score={vehicle.condition_score || 95} />
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <BookingCalendar bookings={bookings} />
          <InspectionPanel v={vehicle} />
        </div>
        <InspectorChat />
      </div>
    </OwnerLayout>
  );
}
