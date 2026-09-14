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
  active: C.info, confirmed: C.primary, cancelled: C.error,
};
const STATUS_LABEL = {
  approved: 'Approuve', pending: 'En attente', rented: 'En location',
  completed: 'Termine', active: 'En cours', confirmed: 'Confirme', cancelled: 'Annule',
};

const IMG = {
  hero:    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  corolla: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&q=80',
  tucson:  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&q=80',
  bmw5:    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&q=80',
  merGLE:  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&q=80',
  sportage:'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=500&q=80',
  evoque:  'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=500&q=80',
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

const VEHICLES = [
  { id:1, name:'Toyota Corolla 2022', cat:'Berline', plate:'LT-1234-A', image:IMG.corolla,
    rate:25000, kmIncluded:300, kmRate:120, rating:4.8, reviews:47, fuel:'Essence', seats:5, status:'approved', score:94 },
  { id:2, name:'Hyundai Tucson 2023', cat:'SUV',     plate:'LT-5678-B', image:IMG.tucson,
    rate:45000, kmIncluded:300, kmRate:120, rating:4.7, reviews:31, fuel:'Diesel',  seats:5, status:'approved', score:97 },
  { id:3, name:'BMW Serie 5 2022',    cat:'Luxe',    plate:'CE-9012-C', image:IMG.bmw5,
    rate:80000, kmIncluded:300, kmRate:150, rating:5.0, reviews:18, fuel:'Essence', seats:5, status:'rented',   score:99 },
  { id:4, name:'Mercedes GLE 350',    cat:'SUV',     plate:'CE-3456-D', image:IMG.merGLE,
    rate:95000, kmIncluded:500, kmRate:100, rating:4.9, reviews:22, fuel:'Diesel',  seats:7, status:'approved', score:91 },
  { id:5, name:'Kia Sportage 2023',   cat:'SUV',     plate:'LT-7890-E', image:IMG.sportage,
    rate:38000, kmIncluded:300, kmRate:120, rating:4.6, reviews:29, fuel:'Hybride', seats:5, status:'approved', score:88 },
  { id:6, name:'Range Rover Evoque',  cat:'Luxe',    plate:'LT-9012-F', image:IMG.evoque,
    rate:110000,kmIncluded:500, kmRate:150, rating:4.9, reviews:11, fuel:'Essence', seats:5, status:'approved', score:98 },
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
        <View style={{ position:'absolute', top:10, left:10, backgroundColor:C.primary,
          borderRadius:20, paddingHorizontal:10, paddingVertical:4 }}>
          <Text style={{ color:'#fff', fontSize:11, fontWeight:'700' }}>{v.cat}</Text>
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

function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !pwd) { Alert.alert('Requis', 'Remplissez tous les champs.'); return; }
    setLoading(true);
    const r = await login({ email, password: pwd });
    setLoading(false);
    if (!r.success) Alert.alert('Connexion echouee', r.error);
  };

  const QUICK = [
    { label:'Client',        email:'client@autolink.com' },
    { label:'Chauffeur',     email:'driver@autolink.com' },
    { label:'Gestionnaire',  email:'owner@autolink.com' },
    { label:'Admin',         email:'admin@autolink.com' },
    { label:'Controleur',    email:'controller@autolink.com' },
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
          <Text style={{ fontSize:20, fontWeight:'800', color:C.text, marginBottom:20 }}>Connexion</Text>

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

          <TouchableOpacity onPress={handle} disabled={loading}
            style={{ backgroundColor:C.primary, borderRadius:14, paddingVertical:14,
              alignItems:'center', opacity:loading?0.7:1 }}>
            {loading ? <ActivityIndicator color="#fff" />
              : <Text style={{ color:'#fff', fontWeight:'700', fontSize:16 }}>Se connecter</Text>}
          </TouchableOpacity>

          <Text style={{ color:C.muted, fontSize:11, textAlign:'center', marginTop:24, marginBottom:12 }}>
            Comptes demo — mot de passe : pass123
          </Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
            {QUICK.map(q => (
              <TouchableOpacity key={q.label}
                onPress={() => { setEmail(q.email); setPwd('pass123'); }}
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
function ClientDash({ user, logout }) {
  const [tab, setTab] = useState('home');
  const [search, setSearch] = useState('');
  const [selV, setSelV] = useState(null);
  const av = user.firstName[0] + user.lastName[0];
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
              {BOOKINGS.slice(0,2).map(b => (
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
            <ScrollView style={{ padding:16 }}>
              <Text style={{ color:C.muted, fontSize:11, marginBottom:10 }}>{VEHICLES.filter(v=>!search||v.name.toLowerCase().includes(search.toLowerCase())).length} vehicule(s) — chauffeur certifie inclus</Text>
              {VEHICLES.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase())).map(v => <VehicleCard key={v.id} v={v} onPress={() => setSelV(v)} />)}
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
            <ScrollView style={{ padding:16 }}>
              {BOOKINGS.map(b => (
                <View key={b.id} style={{ backgroundColor:C.card, borderRadius:16, padding:14, marginBottom:10, shadowColor:'#000', shadowOpacity:0.05, elevation:2 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 }}>
                    <View style={{ width:42, height:42, borderRadius:13, backgroundColor:C.primary+'15', alignItems:'center', justifyContent:'center' }}>
                      <Ionicons name="car-sport" size={20} color={C.primary} />
                    </View>
                    <View style={{ flex:1 }}>
                      <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text }}>{b.vehicle}</Text>
                      <Text numberOfLines={1} style={{ color:C.muted, fontSize:11 }}>{b.id} · {b.type}</Text>
                    </View>
                    <View style={{ backgroundColor:(b.status==='completed'?C.success:C.warning)+'20', borderRadius:20, paddingHorizontal:10, paddingVertical:3 }}>
                      <Text style={{ color:b.status==='completed'?C.success:C.warning, fontSize:11, fontWeight:'700' }}>{b.status==='completed'?'Termine':'Attente'}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', borderTopWidth:1, borderTopColor:C.border, paddingTop:10 }}>
                    <View><Text style={{ color:C.muted, fontSize:10 }}>Chauffeur</Text><Text style={{ color:C.text, fontSize:12, fontWeight:'600' }}>{b.driver}</Text></View>
                    <View><Text style={{ color:C.muted, fontSize:10 }}>Date</Text><Text style={{ color:C.text, fontSize:12, fontWeight:'600' }}>{b.date}</Text></View>
                    <View style={{ alignItems:'flex-end' }}><Text style={{ color:C.muted, fontSize:10 }}>Montant</Text><Text style={{ color:C.primary, fontSize:15, fontWeight:'900' }}>{fmtNum(b.amount)}</Text></View>
                  </View>
                  {b.rating ? <View style={{ marginTop:8, flexDirection:'row', gap:2 }}>{[1,2,3,4,5].map(i=><Ionicons key={i} name={i<=b.rating?'star':'star-outline'} size={13} color="#FBBF24" />)}</View> : null}
                </View>
              ))}
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
      {selV && <BookingModal vehicle={selV} onClose={() => setSelV(null)} />}
    </SafeAreaView>
  );
}

// ─── ROLE SCREENS (Owner/Driver/Admin/Controller stubs) ──────────────────────
function OwnerDash({ user, logout }) {
  const av = user.firstName[0] + user.lastName[0];
  const myV = [
    { id:1, name:'Toyota Corolla 2022', plate:'LT-1234-A', image:IMG.corolla, rate:25000, status:'available', earned:873600, km:8240, score:94 },
    { id:2, name:'Hyundai Tucson 2023', plate:'LT-5678-B', image:IMG.tucson,  rate:45000, status:'rented',    earned:1544400, km:12880, score:97 },
  ];
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.dark }}>
      <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <View style={{ flex:1, marginRight:10 }}>
            <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Gestionnaire de parc</Text>
            <Text numberOfLines={1} style={{ color:'#fff', fontWeight:'900', fontSize:19 }}>{user.firstName} {user.lastName}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:10, padding:8 }}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView style={{ padding:16 }}>
        <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
          {[{l:'Vehicules',v:myV.length,c:C.info},{l:'Revenus nets',v:`${fmtNum(myV.reduce((s,v)=>s+v.earned,0))} `,c:C.primary},{l:'Km total',v:`${myV.reduce((s,v)=>s+v.km,0).toLocaleString()}`,c:C.success}].map(s=>(
            <View key={s.l} style={{ flex:1, backgroundColor:s.c+'15', borderRadius:14, padding:12, alignItems:'center' }}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:15, fontWeight:'900', color:s.c }}>{s.v}</Text>
              <Text style={{ fontSize:10, color:C.muted, marginTop:2, textAlign:'center' }}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor:'#F0FDF4', borderRadius:14, padding:12, marginBottom:14, flexDirection:'row', alignItems:'center', gap:8 }}>
          <Ionicons name="information-circle" size={20} color={C.success} />
          <Text style={{ color:'#166534', fontSize:12, flex:1 }}>Votre part : 78% — Commission AutoLink : 22% — Km supp. reverses</Text>
        </View>
        <SectionTitle title="Mes vehicules" />
        {myV.map(v => (
          <View key={v.id} style={{ backgroundColor:C.card, borderRadius:16, overflow:'hidden', marginBottom:12, shadowColor:'#000', shadowOpacity:0.06, elevation:3 }}>
            <Image source={{ uri:v.image }} style={{ width:'100%', height:130 }} resizeMode="cover" />
            <View style={{ padding:14, flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
              <View style={{ flex:1, marginRight:10 }}>
                <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text, fontSize:14 }}>{v.name}</Text>
                <Text numberOfLines={1} style={{ color:C.muted, fontSize:11, fontFamily:Platform.OS==='ios'?'Courier':'monospace' }}>{v.plate}</Text>
              </View>
              <View style={{ alignItems:'flex-end' }}>
                <Badge label={v.status==='available'?'Disponible':'En location'} color={v.status==='available'?C.success:C.info} />
                <Text style={{ fontWeight:'900', color:C.primary, fontSize:15, marginTop:4 }}>{fmtNum(v.earned)}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function DriverDash({ user, logout }) {
  const [online, setOnline] = useState(false);
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.dark }}>
      <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <View style={{ flex:1, marginRight:10 }}>
            <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Chauffeur certifie</Text>
            <Text numberOfLines={1} style={{ color:'#fff', fontWeight:'900', fontSize:19 }}>{user.firstName} {user.lastName}</Text>
          </View>
          <View style={{ alignItems:'center', gap:4 }}>
            <Switch value={online} onValueChange={setOnline} trackColor={{ false:'#94A3B8', true:C.success }} thumbColor="#fff" />
            <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:10 }}>{online?'En ligne':'Hors ligne'}</Text>
          </View>
        </View>
        <View style={{ marginTop:14, backgroundColor:online?C.success+'30':'rgba(255,255,255,0.1)', borderRadius:12, padding:12, flexDirection:'row', alignItems:'center', gap:8 }}>
          <View style={{ width:10, height:10, borderRadius:5, backgroundColor:online?C.success:'#94A3B8' }} />
          <Text style={{ color:'#fff', fontWeight:'600', fontSize:13, flex:1 }}>{online?'Vous recevez des demandes':'Activez-vous pour recevoir des courses'}</Text>
        </View>
      </LinearGradient>
      <ScrollView style={{ padding:16 }}>
        <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
          {[{l:'Courses',v:user.trips||312,c:C.primary},{l:'Note',v:`${user.rating||4.8}/5`,c:'#F59E0B'},{l:'Revenus',v:`${fmtNum(user.earned||2450000)}`,c:C.success}].map(s=>(
            <View key={s.l} style={{ flex:1, backgroundColor:s.c+'15', borderRadius:14, padding:12, alignItems:'center' }}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:15, fontWeight:'900', color:s.c }}>{s.v}</Text>
              <Text style={{ fontSize:10, color:C.muted, marginTop:2, textAlign:'center' }}>{s.l}</Text>
            </View>
          ))}
        </View>
        <SectionTitle title="Vehicule assigne" />
        <View style={{ backgroundColor:C.card, borderRadius:16, overflow:'hidden', marginBottom:14, shadowColor:'#000', shadowOpacity:0.06, elevation:3 }}>
          <Image source={{ uri:IMG.corolla }} style={{ width:'100%', height:130 }} resizeMode="cover" />
          <View style={{ padding:14 }}>
            <Text style={{ fontWeight:'800', color:C.text, fontSize:14 }}>Toyota Corolla 2022</Text>
            <Text style={{ color:C.muted, fontSize:11, fontFamily:Platform.OS==='ios'?'Courier':'monospace' }}>LT-1234-A · Score 94/100</Text>
          </View>
        </View>
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
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.dark }}>
      <LinearGradient colors={[C.dark, C.primary]} style={{ padding:20, paddingTop:14, paddingBottom:20 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <View style={{ flex:1, marginRight:10 }}>
            <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Administration</Text>
            <Text numberOfLines={1} style={{ color:'#fff', fontWeight:'900', fontSize:19 }}>AutoLink Pro</Text>
          </View>
          <TouchableOpacity onPress={logout} style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:10, padding:8 }}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView style={{ padding:16 }}>
        <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
          {[{l:'Utilisateurs',v:'5 247',c:C.info},{l:'Vehicules',v:'523',c:C.primary},{l:'Commission',v:'11.9 M',c:C.success}].map(s=>(
            <View key={s.l} style={{ flex:1, backgroundColor:s.c+'15', borderRadius:14, padding:12, alignItems:'center' }}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize:15, fontWeight:'900', color:s.c }}>{s.v}</Text>
              <Text style={{ fontSize:10, color:C.muted, marginTop:2, textAlign:'center' }}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={{ backgroundColor:'#FEF3C7', borderRadius:14, padding:14, marginBottom:14, flexDirection:'row', alignItems:'center', gap:10 }}>
          <Ionicons name="warning" size={22} color="#D97706" />
          <Text style={{ color:'#92400E', fontWeight:'600', fontSize:13, flex:1 }}>12 candidatures chauffeurs en attente de validation</Text>
        </View>
        <SectionTitle title="Agents affilies" />
        {[{code:'AGT-DBL-001',name:'Moise Kamga',conv:28,comm:217000},{code:'AGT-YDE-002',name:'Rachel Biyong',conv:14,comm:94500},{code:'AGT-DBL-003',name:'Serge Ndoumbe',conv:42,comm:399000}].map(a=>(
          <View key={a.code} style={{ backgroundColor:C.card, borderRadius:14, padding:14, marginBottom:10, shadowColor:'#000', shadowOpacity:0.04, elevation:2 }}>
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <Text numberOfLines={1} style={{ fontWeight:'800', color:C.text, flex:1, marginRight:10 }}>{a.name}</Text>
              <Badge label={a.code} color={C.primary} />
            </View>
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <Text style={{ color:C.muted, fontSize:12 }}>{a.conv} conversions</Text>
              <Text style={{ fontWeight:'700', color:C.primary, fontSize:13 }}>{fmtNum(a.comm)}</Text>
            </View>
          </View>
        ))}
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
function BookingModal({ vehicle, onClose }) {
  const [step, setStep] = useState(1);
  const [rt, setRt] = useState(RENTAL_TYPES[2]);
  const [days, setDays] = useState(2);
  const [date, setDate] = useState('');
  const [pickup, setPickup] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [agentOk, setAgentOk] = useState(null);
  const [pay, setPay] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);

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
          <Text style={{ fontSize:20, fontWeight:'900', color:C.text, marginTop:12, marginBottom:8, textAlign:'center' }}>Reservation confirmee</Text>
          <Text style={{ color:C.muted, textAlign:'center' }}>{vehicle.name} — {rt.label}</Text>
          {agentOk && <Text style={{ color:C.success, fontSize:12, fontWeight:'600', marginTop:4 }}>Code agent {agentCode} applique</Text>}
          <Text style={{ fontSize:22, fontWeight:'900', color:C.primary, marginVertical:12 }}>{fmtNum(price)}</Text>
          <Text style={{ color:C.muted, fontSize:11, marginBottom:20, textAlign:'center' }}>SMS envoye au {phone}</Text>
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
                {[{id:'mtn',label:'MTN Mobile Money',dot:'#FCD34D'},{id:'orange',label:'Orange Money',dot:'#FB923C'},{id:'bank',label:'Depot bancaire',dot:'#60A5FA'}].map(pm=>(
                  <TouchableOpacity key={pm.id} onPress={()=>setPay(pm.id)} style={{ borderWidth:2, borderColor:pay===pm.id?pm.dot:C.border, borderRadius:14, padding:12, marginBottom:8, flexDirection:'row', alignItems:'center', gap:12, backgroundColor:pay===pm.id?pm.dot+'15':C.card }}>
                    <View style={{ width:28,height:28,borderRadius:8,backgroundColor:pm.dot+'50' }} />
                    <Text numberOfLines={1} style={{ fontWeight:'700', color:C.text, flex:1 }}>{pm.label}</Text>
                    {pay===pm.id && <Ionicons name="checkmark-circle" size={22} color={pm.dot} />}
                  </TouchableOpacity>
                ))}
                <View style={{ backgroundColor:C.card, borderRadius:14, padding:14, borderWidth:1, borderColor:C.border, marginTop:8 }}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', paddingBottom:8, borderBottomWidth:1, borderBottomColor:C.border }}>
                    <Text style={{ color:C.muted }}>Commission AutoLink (22%)</Text>
                    <Text style={{ color:C.error }}>-{fmtNum(Math.round(price*0.22))}</Text>
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
                  <TouchableOpacity onPress={()=>phone?setDone(true):Alert.alert('Requis','Entrez votre numero')} style={{ flex:2, backgroundColor:C.primary, borderRadius:14, paddingVertical:14, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8 }}><Ionicons name="shield-checkmark" size={18} color="#fff" /><Text style={{ color:'#fff', fontWeight:'700', fontSize:15 }}>Payer — {fmtNum(price)}</Text></TouchableOpacity>
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

  const login = async ({ email, password }) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Email ou mot de passe incorrect.' };
    const { password: _, ...safe } = found;
    await AsyncStorage.setItem('autolink_user', JSON.stringify(safe));
    setUser(safe);
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('autolink_user');
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
    <AuthCtx.Provider value={{ user, login, logout }}>
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
