// AutoLink Pro — Mobile App v3.0 — Cameroun
// Production-Ready · All Roles · Real Images · No Emojis
// © 2025 AutoLink Technologies — Douala & Yaoundé

import React, { useState, useEffect, useContext, createContext, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList,
  TextInput, StatusBar, ActivityIndicator, Alert,
  Platform, Dimensions, Animated, Modal, Switch, Image, ImageBackground,
  KeyboardAvoidingView, RefreshControl,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── DIMENSIONS & CONSTANTS ───────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');

const C = {
  primary: '#0D9488', primaryDark: '#0F766E', primaryLight: '#14B8A6',
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#1E293B', muted: '#64748B', white: '#FFFFFF',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6',
  dark: '#0F172A', overlay: 'rgba(0,0,0,0.55)',
};
const STATUS_COLOR = {
  approved: C.success, pending: C.warning, rented: C.info, completed: C.success,
  active: C.info, confirmed: C.primary, cancelled: C.error, disputed: C.error,
};
const STATUS_LABEL = {
  approved: 'Approuve', pending: 'Attente paiement', rented: 'En location',
  completed: 'Termine', active: 'En cours', confirmed: 'Confirme', cancelled: 'Annule', disputed: 'Litige',
};

// ─── API — backend partage web + mobile ────────────────────────────────────────
// En production : domaine de l'API Dokploy. En local : http://<IP-PC>:8000/api
const API_URL = 'https://api-autolink-pro.worldwide-international.business/api';

const apiFetch = async (path, { method = 'GET', body, auth = true } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = await AsyncStorage.getItem('al_access');
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && auth) throw Object.assign(new Error('unauthorized'), { status: 401 });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error('api_error'), { status: res.status, data });
  return data;
};

const api = {
  login:      (email, password) => apiFetch('/users/login/', { method: 'POST', body: { email, password }, auth: false }),
  google:     (profile)         => apiFetch('/users/google/', { method: 'POST', body: profile, auth: false }),
  register:   (payload)         => apiFetch('/users/register/', { method: 'POST', body: payload, auth: false }),
  me:         ()                => apiFetch('/users/me/'),
  vehicles:   ()                => apiFetch('/vehicles/?page_size=100', { auth: false }),
  bookings:   ()                => apiFetch('/bookings/?page_size=100'),
  newBooking: (payload)         => apiFetch('/bookings/', { method: 'POST', body: payload }),
  setStatus:  (id, status)      => apiFetch(`/bookings/${id}/`, { method: 'PATCH', body: { status } }),
  stats:      ()                => apiFetch('/bookings/stats/'),
  users:      ()                => apiFetch('/users/?page_size=100'),
  setUser:    (id, payload)     => apiFetch(`/users/${id}/`, { method: 'PATCH', body: payload }),
  wallet:     ()                => apiFetch('/payments/wallet/'),
  topup:      (amount, method, phone) => apiFetch('/payments/wallet/topup/', { method: 'POST', body: { amount, method, phone } }),
  dispute:    (id, reason)      => apiFetch(`/bookings/${id}/dispute/`, { method: 'POST', body: { reason } }),
  resolve:    (id, decision)    => apiFetch(`/bookings/${id}/resolve-dispute/`, { method: 'POST', body: { decision } }),
  notifs:     ()                => apiFetch('/users/notifications/'),
  readNotifs: ()                => apiFetch('/users/notifications/read/', { method: 'POST' }),
};

const TIER_STYLE = {
  basic:    { label: 'Basic',    color: '#475569' },
  standard: { label: 'Standard', color: '#2563EB' },
  premium:  { label: 'Premium',  color: '#7C3AED' },
  gold:     { label: 'Gold',     color: '#D97706' },
};

const TOPUP_METHODS = [
  { id: 'mtn',    label: 'MTN MoMo',     color: '#FCD34D', icon: 'phone-portrait' },
  { id: 'orange', label: 'Orange Money', color: '#FB923C', icon: 'phone-portrait' },
  { id: 'senbid', label: 'SenBid',       color: '#14B8A6', icon: 'card' },
  { id: 'paybid', label: 'PayBid',       color: '#6366F1', icon: 'card' },
  { id: 'paypal', label: 'PayPal',       color: '#1D4ED8', icon: 'globe' },
  { id: 'stripe', label: 'Stripe',       color: '#7C3AED', icon: 'card' },
];

const IMG = {
  hero:    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  corolla: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&q=80',
  tucson:  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&q=80',
  bmw5:    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&q=80',
  merGLE:  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&q=80',
  sportage:'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=500&q=80',
  evoque:  'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=500&q=80',
  sprinter:'https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=500&q=80',
  van:     'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&q=80',
  d1:      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  d2:      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
  d3:      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const RENTAL_TYPES = [
  { id:'3h',        label:'3 heures',    icon:'time-outline',     mult:0.15, minP:15000, km:100 },
  { id:'8h',        label:'8 heures',    icon:'sunny-outline',    mult:0.30, minP:25000, km:200 },
  { id:'24h',       label:'24 heures',   icon:'calendar-outline', mult:1.0,  minP:25000, km:300 },
  { id:'intercity', label:'Interurbain', icon:'navigate-outline', mult:1.5,  minP:60000, km:500 },
  { id:'longhaul',  label:'Longue duree',icon:'moon-outline',     mult:null, minP:0,     km:500 },
];

const VALID_AGENT_CODES = ['AGT-DBL-001','AGT-YDE-002','AGT-DBL-003'];

const DEMO_USERS = [
  { id:1, email:'client@autolink.com',     password:'pass123', role:'CLIENT',
    firstName:'Marie', lastName:'Mballa',  phone:'+237 6 75 12 34 56', bookings:12, spent:780000 },
  { id:2, email:'driver@autolink.com',     password:'pass123', role:'DRIVER',
    firstName:'Armand', lastName:'Nkounga', phone:'+237 6 99 88 77 00',
    rating:4.8, trips:312, earned:2450000, acceptance:96, ontime:98 },
  { id:3, email:'owner@autolink.com',      password:'pass123', role:'OWNER',
    firstName:'Jean', lastName:'Kouassi', phone:'+237 6 55 22 33 44',
    vehicles:2, totalEarned:1856000, locations:65 },
  { id:4, email:'admin@autolink.com',      password:'pass123', role:'ADMIN',
    firstName:'Admin', lastName:'AutoLink', phone:'+237 2 22 20 00 01' },
  { id:5, email:'controller@autolink.com', password:'pass123', role:'CONTROLLER',
    firstName:'Paul', lastName:'Diallo', phone:'+237 6 54 44 55 66', inspections:247 },
];

// 60+ véhicules réels les plus utilisés au Cameroun — gammes basic/standard/premium/gold
const _mv = (id, name, cat, tier, rate, fuel, seats, extra = {}) => ({
  id, name, cat, tier, rate, fuel, seats,
  plate: `LT-${1000 + id}-A`,
  image: tier === 'gold' || tier === 'premium' ? IMG.merGLE : cat === 'SUV' ? IMG.tucson : cat === 'Pickup' ? IMG.evoque : cat === 'Van' || cat === 'Minibus' ? IMG.sprinter || IMG.evoque : IMG.corolla,
  kmIncluded: tier === 'gold' || tier === 'premium' ? 500 : 300,
  kmRate: tier === 'gold' ? 150 : 120,
  rating: extra.rating ?? 4.6, reviews: extra.reviews ?? 15,
  status: extra.status ?? 'approved', score: extra.score ?? 90,
});

const VEHICLES = [
  // BASIC
  _mv(1, 'Toyota Yaris 2019', 'Citadine', 'basic', 18000, 'Essence', 5, { rating: 4.5 }),
  _mv(2, 'Toyota Corolla 2016', 'Berline', 'basic', 20000, 'Essence', 5, { rating: 4.6 }),
  _mv(3, 'Toyota Camry 2015', 'Berline', 'basic', 22000, 'Essence', 5, { rating: 4.4 }),
  _mv(4, 'Toyota Avensis 2014', 'Berline', 'basic', 20000, 'Diesel', 5, { rating: 4.3 }),
  _mv(5, 'Toyota Starlet 2021', 'Citadine', 'basic', 19000, 'Essence', 5, { rating: 4.7 }),
  _mv(6, 'Honda Civic 2017', 'Berline', 'basic', 21000, 'Essence', 5, { rating: 4.5 }),
  _mv(7, 'Honda Accord 2015', 'Berline', 'basic', 23000, 'Essence', 5, { rating: 4.4 }),
  _mv(8, 'Hyundai Accent 2019', 'Citadine', 'basic', 17000, 'Essence', 5, { rating: 4.3 }),
  _mv(9, 'Hyundai Elantra 2018', 'Berline', 'basic', 20000, 'Essence', 5, { rating: 4.5 }),
  _mv(10, 'Kia Rio 2019', 'Citadine', 'basic', 17000, 'Essence', 5, { rating: 4.4 }),
  _mv(11, 'Kia Picanto 2021', 'Citadine', 'basic', 15000, 'Essence', 5, { rating: 4.6 }),
  _mv(12, 'Kia Cerato 2017', 'Berline', 'basic', 19000, 'Essence', 5, { rating: 4.4 }),
  _mv(13, 'Nissan Almera 2018', 'Berline', 'basic', 18000, 'Essence', 5, { rating: 4.3 }),
  _mv(14, 'Nissan Micra 2019', 'Citadine', 'basic', 15000, 'Essence', 5, { rating: 4.2 }),
  _mv(15, 'Suzuki Swift 2020', 'Citadine', 'basic', 17000, 'Essence', 5, { rating: 4.6 }),
  _mv(16, 'Peugeot 301 2018', 'Berline', 'basic', 19000, 'Diesel', 5, { rating: 4.4 }),
  _mv(17, 'Peugeot 208 2020', 'Citadine', 'basic', 20000, 'Essence', 5, { rating: 4.5 }),
  _mv(18, 'Renault Logan 2017', 'Berline', 'basic', 16000, 'Diesel', 5, { rating: 4.2 }),
  _mv(19, 'Renault Clio 2019', 'Citadine', 'basic', 17000, 'Essence', 5, { rating: 4.4 }),
  _mv(20, 'Volkswagen Golf 7 2017', 'Citadine', 'basic', 22000, 'Essence', 5, { rating: 4.6 }),
  _mv(21, 'Volkswagen Polo 2019', 'Citadine', 'basic', 19000, 'Essence', 5, { rating: 4.5 }),
  _mv(22, 'Mazda 3 2018', 'Berline', 'basic', 21000, 'Essence', 5, { rating: 4.5 }),
  _mv(23, 'Ford Fiesta 2018', 'Citadine', 'basic', 17000, 'Essence', 5, { rating: 4.3 }),
  _mv(24, 'Dacia Logan 2019', 'Berline', 'basic', 16000, 'Diesel', 5, { rating: 4.3 }),
  // STANDARD
  _mv(25, 'Toyota Corolla 2022', 'Berline', 'standard', 25000, 'Essence', 5, { rating: 4.8, image: IMG.corolla }),
  _mv(26, 'Toyota RAV4 2021', 'SUV', 'standard', 42000, 'Hybride', 5, { rating: 4.7 }),
  _mv(27, 'Toyota Camry 2021', 'Berline', 'standard', 35000, 'Hybride', 5, { rating: 4.7 }),
  _mv(28, 'Toyota Hilux 2020', 'Pickup', 'standard', 50000, 'Diesel', 5, { rating: 4.8 }),
  _mv(29, 'Toyota Fortuner 2019', 'SUV', 'standard', 52000, 'Diesel', 7, { rating: 4.6 }),
  _mv(30, 'Toyota HiAce 2020', 'Minibus', 'standard', 55000, 'Diesel', 14, { rating: 4.6 }),
  _mv(31, 'Hyundai Tucson 2023', 'SUV', 'standard', 45000, 'Diesel', 5, { rating: 4.7, image: IMG.tucson }),
  _mv(32, 'Hyundai Santa Fe 2021', 'SUV', 'standard', 50000, 'Diesel', 7, { rating: 4.6 }),
  _mv(33, 'Hyundai H-1 2019', 'Van', 'standard', 45000, 'Diesel', 9, { rating: 4.5 }),
  _mv(34, 'Kia Sportage 2023', 'SUV', 'standard', 38000, 'Hybride', 5, { rating: 4.6, image: IMG.sportage }),
  _mv(35, 'Kia Sorento 2021', 'SUV', 'standard', 48000, 'Diesel', 7, { rating: 4.6 }),
  _mv(36, 'Nissan Qashqai 2021', 'SUV', 'standard', 35000, 'Essence', 5, { rating: 4.5 }),
  _mv(37, 'Nissan X-Trail 2020', 'SUV', 'standard', 42000, 'Diesel', 7, { rating: 4.5 }),
  _mv(38, 'Nissan Navara 2021', 'Pickup', 'standard', 48000, 'Diesel', 5, { rating: 4.6 }),
  _mv(39, 'Honda CR-V 2021', 'SUV', 'standard', 40000, 'Essence', 5, { rating: 4.7 }),
  _mv(40, 'Mazda CX-5 2022', 'SUV', 'standard', 43000, 'Essence', 5, { rating: 4.7 }),
  _mv(41, 'Mitsubishi Outlander 2020', 'SUV', 'standard', 38000, 'Essence', 7, { rating: 4.4 }),
  _mv(42, 'Mitsubishi L200 2021', 'Pickup', 'standard', 46000, 'Diesel', 5, { rating: 4.5 }),
  _mv(43, 'Mitsubishi Pajero 2018', 'SUV', 'standard', 50000, 'Diesel', 7, { rating: 4.5 }),
  _mv(44, 'Suzuki Vitara 2021', 'SUV', 'standard', 32000, 'Essence', 5, { rating: 4.4 }),
  _mv(45, 'Peugeot 3008 2021', 'SUV', 'standard', 45000, 'Diesel', 5, { rating: 4.6 }),
  _mv(46, 'Peugeot 508 2020', 'Berline', 'standard', 38000, 'Diesel', 5, { rating: 4.6 }),
  _mv(47, 'Volkswagen Tiguan 2021', 'SUV', 'standard', 44000, 'Diesel', 5, { rating: 4.6 }),
  _mv(48, 'Isuzu D-Max 2022', 'Pickup', 'standard', 47000, 'Diesel', 5, { rating: 4.6 }),
  _mv(49, 'Ford Ranger 2021', 'Pickup', 'standard', 49000, 'Diesel', 5, { rating: 4.7 }),
  _mv(50, 'Ford Everest 2020', 'SUV', 'standard', 53000, 'Diesel', 7, { rating: 4.5 }),
  _mv(51, 'Mercedes Sprinter 2021', 'Van', 'standard', 55000, 'Diesel', 9, { rating: 4.9 }),
  _mv(52, 'Dacia Duster 2021', 'SUV', 'standard', 28000, 'Diesel', 5, { rating: 4.4 }),
  // PREMIUM
  _mv(53, 'Toyota Land Cruiser Prado 2022', 'SUV', 'premium', 75000, 'Diesel', 7, { rating: 4.9 }),
  _mv(54, 'Toyota Land Cruiser 2020', 'SUV', 'premium', 85000, 'Diesel', 7, { rating: 4.9 }),
  _mv(55, 'Toyota Highlander 2022', 'SUV', 'premium', 68000, 'Hybride', 7, { rating: 4.7 }),
  _mv(56, 'Toyota Sienna 2022', 'Van', 'premium', 65000, 'Hybride', 8, { rating: 4.8 }),
  _mv(57, 'Mercedes Classe C 300 2022', 'Berline', 'premium', 70000, 'Essence', 5, { rating: 4.8 }),
  _mv(58, 'Mercedes Classe E 350 2021', 'Berline', 'premium', 78000, 'Diesel', 5, { rating: 4.9 }),
  _mv(59, 'Mercedes GLC 300 2022', 'SUV', 'premium', 80000, 'Essence', 5, { rating: 4.8 }),
  _mv(60, 'BMW Serie 5 2022', 'Berline', 'premium', 80000, 'Essence', 5, { rating: 5.0, status: 'rented', image: IMG.bmw5 }),
  _mv(61, 'BMW X3 2021', 'SUV', 'premium', 72000, 'Diesel', 5, { rating: 4.7 }),
  _mv(62, 'BMW X5 2022', 'SUV', 'premium', 88000, 'Diesel', 7, { rating: 4.9 }),
  _mv(63, 'Audi Q5 2022', 'SUV', 'premium', 75000, 'Diesel', 5, { rating: 4.8 }),
  _mv(64, 'Audi A6 2021', 'Berline', 'premium', 70000, 'Diesel', 5, { rating: 4.7 }),
  _mv(65, 'Lexus RX 350 2021', 'SUV', 'premium', 78000, 'Hybride', 5, { rating: 4.8 }),
  _mv(66, 'Lexus GX 460 2020', 'SUV', 'premium', 82000, 'Essence', 7, { rating: 4.7 }),
  _mv(67, 'Nissan Patrol 2020', 'SUV', 'premium', 85000, 'Essence', 7, { rating: 4.8 }),
  _mv(68, 'Volkswagen Touareg 2021', 'SUV', 'premium', 76000, 'Diesel', 5, { rating: 4.7 }),
  // GOLD
  _mv(69, 'Mercedes GLE 350 2023', 'SUV', 'gold', 95000, 'Diesel', 7, { rating: 4.9, image: IMG.merGLE }),
  _mv(70, 'Mercedes GLS 450 2022', 'SUV', 'gold', 120000, 'Essence', 7, { rating: 4.9 }),
  _mv(71, 'Mercedes Classe S 500 2023', 'Berline', 'gold', 150000, 'Hybride', 5, { rating: 5.0 }),
  _mv(72, 'Mercedes Classe G 63 2022', 'SUV', 'gold', 200000, 'Essence', 5, { rating: 4.9 }),
  _mv(73, 'BMW X7 2023', 'SUV', 'gold', 130000, 'Essence', 7, { rating: 4.9 }),
  _mv(74, 'BMW Serie 7 2022', 'Berline', 'gold', 125000, 'Hybride', 5, { rating: 4.8 }),
  _mv(75, 'Lexus LX 570 2021', 'SUV', 'gold', 110000, 'Essence', 7, { rating: 4.8 }),
  _mv(76, 'Range Rover Evoque 2022', 'SUV', 'gold', 110000, 'Essence', 5, { rating: 4.9, image: IMG.evoque }),
  _mv(77, 'Range Rover Sport 2023', 'SUV', 'gold', 140000, 'Diesel', 5, { rating: 5.0 }),
  _mv(78, 'Range Rover Velar 2022', 'SUV', 'gold', 105000, 'Essence', 5, { rating: 4.8 }),
  _mv(79, 'Toyota Land Cruiser V8 VXR 2023', 'SUV', 'gold', 100000, 'Diesel', 7, { rating: 4.9 }),
  _mv(80, 'Porsche Cayenne 2022', 'SUV', 'gold', 160000, 'Essence', 5, { rating: 4.9 }),
  _mv(81, 'Audi Q7 2022', 'SUV', 'gold', 98000, 'Diesel', 7, { rating: 4.8 }),
  _mv(82, 'Audi Q8 2023', 'SUV', 'gold', 135000, 'Essence', 5, { rating: 4.9 }),
];

const BOOKINGS = [
  { id:'BK-0024', vehicle:'Hyundai Tucson 2023', type:'Journee',    amount:45000,  status:'completed', date:'08 Sep', driver:'Armand Nkounga', rating:5 },
  { id:'BK-0025', vehicle:'BMW Serie 5 2022',    type:'8 heures',   amount:24000,  status:'completed', date:'06 Sep', driver:'Eric Mvondo',    rating:4 },
  { id:'BK-0026', vehicle:'Mercedes GLE 350',    type:'Interurbain',amount:142500, status:'pending',   date:'12 Sep', driver:'En attente',     rating:null },
];

const TRIPS = [
  { id:1, client:'Marie Mballa',  from:'Bonanjo',   to:'Akwa',  date:'Auj 09:30',  amount:15000, rating:5, km:'18 km', duration:'45 min', photo:IMG.d1 },
  { id:2, client:'Eric Mvondo',   from:'Bonapriso', to:'Bali',  date:'Hier 14:20', amount:12000, rating:4, km:'14 km', duration:'38 min', photo:IMG.d2 },
  { id:3, client:'Aline Ngono',   from:'Makepe',    to:'Kotto', date:'20 Sep',     amount:18000, rating:5, km:'22 km', duration:'62 min', photo:IMG.d3 },
];

const INSPECTIONS = [
  { id:1, vehicle:'Toyota Corolla 2022', plate:'LT-1234-A', type:'Entree', date:'Auj 08:15', score:94, fuel:95,  km:45230 },
  { id:2, vehicle:'Hyundai Tucson 2023', plate:'LT-5678-B', type:'Sortie', date:'Hier 16:45',score:91, fuel:60,  km:28750 },
  { id:3, vehicle:'BMW Serie 5 2022',    plate:'CE-9012-C', type:'Entree', date:'20 Sep',    score:99, fuel:100, km:12400 },
];

const fmtNum = n => n >= 1000000
  ? (n/1000000).toFixed(1).replace('.0','') + ' M F'
  : n >= 1000 ? (n/1000).toFixed(0) + ' K F'
  : n + ' F';
const fmtRate = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F';

// ─── CONTEXTS ─────────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// ─── COMMON COMPONENTS ────────────────────────────────────────────────────────
function Badge({ label, color = C.primary }) {
  return (
    <View style={{ backgroundColor: color + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

function Stars({ rating = 0, size = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Ionicons key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size} color="#FBBF24" />
      ))}
    </View>
  );
}

function SectionTitle({ title, action, onAction }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 }}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: C.text }}>{title}</Text>
      {action && <TouchableOpacity onPress={onAction}><Text style={{ color: C.primary, fontWeight: '600', fontSize: 13 }}>{action}</Text></TouchableOpacity>}
    </View>
  );
}

function VehicleCard({ v, onPress }) {
  const avail = v.status === 'approved';
  return (
    <TouchableOpacity onPress={onPress} disabled={!avail} activeOpacity={0.88}
      style={{ backgroundColor:C.card, borderRadius:18, overflow:'hidden', marginBottom:14,
        shadowColor:'#000', shadowOpacity:0.08, shadowRadius:10, elevation:4, opacity:avail?1:0.65 }}>
      <View style={{ height:155, backgroundColor:'#CBD5E1' }}>
        <Image source={{ uri:v.image }} style={{ width:'100%', height:'100%' }} resizeMode="cover" />
        <View style={{ position:'absolute', top:0,left:0,right:0,bottom:0, backgroundColor:'rgba(0,0,0,0.1)' }} />
        <View style={{ position:'absolute', top:10, left:10, flexDirection:'row', gap:6 }}>
          <View style={{ backgroundColor:C.primary, borderRadius:20, paddingHorizontal:10, paddingVertical:4 }}>
            <Text style={{ color:'#fff', fontSize:11, fontWeight:'700' }}>{v.cat}</Text>
          </View>
          {v.tier && (
            <View style={{ backgroundColor:(TIER_STYLE[v.tier]?.color || C.primary), borderRadius:20, paddingHorizontal:10, paddingVertical:4 }}>
              <Text style={{ color:'#fff', fontSize:11, fontWeight:'700' }}>{TIER_STYLE[v.tier]?.label || v.tier}</Text>
            </View>
          )}
        </View>
        <View style={{ position:'absolute', top:10, right:10, backgroundColor:'rgba(0,0,0,0.45)',
          borderRadius:20, paddingHorizontal:8, paddingVertical:3, flexDirection:'row', alignItems:'center', gap:3 }}>
          <Ionicons name="star" size={11} color="#FBBF24" />
          <Text style={{ color:'#fff', fontSize:11, fontWeight:'700' }}>{v.rating}</Text>
        </View>
        {!avail && (
          <View style={{ position:'absolute', top:0,left:0,right:0,bottom:0, backgroundColor:'rgba(0,0,0,0.5)',
            alignItems:'center', justifyContent:'center' }}>
            <Text style={{ color:'#fff', fontWeight:'800', fontSize:14 }}>En location</Text>
          </View>
        )}
        <View style={{ position:'absolute', bottom:8, left:10 }}>
          <Text style={{ color:'rgba(255,255,255,0.85)', fontSize:10,
            fontFamily: Platform.OS==='ios'?'Courier':'monospace' }}>{v.plate}</Text>
        </View>
      </View>
      <View style={{ padding:14 }}>
        <Text numberOfLines={1} style={{ fontSize:15, fontWeight:'800', color:C.text, marginBottom:2 }}>{v.name}</Text>
        <Text style={{ fontSize:12, color:C.muted, marginBottom:8 }}>
          {v.fuel} · {v.seats} places · Score {v.score}/100
        </Text>
        <View style={{ backgroundColor:'#EFF6FF', borderRadius:10, padding:8, marginBottom:10 }}>
          <Text style={{ fontSize:11, color:C.info, fontWeight:'600' }}>
            {v.kmIncluded} km inclus · {v.kmRate} F/km supp.
          </Text>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:19, fontWeight:'900', color:C.primary, flexShrink:1, marginRight:8 }}>
            {v.rate.toLocaleString()}<Text style={{ fontSize:12, fontWeight:'400', color:C.muted }}> F/j</Text>
          </Text>
          <View style={{ backgroundColor:avail?C.primary:'#94A3B8', borderRadius:12,
            paddingHorizontal:14, paddingVertical:8 }}>
            <Text style={{ color:'#fff', fontWeight:'700', fontSize:13 }}>
              {avail ? 'Reserver' : 'Complet'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TabBar({ tabs, active, onPress }) {
  return (
    <View style={{ flexDirection:'row', backgroundColor:C.card, borderTopWidth:1, borderTopColor:C.border,
      paddingBottom: Platform.OS==='ios'?20:8, paddingTop:8 }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <TouchableOpacity key={t.id} style={{ flex:1, alignItems:'center', paddingVertical:4 }}
            onPress={() => onPress(t.id)}>
            <Ionicons name={on ? t.icon : t.icon+'-outline'} size={22} color={on?C.primary:C.muted} />
            <Text style={{ fontSize:10, marginTop:2, color:on?C.primary:C.muted, fontWeight:on?'700':'400' }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── SPLASH + LOGIN ──────────────────────────────────────────────────────────────
function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, []);
  return (
    <LinearGradient colors={[C.dark, C.primaryDark, C.primary]}
      style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={{ width:90, height:90, borderRadius:24, backgroundColor:'rgba(255,255,255,0.2)',
        alignItems:'center', justifyContent:'center', marginBottom:18 }}>
        <Ionicons name="car-sport" size={46} color="#fff" />
      </View>
      <Text style={{ color:'#fff', fontSize:30, fontWeight:'900', letterSpacing:-0.5 }}>AutoLink Pro</Text>
      <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:16, marginTop:8 }}>Votre mobilite, notre mission</Text>
      <ActivityIndicator color="rgba(255,255,255,0.6)" size="large" style={{ position:'absolute', bottom:80 }} />
    </LinearGradient>
  );
}

function GoogleButton() {
  const { googleLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [gmail, setGmail] = useState('');
  const [gname, setGname] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!gmail.includes('@')) { Alert.alert('Requis', 'Entrez une adresse Gmail valide.'); return; }
    setBusy(true);
    const parts = gname.trim().split(/\s+/);
    const r = await googleLogin({ email: gmail, first_name: parts[0] || '', last_name: parts.slice(1).join(' ') || '', google_id: '' });
    setBusy(false);
    if (r.success) setOpen(false);
    else Alert.alert('Erreur', r.error || 'Connexion Google impossible.');
  };

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)}
        style={{ borderWidth:1.5, borderColor:C.border, borderRadius:14, paddingVertical:13,
          flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, backgroundColor:C.card, marginTop:14 }}>
        <Ionicons name="logo-google" size={18} color="#DB4437" />
        <Text style={{ color:C.text, fontWeight:'700', fontSize:14 }}>Continuer avec Google</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', padding:24 }}>
          <View style={{ backgroundColor:C.bg, borderRadius:20, padding:20 }}>
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={{ fontWeight:'800', color:C.text, fontSize:15 }}>Compte Google</Text>
              </View>
              <TouchableOpacity onPress={() => setOpen(false)}><Ionicons name="close" size={24} color={C.muted} /></TouchableOpacity>
            </View>
            <Text style={{ fontSize:12, fontWeight:'600', color:C.muted, marginBottom:4 }}>Adresse Gmail</Text>
            <TextInput value={gmail} onChangeText={setGmail} placeholder="prenom.nom@gmail.com" placeholderTextColor={C.muted}
              keyboardType="email-address" autoCapitalize="none"
              style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:12, backgroundColor:C.card, color:C.text, marginBottom:10 }} />
            <Text style={{ fontSize:12, fontWeight:'600', color:C.muted, marginBottom:4 }}>Nom complet (1ere connexion)</Text>
            <TextInput value={gname} onChangeText={setGname} placeholder="Prenom Nom" placeholderTextColor={C.muted}
              style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:12, backgroundColor:C.card, color:C.text, marginBottom:14 }} />
            <TouchableOpacity onPress={submit} disabled={busy}
              style={{ backgroundColor:C.primary, borderRadius:12, paddingVertical:13, alignItems:'center' }}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontWeight:'700' }}>Continuer</Text>}
            </TouchableOpacity>
            <Text style={{ color:C.muted, fontSize:10, textAlign:'center', marginTop:10 }}>
              Compte cree automatiquement si inexistant (role Client).
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [reg, setReg] = useState({ firstName: '', lastName: '', phone: '' });
  const { register } = useAuth();

  const handle = async () => {
    if (!email || !pwd) { Alert.alert('Requis', 'Remplissez tous les champs.'); return; }
    setLoading(true);
    const r = await login({ email, password: pwd });
    setLoading(false);
    if (!r.success) Alert.alert('Connexion echouee', r.error);
  };

  const handleRegister = async () => {
    if (!email || !pwd || !reg.firstName || !reg.lastName) { Alert.alert('Requis', 'Remplissez tous les champs.'); return; }
    setLoading(true);
    const r = await register({ email, password: pwd, firstName: reg.firstName, lastName: reg.lastName, phone: reg.phone });
    setLoading(false);
    if (!r.success) Alert.alert('Inscription echouee', r.error);
  };

  // Profils publics uniquement — admin/chauffeur/controleur se connectent par leurs
  // identifiants (non affiches) et leurs comptes sont geres depuis l'espace Admin.
  const QUICK = [
    { label:'Client',        email:'client@autolink.com' },
    { label:'Gestionnaire',  email:'owner@autolink.com' },
  ];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.primaryDark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />
      <ScrollView contentContainerStyle={{ flexGrow:1, paddingBottom:40 }}>
        {/* Hero image */}
        <View style={{ height:200, backgroundColor:C.dark, overflow:'hidden' }}>
          <Image source={{ uri:IMG.hero }} style={{ width:'100%', height:'100%' }} resizeMode="cover" />
          <View style={{ position:'absolute', top:0,left:0,right:0,bottom:0, backgroundColor:'rgba(0,0,0,0.5)' }} />
          <View style={{ position:'absolute', top:0,left:0,right:0,bottom:0, justifyContent:'center', alignItems:'center' }}>
            <View style={{ width:72, height:72, borderRadius:20, backgroundColor:'rgba(255,255,255,0.2)',
              alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <Ionicons name="car-sport" size={38} color="#fff" />
            </View>
            <Text style={{ color:'#fff', fontSize:26, fontWeight:'900' }}>AutoLink Pro</Text>
            <Text style={{ color:'rgba(255,255,255,0.75)', fontSize:14, marginTop:4 }}>Douala · Yaounde · Cameroun</Text>
          </View>
        </View>

        {/* Form */}
        <View style={{ backgroundColor:C.bg, borderTopLeftRadius:24, borderTopRightRadius:24,
          marginTop:-20, padding:24 }}>
          <Text style={{ fontSize:20, fontWeight:'800', color:C.text, marginBottom:20 }}>
            {mode === 'login' ? 'Connexion' : 'Creer un compte'}
          </Text>

          {mode === 'register' && (
            <>
              <View style={{ flexDirection:'row', gap:10 }}>
                <View style={{ flex:1 }}>
                  <Text style={{ fontSize:13, fontWeight:'600', color:C.muted, marginBottom:6 }}>Prenom</Text>
                  <TextInput value={reg.firstName} onChangeText={v => setReg(r => ({...r, firstName: v}))} placeholder="Marie"
                    placeholderTextColor={C.muted} style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:13, fontSize:14, backgroundColor:C.card, color:C.text, marginBottom:12 }} />
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ fontSize:13, fontWeight:'600', color:C.muted, marginBottom:6 }}>Nom</Text>
                  <TextInput value={reg.lastName} onChangeText={v => setReg(r => ({...r, lastName: v}))} placeholder="Mballa"
                    placeholderTextColor={C.muted} style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:13, fontSize:14, backgroundColor:C.card, color:C.text, marginBottom:12 }} />
                </View>
              </View>
              <Text style={{ fontSize:13, fontWeight:'600', color:C.muted, marginBottom:6 }}>Telephone</Text>
              <TextInput value={reg.phone} onChangeText={v => setReg(r => ({...r, phone: v}))} placeholder="+237 6XX XX XX XX"
                placeholderTextColor={C.muted} keyboardType="phone-pad"
                style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:13, fontSize:14, backgroundColor:C.card, color:C.text, marginBottom:12 }} />
            </>
          )}

          <Text style={{ fontSize:13, fontWeight:'600', color:C.muted, marginBottom:6 }}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="votre@email.com"
            placeholderTextColor={C.muted} keyboardType="email-address" autoCapitalize="none"
            style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:13,
              fontSize:14, backgroundColor:C.card, color:C.text, marginBottom:14 }} />

          <Text style={{ fontSize:13, fontWeight:'600', color:C.muted, marginBottom:6 }}>Mot de passe</Text>
          <TextInput value={pwd} onChangeText={setPwd} placeholder="••••••••"
            placeholderTextColor={C.muted} secureTextEntry
            style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:13,
              fontSize:14, backgroundColor:C.card, color:C.text, marginBottom:20 }} />

          <TouchableOpacity onPress={mode === 'login' ? handle : handleRegister} disabled={loading}
            style={{ backgroundColor:C.primary, borderRadius:14, paddingVertical:14,
              alignItems:'center', opacity:loading?0.7:1 }}>
            {loading ? <ActivityIndicator color="#fff" />
              : <Text style={{ color:'#fff', fontWeight:'700', fontSize:16 }}>{mode === 'login' ? 'Se connecter' : "S'inscrire"}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(m => m === 'login' ? 'register' : 'login')} style={{ marginTop:14 }}>
            <Text style={{ color:C.primary, fontWeight:'700', fontSize:13, textAlign:'center' }}>
              {mode === 'login' ? "Pas de compte ? S'inscrire" : 'Deja un compte ? Se connecter'}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginTop:18 }}>
            <View style={{ flex:1, height:1, backgroundColor:C.border }} />
            <Text style={{ color:C.muted, fontSize:11, fontWeight:'600' }}>OU</Text>
            <View style={{ flex:1, height:1, backgroundColor:C.border }} />
          </View>

          <GoogleButton />

          <Text style={{ color:C.muted, fontSize:11, textAlign:'center', marginTop:24, marginBottom:12 }}>
            Comptes demo — mot de passe : pass123
          </Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
            {QUICK.map(q => (
              <TouchableOpacity key={q.label}
                onPress={() => { setEmail(q.email); setPwd('pass123'); setMode('login'); }}
                style={{ backgroundColor:C.primaryDark+'15', borderWidth:1.5, borderColor:C.primary+'40',
                  borderRadius:10, paddingVertical:7, paddingHorizontal:14 }}>
                <Text style={{ color:C.primary, fontWeight:'700', fontSize:12 }}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Role-based dashboards
// Mappe un vehicule API vers le format des cartes mobiles
const mapApiVehicle = (v) => {
  const m = (v.model || '').toLowerCase();
  let image = IMG.corolla;
  if (v.category === 'SUV') image = IMG.tucson;
  if (v.tier === 'gold' || v.tier === 'premium') image = IMG.merGLE;
  if (m.includes('corolla')) image = IMG.corolla;
  else if (m.includes('tucson')) image = IMG.tucson;
  else if (m.includes('sportage')) image = IMG.sportage;
  else if (m.includes('gle')) image = IMG.merGLE;
  else if (m.includes('serie')) image = IMG.bmw5;
  else if (m.includes('evoque')) image = IMG.evoque;
  else if (v.category === 'Van' || v.category === 'Minibus') image = IMG.sprinter;
  return {
    id: v.id, name: `${v.brand} ${v.model} ${v.year}`, cat: v.category, tier: v.tier || 'standard',
    plate: v.plate, image, rate: Number(v.computed_rate || v.daily_rate),
    kmIncluded: 300, kmRate: 120, rating: Number(v.rating) || 4.6, reviews: v.rating_count || 0,
    fuel: v.fuel, seats: v.seats, status: v.status, score: v.condition_score,
    driverAvailable: !!v.driver_available, api: true,
  };
};

function ClientDash({ user, logout }) {
  const [tab, setTab] = useState('home');
  const [search, setSearch] = useState('');
  const [selV, setSelV] = useState(null);
  const [tier, setTier] = useState('');
  const [vehicles, setVehicles] = useState(VEHICLES);
  const [bookings, setBookings] = useState(BOOKINGS);
  const [balance, setBalance] = useState(user.balance != null ? Number(user.balance) : null);
  const [showTopUp, setShowTopUp] = useState(false);
  const av = (user.firstName[0] || 'A') + (user.lastName[0] || 'L');

  const refresh = useCallback(async () => {
    try { const d = await api.vehicles(); const l = (d.results || d).map(mapApiVehicle); if (l.length) setVehicles(l); } catch (_) {}
    try {
      const d = await api.bookings();
      setBookings((d.results || d).map(b => ({
        id: `BK-${String(b.id).padStart(4,'0')}`, vehicle: b.vehicle_name, type: 'Location',
        amount: Number(b.subtotal), status: b.status, date: b.start_date, endDate: b.end_date,
        driver: b.driver_name || (b.driver_type==='internal' ? 'Attribution auto…' : b.driver_type==='owner' ? 'Chauffeur du proprio' : 'Sans chauffeur'),
        driverType: b.driver_type, escrow: b.escrow_status,
        rating: b.client_rating, rawId: b.id,
      })));
    } catch (_) {}
    try { const d = await api.wallet(); setBalance(Number(d.balance)); } catch (_) {}
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  const TABS = [
    { id:'home',     label:'Accueil',   icon:'home' },
    { id:'search',   label:'Catalogue', icon:'search' },
    { id:'bookings', label:'Courses',   icon:'receipt' },
    { id:'profile',  label:'Profil',    icon:'person' },
  ];
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.dark }}>
      <View style={{ flex:1 }}>
        {tab === 'home' && (
          <ScrollView stickyHeaderIndices={[0]}>
            <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14 }}>
              <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
              <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                <View style={{ flex:1, marginRight:10 }}>
                  <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Bienvenue,</Text>
                  <Text numberOfLines={1} style={{ color:'#fff', fontWeight:'900', fontSize:19 }}>{user.firstName} {user.lastName}</Text>
                </View>
                <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                  <View style={{ width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' }}>
                    <Text style={{ color:'#fff', fontWeight:'800', fontSize:13 }}>{av}</Text>
                  </View>
                  <TouchableOpacity onPress={logout} style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:10, padding:8 }}>
                    <Ionicons name="log-out-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
            <View style={{ padding:16 }}>
              <TouchableOpacity onPress={() => setTab('search')} activeOpacity={0.9} style={{ borderRadius:18, overflow:'hidden', marginBottom:16 }}>
                <Image source={{ uri:IMG.hero }} style={{ width:'100%', height:150 }} resizeMode="cover" />
                <View style={{ position:'absolute', top:0,left:0,right:0,bottom:0, backgroundColor:'rgba(0,0,0,0.42)' }} />
                <View style={{ position:'absolute', bottom:14, left:14, right:14 }}>
                  <Text numberOfLines={2} style={{ color:'#fff', fontWeight:'900', fontSize:17, marginBottom:8 }}>Reservez votre vehicule</Text>
                  <View style={{ backgroundColor:C.primary, borderRadius:10, paddingHorizontal:12, paddingVertical:7, flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start' }}>
                    <Ionicons name="car-sport" size={15} color="#fff" />
                    <Text style={{ color:'#fff', fontWeight:'700', fontSize:13 }}>Voir catalogue</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <SectionTitle title="Types de location" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14, marginHorizontal:-16, paddingHorizontal:16 }}>
                {[{l:'3 heures',i:'time-outline',c:C.info},{l:'8 heures',i:'sunny-outline',c:C.dark},{l:'24 heures',i:'calendar-outline',c:C.primary},{l:'Interurbain',i:'navigate-outline',c:'#F97316'}].map(t => (
                  <TouchableOpacity key={t.l} onPress={() => setTab('search')} style={{ backgroundColor:C.card, borderRadius:16, padding:12, marginRight:10, alignItems:'center', minWidth:85, shadowColor:'#000', shadowOpacity:0.05, elevation:2 }}>
                    <View style={{ width:36, height:36, borderRadius:12, backgroundColor:t.c+'18', alignItems:'center', justifyContent:'center', marginBottom:5 }}>
                      <Ionicons name={t.i} size={19} color={t.c} />
                    </View>
                    <Text style={{ color:C.text, fontWeight:'700', fontSize:11, textAlign:'center' }}>{t.l}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
                {[{l:'Reservations',v:user.bookings||3,c:C.info},{l:'Depense',v:`${fmtNum(user.spent||0)}`,c:C.primary},{l:'Note',v:'4.8/5',c:'#F59E0B'}].map(s => (
                  <View key={s.l} style={{ flex:1, backgroundColor:s.c+'15', borderRadius:14, padding:12, alignItems:'center' }}>
                    <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:15, fontWeight:'900', color:s.c }}>{s.v}</Text>
                    <Text style={{ fontSize:10, color:C.muted, marginTop:2, textAlign:'center' }}>{s.l}</Text>
                  </View>
                ))}
              </View>
              <SectionTitle title="Dernieres reservations" action="Voir tout" onAction={() => setTab('bookings')} />
              {bookings.slice(0,2).map(b => (
                <View key={b.id} style={{ backgroundColor:C.card, borderRadius:16, padding:14, marginBottom:10, flexDirection:'row', alignItems:'center', gap:10, shadowColor:'#000', shadowOpacity:0.05, elevation:2 }}>
                  <View style={{ width:42, height:42, borderRadius:13, backgroundColor:C.primary+'18', alignItems:'center', justifyContent:'center' }}>
                    <Ionicons name="car" size={20} color={C.primary} />
                  </View>
                  <View style={{ flex:1 }}>
                    <Text numberOfLines={1} style={{ fontWeight:'700', color:C.text, fontSize:13 }}>{b.vehicle}</Text>
                    <Text numberOfLines={1} style={{ color:C.muted, fontSize:11 }}>{b.type} · {b.date}</Text>
                  </View>
                  <View style={{ alignItems:'flex-end' }}>
                    <Text style={{ fontWeight:'800', color:C.text }}>{fmtNum(b.amount)}</Text>
                    <View style={{ backgroundColor:(b.status==='completed'?C.success:C.warning)+'20', borderRadius:20, paddingHorizontal:8, paddingVertical:2, marginTop:3 }}>
                      <Text style={{ color:b.status==='completed'?C.success:C.warning, fontSize:10, fontWeight:'700' }}>{b.status==='completed'?'Termine':'Attente'}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        {tab === 'search' && (
          <View style={{ flex:1 }}>
            <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14, paddingBottom:14 }}>
              <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
              <Text style={{ color:'#fff', fontWeight:'900', fontSize:18, marginBottom:10 }}>Catalogue vehicules</Text>
              <View style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:12, flexDirection:'row', alignItems:'center', paddingHorizontal:12 }}>
                <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
                <TextInput value={search} onChangeText={setSearch} placeholder="Marque, modele..." placeholderTextColor="rgba(255,255,255,0.6)" style={{ flex:1, paddingVertical:10, paddingLeft:8, color:'#fff', fontSize:14 }} />
              </View>
            </LinearGradient>
            <View style={{ paddingHorizontal:16, paddingTop:12, paddingBottom:4 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[{id:'',label:'Toutes'},{id:'basic',label:'Basic'},{id:'standard',label:'Standard'},{id:'premium',label:'Premium'},{id:'gold',label:'Gold'}].map(t => (
                  <TouchableOpacity key={t.id} onPress={() => setTier(t.id)}
                    style={{ backgroundColor: tier===t.id ? C.primary : C.card, borderRadius:20,
                      paddingHorizontal:14, paddingVertical:7, marginRight:8, borderWidth:1, borderColor: tier===t.id ? C.primary : C.border }}>
                    <Text style={{ color: tier===t.id ? '#fff' : C.text, fontWeight:'700', fontSize:12 }}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <ScrollView style={{ padding:16, paddingTop:6 }}
              refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}>
              <Text style={{ color:C.muted, fontSize:11, marginBottom:10 }}>{vehicles.filter(v=>(!search||v.name.toLowerCase().includes(search.toLowerCase()))&&(!tier||v.tier===tier)).length} vehicule(s) — chauffeur certifie inclus</Text>
              {vehicles.filter(v => (!search || v.name.toLowerCase().includes(search.toLowerCase())) && (!tier || v.tier === tier)).map(v => <VehicleCard key={v.id} v={v} onPress={() => setSelV(v)} />)}
              <View style={{ height:20 }} />
            </ScrollView>
          </View>
        )}
        {tab === 'bookings' && (
          <View style={{ flex:1 }}>
            <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14, paddingBottom:20 }}>
              <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
              <Text style={{ color:'#fff', fontWeight:'900', fontSize:18 }}>Mes reservations</Text>
            </LinearGradient>
            <ScrollView style={{ padding:16 }}
              refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}>
              {bookings.length === 0 && (
                <Text style={{ color:C.muted, textAlign:'center', marginTop:40 }}>Aucune reservation pour le moment.</Text>
              )}
              {bookings.map(b => {
                const B_STATUS = {
                  pending:   { l:'Attente paiement', c:C.warning },
                  confirmed: { l:'Confirmee',        c:C.info },
                  active:    { l:'En cours',         c:'#7C3AED' },
                  completed: { l:'Termine',          c:C.success },
                  cancelled: { l:'Annulee',          c:C.error },
                  disputed:  { l:'Litige en cours',  c:C.error },
                };
                const st = B_STATUS[b.status] || B_STATUS.pending;
                const reportProblem = () => {
                  Alert.alert('Signaler un probleme', 'La caution du proprietaire sera gelee et un admin AutoLink arbitrera votre dossier.', [
                    { text:'Annuler', style:'cancel' },
                    { text:'Panne mecanique', onPress:() => api.dispute(b.rawId, 'Panne mecanique').then(refresh).catch(()=>Alert.alert('Erreur','API injoignable')) },
                    { text:'Vehicule non conforme', onPress:() => api.dispute(b.rawId, 'Vehicule non conforme').then(refresh).catch(()=>Alert.alert('Erreur','API injoignable')) },
                    { text:'Autre probleme', style:'destructive', onPress:() => api.dispute(b.rawId, 'Autre probleme signale par le client').then(refresh).catch(()=>Alert.alert('Erreur','API injoignable')) },
                  ]);
                };
                const cancelBooking = () => {
                  Alert.alert('Annuler la reservation', 'Le paiement sera integralement rembourse sur votre solde AutoLink.', [
                    { text:'Non', style:'cancel' },
                    { text:'Oui, annuler', style:'destructive', onPress:() => api.setStatus(b.rawId, 'cancelled').then(refresh).catch(()=>Alert.alert('Erreur','Annulation impossible')) },
                  ]);
                };
                return (
                <View key={b.id} style={{ backgroundColor:C.card, borderRadius:16, padding:14, marginBottom:10, shadowColor:'#000', shadowOpacity:0.05, elevation:2 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 }}>
                    <View style={{ width:42, height:42, borderRadius:13, backgroundColor:C.primary+'15', alignItems:'center', justifyContent:'center' }}>
                      <Ionicons name="car-sport" size={20} color={C.primary} />
                    </View>
                    <View style={{ flex:1 }}>
                      <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text }}>{b.vehicle}</Text>
                      <Text numberOfLines={1} style={{ color:C.muted, fontSize:11 }}>{b.id} · {b.type}</Text>
                    </View>
                    <View style={{ backgroundColor:st.c+'20', borderRadius:20, paddingHorizontal:10, paddingVertical:3 }}>
                      <Text style={{ color:st.c, fontSize:11, fontWeight:'700' }}>{st.l}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', borderTopWidth:1, borderTopColor:C.border, paddingTop:10 }}>
                    <View style={{ flex:1, marginRight:8 }}><Text style={{ color:C.muted, fontSize:10 }}>Chauffeur</Text><Text numberOfLines={1} style={{ color:C.text, fontSize:12, fontWeight:'600' }}>{b.driver}</Text></View>
                    <View><Text style={{ color:C.muted, fontSize:10 }}>Dates</Text><Text style={{ color:C.text, fontSize:12, fontWeight:'600' }}>{b.date} → {b.endDate || '—'}</Text></View>
                    <View style={{ alignItems:'flex-end' }}><Text style={{ color:C.muted, fontSize:10 }}>Montant</Text><Text style={{ color:C.primary, fontSize:15, fontWeight:'900' }}>{fmtNum(b.amount)}</Text></View>
                  </View>
                  {b.escrow === 'held' && <Text style={{ color:C.muted, fontSize:10, marginTop:6 }}>Paiement securise — caution bloquee jusqu'a la fin</Text>}
                  {b.escrow === 'disputed' && <Text style={{ color:C.error, fontSize:10, marginTop:6 }}>Caution gelee — arbitrage AutoLink en cours</Text>}
                  <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
                    {['pending','confirmed'].includes(b.status) && (
                      <TouchableOpacity onPress={cancelBooking} style={{ flex:1, backgroundColor:C.error+'15', borderRadius:10, paddingVertical:8, alignItems:'center' }}>
                        <Text style={{ color:C.error, fontSize:11, fontWeight:'700' }}>Annuler (rembourse)</Text>
                      </TouchableOpacity>
                    )}
                    {['confirmed','active'].includes(b.status) && (
                      <TouchableOpacity onPress={reportProblem} style={{ flex:1, backgroundColor:C.warning+'20', borderRadius:10, paddingVertical:8, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:4 }}>
                        <Ionicons name="warning" size={13} color="#B45309" />
                        <Text style={{ color:'#B45309', fontSize:11, fontWeight:'700' }}>Signaler un probleme</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {b.rating ? <View style={{ marginTop:8, flexDirection:'row', gap:2 }}>{[1,2,3,4,5].map(i=><Ionicons key={i} name={i<=b.rating?'star':'star-outline'} size={13} color="#FBBF24" />)}</View> : null}
                </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        {tab === 'profile' && (
          <ScrollView>
            <LinearGradient colors={[C.dark, C.primary]} style={{ padding:30, paddingTop:20, alignItems:'center' }}>
              <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
              <View style={{ width:76, height:76, borderRadius:38, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                <Text style={{ color:'#fff', fontWeight:'900', fontSize:24 }}>{av}</Text>
              </View>
              <Text numberOfLines={1} style={{ color:'#fff', fontWeight:'900', fontSize:19 }}>{user.firstName} {user.lastName}</Text>
              <Text style={{ color:'rgba(255,255,255,0.75)', marginTop:4 }}>Client AutoLink</Text>
            </LinearGradient>
            <View style={{ padding:16 }}>
              {/* Solde AutoLink */}
              <View style={{ backgroundColor:C.primaryDark, borderRadius:18, padding:18, marginBottom:14 }}>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                    <View style={{ width:44, height:44, borderRadius:14, backgroundColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' }}>
                      <Ionicons name="wallet" size={22} color="#fff" />
                    </View>
                    <View>
                      <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:11 }}>Mon solde AutoLink</Text>
                      <Text style={{ color:'#fff', fontSize:24, fontWeight:'900' }}>
                        {balance === null ? '—' : `${balance.toLocaleString()} FCFA`}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowTopUp(true)}
                    style={{ backgroundColor:'#fff', borderRadius:12, paddingHorizontal:14, paddingVertical:9, flexDirection:'row', alignItems:'center', gap:5 }}>
                    <Ionicons name="add" size={16} color={C.primaryDark} />
                    <Text style={{ color:C.primaryDark, fontWeight:'800', fontSize:13 }}>Recharger</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color:'rgba(255,255,255,0.6)', fontSize:10, marginTop:10 }}>
                  MTN MoMo · Orange Money · SenBid · PayBid · PayPal · Stripe
                </Text>
              </View>
              {[['Telephone',user.phone],['Ville','Douala, Cameroun'],['Email',user.email]].map(([k,v]) => (
                <View key={k} style={{ backgroundColor:C.card, borderRadius:14, padding:14, marginBottom:10, flexDirection:'row', justifyContent:'space-between', shadowColor:'#000', shadowOpacity:0.04, elevation:2 }}>
                  <Text style={{ color:C.muted, flexShrink:0, marginRight:12 }}>{k}</Text>
                  <Text numberOfLines={1} style={{ color:C.text, fontWeight:'600', flexShrink:1, textAlign:'right' }}>{v}</Text>
                </View>
              ))}
              <TouchableOpacity onPress={logout} style={{ borderWidth:2, borderColor:C.error, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:8, flexDirection:'row', justifyContent:'center', gap:8 }}>
                <Ionicons name="log-out-outline" size={18} color={C.error} />
                <Text style={{ color:C.error, fontWeight:'700', fontSize:15 }}>Se deconnecter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
      <TabBar tabs={TABS} active={tab} onPress={setTab} />
      {selV && <BookingModal vehicle={selV} onClose={() => setSelV(null)} onDone={refresh} />}
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} onDone={(b) => setBalance(Number(b))} />}
    </SafeAreaView>
  );
}

// ─── TOPUP MODAL — recharge solde ───────────────────────────────────────────
function TopUpModal({ onClose, onDone }) {
  const [amount, setAmount] = useState('25000');
  const [method, setMethod] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const submit = async () => {
    const amt = parseInt(amount, 10);
    if (!amt || amt < 500) { Alert.alert('Montant', 'Minimum 500 FCFA.'); return; }
    setBusy(true);
    try {
      const d = await api.topup(amt, method, phone);
      setDone(d);
      onDone?.(d.balance);
    } catch {
      Alert.alert('Erreur', 'API injoignable — recharge impossible hors ligne.');
    }
    setBusy(false);
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' }}>
        <View style={{ backgroundColor:C.bg, borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, maxHeight:SH*0.85 }}>
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <Text style={{ fontWeight:'800', fontSize:16, color:C.text }}>Recharger mon solde</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={26} color={C.muted} /></TouchableOpacity>
          </View>
          {done ? (
            <View style={{ alignItems:'center', paddingVertical:16 }}>
              <Ionicons name="checkmark-circle" size={56} color={C.success} />
              <Text style={{ fontWeight:'800', color:C.text, fontSize:17, marginTop:10 }}>Recharge effectuee</Text>
              <Text style={{ color:C.muted, fontSize:12, marginTop:4 }}>Ref: {done.transaction?.reference}</Text>
              <Text style={{ color:C.primary, fontWeight:'900', fontSize:22, marginTop:8 }}>{Number(done.balance).toLocaleString()} FCFA</Text>
              <TouchableOpacity onPress={onClose} style={{ backgroundColor:C.primary, borderRadius:12, paddingVertical:12, paddingHorizontal:40, marginTop:16 }}>
                <Text style={{ color:'#fff', fontWeight:'700' }}>Fermer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize:12, fontWeight:'700', color:C.muted, marginBottom:6 }}>Montant (FCFA)</Text>
              <TextInput value={amount} onChangeText={setAmount} keyboardType="number-pad"
                style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:12, backgroundColor:C.card, color:C.text, fontSize:16, fontWeight:'700' }} />
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:10, marginBottom:14 }}>
                {[5000, 10000, 25000, 50000, 100000].map(a => (
                  <TouchableOpacity key={a} onPress={() => setAmount(String(a))}
                    style={{ borderRadius:20, paddingHorizontal:12, paddingVertical:7, borderWidth:1.5,
                      borderColor: amount === String(a) ? C.primary : C.border,
                      backgroundColor: amount === String(a) ? C.primary : C.card }}>
                    <Text style={{ color: amount === String(a) ? '#fff' : C.text, fontWeight:'700', fontSize:12 }}>{a.toLocaleString()} F</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ fontSize:12, fontWeight:'700', color:C.muted, marginBottom:8 }}>Moyen de paiement</Text>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:14 }}>
                {TOPUP_METHODS.map(m => (
                  <TouchableOpacity key={m.id} onPress={() => setMethod(m.id)}
                    style={{ width:'31%', borderWidth:2, borderRadius:12, padding:10, alignItems:'center',
                      borderColor: method === m.id ? m.color : C.border, backgroundColor: method === m.id ? m.color+'15' : C.card }}>
                    <View style={{ width:30, height:30, borderRadius:8, backgroundColor:m.color, alignItems:'center', justifyContent:'center', marginBottom:5 }}>
                      <Ionicons name={m.icon} size={15} color="#fff" />
                    </View>
                    <Text style={{ fontSize:10, fontWeight:'700', color:C.text, textAlign:'center' }}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {['mtn','orange','senbid','paybid'].includes(method) && (
                <>
                  <Text style={{ fontSize:12, fontWeight:'700', color:C.muted, marginBottom:6 }}>Numero de telephone</Text>
                  <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+237 6XX XX XX XX"
                    placeholderTextColor={C.muted}
                    style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:12, backgroundColor:C.card, color:C.text, marginBottom:14 }} />
                </>
              )}
              <TouchableOpacity onPress={submit} disabled={busy}
                style={{ backgroundColor:C.primary, borderRadius:14, paddingVertical:14, alignItems:'center', marginBottom:20, flexDirection:'row', justifyContent:'center', gap:8 }}>
                {busy ? <ActivityIndicator color="#fff" /> : <Ionicons name="wallet" size={18} color="#fff" />}
                <Text style={{ color:'#fff', fontWeight:'800', fontSize:15 }}>{busy ? 'Traitement...' : `Recharger ${parseInt(amount || '0', 10).toLocaleString()} FCFA`}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── ROLE SCREENS (Owner/Driver/Admin/Controller stubs) ──────────────────────
function OwnerDash({ user, logout }) {
  const av = user.firstName[0] + user.lastName[0];
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [balance, setBalance] = useState(null);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [v, b, n, w] = await Promise.all([api.vehicles(), api.bookings(), api.notifs(), api.wallet()]);
      setVehicles((v.results || v).map(mapApiVehicle));
      setBookings(b.results || b);
      setNotifs(n.results || []);
      setBalance(Number(w.balance));
      setOnline(true);
    } catch { setOnline(false); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const markBack = (id) => {
    Alert.alert('Vehicule recupere', 'Confirmer la fin de cette location ? La caution vous sera versee.', [
      { text:'Non', style:'cancel' },
      { text:'Oui, terminer', onPress: async () => {
        setBusy(id);
        try { await api.setStatus(id, 'completed'); await load(); } catch { Alert.alert('Erreur','Action impossible'); }
        setBusy(null);
      }},
    ]);
  };

  const V_ST = {
    pending:{l:'En verification',c:C.warning}, approved:{l:'Disponible',c:C.success},
    rented:{l:'En location',c:C.info}, maintenance:{l:'Maintenance',c:'#F97316'}, suspended:{l:'Suspendu',c:C.error},
  };
  const active = bookings.filter(b => ['confirmed','active'].includes(b.status));
  const earned = bookings.filter(b => b.status==='completed').reduce((s,b) => s + Number(b.owner_amount||0), 0);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.dark }}>
      <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <View style={{ flex:1, marginRight:10 }}>
            <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Proprietaire</Text>
            <Text numberOfLines={1} style={{ color:'#fff', fontWeight:'900', fontSize:19 }}>{user.firstName} {user.lastName}</Text>
          </View>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <View style={{ width:7, height:7, borderRadius:4, backgroundColor: online ? '#4ADE80' : '#F87171' }} />
            <TouchableOpacity onPress={logout} style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:10, padding:8 }}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      <ScrollView style={{ padding:16 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
        <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
          {[{l:'Vehicules',v:vehicles.length,c:C.info},{l:'En location',v:active.length,c:'#7C3AED'},{l:'Solde',v:balance===null?'—':fmtNum(balance),c:C.success}].map(s=>(
            <View key={s.l} style={{ flex:1, backgroundColor:s.c+'15', borderRadius:14, padding:12, alignItems:'center' }}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:15, fontWeight:'900', color:s.c }}>{s.v}</Text>
              <Text style={{ fontSize:10, color:C.muted, marginTop:2, textAlign:'center' }}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor:'#F0FDF4', borderRadius:14, padding:12, marginBottom:14, flexDirection:'row', alignItems:'center', gap:8 }}>
          <Ionicons name="shield-checkmark" size={20} color={C.success} />
          <Text style={{ color:'#166534', fontSize:11, flex:1 }}>Votre part : 50% — bloquee en caution pendant la location, versee automatiquement au retour du vehicule.</Text>
        </View>
        {notifs.length > 0 && (
          <>
            <SectionTitle title="Notifications" />
            {notifs.slice(0,4).map(n => (
              <View key={n.id} style={{ backgroundColor:n.is_read?C.card:'#EFF6FF', borderRadius:14, padding:12, marginBottom:8, borderWidth:n.is_read?0:1, borderColor:'#BFDBFE' }}>
                <Text style={{ fontWeight:'700', color:C.text, fontSize:12 }}>{n.title}</Text>
                <Text style={{ color:C.muted, fontSize:11, marginTop:2 }}>{n.message}</Text>
              </View>
            ))}
          </>
        )}
        <SectionTitle title="Locations en cours" />
        {active.length === 0 && <Text style={{ color:C.muted, fontSize:12, marginBottom:12 }}>Aucune location en cours.</Text>}
        {active.map(b => (
          <View key={b.id} style={{ backgroundColor:C.card, borderRadius:14, padding:12, marginBottom:10 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text, fontSize:13, flex:1, marginRight:8 }}>{b.vehicle_name}</Text>
              <Badge label={b.status==='confirmed'?'Confirmee':'En cours'} color={b.status==='confirmed'?C.info:'#7C3AED'} />
            </View>
            <Text style={{ color:C.muted, fontSize:11, marginTop:4 }}>
              {b.client_name} · {b.start_date} → {b.end_date}
              {b.driver_type==='owner' ? ' · Votre chauffeur requis' : b.driver_type==='internal' ? ' · Chauffeur AutoLink' : ''}
            </Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
              <Text style={{ color:C.muted, fontSize:10 }}>Caution : {Number(b.owner_amount||0).toLocaleString()} F ({b.escrow_status==='held'?'bloquee':'versee'})</Text>
              <TouchableOpacity onPress={()=>markBack(b.id)} disabled={busy===b.id}
                style={{ backgroundColor:C.success+'18', borderRadius:8, paddingHorizontal:10, paddingVertical:6 }}>
                <Text style={{ color:C.success, fontSize:11, fontWeight:'700' }}>{busy===b.id?'…':'Vehicule recupere'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <SectionTitle title="Mes vehicules" />
        {vehicles.length === 0 && <Text style={{ color:C.muted, fontSize:12 }}>{online?'Aucun vehicule enregistre.':'API injoignable.'}</Text>}
        {vehicles.map(v => {
          const st = V_ST[v.status] || V_ST.pending;
          return (
            <View key={v.id} style={{ backgroundColor:C.card, borderRadius:16, overflow:'hidden', marginBottom:12, shadowColor:'#000', shadowOpacity:0.06, elevation:3 }}>
              <Image source={{ uri:v.image }} style={{ width:'100%', height:130 }} resizeMode="cover" />
              <View style={{ padding:14, flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                <View style={{ flex:1, marginRight:10 }}>
                  <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text, fontSize:14 }}>{v.name}</Text>
                  <Text numberOfLines={1} style={{ color:C.muted, fontSize:11, fontFamily:Platform.OS==='ios'?'Courier':'monospace' }}>{v.plate}</Text>
                </View>
                <View style={{ alignItems:'flex-end' }}>
                  <Badge label={st.l} color={st.c} />
                  <Text style={{ fontWeight:'900', color:C.primary, fontSize:15, marginTop:4 }}>{fmtNum(v.rate)}/j</Text>
                </View>
              </View>
            </View>
          );
        })}
        <TouchableOpacity onPress={logout} style={{ borderWidth:2, borderColor:C.error, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:8, flexDirection:'row', justifyContent:'center', gap:8 }}>
          <Ionicons name="log-out-outline" size={18} color={C.error} />
          <Text style={{ color:C.error, fontWeight:'700', fontSize:15 }}>Se deconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DriverDash({ user, logout }) {
  const [bookings, setBookings] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [online, setOnline] = useState(true);
  const [apiOk, setApiOk] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [b, n] = await Promise.all([api.bookings(), api.notifs()]);
      setBookings(b.results || b);
      setNotifs(n.results || []);
      setApiOk(true);
    } catch { setApiOk(false); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (id, status) => {
    setBusy(id);
    try { await api.setStatus(id, status); await load(); } catch { Alert.alert('Erreur','Action impossible'); }
    setBusy(null);
  };

  const current = bookings.filter(b => ['confirmed','active'].includes(b.status));
  const past = bookings.filter(b => ['completed','cancelled'].includes(b.status));

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.dark }}>
      <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <View style={{ flex:1, marginRight:10 }}>
            <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Chauffeur interne AutoLink</Text>
            <Text numberOfLines={1} style={{ color:'#fff', fontWeight:'900', fontSize:19 }}>{user.firstName} {user.lastName}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:10, padding:8 }}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop:14, backgroundColor:apiOk?C.success+'30':'rgba(255,255,255,0.1)', borderRadius:12, padding:12, flexDirection:'row', alignItems:'center', gap:8 }}>
          <View style={{ width:10, height:10, borderRadius:5, backgroundColor:apiOk?C.success:'#94A3B8' }} />
          <Text style={{ color:'#fff', fontWeight:'600', fontSize:13, flex:1 }}>{apiOk?'Courses assignees automatiquement par le systeme':'API injoignable'}</Text>
        </View>
      </LinearGradient>
      <ScrollView style={{ padding:16 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
        <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
          {[{l:'A venir',v:current.filter(b=>b.status==='confirmed').length,c:C.info},{l:'En cours',v:current.filter(b=>b.status==='active').length,c:C.success},{l:'Terminees',v:past.length,c:C.primary}].map(s=>(
            <View key={s.l} style={{ flex:1, backgroundColor:s.c+'15', borderRadius:14, padding:12, alignItems:'center' }}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:15, fontWeight:'900', color:s.c }}>{s.v}</Text>
              <Text style={{ fontSize:10, color:C.muted, marginTop:2, textAlign:'center' }}>{s.l}</Text>
            </View>
          ))}
        </View>
        {notifs.length > 0 && (
          <>
            <SectionTitle title="Notifications" />
            {notifs.slice(0,3).map(n => (
              <View key={n.id} style={{ backgroundColor:n.is_read?C.card:'#EFF6FF', borderRadius:14, padding:12, marginBottom:8 }}>
                <Text style={{ fontWeight:'700', color:C.text, fontSize:12 }}>{n.title}</Text>
                <Text style={{ color:C.muted, fontSize:11, marginTop:2 }}>{n.message}</Text>
              </View>
            ))}
          </>
        )}
        <SectionTitle title="Mes courses" />
        {current.length === 0 && <Text style={{ color:C.muted, fontSize:12, marginBottom:12 }}>Aucune course assignee pour le moment.</Text>}
        {current.map(b => (
          <View key={b.id} style={{ backgroundColor:C.card, borderRadius:16, padding:14, marginBottom:10, shadowColor:'#000', shadowOpacity:0.05, elevation:2 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text, fontSize:13, flex:1, marginRight:8 }}>
                {b.client_name} — {b.vehicle_name}
              </Text>
              <Badge label={b.status==='confirmed'?'A venir':'En cours'} color={b.status==='confirmed'?C.info:C.success} />
            </View>
            <Text style={{ color:C.muted, fontSize:11 }}>{b.start_date} → {b.end_date}</Text>
            {b.pickup_address ? <Text style={{ color:C.muted, fontSize:11, marginTop:2 }}>Depart : {b.pickup_address}</Text> : null}
            <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
              {b.status === 'confirmed' && (
                <TouchableOpacity onPress={()=>setStatus(b.id,'active')} disabled={busy===b.id}
                  style={{ flex:1, backgroundColor:C.info, borderRadius:10, paddingVertical:9, alignItems:'center' }}>
                  <Text style={{ color:'#fff', fontSize:12, fontWeight:'700' }}>Demarrer la course</Text>
                </TouchableOpacity>
              )}
              {b.status === 'active' && (
                <TouchableOpacity onPress={()=>setStatus(b.id,'completed')} disabled={busy===b.id}
                  style={{ flex:1, backgroundColor:C.success, borderRadius:10, paddingVertical:9, alignItems:'center' }}>
                  <Text style={{ color:'#fff', fontSize:12, fontWeight:'700' }}>{busy===b.id?'…':'Course terminee — liberer la voiture'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        <SectionTitle title="Historique" />
        {past.slice(0,10).map(b => (
          <View key={b.id} style={{ backgroundColor:C.card, borderRadius:14, padding:12, marginBottom:8, flexDirection:'row', alignItems:'center', gap:10 }}>
            <Ionicons name="checkmark-circle" size={20} color={C.success} />
            <View style={{ flex:1 }}>
              <Text numberOfLines={1} style={{ fontWeight:'700', color:C.text, fontSize:12 }}>{b.client_name} — {b.vehicle_name}</Text>
              <Text style={{ color:C.muted, fontSize:10 }}>{b.start_date} → {b.end_date}</Text>
            </View>
          </View>
        ))}
        <SectionTitle title="Dernieres courses" />
        {TRIPS.map(t => (
          <View key={t.id} style={{ backgroundColor:C.card, borderRadius:16, padding:14, marginBottom:10, flexDirection:'row', alignItems:'center', gap:10, shadowColor:'#000', shadowOpacity:0.05, elevation:2 }}>
            <View style={{ width:44, height:44, borderRadius:22, overflow:'hidden', backgroundColor:C.border }}>
              <Image source={{ uri:t.photo }} style={{ width:44, height:44 }} resizeMode="cover" />
            </View>
            <View style={{ flex:1 }}>
              <Text numberOfLines={1} style={{ fontWeight:'700', color:C.text }}>{t.client}</Text>
              <Text numberOfLines={1} style={{ color:C.muted, fontSize:11 }}>{t.from} → {t.to} · {t.km}</Text>
            </View>
            <View style={{ alignItems:'flex-end' }}>
              <Text style={{ fontWeight:'900', color:C.primary }}>{t.amount.toLocaleString()} F</Text>
              <Stars rating={t.rating} size={12} />
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={logout} style={{ borderWidth:2, borderColor:C.error, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:8, flexDirection:'row', justifyContent:'center', gap:8 }}>
          <Ionicons name="log-out-outline" size={18} color={C.error} />
          <Text style={{ color:C.error, fontWeight:'700', fontSize:15 }}>Se deconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function AdminDash({ user, logout }) {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState('live'); // live | comptes

  const load = useCallback(async () => {
    try {
      const [s, b, u] = await Promise.all([api.stats(), api.bookings(), api.users()]);
      setStats(s);
      setBookings(b.results || b);
      setUsers(u.results || u);
      setOnline(true);
    } catch { setOnline(false); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000); // synchro quasi-instantanee
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (id, status) => {
    try { await api.setStatus(id, status); await load(); } catch (_) {}
  };
  const toggleUser = async (u) => {
    try { await api.setUser(u.id, { is_active: !u.is_active }); await load(); } catch (_) {}
  };
  const setRole = async (u, role) => {
    try { await api.setUser(u.id, { role }); await load(); } catch (_) {}
  };

  const disputed = bookings.filter(b => b.status === 'disputed');
  const pendingB = bookings.filter(b => b.status === 'pending');
  const ROLE_LABEL = { CLIENT:'Client', OWNER:'Gestionnaire', DRIVER:'Chauffeur', ADMIN:'Admin', CONTROLLER:'Controleur' };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.dark }}>
      <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14, paddingBottom:14 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <View style={{ flex:1, marginRight:10 }}>
            <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Administration</Text>
            <Text numberOfLines={1} style={{ color:'#fff', fontWeight:'900', fontSize:19 }}>AutoLink Pro</Text>
          </View>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(255,255,255,0.15)', borderRadius:20, paddingHorizontal:10, paddingVertical:5 }}>
              <View style={{ width:7, height:7, borderRadius:4, backgroundColor: online ? '#4ADE80' : '#F87171' }} />
              <Text style={{ color:'#fff', fontSize:10, fontWeight:'700' }}>{online ? 'En ligne' : 'Hors ligne'}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:10, padding:8 }}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={{ flexDirection:'row', backgroundColor:C.card, borderBottomWidth:1, borderBottomColor:C.border }}>
        {[['live','En direct'],['comptes','Comptes & roles']].map(([id,l]) => (
          <TouchableOpacity key={id} onPress={() => setTab(id)}
            style={{ flex:1, paddingVertical:12, alignItems:'center', borderBottomWidth:2, borderBottomColor: tab===id ? C.primary : 'transparent' }}>
            <Text style={{ color: tab===id ? C.primary : C.muted, fontWeight:'700', fontSize:13 }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ padding:16 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
        {tab === 'live' && (
          <>
            <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
              {[{l:'Utilisateurs',v:stats?stats.users:'—',c:C.info},{l:'Vehicules',v:stats?stats.vehicles:'—',c:C.primary},{l:'Reservations',v:stats?stats.bookings_total:'—',c:'#7C3AED'}].map(s=>(
                <View key={s.l} style={{ flex:1, backgroundColor:s.c+'15', borderRadius:14, padding:12, alignItems:'center' }}>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:15, fontWeight:'900', color:s.c }}>{s.v}</Text>
                  <Text style={{ fontSize:10, color:C.muted, marginTop:2, textAlign:'center' }}>{s.l}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection:'row', gap:8, marginBottom:14 }}>
              {[{l:'En attente',v:stats?stats.bookings_pending:'—',c:C.warning},{l:'En cours',v:stats?stats.bookings_active:'—',c:C.info},{l:'Commission',v:stats?fmtNum(stats.commission_total):'—',c:C.success}].map(s=>(
                <View key={s.l} style={{ flex:1, backgroundColor:s.c+'15', borderRadius:14, padding:12, alignItems:'center' }}>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:15, fontWeight:'900', color:s.c }}>{s.v}</Text>
                  <Text style={{ fontSize:10, color:C.muted, marginTop:2, textAlign:'center' }}>{s.l}</Text>
                </View>
              ))}
            </View>
            {disputed.length > 0 && (
              <>
                <View style={{ backgroundColor:'#FEE2E2', borderRadius:14, padding:12, marginBottom:10, flexDirection:'row', alignItems:'center', gap:8 }}>
                  <Ionicons name="warning" size={20} color={C.error} />
                  <Text style={{ color:'#991B1B', fontWeight:'600', fontSize:12, flex:1 }}>{disputed.length} litige(s) a arbitrer — caution gelee</Text>
                </View>
                {disputed.map(b => (
                  <View key={b.id} style={{ backgroundColor:'#FFF5F5', borderRadius:14, padding:12, marginBottom:10, borderWidth:1, borderColor:'#FECACA' }}>
                    <Text style={{ fontWeight:'800', color:C.text, fontSize:13 }}>BK-{String(b.id).padStart(4,'0')} — {b.client_name}</Text>
                    <Text style={{ color:C.muted, fontSize:11 }}>{b.vehicle_name} · {Number(b.subtotal).toLocaleString()} F bloques</Text>
                    {b.dispute_reason ? <Text style={{ color:C.error, fontSize:11, fontStyle:'italic', marginTop:3 }}>"{b.dispute_reason}"</Text> : null}
                    <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
                      <TouchableOpacity onPress={() => api.resolve(b.id,'refund').then(load).catch(()=>{})}
                        style={{ flex:1, backgroundColor:C.error, borderRadius:8, paddingVertical:8, alignItems:'center' }}>
                        <Text style={{ color:'#fff', fontSize:11, fontWeight:'700' }}>Rembourser client</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => api.resolve(b.id,'release').then(load).catch(()=>{})}
                        style={{ flex:1, backgroundColor:C.success, borderRadius:8, paddingVertical:8, alignItems:'center' }}>
                        <Text style={{ color:'#fff', fontSize:11, fontWeight:'700' }}>Payer proprio</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
            <SectionTitle title="Reservations en direct" />
            <Text style={{ color:C.muted, fontSize:10, marginBottom:10 }}>Confirmees automatiquement apres paiement — supervision uniquement.</Text>
            {bookings.length === 0 && <Text style={{ color:C.muted, textAlign:'center', marginTop:20 }}>{online ? 'Aucune reservation.' : 'API injoignable.'}</Text>}
            {bookings.slice(0, 30).map(b => (
              <View key={b.id} style={{ backgroundColor:C.card, borderRadius:14, padding:12, marginBottom:10, shadowColor:'#000', shadowOpacity:0.04, elevation:2 }}>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text, fontSize:13, flex:1, marginRight:8 }}>
                    BK-{String(b.id).padStart(4,'0')} — {b.client_name || 'Client'}
                  </Text>
                  <Badge label={STATUS_LABEL[b.status] || b.status} color={STATUS_COLOR[b.status] || C.muted} />
                </View>
                <Text numberOfLines={1} style={{ color:C.muted, fontSize:11 }}>
                  {b.vehicle_name} · {b.start_date} → {b.end_date}{b.driver_name ? ` · Chauffeur : ${b.driver_name}` : ''}
                </Text>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
                  <Text style={{ fontWeight:'900', color:C.primary, fontSize:14 }}>{Number(b.subtotal).toLocaleString()} F</Text>
                  {b.escrow_status ? (
                    <Text style={{ color:C.muted, fontSize:9 }}>
                      {b.escrow_status==='held'?'Caution bloquee':b.escrow_status==='released'?'Proprio paye':b.escrow_status==='refunded'?'Client rembourse':'Caution gelee'}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'comptes' && (
          <>
            <SectionTitle title="Gestion des comptes" />
            <Text style={{ color:C.muted, fontSize:11, marginBottom:12 }}>
              Activez/suspendez les comptes et attribuez les roles chauffeur ou controleur.
            </Text>
            {users.map(u => (
              <View key={u.id} style={{ backgroundColor:C.card, borderRadius:14, padding:12, marginBottom:10, shadowColor:'#000', shadowOpacity:0.04, elevation:2 }}>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                  <View style={{ flex:1, marginRight:8 }}>
                    <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text, fontSize:13 }}>{u.first_name} {u.last_name}</Text>
                    <Text numberOfLines={1} style={{ color:C.muted, fontSize:11 }}>{u.email}</Text>
                  </View>
                  <Badge label={ROLE_LABEL[u.role] || u.role} color={u.role==='ADMIN'?C.error:u.role==='DRIVER'?C.info:u.role==='CONTROLLER'?'#7C3AED':C.primary} />
                </View>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
                  <View style={{ flexDirection:'row', gap:6 }}>
                    {u.role !== 'ADMIN' && (
                      <>
                        <TouchableOpacity onPress={() => setRole(u, u.role === 'DRIVER' ? 'CLIENT' : 'DRIVER')}
                          style={{ backgroundColor:C.info+'18', borderRadius:8, paddingHorizontal:8, paddingVertical:5 }}>
                          <Text style={{ color:C.info, fontSize:10, fontWeight:'700' }}>{u.role === 'DRIVER' ? 'Retirer chauffeur' : 'Nommer chauffeur'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRole(u, u.role === 'CONTROLLER' ? 'CLIENT' : 'CONTROLLER')}
                          style={{ backgroundColor:'#7C3AED18', borderRadius:8, paddingHorizontal:8, paddingVertical:5 }}>
                          <Text style={{ color:'#7C3AED', fontSize:10, fontWeight:'700' }}>{u.role === 'CONTROLLER' ? 'Retirer controleur' : 'Nommer controleur'}</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => toggleUser(u)}
                    style={{ backgroundColor:(u.is_active ? C.success : C.error)+'18', borderRadius:8, paddingHorizontal:10, paddingVertical:5 }}>
                    <Text style={{ color:u.is_active ? C.success : C.error, fontSize:11, fontWeight:'700' }}>{u.is_active ? 'Actif' : 'Suspendu'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={{ height:20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ControllerDash({ user, logout }) {
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.dark }}>
      <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14, paddingBottom:20 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <View style={{ flex:1, marginRight:10 }}>
            <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Controleur</Text>
            <Text numberOfLines={1} style={{ color:'#fff', fontWeight:'900', fontSize:19 }}>{user.firstName} {user.lastName}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:10, padding:8 }}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView style={{ padding:16 }}>
        <View style={{ flexDirection:'row', gap:8, marginBottom:14 }}>
          {[{l:'Inspections',v:user.inspections||247,c:C.primary},{l:'Ce mois',v:'18',c:C.success},{l:'Litiges',v:'3',c:C.warning}].map(s=>(
            <View key={s.l} style={{ flex:1, backgroundColor:s.c+'15', borderRadius:14, padding:12, alignItems:'center' }}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:15, fontWeight:'900', color:s.c }}>{s.v}</Text>
              <Text style={{ fontSize:10, color:C.muted, marginTop:2, textAlign:'center' }}>{s.l}</Text>
            </View>
          ))}
        </View>
        <SectionTitle title="Dernieres inspections" />
        {INSPECTIONS.map(i => (
          <View key={i.id} style={{ backgroundColor:C.card, borderRadius:14, padding:14, marginBottom:10, shadowColor:'#000', shadowOpacity:0.04, elevation:2 }}>
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text, fontSize:14, flex:1, marginRight:10 }}>{i.vehicle}</Text>
              <View style={{ backgroundColor:(i.score>=90?C.success:C.warning)+'20', borderRadius:20, paddingHorizontal:10, paddingVertical:3 }}>
                <Text style={{ color:i.score>=90?C.success:C.warning, fontWeight:'700', fontSize:12 }}>{i.score}/100</Text>
              </View>
            </View>
            <Text style={{ color:C.muted, fontSize:11, fontFamily:Platform.OS==='ios'?'Courier':'monospace', marginBottom:4 }}>{i.plate}</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <Text numberOfLines={1} style={{ color:C.muted, fontSize:12, flex:1, marginRight:8 }}>{i.type} · {i.date}</Text>
              <Text numberOfLines={1} style={{ color:C.muted, fontSize:12 }}>{i.km.toLocaleString()} km · Carbu: {i.fuel}%</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={logout} style={{ borderWidth:2, borderColor:C.error, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:8, flexDirection:'row', justifyContent:'center', gap:8 }}>
          <Ionicons name="log-out-outline" size={18} color={C.error} />
          <Text style={{ color:C.error, fontWeight:'700', fontSize:15 }}>Se deconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── BOOKING MODAL ────────────────────────────────────────────────────────────
function BookingModal({ vehicle, onClose, onDone }) {
  const [step, setStep] = useState(1);
  const [rt, setRt] = useState(RENTAL_TYPES[2]);
  const [days, setDays] = useState(2);
  const [date, setDate] = useState('');
  const [pickup, setPickup] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [agentOk, setAgentOk] = useState(null);
  const [pay, setPay] = useState('wallet');
  const [phone, setPhone] = useState('');
  const [driverType, setDriverType] = useState('none');
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      // date JJ/MM/AAAA → AAAA-MM-JJ
      let start = date;
      const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m) start = `${m[3]}-${m[2]}-${m[1]}`;
      const end = new Date(start);
      end.setDate(end.getDate() + (rt.id === 'longhaul' ? days : 1));
      const res = await api.newBooking({
        vehicle: vehicle.id,
        start_date: start,
        end_date: end.toISOString().split('T')[0],
        pickup_address: pickup,
        driver_type: driverType,
        payment_method: pay,
        notes: `Type: ${rt.label} | Tel: ${phone || '—'}${agentCode ? ` | Agent: ${agentCode}` : ''}`,
      });
      setSaved(res?.status === 'confirmed' || !!res?.id);
      onDone?.();
    } catch (e) {
      const msg = e?.data?.payment || e?.data?.vehicle || e?.data?.driver_type;
      Alert.alert('Reservation impossible', String(msg || 'Paiement non effectue — aucune reservation creee. Verifiez votre connexion et votre solde.'));
      setBusy(false);
      return;
    }
    setBusy(false);
    setDone(true);
  };

  const price = (() => {
    if (!vehicle) return 0;
    if (rt.id==='3h')        return Math.max(Math.round(vehicle.rate*0.15), 15000);
    if (rt.id==='8h')        return Math.max(Math.round(vehicle.rate*0.30), 25000);
    if (rt.id==='24h')       return vehicle.rate;
    if (rt.id==='intercity') return Math.max(Math.round(vehicle.rate*1.5), 60000);
    return vehicle.rate * days;
  })();

  const chk = txt => { const u=txt.toUpperCase(); setAgentCode(u); setAgentOk(u?VALID_AGENT_CODES.includes(u):null); };

  if (done) return (
    <Modal visible animationType="fade" transparent>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'center', padding:20 }}>
        <View style={{ backgroundColor:C.bg, borderRadius:24, padding:28, alignItems:'center' }}>
          <Ionicons name="checkmark-circle" size={64} color={C.success} />
          <Text style={{ fontSize:20, fontWeight:'900', color:C.text, marginTop:12, marginBottom:8, textAlign:'center' }}>
            {saved ? 'Reservation confirmee' : 'Reservation enregistree'}
          </Text>
          <Text style={{ color:C.muted, textAlign:'center' }}>{vehicle.name} — {rt.label}</Text>
          {driverType === 'internal' && <Text style={{ color:C.info, fontSize:12, fontWeight:'600', marginTop:4 }}>Un chauffeur AutoLink vous est assigne automatiquement.</Text>}
          {driverType === 'owner' && <Text style={{ color:C.info, fontSize:12, fontWeight:'600', marginTop:4 }}>Le proprietaire se presentera avec son chauffeur.</Text>}
          {agentOk && <Text style={{ color:C.success, fontSize:12, fontWeight:'600', marginTop:4 }}>Code agent {agentCode} applique</Text>}
          <Text style={{ fontSize:22, fontWeight:'900', color:C.primary, marginVertical:12 }}>{fmtNum(price)}</Text>
          <Text style={{ color:C.success, fontSize:11, marginBottom:20, textAlign:'center' }}>
            Paiement recu — confirmee automatiquement. Le proprietaire a ete notifie.
          </Text>
          <TouchableOpacity onPress={onClose} style={{ backgroundColor:C.primary, borderRadius:14, paddingVertical:14, paddingHorizontal:32 }}>
            <Text style={{ color:'#fff', fontWeight:'700', fontSize:15 }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal visible animationType="slide" transparent>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' }}>
        <View style={{ backgroundColor:C.bg, borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:SH*0.9 }}>
          <View style={{ width:40, height:4, backgroundColor:C.border, borderRadius:2, alignSelf:'center', marginTop:12, marginBottom:6 }} />
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingBottom:10, borderBottomWidth:1, borderBottomColor:C.border }}>
            <View style={{ flex:1, marginRight:10 }}>
              <Text numberOfLines={1} style={{ fontWeight:'800', fontSize:15, color:C.text }}>{vehicle.name}</Text>
              <Text numberOfLines={1} style={{ color:C.muted, fontSize:11 }}>{vehicle.cat} · {vehicle.fuel} · {vehicle.seats} places</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={26} color={C.muted} /></TouchableOpacity>
          </View>
          <View style={{ flexDirection:'row', paddingHorizontal:20, paddingVertical:10, gap:6 }}>
            {['Type & date','Options','Paiement'].map((s,i) => (
              <View key={i} style={{ flex:1, alignItems:'center' }}>
                <View style={{ width:22, height:22, borderRadius:11, backgroundColor:step>i?C.success:step===i+1?C.primary:C.border, alignItems:'center', justifyContent:'center', marginBottom:2 }}>
                  <Text style={{ color:'#fff', fontSize:9, fontWeight:'800' }}>{step>i?'v':i+1}</Text>
                </View>
                <Text style={{ fontSize:9, color:step===i+1?C.primary:C.muted, textAlign:'center' }}>{s}</Text>
              </View>
            ))}
          </View>
          <ScrollView style={{ paddingHorizontal:20 }} keyboardShouldPersistTaps="handled">
            {step===1 && (
              <View style={{ paddingBottom:20 }}>
                <Text style={{ fontWeight:'700', color:C.text, marginBottom:8 }}>Type de location</Text>
                {RENTAL_TYPES.map(r => {
                  const on=rt.id===r.id;
                  return (
                    <TouchableOpacity key={r.id} onPress={()=>setRt(r)} style={{ borderWidth:2, borderColor:on?C.primary:C.border, borderRadius:14, padding:12, marginBottom:8, flexDirection:'row', alignItems:'center', gap:10, backgroundColor:on?C.primary+'10':C.card }}>
                      <View style={{ width:32, height:32, borderRadius:10, backgroundColor:on?C.primary:C.border, alignItems:'center', justifyContent:'center' }}>
                        <Ionicons name={r.icon} size={16} color={on?'#fff':C.muted} />
                      </View>
                      <View style={{ flex:1 }}>
                        <Text style={{ fontWeight:'700', color:C.text, fontSize:13 }}>{r.label}</Text>
                        <Text style={{ color:C.muted, fontSize:10 }}>{r.km} km inclus</Text>
                      </View>
                      <Text style={{ fontWeight:'800', color:C.primary, fontSize:12 }}>{r.id==='longhaul'?`${vehicle.rate.toLocaleString()} F/j`:r.id==='3h'?`des ${Math.max(Math.round(vehicle.rate*0.15),15000).toLocaleString()} F`:r.id==='8h'?`des ${Math.max(Math.round(vehicle.rate*0.30),25000).toLocaleString()} F`:r.id==='intercity'?`des ${Math.max(Math.round(vehicle.rate*1.5),60000).toLocaleString()} F`:`${vehicle.rate.toLocaleString()} F`}</Text>
                    </TouchableOpacity>
                  );
                })}
                {rt.id==='longhaul' && <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginTop:8 }}>
                  <TouchableOpacity onPress={()=>setDays(d=>Math.max(2,d-1))} style={{ width:38,height:38,borderRadius:10,backgroundColor:C.primary,alignItems:'center',justifyContent:'center' }}><Ionicons name="remove" size={20} color="#fff" /></TouchableOpacity>
                  <Text style={{ fontSize:20,fontWeight:'900',color:C.text,minWidth:28,textAlign:'center' }}>{days}</Text>
                  <TouchableOpacity onPress={()=>setDays(d=>Math.min(30,d+1))} style={{ width:38,height:38,borderRadius:10,backgroundColor:C.primary,alignItems:'center',justifyContent:'center' }}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
                  <Text style={{ color:C.muted }}>jours</Text>
                </View>}
                <Text style={{ fontWeight:'700', color:C.text, marginTop:12, marginBottom:6 }}>Date de depart</Text>
                <TextInput value={date} onChangeText={setDate} placeholder="JJ/MM/AAAA" placeholderTextColor={C.muted} style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:12, fontSize:14, backgroundColor:C.card, color:C.text }} />
              </View>
            )}
            {step===2 && (
              <View style={{ paddingBottom:20 }}>
                <Text style={{ fontWeight:'700', color:C.text, marginBottom:6 }}>Adresse de prise en charge</Text>
                <TextInput value={pickup} onChangeText={setPickup} placeholder="Ex: Bonanjo, Douala" placeholderTextColor={C.muted} style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:12, fontSize:14, backgroundColor:C.card, color:C.text, marginBottom:12 }} />
                <Text style={{ fontWeight:'700', color:C.text, marginBottom:6 }}>Code agent <Text style={{ fontWeight:'400', color:C.muted }}>(optionnel)</Text></Text>
                <View style={{ position:'relative', marginBottom:12 }}>
                  <TextInput value={agentCode} onChangeText={chk} placeholder="Ex: AGT-DBL-001" placeholderTextColor={C.muted} autoCapitalize="characters" style={{ borderWidth:1.5, borderColor:agentOk===true?C.success:agentOk===false?C.error:C.border, borderRadius:12, padding:12, fontSize:14, backgroundColor:C.card, color:C.text, paddingRight:44 }} />
                  {agentCode ? <View style={{ position:'absolute', right:12, top:13 }}><Ionicons name={agentOk?'checkmark-circle':'close-circle'} size={22} color={agentOk?C.success:C.error} /></View> : null}
                </View>
                <Text style={{ fontWeight:'700', color:C.text, marginBottom:8 }}>Option chauffeur</Text>
                <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
                  {[{id:'none',l:'Sans',s:'Vous conduisez'},{id:'internal',l:'AutoLink',s:'Assigne auto'},{id:'owner',l:'Du proprio',s:'Fourni',off:vehicle.api===true&&!vehicle.driverAvailable}].map(o => (
                    <TouchableOpacity key={o.id} disabled={o.off} onPress={()=>setDriverType(o.id)}
                      style={{ flex:1, borderWidth:2, borderRadius:12, padding:10, alignItems:'center', opacity:o.off?0.4:1,
                        borderColor:driverType===o.id?C.primary:C.border, backgroundColor:driverType===o.id?C.primary+'10':C.card }}>
                      <Text style={{ fontWeight:'700', color:C.text, fontSize:12 }}>{o.l}</Text>
                      <Text style={{ color:C.muted, fontSize:9, textAlign:'center' }}>{o.off?'Indisponible':o.s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ backgroundColor:'#EFF6FF', borderRadius:12, padding:12 }}>
                  <Text style={{ color:C.info, fontWeight:'700', fontSize:12, marginBottom:2 }}>Forfait kilometrique</Text>
                  <Text style={{ color:C.info, fontSize:11 }}>{rt.km} km inclus · Au-dela : {vehicle.kmRate} F/km</Text>
                </View>
                <View style={{ backgroundColor:C.card, borderRadius:14, padding:14, marginTop:12, borderWidth:1, borderColor:C.border }}>
                  <Text style={{ fontWeight:'700', color:C.text, marginBottom:8 }}>Recapitulatif</Text>
                  {[['Type',rt.label],['Prise en charge',pickup||'—'],['Agent',agentOk?agentCode:'—']].map(([k,v])=>(
                    <View key={k} style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
                      <Text style={{ color:C.muted, fontSize:12, flexShrink:0, marginRight:10 }}>{k}</Text>
                      <Text numberOfLines={1} style={{ color:C.text, fontSize:12, fontWeight:'600', flexShrink:1, textAlign:'right' }}>{v}</Text>
                    </View>
                  ))}
                  <View style={{ borderTopWidth:1, borderTopColor:C.border, paddingTop:8, marginTop:4, flexDirection:'row', justifyContent:'space-between' }}>
                    <Text style={{ fontWeight:'800', color:C.text }}>Total</Text>
                    <Text style={{ fontWeight:'900', color:C.primary, fontSize:15 }}>{fmtNum(price)}</Text>
                  </View>
                </View>
              </View>
            )}
            {step===3 && (
              <View style={{ paddingBottom:20 }}>
                <Text style={{ fontWeight:'700', color:C.text, marginBottom:6 }}>Numero de telephone</Text>
                <TextInput value={phone} onChangeText={setPhone} placeholder="+237 6XX XX XX XX" placeholderTextColor={C.muted} keyboardType="phone-pad" style={{ borderWidth:1.5, borderColor:C.border, borderRadius:12, padding:12, fontSize:14, backgroundColor:C.card, color:C.text, marginBottom:16 }} />
                <Text style={{ fontWeight:'700', color:C.text, marginBottom:10 }}>Mode de paiement</Text>
                {[{id:'wallet',label:'Solde AutoLink',dot:'#10B981'},{id:'mtn',label:'MTN MoMo',dot:'#FCD34D'},{id:'orange',label:'Orange Money',dot:'#FB923C'},{id:'senbid',label:'SenBid',dot:'#14B8A6'},{id:'paybid',label:'PayBid',dot:'#6366F1'},{id:'stripe',label:'Carte (Stripe)',dot:'#7C3AED'}].map(pm=>(
                  <TouchableOpacity key={pm.id} onPress={()=>setPay(pm.id)} style={{ borderWidth:2, borderColor:pay===pm.id?pm.dot:C.border, borderRadius:14, padding:12, marginBottom:8, flexDirection:'row', alignItems:'center', gap:12, backgroundColor:pay===pm.id?pm.dot+'15':C.card }}>
                    <View style={{ width:28,height:28,borderRadius:8,backgroundColor:pm.dot+'50' }} />
                    <Text numberOfLines={1} style={{ fontWeight:'700', color:C.text, flex:1 }}>{pm.label}</Text>
                    {pay===pm.id && <Ionicons name="checkmark-circle" size={22} color={pm.dot} />}
                  </TouchableOpacity>
                ))}
                <View style={{ backgroundColor:C.card, borderRadius:14, padding:14, borderWidth:1, borderColor:C.border, marginTop:8 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:6, paddingBottom:8, borderBottomWidth:1, borderBottomColor:C.border }}>
                    <Ionicons name="shield-checkmark" size={14} color={C.success} />
                    <Text style={{ color:C.muted, fontSize:11, flex:1 }}>Paiement securise — caution bloquee jusqu'a la fin de la location</Text>
                  </View>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', paddingTop:8 }}>
                    <Text style={{ fontWeight:'800', color:C.text }}>Total a payer</Text>
                    <Text style={{ fontWeight:'900', color:C.primary, fontSize:16 }}>{fmtNum(price)}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
          <View style={{ padding:20, gap:10, borderTopWidth:1, borderTopColor:C.border }}>
            {step<3
              ? <View style={{ flexDirection:'row', gap:10 }}>
                  <TouchableOpacity onPress={onClose} style={{ flex:1, borderWidth:2, borderColor:C.muted, borderRadius:14, paddingVertical:14, alignItems:'center' }}><Text style={{ color:C.muted, fontWeight:'700' }}>Annuler</Text></TouchableOpacity>
                  <TouchableOpacity onPress={()=>setStep(s=>s+1)} disabled={step===1&&!date} style={{ flex:2, backgroundColor:step===1&&!date?'#94A3B8':C.primary, borderRadius:14, paddingVertical:14, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8 }}><Ionicons name="arrow-forward" size={18} color="#fff" /><Text style={{ color:'#fff', fontWeight:'700', fontSize:15 }}>Suivant</Text></TouchableOpacity>
                </View>
              : <View style={{ flexDirection:'row', gap:10 }}>
                  <TouchableOpacity onPress={()=>setStep(2)} style={{ flex:1, borderWidth:2, borderColor:C.muted, borderRadius:14, paddingVertical:14, alignItems:'center' }}><Text style={{ color:C.muted, fontWeight:'700' }}>Retour</Text></TouchableOpacity>
                  <TouchableOpacity onPress={submit} disabled={busy} style={{ flex:2, backgroundColor:busy?'#94A3B8':C.primary, borderRadius:14, paddingVertical:14, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8 }}>{busy?<ActivityIndicator color="#fff" size="small"/>:<Ionicons name="shield-checkmark" size={18} color="#fff" />}<Text style={{ color:'#fff', fontWeight:'700', fontSize:15 }}>{busy?'Envoi...':`Payer — ${fmtNum(price)}`}</Text></TouchableOpacity>
                </View>
            }
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function AppInner() {
  const [user, setUser] = useState(null);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('autolink_user')
      .then(d => { if (d) setUser(JSON.parse(d)); })
      .catch(() => {});
  }, []);

  const normalize = (u) => ({
    ...u,
    firstName: u.firstName || u.first_name || '',
    lastName:  u.lastName  || u.last_name  || '',
  });

  const saveSession = async (data) => {
    const u = normalize(data.user);
    await AsyncStorage.setItem('autolink_user', JSON.stringify(u));
    await AsyncStorage.setItem('al_access', data.access);
    await AsyncStorage.setItem('al_refresh', data.refresh);
    setUser(u);
    return u;
  };

  const login = async ({ email, password }) => {
    try {
      const data = await api.login(email, password);
      await saveSession(data);
      return { success: true };
    } catch (e) {
      if (e.status === 400 || e.status === 401) return { success: false, error: 'Email ou mot de passe incorrect.' };
    }
    // API injoignable → repli comptes demo
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'API injoignable — compte demo introuvable.' };
    const { password: _, ...safe } = found;
    await AsyncStorage.setItem('autolink_user', JSON.stringify(safe));
    setUser(safe);
    return { success: true };
  };

  const googleLogin = async (profile) => {
    try {
      const data = await api.google(profile);
      await saveSession(data);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Connexion Google impossible — API injoignable.' };
    }
  };

  const register = async ({ email, password, firstName, lastName, phone }) => {
    try {
      const data = await api.register({
        username: email.split('@')[0] + Date.now() % 1000,
        email, password, password2: password,
        first_name: firstName, last_name: lastName, phone: phone || '', role: 'CLIENT',
      });
      await saveSession(data);
      return { success: true };
    } catch (e) {
      const first = e.data && Object.values(e.data)[0];
      return { success: false, error: Array.isArray(first) ? first[0] : 'Inscription impossible — API injoignable.' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('autolink_user');
    await AsyncStorage.removeItem('al_access');
    await AsyncStorage.removeItem('al_refresh');
    setUser(null);
  };

  if (splash) return <Splash onDone={() => setSplash(false)} />;

  const renderByRole = () => {
    if (!user) return <LoginScreen />;
    switch (user.role) {
      case 'CLIENT':     return <ClientDash     user={user} logout={logout} />;
      case 'OWNER':      return <OwnerDash       user={user} logout={logout} />;
      case 'DRIVER':     return <DriverDash      user={user} logout={logout} />;
      case 'ADMIN':      return <AdminDash       user={user} logout={logout} />;
      case 'CONTROLLER': return <ControllerDash  user={user} logout={logout} />;
      default:           return <LoginScreen />;
    }
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout, register, googleLogin }}>
      {renderByRole()}
    </AuthCtx.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}
