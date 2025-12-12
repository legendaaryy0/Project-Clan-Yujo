import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, Clock, Users, Video, MonitorPlay, Mic2, Bell, LogOut, Plus, 
  CheckCircle, AlertCircle, Film, LayoutDashboard, Settings, MessageSquare, 
  Lock, User, Save, Edit3, Link as LinkIcon, Shield, UserCheck, XCircle, 
  RefreshCw, Smile, Key, Activity, Copy, Trash2, Info, Send, ThumbsUp, 
  MessageCircle, Vote, BarChart2, PlayCircle, Wifi, WifiOff, Zap, Hexagon, 
  Menu, X, Grid, MoreVertical, ChevronRight, Image as ImageIcon, Upload, 
  Layers, Briefcase, MapPin, CalendarDays, CheckSquare, Flag, ArrowLeft, 
  AlertTriangle, MessageSquareCode, Minimize2, Command, Megaphone, HardDrive,
  Sticker, CornerDownRight, Loader2, Reply, Power, Cpu, BookOpen, Factory,
  Unlock, Hash, Edit2, UserPlus, FileText, Eye, EyeOff, ExternalLink, Briefcase as WorkIcon, GraduationCap, Building2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, addDoc, onSnapshot, query, 
  orderBy, updateDoc, deleteDoc, limit, serverTimestamp, where, getDocs, getDoc 
} from 'firebase/firestore';

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBZUDfgKkoXIJtC8H2cef8dzhHJlhNvrYE",
  authDomain: "clan-yujo.firebaseapp.com",
  projectId: "clan-yujo",
  storageBucket: "clan-yujo.firebasestorage.app",
  messagingSenderId: "467178271538",
  appId: "1:467178271538:web:958c5eb0a0ab5eb2dddd2b",
  measurementId: "G-PKCS8S297J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 2. CONSTANTS & DATA ---
const COLLECTION_USERS = 'users';
const COLLECTION_BOOKINGS = 'bookings';
const COLLECTION_PROJECTS = 'projects';
const COLLECTION_LOGS = 'activity_logs';
const COLLECTION_REQUESTS = 'requests'; 
const COLLECTION_SCREENINGS = 'screenings'; 
const COLLECTION_POLLS = 'polls'; 
const COLLECTION_MESSAGES = 'messages'; 
const COLLECTION_ANNOUNCEMENTS = 'announcements';
const COLLECTION_STICKERS = 'stickers'; 
const COLLECTION_SYSTEM = 'system'; 

const ADMIN_CODE = "MINAT02025";  
const STAFF_CODE = "AKIRA2025"; 
const TEMP_CODE = "TEMP2025";
const LOGO_URL = "/logo.jpeg"; 

// --- RESOURCES ---
const RESOURCES = [
  { id: 'armory-1', name: 'Alienware Station', type: 'Armory', icon: Cpu, desc: 'Seat 1: Heavy Firepower' },
  { id: 'armory-2', name: 'Maingear Rig', type: 'Armory', icon: Cpu, desc: 'Seat 2: Ultra Performance' },
  { id: 'edit-bay', name: 'Main Edit Bay', type: 'Labs', icon: Lock, desc: 'Restricted: Request Ray', restricted: true, owner: 'Ray' },
  { id: 'lib-1', name: 'Library Seat 1', type: 'Barracks', icon: BookOpen, desc: 'Tactical Planning' },
  { id: 'lib-2', name: 'Library Seat 2', type: 'Barracks', icon: BookOpen, desc: 'Tactical Planning' },
];

const DEFAULT_STICKERS = [
  { id: 's1', url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Love&backgroundColor=transparent', name: 'Love' },
  { id: 's2', url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Fire&backgroundColor=transparent', name: 'Fire' },
];

const ROLE_TEMPLATES = {
  'Production': ['Producer', 'Director', 'D.O.P', 'Camera Op', 'Sound Mixer', 'Gaffer', 'Art Director'],
  'Pre-Production': ['Producer', 'Scriptwriter', 'Storyboard Artist', 'Casting Director', 'Location Manager'],
  'Post-Production': ['Lead Editor', 'VFX Supervisor', 'Sound Designer', 'Colorist', 'Animator'],
  'Custom': ['Lead']
};

const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Toon' },
  { id: 'personas', name: 'Realish' },
  { id: 'adventurer', name: 'RPG' },
  { id: 'lorelei', name: 'Anime' },
  { id: 'micah', name: 'Clean' }
];

const REACTION_EMOJIS = ['🔥', '❤️', '👍', '😂', '🦅', '👀'];

const formatDate = (date) => date.toISOString().split('T')[0];
const generatePassword = () => {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789"; 
  let pass = "";
  for (let i = 0; i < 6; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
};

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const compressImage = (file, quality = 0.7, maxWidth = 1080) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const scale = Math.min(1, maxWidth / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality)); 
            };
        };
    });
};

// --- COMPONENTS ---

// 1. UTILITY & SIMPLE COMPONENTS

const NexusMenu = ({ isOpen, toggle, setActiveTab, handleLogout, role, openChat, hasUnread }) => {
  const menuRef = useRef(null);
  useEffect(() => { const handleClickOutside = (event) => { if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) { toggle(); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, [isOpen, toggle]);
  if (!isOpen) return null;
  return (
    <div ref={menuRef} className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[250px] z-50 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 lg:bottom-10 lg:left-24 lg:transform-none">
       <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl p-2 shadow-2xl flex flex-col gap-1">
          {role !== 'temp' && (<button onClick={() => { openChat(); toggle(); }} className="flex items-center gap-3 text-emerald-400 hover:text-emerald-300 hover:bg-white/10 px-4 py-3 rounded-xl transition text-sm font-bold relative"><MessageCircle size={18}/> Clan Comms{hasUnread && <span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</button>)}
          {role !== 'temp' && (<button onClick={() => { setActiveTab('team'); toggle(); }} className="flex items-center gap-3 text-zinc-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition text-sm font-bold"><Users size={18}/> Clan Members</button>)}
          <button onClick={() => { setActiveTab('profile'); toggle(); }} className="flex items-center gap-3 text-zinc-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition text-sm font-bold"><Settings size={18}/> My Identity</button>
          {role === 'admin' && <button onClick={() => { setActiveTab('cinema_admin'); toggle(); }} className="flex items-center gap-3 text-zinc-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition text-sm font-bold"><Video size={18} className="text-amber-400"/> Cinema Control</button>}
          <div className="h-px bg-zinc-800 my-1"></div>
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:bg-red-900/20 px-4 py-3 rounded-xl transition text-sm font-bold"><LogOut size={18}/> Disconnect</button>
       </div>
    </div>
  );
};

const AgentDossier = ({ userId, users, onClose }) => {
    const user = users.find(u => u.uid === userId);
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in-95">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-black/50 p-2 rounded-full z-10"><X size={18}/></button>
                <div className="h-32 bg-gradient-to-r from-emerald-900/50 to-purple-900/50 relative">
                    <div className="absolute -bottom-12 left-6 border-4 border-zinc-900 rounded-2xl overflow-hidden bg-black w-24 h-24 shadow-lg">
                        <img src={user.avatar} className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="pt-14 px-6 pb-8">
                    <div className="mb-4">
                        <h3 className="text-2xl font-black text-white leading-none">{user.displayName || 'Unknown Agent'}</h3>
                        <p className="text-emerald-500 font-mono text-xs mt-1 flex items-center gap-1">
                            <Hash size={12}/> {user.username || '---'} (ORIGINAL ID)
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="bg-black/30 p-3 rounded-xl border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">Clearance</span>
                            <span className="text-white text-sm font-bold capitalize">{user.role || 'Unassigned'}</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-xl border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">Status Report</span>
                            <p className="text-zinc-300 text-sm leading-relaxed italic">"{user.bio || 'No status reported.'}"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoginScreen = ({ onLogin, isAuthReady }) => {
  const [mode, setMode] = useState('login'); 
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [regData, setRegData] = useState({ name: '', accessCode: '' });
  const [createdCreds, setCreatedCreds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isAuthReady) return setError("Connecting to HQ...");
    setLoading(true); setError('');
    try {
      const q = query(collection(db, COLLECTION_USERS), where('username', '==', loginCreds.username));
      const snapshot = await getDocs(q);
      if (snapshot.empty) { setError("Unknown Agent ID."); setLoading(false); return; }
      const userDoc = snapshot.docs.find(doc => doc.data().password === loginCreds.password);
      if (!userDoc) { setError("Invalid Key."); setLoading(false); return; }
      onLogin(userDoc.data());
    } catch (err) { setError("Network Error."); } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isAuthReady) return setError("Connecting to HQ...");
    setLoading(true); setError('');
    try {
       let assignedRole = '';
       if (regData.accessCode === ADMIN_CODE) assignedRole = 'admin';
       else if (regData.accessCode === STAFF_CODE) assignedRole = 'staff';
       else if (regData.accessCode === TEMP_CODE) assignedRole = 'temp';
       else throw new Error("Invalid Code.");

       const cleanName = regData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
       const randomSuffix = Math.floor(Math.random() * 1000);
       const genUsername = `${cleanName}${randomSuffix}`;
       const genPassword = generatePassword();

       const q = query(collection(db, COLLECTION_USERS), where('username', '==', genUsername));
       const snap = await getDocs(q);
       if (!snap.empty) throw new Error("Retry registration.");

       const newDocRef = doc(collection(db, COLLECTION_USERS));
       const userData = {
         uid: newDocRef.id, authUid: auth.currentUser?.uid || 'anon', displayName: regData.name, role: assignedRole,
         status: 'active', username: genUsername, password: genPassword,
         bio: "Ready for action.", joinedAt: serverTimestamp(),
         avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${newDocRef.id}`
       };
       await setDoc(newDocRef, userData);
       setCreatedCreds({ username: genUsername, password: genPassword });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };

  if (createdCreds) return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
         <div className="bg-zinc-900/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-zinc-800 max-w-md w-full text-center animate-in zoom-in">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"><Key size={40} /></div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome.</h2>
            <p className="text-zinc-400 mb-8 text-sm">Save these credentials immediately.</p>
            <div className="bg-black/40 p-6 rounded-2xl border border-zinc-800 text-left space-y-5 mb-8">
               <div><label className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest mb-1 block">Agent ID</label><div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-xl border border-zinc-700"><span className="text-white font-mono text-lg">{createdCreds.username}</span><button onClick={() => copyToClipboard(createdCreds.username)} className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white"><Copy size={16}/></button></div></div>
               <div><label className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest mb-1 block">Access Key</label><div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-xl border border-zinc-700"><span className="text-white font-mono text-lg">{createdCreds.password}</span><button onClick={() => copyToClipboard(createdCreds.password)} className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white"><Copy size={16}/></button></div></div>
            </div>
            <button onClick={() => { setCreatedCreds(null); setMode('login'); setLoginCreds(createdCreds); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl">Enter System</button>
         </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="bg-zinc-900/60 backdrop-blur-xl w-full max-w-md p-8 rounded-3xl shadow-2xl border border-zinc-800/50 relative z-10 mb-8">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-xl rotate-3 hover:rotate-0 transition duration-500 overflow-hidden">
            {LOGO_URL ? <img src={LOGO_URL} alt="Clan Yujo" className="w-full h-full object-cover"/> : <Hexagon className="text-white w-10 h-10" />}
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">CLAN YUJO</h1>
          <p className="text-zinc-400 text-sm uppercase tracking-widest">Production OS v9.1</p>
        </div>
        <div className={`flex justify-center mb-6 text-xs font-bold ${isAuthReady ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
             {isAuthReady ? <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20"><Wifi size={12}/> SYSTEMS ONLINE</span> : <span className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20"><RefreshCw size={12} className="animate-spin"/> ESTABLISHING LINK...</span>}
        </div>
        <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-zinc-800">
          <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>LOGIN</button>
          <button onClick={() => { setMode('register'); setError(''); }} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>INITIATE</button>
        </div>
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
             <div className="space-y-1"><label className="text-xs font-bold text-zinc-500 ml-2 uppercase">Agent ID</label><input type="text" required className="w-full bg-black/50 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" placeholder="Username" value={loginCreds.username} onChange={(e) => setLoginCreds({...loginCreds, username: e.target.value})}/></div>
             <div className="space-y-1"><label className="text-xs font-bold text-zinc-500 ml-2 uppercase">Access Key</label><input type="password" required className="w-full bg-black/50 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" placeholder="Password" value={loginCreds.password} onChange={(e) => setLoginCreds({...loginCreds, password: e.target.value})}/></div>
             {error && <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 text-xs"><AlertCircle size={16} /> {error}</div>}
             <button disabled={loading || !isAuthReady} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-xl mt-4 transition-all hover:scale-[1.02]">{loading ? 'AUTHENTICATING...' : 'ENTER STUDIO'}</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-1"><label className="text-xs font-bold text-zinc-500 ml-2 uppercase">Identity</label><input type="text" required className="w-full bg-black/50 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition" placeholder="Full Name" value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})}/></div>
            <div className="space-y-1"><label className="text-xs font-bold text-zinc-500 ml-2 uppercase">Clan Code</label><input type="text" required className="w-full bg-black/50 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition" placeholder="Enter Code" value={regData.accessCode} onChange={(e) => setRegData({...regData, accessCode: e.target.value})}/></div>
            {error && <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 text-xs"><AlertCircle size={16} /> {error}</div>}
            <button disabled={loading || !isAuthReady} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl shadow-xl mt-4 transition-all hover:scale-[1.02]">{loading ? 'PROCESSING...' : 'JOIN THE CLAN'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

const SwipeableMessage = ({ msg, isMe, onTriggerOptions, activeReactionId, setActiveReactionId, toggleReaction, setReplyTo, users, onShowProfile }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [translateX, setTranslateX] = useState(0);
  
  const senderUser = users.find(u => u.uid === msg.uid);
  const displayUsername = senderUser ? senderUser.username : 'Unknown';
  const displayAvatar = senderUser ? senderUser.avatar : msg.avatar;
  const displayName = senderUser ? senderUser.displayName : msg.displayName;

  const minSwipeDistance = 50; 

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart) {
        const currentX = e.targetTouches[0].clientX;
        const diff = currentX - touchStart;
        if (diff < 0 && diff > -100) { setTranslateX(diff); }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) { onTriggerOptions(msg.id); }
    setTranslateX(0); setTouchStart(null); setTouchEnd(null);
  };

  const isSelected = activeReactionId === msg.id;

  return (
    <div className={`relative ${isMe ? 'flex flex-col items-end' : 'flex flex-col items-start'} overflow-x-clip`}>
       <div 
         className={`flex gap-3 max-w-[95%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} transition-transform duration-200`}
         style={{ transform: `translateX(${translateX}px)` }}
         onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
         onContextMenu={(e) => { e.preventDefault(); onTriggerOptions(msg.id); }}
       >
           {!isMe && (
               <img 
                src={displayAvatar} 
                onClick={() => onShowProfile(msg.uid)}
                className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 object-cover flex-shrink-0 mt-auto cursor-pointer hover:border-emerald-500 transition"
               />
           )}
           <div className="relative group">
               {msg.replyTo && (
                   <div className={`text-[10px] mb-1 px-2 flex items-center gap-1 opacity-60 ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <CornerDownRight size={10}/> Replying to {msg.replyTo.name}
                   </div>
               )}
               <div className={`p-3.5 rounded-2xl shadow-md relative transition-all duration-200 ${isSelected ? 'scale-95 ring-2 ring-emerald-500/50' : ''} ${isMe ? 'bg-white text-black rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'}`}>
                   {msg.replyTo && (
                       <div className={`mb-2 p-1.5 rounded border-l-2 text-[10px] opacity-80 ${isMe ? 'bg-gray-100 border-gray-400 text-gray-600' : 'bg-black/20 border-emerald-500 text-zinc-400'}`}>
                           <p className="font-bold truncate">{msg.replyTo.name}</p>
                           <p className="truncate">{msg.replyTo.text}</p>
                       </div>
                   )}
                   {!isMe && (
                       <div className="flex items-baseline gap-2 mb-1 cursor-pointer" onClick={() => onShowProfile(msg.uid)}>
                           <p className="text-[10px] font-black uppercase text-emerald-400 border-b border-emerald-500/30 hover:border-emerald-400 transition pb-0.5">
                               {displayName}
                           </p>
                           <span className="text-[9px] text-zinc-500 font-mono">@{displayUsername}</span>
                       </div>
                   )}
                   
                   {msg.type === 'sticker' ? (
                       <img src={msg.content} className="w-20 h-20 object-contain drop-shadow-sm" alt="Sticker" />
                   ) : msg.image ? (
                       <img src={msg.image} className="rounded-lg w-full h-auto border border-black/10" />
                   ) : (
                       <p className="text-sm leading-snug whitespace-pre-wrap">{msg.text}</p>
                   )}
                   <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-gray-400' : 'text-zinc-500'}`}>{formatTime(msg.createdAt)}</p>
               </div>
               {msg.reactions && Object.keys(msg.reactions).some(k => msg.reactions[k].length > 0) && (
                   <div className={`absolute -bottom-2.5 ${isMe ? 'right-1' : 'left-1'} flex gap-0.5 z-10`}>
                       {Object.entries(msg.reactions).map(([emoji, users]) => (
                           users.length > 0 && (
                               <span key={emoji} className="bg-zinc-900 border border-zinc-700 text-[9px] px-1 py-0.5 rounded-full text-white shadow-sm flex items-center gap-0.5 animate-in zoom-in">
                                   {emoji} {users.length > 1 && <span className="opacity-60">{users.length}</span>}
                               </span>
                           )
                       ))}
                   </div>
               )}
           </div>
       </div>
       {isSelected && (
           <>
           <div className="fixed inset-0 z-40" onClick={() => setActiveReactionId(null)}></div>
           <div className={`absolute z-50 ${isMe ? 'right-0' : 'left-12'} -top-10 bg-zinc-800 p-1 rounded-full shadow-xl flex gap-1 border border-zinc-600 animate-in fade-in slide-in-from-bottom-2`}>
               {REACTION_EMOJIS.map(emoji => (
                   <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)} className="hover:bg-zinc-700 p-1.5 rounded-full transition hover:scale-125 active:scale-95 text-base leading-none">
                       {emoji}
                   </button>
               ))}
               <div className="w-px bg-zinc-600 mx-1"></div>
               <button onClick={() => { setReplyTo(msg); setActiveReactionId(null); }} className="hover:bg-zinc-700 p-1.5 rounded-full text-zinc-300"><Reply size={14}/></button>
           </div>
           </>
       )}
    </div>
  );
};

const GlobalChat = ({ currentUser, users, onClose, onShowProfile }) => {
  const [msgText, setMsgText] = useState('');
  const [messages, setMessages] = useState([]);
  const [savedStickers, setSavedStickers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [activeReactionId, setActiveReactionId] = useState(null); 
  const [replyTo, setReplyTo] = useState(null);
  const [showStickerHub, setShowStickerHub] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState(null);
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const stickerInputRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, COLLECTION_MESSAGES), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const rawMsgs = snap.docs.map(d => ({id: d.id, ...d.data()}));
      const sorted = rawMsgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setMessages(sorted);
      setTimeout(() => { if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
      const q = query(collection(db, COLLECTION_STICKERS), orderBy('createdAt', 'desc'), limit(20));
      const unsub = onSnapshot(q, (snap) => {
          const stickers = snap.docs.map(d => ({id: d.id, ...d.data()}));
          setSavedStickers(stickers.length > 0 ? stickers : DEFAULT_STICKERS);
      });
      return () => unsub();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => sendToDb({ image: reader.result }); 
        reader.readAsDataURL(file);
    }
  };

  const handleStickerUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setIsSending(true);
      try {
        const compressedSticker = await compressImage(file, 0.7, 150);
        await addDoc(collection(db, COLLECTION_STICKERS), { url: compressedSticker, addedBy: currentUser.displayName, createdAt: serverTimestamp() });
      } catch(err) { console.error(err); }
      finally { setIsSending(false); }
  };

  const sendToDb = async (data) => {
      setIsSending(true);
      try {
        await addDoc(collection(db, COLLECTION_MESSAGES), {
            ...data, 
            uid: currentUser.uid, 
            displayName: currentUser.displayName, 
            avatar: currentUser.avatar, 
            reactions: {}, 
            replyTo: replyTo ? { id: replyTo.id, name: replyTo.displayName, text: replyTo.text || "Media" } : null,
            createdAt: serverTimestamp()
        });
        setMsgText(''); setReplyTo(null); setActiveReactionId(null); setShowStickerHub(false);
      } catch(err) { console.error(err); }
      finally { setIsSending(false); }
  };

  const toggleReaction = async (msgId, emoji) => {
      const msgRef = doc(db, COLLECTION_MESSAGES, msgId);
      const msg = messages.find(m => m.id === msgId);
      if (!msg) return;
      const currentReactions = msg.reactions || {};
      const userList = currentReactions[emoji] || [];
      const newUserList = userList.includes(currentUser.uid) ? userList.filter(id => id !== currentUser.uid) : [...userList, currentUser.uid];
      await updateDoc(msgRef, { [`reactions.${emoji}`]: newUserList });
      setActiveReactionId(null);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950/95 backdrop-blur-xl flex flex-col animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex justify-between items-center safe-top">
           <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
               <div>
                   <h3 className="text-white font-black text-lg tracking-widest flex items-center gap-2">
                       <MessageSquareCode size={20} className="text-emerald-500"/> CLAN COMMS
                   </h3>
                   <p className="text-[10px] text-zinc-500 font-mono uppercase">Secure Channel // {users.length} Agents Online</p>
               </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition bg-zinc-900 border border-zinc-800"><Minimize2 size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" ref={scrollRef}>
           {messages.length === 0 && <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4"><Wifi size={48} className="animate-pulse"/><p className="text-xs uppercase tracking-widest">Frequency Open...</p></div>}
           {messages.map(msg => (
               <SwipeableMessage 
                key={msg.id} 
                msg={msg} 
                isMe={msg.uid === currentUser.uid} 
                activeReactionId={activeReactionId} 
                onTriggerOptions={(id) => setActiveReactionId(id)} 
                toggleReaction={toggleReaction} 
                setReplyTo={setReplyTo} 
                setActiveReactionId={setActiveReactionId}
                users={users}
                onShowProfile={onShowProfile}
               />
           ))}
           {isSending && <div className="flex justify-center"><Loader2 size={16} className="text-emerald-500 animate-spin"/></div>}
      </div>

      {showStickerHub && (
          <div className="bg-zinc-900 border-t border-zinc-800 p-4 h-48 flex flex-col animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sticker Vault</span>
                  <button onClick={() => stickerInputRef.current.click()} className="text-[10px] flex items-center gap-1 text-emerald-500 hover:text-white transition font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20"><Plus size={12}/> UPLOAD NEW</button>
                  <input type="file" ref={stickerInputRef} className="hidden" accept="image/*" onChange={handleStickerUpload}/>
              </div>
              <div className="grid grid-cols-5 md:grid-cols-8 gap-3 overflow-y-auto custom-scrollbar">
                  {savedStickers.map(s => (<button key={s.id} onClick={() => sendToDb({ type: 'sticker', content: s.url })} className="hover:bg-zinc-800 p-2 rounded-xl transition flex items-center justify-center aspect-square border border-transparent hover:border-zinc-700 bg-zinc-950"><img src={s.url} className="w-full h-full object-contain" /></button>))}
              </div>
          </div>
      )}

      <div className="bg-zinc-900 border-t border-zinc-800 pb-safe p-2 md:p-4">
           {replyTo && (<div className="bg-zinc-800/80 px-4 py-2 flex justify-between items-center border-b border-zinc-700/50 animate-in slide-in-from-bottom-2 mb-2 rounded-t-xl mx-2"><div className="border-l-2 border-emerald-500 pl-3"><p className="text-emerald-500 text-xs font-bold">Reply to {replyTo.displayName}</p><p className="text-zinc-400 text-xs truncate max-w-[200px]">{replyTo.text || 'Media'}</p></div><button onClick={() => setReplyTo(null)}><X size={16} className="text-zinc-500 hover:text-white"/></button></div>)}
           <form onSubmit={(e) => { e.preventDefault(); sendToDb({ text: msgText }); }} className="flex gap-2 items-end max-w-4xl mx-auto w-full">
               <button type="button" onClick={() => fileInputRef.current.click()} className="text-zinc-400 hover:text-white p-3 bg-zinc-800 rounded-2xl transition active:scale-95 border border-zinc-700 hover:border-zinc-500"><ImageIcon size={20}/></button>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
               <div className="flex-1 bg-black border border-zinc-700 rounded-2xl px-4 py-3 flex items-center focus-within:border-emerald-500 transition shadow-inner">
                   <input autoFocus className="bg-transparent text-white text-sm w-full outline-none placeholder:text-zinc-600" placeholder="Type a message..." value={msgText} onChange={e => setMsgText(e.target.value)}/>
                   <button type="button" onClick={() => setShowStickerHub(!showStickerHub)} className={`ml-2 transition ${showStickerHub ? 'text-emerald-500' : 'text-zinc-500 hover:text-white'}`}><Sticker size={20}/></button>
               </div>
               <button disabled={isSending} className={`p-3 rounded-2xl transition shadow-lg ${msgText.trim() || isSending ? 'bg-emerald-600 text-white hover:scale-105 active:scale-95' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}><Send size={20} /></button>
           </form>
      </div>

      {viewingProfileId && <AgentDossier userId={viewingProfileId} users={users} onClose={() => setViewingProfileId(null)} />}
    </div>
  );
};

// ANNOUNCEMENTS WIDGET
const AnnouncementsWidget = ({ announcements, isAdmin, logActivity }) => {
    const [text, setText] = useState('');
    const postAnnouncement = async (e) => { e.preventDefault(); if(!text) return; await addDoc(collection(db, COLLECTION_ANNOUNCEMENTS), { text, createdAt: serverTimestamp(), active: true }); logActivity('Posted announcement'); setText(''); };
    const deleteAnnounce = async (id) => { await deleteDoc(doc(db, COLLECTION_ANNOUNCEMENTS, id)); };
    const latest = announcements && announcements.length > 0 ? announcements[0] : null;
    return (
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-6 rounded-3xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Megaphone size={100} className="text-white"/></div>
            <div className="relative z-10">
                <h3 className="text-indigo-300 font-black uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><Megaphone size={14}/> HQ Broadcast</h3>
                {latest ? (<div className="flex justify-between items-start"><p className="text-white text-lg md:text-2xl font-bold leading-tight max-w-2xl">"{latest.text}"</p>{isAdmin && <button onClick={() => deleteAnnounce(latest.id)} className="text-zinc-500 hover:text-red-400"><Trash2 size={16}/></button>}</div>) : <p className="text-zinc-500 italic">No active broadcasts.</p>}
                {isAdmin && (<form onSubmit={postAnnouncement} className="mt-6 flex gap-2"><input className="flex-1 bg-black/30 border border-indigo-500/30 rounded-xl px-4 py-2 text-sm text-white placeholder:text-indigo-300/50 focus:border-indigo-400 outline-none" placeholder="New Announcement..." value={text} onChange={e => setText(e.target.value)} /><button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase">Post</button></form>)}
            </div>
        </div>
    );
};

// MOVIE & POLL COMPONENTS
const MovieNightAdmin = ({ logActivity }) => {
  const [movie, setMovie] = useState({ title: '', date: '', time: '', desc: '', image: '' });
  const [pollQ, setPollQ] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [saveStatus, setSaveStatus] = useState('idle'); 
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setMovie(prev => ({ ...prev, image: reader.result })); reader.readAsDataURL(file); }
  };
  const handleUpdateMovie = async (e) => { 
      e.preventDefault(); 
      setSaveStatus('saving');
      const formattedTime = `${movie.date} @ ${movie.time}`; 
      await addDoc(collection(db, COLLECTION_SCREENINGS), { ...movie, time: formattedTime, createdAt: serverTimestamp() }); 
      logActivity(`Updated Movie: ${movie.title}`); 
      setMovie({ title: '', date: '', time: '', desc: '', image: '' }); 
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
  };
  const handleLaunchPoll = async (e) => { e.preventDefault(); const validOptions = pollOptions.filter(o => o.trim() !== '').map(text => ({ text, votes: 0 })); await addDoc(collection(db, COLLECTION_POLLS), { question: pollQ, options: validOptions, votedBy: [], status: 'active', createdAt: serverTimestamp() }); logActivity(`Launched poll`); setPollQ(''); setPollOptions(['', '']); alert("Live!"); };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm">
         <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><Film className="text-purple-500"/> NEXT SCREENING</h2>
         <form onSubmit={handleUpdateMovie} className="space-y-5">
            <div className="flex gap-4">
                 {movie.image ? (<div className="w-24 h-32 bg-cover bg-center rounded-lg border border-zinc-700" style={{ backgroundImage: `url(${movie.image})` }}></div>) : (<div onClick={() => fileInputRef.current.click()} className="w-24 h-32 bg-black/50 border border-zinc-700 border-dashed rounded-lg flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:border-purple-500 hover:text-purple-500 transition"><ImageIcon size={20} /><span className="text-[10px] mt-1">COVER</span></div>)}
                 <div className="flex-1 space-y-3">
                    <input className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none" placeholder="Movie Title" value={movie.title} onChange={e=>setMovie({...movie, title: e.target.value})} required/>
                    <div className="flex gap-2">
                        <input type="date" className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none text-sm" value={movie.date} onChange={e=>setMovie({...movie, date: e.target.value})} required/>
                        <input type="time" className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white focus:border-purple-500 outline-none text-sm" value={movie.time} onChange={e=>setMovie({...movie, time: e.target.value})} required/>
                    </div>
                 </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <textarea className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white h-32 focus:border-purple-500 outline-none" placeholder="Hype Text..." value={movie.desc} onChange={e=>setMovie({...movie, desc: e.target.value})} required/>
            <button disabled={saveStatus !== 'idle'} className={`w-full font-bold py-4 rounded-xl transition uppercase tracking-wider flex items-center justify-center gap-2 ${saveStatus === 'success' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-purple-50'}`}>{saveStatus === 'success' ? <><CheckCircle size={18}/> PUBLISHED SUCCESSFULLY</> : (saveStatus === 'saving' ? 'BROADCASTING...' : 'BROADCAST SIGNAL')}</button>
         </form>
      </div>
      <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm">
         <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><BarChart2 className="text-emerald-500"/> NEW POLL</h2>
         <form onSubmit={handleLaunchPoll} className="space-y-5">
            <input className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white focus:border-emerald-500 outline-none" placeholder="Question" value={pollQ} onChange={e=>setPollQ(e.target.value)} required/>
            <div className="space-y-3">{pollOptions.map((opt, idx) => (<input key={idx} className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" placeholder={`Option ${idx+1}`} value={opt} onChange={e => { const newOpts = [...pollOptions]; newOpts[idx] = e.target.value; setPollOptions(newOpts); }}/>))}</div>
            <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="text-xs text-zinc-400 hover:text-white font-bold uppercase tracking-wider">+ Add Option</button>
            <button className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-500 transition uppercase tracking-wider">Go Live</button>
         </form>
      </div>
    </div>
  );
};

const MovieDisplayWidget = ({ screening }) => {
  if (!screening) return <div className="bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800 p-10 text-center text-zinc-600 h-full flex flex-col items-center justify-center"><Film size={64} className="mx-auto mb-4 opacity-20"/><p className="font-bold tracking-widest text-sm">NO SIGNAL</p></div>;
  const bgImage = screening.image || `https://source.unsplash.com/random/800x600/?cinema,movie,dark`;
  return (
    <div className="bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden relative group h-full shadow-2xl">
       <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition duration-1000 group-hover:scale-105" style={{ backgroundImage: `url(${bgImage})` }}></div>
       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
       <div className="p-8 relative z-20 flex flex-col h-full justify-end">
          <div className="flex justify-between items-start mb-auto"><span className="bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Friday Movie Night</span></div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mt-4 mb-2 drop-shadow-xl leading-tight">{screening.title}</h2>
          <div className="flex items-center gap-3 text-purple-300 font-mono text-sm mb-4 bg-black/40 w-fit px-3 py-1 rounded-lg border border-white/10 backdrop-blur-md"><Clock size={14}/> <span>{screening.time}</span></div>
          <p className="text-zinc-300 text-sm leading-relaxed max-w-lg line-clamp-3">{screening.desc}</p>
       </div>
    </div>
  );
};

const PollWidget = ({ poll, currentUser, logActivity }) => {
  if (!poll) return null;
  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
  const hasVoted = poll.votedBy.includes(currentUser.uid);
  const handleVote = async (optionText) => {
    if (hasVoted) return;
    const updatedOptions = poll.options.map(o => o.text === optionText ? { ...o, votes: o.votes + 1 } : o);
    await updateDoc(doc(db, COLLECTION_POLLS, poll.id), { options: updatedOptions, votedBy: [...poll.votedBy, currentUser.uid] });
    logActivity(`Voted in poll`);
  };
  return (
    <div className="bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-800 p-8 h-full flex flex-col shadow-xl">
       <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-white flex items-center gap-3"><Vote className="text-blue-500"/> VOTE</h3><span className="text-[10px] font-mono text-zinc-500 bg-black px-2 py-1 rounded border border-zinc-800">{totalVotes} VOTES</span></div>
       <p className="text-white font-bold mb-6 text-lg leading-tight">{poll.question}</p>
       <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">{poll.options.map((opt, idx) => { const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100); return (<div key={idx} className="relative">{hasVoted ? (<div className="w-full bg-black rounded-xl h-12 relative overflow-hidden border border-zinc-800"><div className="absolute top-0 left-0 h-full bg-blue-600/20 transition-all duration-1000" style={{ width: `${percentage}%` }}></div><div className="absolute inset-0 flex items-center justify-between px-5"><span className="font-bold text-white text-sm">{opt.text}</span><span className="font-mono text-blue-400 font-bold">{percentage}%</span></div></div>) : (<button onClick={() => handleVote(opt.text)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-left px-5 py-4 rounded-xl transition font-bold flex justify-between group border border-transparent hover:border-zinc-600 text-sm">{opt.text}<span className="opacity-0 group-hover:opacity-100 transition text-blue-400 text-[10px] uppercase tracking-wider font-black">Select</span></button>)}</div>); })}</div>
    </div>
  );
};

const AvatarSelector = ({ currentAvatar, onSelect }) => {
  const [style, setStyle] = useState('avataaars');
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));
  const previews = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({ id: i, url: `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}-${i}` })), [style, seed]);
  return (
    <div className="bg-black/30 p-6 rounded-2xl border border-zinc-700/50 mt-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-6"><h4 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Smile size={16} className="text-purple-500"/> Identity Module</h4><button onClick={() => setSeed(Math.random().toString(36))} className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition"><RefreshCw size={12} /> REROLL</button></div>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">{AVATAR_STYLES.map(s => <button key={s.id} onClick={() => setStyle(s.id)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition whitespace-nowrap ${style === s.id ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{s.name}</button>)}</div>
      <div className="grid grid-cols-3 gap-4">{previews.map((item) => (<button key={item.id} onClick={() => onSelect(item.url)} className="aspect-square rounded-xl bg-white border-2 border-transparent hover:border-purple-500 overflow-hidden relative group transition-all shadow-lg hover:shadow-purple-500/20"><img src={item.url} className="w-full h-full object-cover" loading="lazy" />{currentAvatar === item.url && <div className="absolute inset-0 bg-purple-600/50 flex items-center justify-center backdrop-blur-sm animate-in zoom-in"><CheckCircle className="text-white w-8 h-8" /></div>}</button>))}</div>
    </div>
  );
};

const ProfileSettings = ({currentUser, logActivity, setSuccessMessage}) => {
  const [data, setData] = useState(currentUser || { displayName: '', bio: '', avatar: '' });
  const [showAv, setShowAv] = useState(false);

  useEffect(() => { if (currentUser) setData(currentUser); }, [currentUser]);

  const save = async (e) => { 
    e.preventDefault(); 
    await updateDoc(doc(db, COLLECTION_USERS, currentUser.uid), { displayName: data.displayName, bio: data.bio || '', avatar: data.avatar }); 
    logActivity(`Updated profile`); 
    setSuccessMessage("IDENTITY UPDATED");
    setTimeout(() => setSuccessMessage(""), 2000);
    setShowAv(false); 
  };

  if (!data) return <div className="text-zinc-500">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-zinc-900 p-10 rounded-3xl border border-zinc-800">
       <div className="flex items-center gap-6 mb-8">
           <div className="w-24 h-24 rounded-2xl bg-white border-4 border-zinc-800 overflow-hidden shadow-2xl relative"><img src={data.avatar} className="w-full h-full object-cover"/></div>
           <div><h3 className="text-white font-bold text-xl">{data.displayName}</h3><button onClick={()=>setShowAv(!showAv)} className="text-purple-400 text-xs font-bold uppercase tracking-wider hover:text-white mt-2">Change Appearance</button></div>
       </div>
       {showAv && <AvatarSelector currentAvatar={data.avatar} onSelect={(url) => { setData({...data, avatar: url}); setShowAv(false); }} />}
       <form onSubmit={save} className="space-y-6 mt-6">
         <div><label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Codename</label><input value={data.displayName || ''} onChange={e=>setData({...data, displayName:e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none"/></div>
         <div><label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Bio / Status</label><textarea value={data.bio || ''} onChange={e=>setData({...data, bio:e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none h-32 resize-none"/></div>
         <button className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-purple-50 transition w-full">Save Identity</button>
       </form>
    </div>
  );
};

const TeamManager = ({ users, currentUser, logActivity, onShowProfile }) => {
  const handleDelete = async (user) => { if(confirm(`Remove ${user.displayName}?`)) { await deleteDoc(doc(db, COLLECTION_USERS, user.uid)); logActivity(`Removed user: ${user.displayName}`); }};
  return (
    <div className="max-w-7xl mx-auto"><div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-black text-white flex items-center gap-3"><Users className="text-amber-500" /> CLAN ROSTER</h2><span className="text-xs text-zinc-500 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 font-bold uppercase tracking-widest">Active: {users.length}</span></div><div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">{users.map(u => (<div key={u.uid} className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 hover:border-purple-500/30 transition group flex flex-col items-center text-center gap-4 relative"><div className="w-20 h-20 rounded-full bg-black border-2 border-zinc-700 overflow-hidden group-hover:scale-110 transition shadow-xl cursor-pointer" onClick={() => onShowProfile(u.uid)}><img src={u.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.uid}`} className="w-full h-full object-cover"/></div><div><p className="text-white font-black text-lg flex items-center justify-center gap-2 cursor-pointer hover:text-emerald-400 transition" onClick={() => onShowProfile(u.uid)}>{u.displayName || 'Unknown Agent'}{u.uid === currentUser.uid && <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded">YOU</span>}</p><p className="text-xs text-purple-400 font-mono mt-1 uppercase tracking-widest">{u.role || 'N/A'}</p><p className="text-xs text-zinc-600 mt-2">@{u.username || '---'}</p></div>{currentUser.role === 'admin' && u.uid !== currentUser.uid && (<button onClick={() => handleDelete(u)} className="mt-2 p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition w-full flex justify-center"><Trash2 size={16} /></button>)}</div>))}</div></div>
  );
};

// --- UPDATED BOOKING SYSTEM (ARMORY & LABS) ---
const BookingSystem = ({ currentUser, bookings, users, requests, logActivity, productionStatus }) => {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [requestingResId, setRequestingResId] = useState(null); 
  const [requestMessage, setRequestMessage] = useState('');
  
  // New Booking Modal State
  const [bookingModal, setBookingModal] = useState(null); // { resource, dateStr }
  const [bookingPurpose, setBookingPurpose] = useState('Learning');
  const [bookingDesc, setBookingDesc] = useState('');

  const bookingsForDate = useMemo(() => bookings.filter(b => b.dateStr === selectedDate && b.status === 'active'), [bookings, selectedDate]);
  
  // Filter for requests sent TO Ray (admin only)
  const adminRequests = useMemo(() => {
      if (currentUser.role !== 'admin') return [];
      return requests.filter(r => r.ownerId === 'RAY_ADMIN' && r.status === 'pending');
  }, [requests, currentUser.role]);

  // COOLDOWN LOGIC
  const checkCooldown = (resourceId, userId, targetDateStr) => {
      // Admins bypass cooldown
      if (currentUser.role === 'admin' || currentUser.role === 'staff') return true;

      const target = new Date(targetDateStr);
      const oneDayBefore = new Date(target); oneDayBefore.setDate(target.getDate() - 1);
      const twoDaysBefore = new Date(target); twoDaysBefore.setDate(target.getDate() - 2);

      const str1 = formatDate(oneDayBefore);
      const str2 = formatDate(twoDaysBefore);

      const bookedYesterday = bookings.some(b => b.userId === userId && b.resourceId === resourceId && b.dateStr === str1 && b.status === 'active');
      const bookedDayBefore = bookings.some(b => b.userId === userId && b.resourceId === resourceId && b.dateStr === str2 && b.status === 'active');

      if (bookedYesterday && bookedDayBefore) {
          return false; // Blocked
      }
      return true; // Allowed
  };

  const initiateBooking = (resource) => {
      if (!productionStatus) return;
      
      const isAllowed = checkCooldown(resource.id, currentUser.uid, selectedDate);
      if (!isAllowed) {
          alert("COOLDOWN ACTIVE: You have booked this asset for 2 consecutive days. Take a 24h break or ask an Admin to override.");
          return;
      }

      // Open Modal
      setBookingModal({ resource, dateStr: selectedDate });
      setBookingPurpose('Learning');
      setBookingDesc('');
  };

  const confirmBooking = async (e) => {
      e.preventDefault();
      if (!bookingModal) return;

      await addDoc(collection(db, COLLECTION_BOOKINGS), { 
          resourceId: bookingModal.resource.id, 
          resourceName: bookingModal.resource.name, 
          userId: currentUser.uid, 
          userName: currentUser.displayName, 
          startTime: serverTimestamp(), 
          status: 'active', 
          dateStr: bookingModal.dateStr,
          purpose: bookingPurpose,
          description: bookingDesc
      }); 
      
      logActivity(`Booked ${bookingModal.resource.name} for ${bookingPurpose}`);
      setBookingModal(null);
  };

  const handleRelease = async (bookingId, resName) => {
      await deleteDoc(doc(db, COLLECTION_BOOKINGS, bookingId)); 
      logActivity(`Released ${resName}`); 
  };

  const sendRequest = async (resource, booking) => {
    if(!requestMessage.trim()) return;
    const ownerId = booking ? booking.userId : 'RAY_ADMIN'; // Default to Ray for empty edit bay
    await addDoc(collection(db, COLLECTION_REQUESTS), { bookingId: booking ? booking.id : 'DIRECT_REQ', resourceId: resource.id, resourceName: resource.name, requesterId: currentUser.uid, requesterName: currentUser.displayName, requesterAvatar: currentUser.avatar, ownerId: ownerId, message: requestMessage, status: 'pending', timestamp: serverTimestamp() }); setRequestingResId(null); setRequestMessage(''); alert(`Request sent to ${resource.owner || 'Occupant'}!`);
  };

  const handleHandover = async (request, booking) => { 
      await updateDoc(doc(db, COLLECTION_BOOKINGS, booking.id), { userId: request.requesterId, userName: request.requesterName }); 
      await updateDoc(doc(db, COLLECTION_REQUESTS, request.id), { status: 'approved' }); 
      logActivity(`Handed over ${booking.resourceName}`); 
  };

  // ADMIN ACTION: Grant access to Edit Bay
  const grantAccess = async (req) => {
      // 1. Create a booking for the requester
      await addDoc(collection(db, COLLECTION_BOOKINGS), {
          resourceId: req.resourceId,
          resourceName: req.resourceName,
          userId: req.requesterId,
          userName: req.requesterName,
          startTime: serverTimestamp(),
          status: 'active',
          dateStr: selectedDate, // Grants access for TODAY/Selected Date
          purpose: 'Approved Request',
          description: req.message
      });
      // 2. Mark request as approved
      await updateDoc(doc(db, COLLECTION_REQUESTS, req.id), { status: 'approved' });
      logActivity(`Ray granted access to ${req.requesterName}`);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3"><Clock className="text-purple-500" /> ARMORY & LABS</h2>
          <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
              <span className="text-xs text-zinc-500 pl-2 font-bold uppercase">Target Date</span>
              <input type="date" value={selectedDate} min={formatDate(new Date())} onChange={(e) => setSelectedDate(e.target.value)} className="bg-black text-white border border-zinc-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-purple-500"/>
          </div>
      </div>
      
      {!productionStatus && (
          <div className="bg-amber-900/20 border border-amber-500/30 p-6 rounded-2xl mb-8 flex items-center justify-center gap-4 animate-pulse">
              <Factory size={32} className="text-amber-500" />
              <div>
                  <h3 className="text-amber-500 font-black text-lg uppercase tracking-widest">Production Halted</h3>
                  <p className="text-amber-200/60 text-xs">Armory access is currently locked by Administration.</p>
              </div>
          </div>
      )}

      {/* ADMIN INBOX (RAY'S REQUESTS) */}
      {currentUser.role === 'admin' && adminRequests.length > 0 && (
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-6 rounded-2xl mb-8 animate-in slide-in-from-top-4">
              <h3 className="text-blue-400 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2"><Unlock size={16}/> Clearance Requests (Ray)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminRequests.map(req => (
                      <div key={req.id} className="bg-black/60 p-4 rounded-xl border border-blue-500/20 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                              <img src={req.requesterAvatar} className="w-8 h-8 rounded-full bg-zinc-800" />
                              <div>
                                  <p className="text-white font-bold text-sm">{req.requesterName}</p>
                                  <p className="text-zinc-400 text-xs italic">"{req.message}"</p>
                              </div>
                          </div>
                          <div className="flex gap-2 mt-auto">
                              <button onClick={() => grantAccess(req)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition uppercase tracking-wider">Grant Access</button>
                              <button onClick={() => deleteDoc(doc(db, COLLECTION_REQUESTS, req.id))} className="px-3 bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 rounded-lg transition"><X size={14}/></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESOURCES.map(res => {
          const activeBooking = bookingsForDate.find(b => b.resourceId === res.id);
          const isMine = activeBooking?.userId === currentUser.uid;
          const bookedByUser = activeBooking ? users.find(u => u.uid === activeBooking.userId) : null;
          const pendingRequests = activeBooking && isMine ? requests.filter(r => r.bookingId === activeBooking.id && r.status === 'pending') : [];
          
          return (
            <div key={res.id} className={`relative p-6 rounded-3xl border-2 transition-all duration-300 group ${!productionStatus ? 'opacity-50 grayscale' : ''} ${activeBooking ? 'bg-zinc-900/50 border-red-900/30' : 'bg-zinc-900 border-zinc-800 hover:border-purple-500/50'}`}>
              <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${activeBooking ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}><res.icon size={28} /></div>
                  {activeBooking ? <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse border border-red-500/20">LOCKED</span> : <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">READY</span>}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{res.name}</h3>
              <p className="text-xs text-zinc-500 mb-6 font-mono uppercase">{res.desc}</p>
              
              {activeBooking && (
                  <div className="mb-6">
                      <div className="bg-black/40 rounded-xl p-3 border border-zinc-800 flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700"><img src={bookedByUser?.avatar} className="w-full h-full object-cover"/></div>
                              <div>
                                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Operator</p>
                                  <p className="text-sm font-bold text-white truncate">{bookedByUser?.displayName}</p>
                              </div>
                          </div>
                          {activeBooking.purpose && (
                              <div className="mt-1 pt-2 border-t border-zinc-800/50">
                                  <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold">{activeBooking.purpose}</span>
                                  <p className="text-xs text-zinc-300 mt-1 italic line-clamp-2">"{activeBooking.description}"</p>
                              </div>
                          )}
                      </div>
                      {isMine && pendingRequests.map(req => (<div key={req.id} className="mt-3 bg-amber-900/10 p-3 rounded-xl border border-amber-500/20"><p className="text-xs text-amber-200 mb-2 font-mono">REQ: "{req.message}"</p><button onClick={() => handleHandover(req, activeBooking)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition">AUTHORIZE HANDOVER</button></div>))}
                  </div>
              )}

              <div className="mt-auto">
                  {res.restricted ? (
                      // RESTRICTED EDIT BAY LOGIC
                      requestingResId === res.id ? (
                          <div className="flex gap-2">
                              <input autoFocus className="flex-1 bg-black text-white text-xs p-3 rounded-xl border border-zinc-700 outline-none focus:border-purple-500" placeholder={`Message ${res.owner}...`} value={requestMessage} onChange={e=>setRequestMessage(e.target.value)} disabled={!productionStatus}/>
                              <button onClick={() => sendRequest(res, activeBooking)} className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 rounded-xl font-bold" disabled={!productionStatus}><Send size={14}/></button>
                          </div>
                      ) : (
                          <button onClick={() => setRequestingResId(res.id)} disabled={!productionStatus || activeBooking} className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 ${activeBooking ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}>
                              <Lock size={14}/> {activeBooking ? 'Occupied' : `Request ${res.owner}`}
                          </button>
                      )
                  ) : (
                      // STANDARD ARMORY LOGIC
                      activeBooking ? (
                          // If mine, allow release. If Admin, allow forced release (clears cooldown for user essentially).
                          (isMine || currentUser.role === 'admin') ? 
                              <button onClick={() => handleRelease(activeBooking.id, res.name)} className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition">
                                  {isMine ? 'Release System' : 'Override Release'}
                              </button> 
                          : ( requestingResId === res.id ? (<div className="flex gap-2"><input autoFocus className="flex-1 bg-black text-white text-xs p-3 rounded-xl border border-zinc-700 outline-none focus:border-purple-500" placeholder="Reason..." value={requestMessage} onChange={e=>setRequestMessage(e.target.value)}/><button onClick={() => sendRequest(res, activeBooking)} className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 rounded-xl font-bold"><Send size={14}/></button></div>) : <button onClick={() => setRequestingResId(res.id)} className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition">Request Access</button>)
                      ) : (
                          <button onClick={() => initiateBooking(res)} disabled={!productionStatus} className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg ${!productionStatus ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-white text-black hover:bg-purple-50 shadow-white/10'}`}>Secure Asset</button>
                      )
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BOOKING MODAL */}
      {bookingModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in">
              <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
                  <button onClick={() => setBookingModal(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-xl font-black text-white mb-1 uppercase">Confirm Reservation</h3>
                  <p className="text-zinc-500 text-xs font-mono mb-6">{bookingModal.resource.name} // {bookingModal.dateStr}</p>
                  
                  <form onSubmit={confirmBooking} className="space-y-4">
                      <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Operation Type</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['Learning', 'Paid Work', 'Office Production'].map(type => (
                                  <button 
                                      type="button" 
                                      key={type}
                                      onClick={() => setBookingPurpose(type)} 
                                      className={`p-2 rounded-xl text-[10px] font-bold uppercase transition border ${bookingPurpose === type ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                                  >
                                      {type === 'Learning' && <GraduationCap size={14} className="mx-auto mb-1"/>}
                                      {type === 'Paid Work' && <WorkIcon size={14} className="mx-auto mb-1"/>}
                                      {type === 'Office Production' && <Building2 size={14} className="mx-auto mb-1"/>}
                                      {type}
                                  </button>
                              ))}
                          </div>
                      </div>
                      
                      <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Intel / Description</label>
                          <textarea 
                              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none h-24 resize-none placeholder:text-zinc-700" 
                              placeholder="Describe your task (e.g. Rendering Scene 04, Learning Blender nodes...)"
                              value={bookingDesc}
                              onChange={(e) => setBookingDesc(e.target.value)}
                              required
                          />
                      </div>

                      <button className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-emerald-400 transition">Confirm Booking</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

// PROJECT TRACKER
const ProjectTracker = ({ projects, users, isAdmin, logActivity, currentUser, setSuccessMessage, navigatedProject, resetNavigatedProject }) => {
  const [view, setView] = useState('list'); 
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProj, setNewProj] = useState({ title: '', type: 'Production', startDate: '', endDate: '', callTime: '', callLocation: '', assignments: {} });
  
  // State for form
  const [projForm, setProjForm] = useState({
      title: '', 
      type: 'Production', 
      startDate: '', 
      endDate: '', 
      callTime: '', 
      callLocation: '', 
      crew: [] 
  });

  const [crewList, setCrewList] = useState([]); 
  const [editingRoleIndex, setEditingRoleIndex] = useState(null); 
  
  // Call sheet upload
  const callSheetInputRef = useRef(null);
  const [callSheetLink, setCallSheetLink] = useState('');

  // Handle direct navigation from dashboard
  useEffect(() => {
      if (navigatedProject) {
          setSelectedProject(navigatedProject);
          setView('details');
          resetNavigatedProject();
      }
  }, [navigatedProject, resetNavigatedProject]);

  useEffect(() => {
      if (view === 'create') {
          const templates = ROLE_TEMPLATES[projForm.type] || ROLE_TEMPLATES['Custom'];
          const initialCrew = templates.map((roleName, idx) => ({
              id: Date.now() + idx,
              roleName: roleName,
              userId: ''
          }));
          setCrewList(initialCrew);
      }
  }, [projForm.type, view]);

  useEffect(() => {
      if (view === 'edit' && selectedProject) {
          setProjForm({
              title: selectedProject.title,
              type: selectedProject.type,
              startDate: selectedProject.startDate,
              endDate: selectedProject.endDate,
              callTime: selectedProject.callTime,
              callLocation: selectedProject.callLocation,
              crew: selectedProject.crew || []
          });
          if (selectedProject.assignments && (!selectedProject.crew || selectedProject.crew.length === 0)) {
              const convertedCrew = Object.entries(selectedProject.assignments).map(([role, uid], idx) => ({
                  id: Date.now() + idx, roleName: role, userId: uid
              }));
              setCrewList(convertedCrew);
          } else {
              setCrewList(selectedProject.crew || []);
          }
      }
  }, [view, selectedProject]);

  const calculateProgress = (start, end) => { if (!start || !end) return 0; const now = new Date().getTime(); const s = new Date(start).getTime(); const e = new Date(end).getTime(); if (now < s) return 0; if (now > e) return 100; return Math.round(((now - s) / (e - s)) * 100); };

  const handleSaveProject = async (e) => {
      e.preventDefault();
      const projectData = {
          ...projForm,
          crew: crewList, 
          progress: 0,
          status: 'Active',
          updatedAt: serverTimestamp()
      };

      if (view === 'create') {
          await addDoc(collection(db, COLLECTION_PROJECTS), { ...projectData, setbacks: [], dataLogs: [], callSheets: [], createdAt: serverTimestamp() });
          logActivity(`Initiated Mission: ${projForm.title}`);
      } else if (view === 'edit' && selectedProject) {
          await updateDoc(doc(db, COLLECTION_PROJECTS, selectedProject.id), projectData);
          logActivity(`Updated Mission: ${projForm.title}`);
      }
      setView('list');
      setProjForm({ title: '', type: 'Production', startDate: '', endDate: '', callTime: '', callLocation: '', crew: [] });
  };

  const handleDeleteProject = async () => {
      if (!selectedProject) return;
      if (confirm(`ABORT MISSION: ${selectedProject.title}? This cannot be undone.`)) {
          await deleteDoc(doc(db, COLLECTION_PROJECTS, selectedProject.id));
          logActivity(`Aborted Mission: ${selectedProject.title}`);
          setView('list');
          setSelectedProject(null);
      }
  };

  const handleAddDataLog = async (e, project) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newLog = { id: Date.now(), cardId: formData.get('cardId'), location: formData.get('location'), notes: formData.get('notes'), copiedBy: currentUser.displayName, timestamp: new Date().toISOString() };
      const updatedLogs = [...(project.dataLogs || []), newLog];
      await updateDoc(doc(db, COLLECTION_PROJECTS, project.id), { dataLogs: updatedLogs });
      e.target.reset();
  };
  const [setbackSuccess, setSetbackSuccess] = useState(false);
  const onSetbackSubmit = async (e, project) => { e.preventDefault(); await handleAddSetback(e.target.setback.value, project); e.target.reset(); setSetbackSuccess(true); setTimeout(() => setSetbackSuccess(false), 2000); };
  const handleAddSetback = async (text, project) => { const newSetback = { id: Date.now(), text, date: new Date().toISOString(), status: 'Active' }; const updatedSetbacks = [...(project.setbacks || []), newSetback]; await updateDoc(doc(db, COLLECTION_PROJECTS, project.id), { setbacks: updatedSetbacks }); logActivity(`Reported setback in ${project.title}`); };

  // Call Sheet Logic
  const handleCallSheetUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const newSheet = { id: Date.now(), name: file.name, type: 'file', url: reader.result, uploadedBy: currentUser.displayName, date: new Date().toISOString() };
              const updatedSheets = [...(selectedProject.callSheets || []), newSheet];
              await updateDoc(doc(db, COLLECTION_PROJECTS, selectedProject.id), { callSheets: updatedSheets });
              logActivity(`Uploaded Call Sheet: ${file.name}`);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddCallSheetLink = async () => {
      if (!callSheetLink.trim()) return;
      const newSheet = { id: Date.now(), name: 'External Call Sheet', type: 'link', url: callSheetLink, uploadedBy: currentUser.displayName, date: new Date().toISOString() };
      const updatedSheets = [...(selectedProject.callSheets || []), newSheet];
      await updateDoc(doc(db, COLLECTION_PROJECTS, selectedProject.id), { callSheets: updatedSheets });
      setCallSheetLink('');
      logActivity(`Linked Call Sheet`);
  };

  const handleDeleteCallSheet = async (sheetId) => {
      const updatedSheets = (selectedProject.callSheets || []).filter(s => s.id !== sheetId);
      await updateDoc(doc(db, COLLECTION_PROJECTS, selectedProject.id), { callSheets: updatedSheets });
  };

  const updateCrewMember = (idx, field, value) => {
      const updated = [...crewList];
      updated[idx][field] = value;
      setCrewList(updated);
  };

  const addCustomRole = () => {
      setCrewList([...crewList, { id: Date.now(), roleName: 'New Role', userId: '' }]);
      setEditingRoleIndex(crewList.length); 
  };

  const removeRole = (idx) => {
      setCrewList(crewList.filter((_, i) => i !== idx));
  };

  const isAssignedToProject = selectedProject ? (
      (selectedProject.crew && selectedProject.crew.some(c => c.userId === currentUser.uid)) ||
      (selectedProject.assignments && Object.values(selectedProject.assignments).includes(currentUser.uid))
  ) : false;

  if (view === 'create' || view === 'edit') return (
    <div className="bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-800 animate-in fade-in zoom-in-95">
       <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
           <button onClick={() => setView(view === 'edit' ? 'details' : 'list')} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition"><ArrowLeft size={20} /></button>
           <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">{view === 'create' ? 'Initialize Mission' : 'Modify Mission Parameters'}</h2>
       </div>
       <form onSubmit={handleSaveProject} className="space-y-8 max-w-4xl">
          <div className="space-y-4">
              <input className="w-full bg-black p-4 rounded-xl border border-zinc-800 text-white focus:border-white outline-none text-lg font-bold" placeholder="Operation Name" value={projForm.title} onChange={e=>setProjForm({...projForm, title: e.target.value})} required />
              
              {view === 'create' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.keys(ROLE_TEMPLATES).map(type => (
                          <button type="button" key={type} onClick={() => setProjForm({...projForm, type})} className={`p-3 rounded-xl border-2 text-[10px] md:text-xs font-bold uppercase tracking-widest transition ${projForm.type === type ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>{type}</button>
                      ))}
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800"><label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Mission Timeline</label><div className="flex gap-2"><div className="flex-1"><span className="text-[10px] text-zinc-600 uppercase block mb-1">Start</span><input type="date" className="w-full bg-black p-2 rounded-lg border border-zinc-800 text-white text-sm" value={projForm.startDate} onChange={e=>setProjForm({...projForm, startDate: e.target.value})} required /></div><div className="flex-1"><span className="text-[10px] text-zinc-600 uppercase block mb-1">End</span><input type="date" className="w-full bg-black p-2 rounded-lg border border-zinc-800 text-white text-sm" value={projForm.endDate} onChange={e=>setProjForm({...projForm, endDate: e.target.value})} required /></div></div></div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800"><label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Call Details</label><div className="flex gap-2"><div className="flex-1"><span className="text-[10px] text-zinc-600 uppercase block mb-1">Call Time</span><input type="time" className="w-full bg-black p-2 rounded-lg border border-zinc-800 text-white text-sm" value={projForm.callTime} onChange={e=>setProjForm({...projForm, callTime: e.target.value})} required /></div><div className="flex-1"><span className="text-[10px] text-zinc-600 uppercase block mb-1">Location</span><input type="text" className="w-full bg-black p-2 rounded-lg border border-zinc-800 text-white text-sm" placeholder="e.g. Studio A" value={projForm.callLocation} onChange={e=>setProjForm({...projForm, callLocation: e.target.value})} required /></div></div></div>
              </div>
          </div>

          <div className="bg-black/30 p-6 rounded-2xl border border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Crew Manifest</h3>
                  <button type="button" onClick={addCustomRole} className="text-[10px] flex items-center gap-1 bg-emerald-900/30 text-emerald-400 px-3 py-1 rounded hover:bg-emerald-900/50 transition font-bold"><Plus size={12}/> ADD ROLE</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crewList.map((member, idx) => (
                      <div key={member.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex flex-col gap-2 group relative hover:border-zinc-600 transition">
                          
                          {/* Role Name Row */}
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2 mb-1">
                              <div className="flex-1 relative">
                                  {editingRoleIndex === idx ? (
                                      <input 
                                          autoFocus
                                          className="w-full bg-black border border-emerald-500 text-emerald-400 text-[10px] font-black uppercase p-1 rounded outline-none"
                                          value={member.roleName}
                                          onChange={(e) => updateCrewMember(idx, 'roleName', e.target.value)}
                                          onBlur={() => setEditingRoleIndex(null)}
                                          onKeyDown={(e) => e.key === 'Enter' && setEditingRoleIndex(null)}
                                      />
                                  ) : (
                                      <div className="flex items-center gap-2 group-hover:text-white transition cursor-pointer" onClick={() => setEditingRoleIndex(idx)}>
                                          <span className="text-[10px] font-black uppercase text-zinc-500 truncate">{member.roleName}</span>
                                          <Edit2 size={10} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition"/>
                                      </div>
                                  )}
                              </div>
                              <button type="button" onClick={() => removeRole(idx)} className="text-zinc-600 hover:text-red-500 p-1"><X size={12}/></button>
                          </div>

                          {/* User Selection Row */}
                          <select 
                              className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-zinc-600"
                              value={member.userId}
                              onChange={(e) => updateCrewMember(idx, 'userId', e.target.value)}
                          >
                              <option value="">-- Unassigned --</option>
                              {users.map(u => <option key={u.uid} value={u.uid}>{u.displayName} (@{u.username})</option>)}
                          </select>
                      </div>
                  ))}
              </div>
          </div>

          <button className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-emerald-400 hover:text-black transition">{view === 'create' ? 'Launch Mission' : 'Update Mission'}</button>
       </form>
    </div>
  );

  if (view === 'details' && selectedProject) {
      const calculatedProgress = calculateProgress(selectedProject.startDate, selectedProject.endDate);
      const displayCrew = selectedProject.crew || 
          (selectedProject.assignments ? Object.entries(selectedProject.assignments).map(([role, uid]) => ({ roleName: role, userId: uid })) : []);

      return (
      <div className="space-y-8 animate-in slide-in-from-right-10">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => setView('list')} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition w-fit"><ArrowLeft size={20} /></button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase break-words">{selectedProject.title}</h2>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs font-mono text-zinc-400">
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-500"/> {selectedProject.callLocation}</span>
                        <span className="flex items-center gap-1"><Clock size={12} className="text-purple-500"/> Call: {selectedProject.callTime}</span>
                        <span className="bg-zinc-800 px-2 rounded border border-zinc-700 text-white whitespace-nowrap">{selectedProject.type}</span>
                    </div>
                </div>
            </div>
            {isAdmin && (
                <div className="flex gap-2">
                    <button onClick={() => setView('edit')} className="bg-zinc-800 hover:bg-white hover:text-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2"><Edit2 size={14}/> Edit Ops</button>
                    <button onClick={handleDeleteProject} className="bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2"><Trash2 size={14}/> Abort</button>
                </div>
            )}
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase mb-2"><span>Timeline Progress (Auto)</span><span>{calculatedProgress}%</span></div>
              <div className="w-full bg-black h-4 rounded-full overflow-hidden border border-zinc-800 relative">
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all duration-500" style={{ width: `${calculatedProgress}%` }}></div>
                  {[25, 50, 75].map(p => <div key={p} className="absolute top-0 bottom-0 w-px bg-black/30" style={{left: `${p}%`}}></div>)}
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                  {/* CALL SHEET MODULE */}
                  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                      <h3 className="text-white font-bold flex items-center gap-2 mb-4"><FileText className="text-amber-500"/> Tactical Call Sheet</h3>
                      
                      {selectedProject.callSheets && selectedProject.callSheets.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                              {selectedProject.callSheets.map((sheet) => (
                                  <div key={sheet.id} className="bg-black/40 border border-zinc-800 rounded-xl p-3 relative group">
                                      {sheet.type === 'link' ? (
                                          <a href={sheet.url} target="_blank" rel="noreferrer" className="block text-center hover:opacity-80 transition">
                                              <ExternalLink size={24} className="text-blue-400 mx-auto mb-2"/>
                                              <p className="text-[10px] text-white font-bold truncate">{sheet.name}</p>
                                          </a>
                                      ) : (
                                          <div className="text-center">
                                              {/* Simple heuristic: if it starts with data:image, show preview, else show icon */}
                                              {sheet.url.startsWith('data:image') ? (
                                                  <img src={sheet.url} className="w-full h-20 object-cover rounded-lg mb-2 border border-zinc-800" />
                                              ) : (
                                                  <FileText size={24} className="text-zinc-400 mx-auto mb-2"/>
                                              )}
                                              <p className="text-[10px] text-white font-bold truncate">{sheet.name}</p>
                                          </div>
                                      )}
                                      <div className="text-[9px] text-zinc-500 text-center mt-1">{new Date(sheet.date).toLocaleDateString()}</div>
                                      {isAdmin && (
                                          <button onClick={() => handleDeleteCallSheet(sheet.id)} className="absolute top-1 right-1 bg-red-900/80 text-red-200 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><X size={10}/></button>
                                      )}
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-zinc-600 text-sm italic mb-4">No call sheets issued for this operation.</p>
                      )}

                      {isAdmin && (
                          <div className="flex flex-col gap-2 border-t border-zinc-800 pt-4">
                              <div className="flex gap-2">
                                  <button onClick={() => callSheetInputRef.current.click()} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"><Upload size={14}/> Upload File / Img</button>
                                  <input type="file" ref={callSheetInputRef} className="hidden" onChange={handleCallSheetUpload} />
                              </div>
                              <div className="flex gap-2 bg-black/40 p-2 rounded-xl border border-zinc-800">
                                  <input 
                                      className="bg-transparent text-white text-xs w-full outline-none px-2" 
                                      placeholder="Or paste external link (Drive/Dropbox)..." 
                                      value={callSheetLink}
                                      onChange={(e) => setCallSheetLink(e.target.value)}
                                  />
                                  <button onClick={handleAddCallSheetLink} className="bg-zinc-800 hover:bg-emerald-600 text-white p-2 rounded-lg transition"><Plus size={14}/></button>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                      <h3 className="text-white font-bold flex items-center gap-2 mb-4"><Users className="text-purple-500"/> Assigned Crew</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {displayCrew.map((member, idx) => { 
                              const user = users.find(u => u.uid === member.userId); 
                              return (
                                  <div key={idx} className="flex items-center gap-3 p-2 bg-black/40 rounded-lg border border-zinc-800">
                                      <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
                                          <img src={user?.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=unknown`} className="w-full h-full object-cover"/>
                                      </div>
                                      <div>
                                          <p className="text-[10px] font-bold text-zinc-500 uppercase">{member.roleName}</p>
                                          <p className={`text-sm font-bold ${user ? 'text-white' : 'text-zinc-600 italic'}`}>{user?.displayName || 'Unassigned'}</p>
                                      </div>
                                  </div>
                              ) 
                          })}
                      </div>
                  </div>
                  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-white font-bold flex items-center gap-2 mb-4"><HardDrive className="text-blue-500"/> Footage & Data Logs</h3>
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        {(selectedProject.dataLogs || []).map(log => (
                            <div key={log.id} className="p-3 bg-black/40 rounded-lg border border-blue-900/30 flex justify-between items-center">
                                <div><p className="text-sm font-bold text-white flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500"/> {log.cardId} → {log.location}</p><p className="text-xs text-zinc-500">{log.notes}</p></div>
                                <div className="text-right"><span className="block text-[10px] font-bold text-blue-400">{log.copiedBy}</span><span className="text-[10px] font-mono text-zinc-600">{new Date(log.timestamp).toLocaleDateString()}</span></div>
                            </div>
                        ))}
                        {(!selectedProject.dataLogs || selectedProject.dataLogs.length === 0) && <p className="text-zinc-600 text-sm italic">No data dumps logged.</p>}
                    </div>
                    {(isAssignedToProject || isAdmin) ? (
                        <form onSubmit={(e) => handleAddDataLog(e, selectedProject)} className="grid grid-cols-12 gap-2 pt-2 border-t border-zinc-800">
                            <input name="cardId" className="col-span-3 bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white" placeholder="Card A01" required/>
                            <input name="location" className="col-span-4 bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white" placeholder="Drive Name" required/>
                            <input name="notes" className="col-span-4 bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white" placeholder="Notes..."/>
                            <button className="col-span-1 bg-blue-600 text-white rounded flex items-center justify-center"><Save size={14}/></button>
                        </form>
                    ) : (<div className="pt-2 border-t border-zinc-800 text-center text-xs text-zinc-500 italic"><Lock size={12} className="inline mr-1"/> Only assigned crew can log footage.</div>)}
                  </div>
              </div>
              <div className="bg-red-900/10 p-6 rounded-2xl border border-red-500/20"><h3 className="text-red-400 font-bold flex items-center gap-2 mb-4"><AlertTriangle size={16}/> Setbacks & Blockers</h3><div className="space-y-2 mb-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">{(selectedProject.setbacks || []).map((sb, idx) => (<div key={idx} className="p-3 bg-black/40 rounded-lg border border-red-500/10"><p className="text-sm text-white font-medium">{sb.text}</p><p className="text-[10px] text-zinc-500 mt-1">{new Date(sb.date).toLocaleDateString()}</p></div>))}{(!selectedProject.setbacks || selectedProject.setbacks.length === 0) && <p className="text-zinc-600 text-sm italic text-center py-4">Operation smooth.</p>}</div>
                  {isAdmin && (<form onSubmit={(e) => onSetbackSubmit(e, selectedProject)} className="flex gap-2"><input name="setback" className="flex-1 bg-zinc-950 border border-red-900/30 rounded p-2 text-xs text-white focus:border-red-500 outline-none" placeholder="Report Issue..." required/><button className={`rounded px-3 flex items-center justify-center transition-all ${setbackSuccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{setbackSuccess ? <CheckCircle size={14}/> : <Plus size={14}/>}</button></form>)}
              </div>
          </div>
      </div>
  );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
       <div className="flex justify-between items-center"><h2 className="text-3xl font-black text-white flex items-center gap-3"><Briefcase className="text-amber-500"/> MISSION LOG</h2>{isAdmin && <button onClick={()=>setView('create')} className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center gap-2"><Plus size={16}/> New Op</button>}</div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{projects.map(p => { const progress = calculateProgress(p.startDate, p.endDate); return (<div key={p.id} onClick={() => { setSelectedProject(p); setView('details'); }} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 hover:border-zinc-600 transition cursor-pointer group relative overflow-hidden"><div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition"><Film size={100} /></div><div className="relative z-10"><div className="flex justify-between mb-4"><span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-purple-900/30 text-purple-400">{p.type}</span><span className="text-zinc-500 text-xs font-mono">{progress}% Timeline</span></div><h3 className="text-2xl font-bold text-white mb-2">{p.title}</h3><div className="flex items-center gap-4 text-zinc-400 text-xs font-mono mb-6"><span className="flex items-center gap-1"><CalendarDays size={12}/> {p.startDate}</span><span className="flex items-center gap-1"><MapPin size={12}/> {p.callLocation}</span></div><div className="w-full bg-black h-2 rounded-full overflow-hidden"><div className="h-full transition-all duration-500 bg-purple-500" style={{width: `${progress}%`}}></div></div></div></div>)})}</div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [currentUser, setCurrentUser] = useState(null); 
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isNexusOpen, setIsNexusOpen] = useState(false); 
  const [showChat, setShowChat] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [productionStatus, setProductionStatus] = useState(false); // Global Production Switch
  
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [polls, setPolls] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [hiddenProjectIds, setHiddenProjectIds] = useState([]);
  const [showHidden, setShowHidden] = useState(false); // Toggle to show hidden projects
  
  const [viewingProfileId, setViewingProfileId] = useState(null); // Global Profile Viewer
  const [navigatedProject, setNavigatedProject] = useState(null); // For redirection

  // Auth & Init
  useEffect(() => {
    const initAuth = async () => {
        const storedUid = localStorage.getItem('clan_yujo_uid');
        if (storedUid) {
             const docRef = doc(db, COLLECTION_USERS, storedUid);
             const docSnap = await getDoc(docRef);
             if (docSnap.exists()) { setCurrentUser(docSnap.data()); setIsAuthReady(true); } 
             else { localStorage.removeItem('clan_yujo_uid'); if (!auth.currentUser) await signInAnonymously(auth); }
        } else { if (!auth.currentUser) await signInAnonymously(auth); }
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => { if (user) { setIsAuthReady(true); if (!currentUser) { const storedUid = localStorage.getItem('clan_yujo_uid'); if (storedUid) initAuth(); } } else { initAuth(); } });
    return () => unsubscribe();
  }, []);

  // Notifications
  useEffect(() => { if (currentUser && "Notification" in window && Notification.permission !== "granted") Notification.requestPermission(); }, [currentUser]);

  // Load hidden preferences
  useEffect(() => {
      const hidden = localStorage.getItem('clan_yujo_hidden_projects');
      if (hidden) setHiddenProjectIds(JSON.parse(hidden));
  }, []);

  // Data Streams
  useEffect(() => {
    if (!currentUser) return;
    const unsubMe = onSnapshot(doc(db, COLLECTION_USERS, currentUser.uid), (d) => { if (d.exists()) setCurrentUser(d.data()); });
    const u1 = onSnapshot(collection(db, COLLECTION_BOOKINGS), (s) => setBookings(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const u2 = onSnapshot(collection(db, COLLECTION_PROJECTS), (s) => setProjects(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const u3 = onSnapshot(query(collection(db, COLLECTION_LOGS), orderBy('timestamp', 'desc')), (s) => setLogs(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const u4 = onSnapshot(collection(db, COLLECTION_USERS), (s) => setUsers(s.docs.map(d => ({uid: d.id, ...d.data()}))));
    const u5 = onSnapshot(collection(db, COLLECTION_REQUESTS), (s) => setRequests(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const u6 = onSnapshot(query(collection(db, COLLECTION_SCREENINGS), orderBy('createdAt', 'desc'), limit(1)), (s) => setScreenings(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const u7 = onSnapshot(query(collection(db, COLLECTION_POLLS), orderBy('createdAt', 'desc'), limit(1)), (s) => setPolls(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const u8 = onSnapshot(collection(db, COLLECTION_MESSAGES), (snap) => { if (!showChat && snap.docChanges().some(change => change.type === 'added')) { setHasUnread(true); const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"); audio.volume = 0.1; audio.play().catch(() => {}); } });
    const u9 = onSnapshot(query(collection(db, COLLECTION_ANNOUNCEMENTS), orderBy('createdAt', 'desc'), limit(1)), (s) => setAnnouncements(s.docs.map(d => ({id: d.id, ...d.data()}))));
    
    // PRODUCTION STATUS LISTENER (NEW)
    const u10 = onSnapshot(doc(db, COLLECTION_SYSTEM, 'config'), (doc) => {
        if (doc.exists()) { setProductionStatus(doc.data().productionLive); }
    });

    return () => { unsubMe(); u1(); u2(); u3(); u4(); u5(); u6(); u7(); u8(); u9(); u10(); };
  }, [currentUser?.uid, showChat]);

  useEffect(() => { if (showChat) setHasUnread(false); }, [showChat]);
  const logActivity = async (action) => { await addDoc(collection(db, COLLECTION_LOGS), { userId: currentUser.uid, userName: currentUser.displayName, action, timestamp: serverTimestamp() }); };
  const handleManualLogin = (userData) => { localStorage.setItem('clan_yujo_uid', userData.uid); setCurrentUser(userData); };
  const handleLogout = () => { localStorage.removeItem('clan_yujo_uid'); setCurrentUser(null); setActiveTab('dashboard'); };

  const toggleHideProject = (e, pid) => {
      e.stopPropagation();
      let newHidden;
      if (hiddenProjectIds.includes(pid)) {
          newHidden = hiddenProjectIds.filter(id => id !== pid);
      } else {
          newHidden = [...hiddenProjectIds, pid];
      }
      setHiddenProjectIds(newHidden);
      localStorage.setItem('clan_yujo_hidden_projects', JSON.stringify(newHidden));
  };

  const handleOpenProject = (project) => {
      setNavigatedProject(project);
      setActiveTab('projects');
  };

  // TOGGLE PRODUCTION (ADMIN ONLY)
  const toggleProduction = async () => {
      const newStatus = !productionStatus;
      await setDoc(doc(db, COLLECTION_SYSTEM, 'config'), { productionLive: newStatus }, { merge: true });
      logActivity(`System Override: Production ${newStatus ? 'ONLINE' : 'HALTED'}`);
  };

  if (!isAuthReady) return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-600 font-mono"><RefreshCw size={48} className="animate-spin text-purple-600 mb-6"/><p className="text-sm tracking-[0.3em] uppercase">CLAN YUJO // INITIALIZING</p></div>;
  if (!currentUser) return <LoginScreen onLogin={handleManualLogin} isAuthReady={isAuthReady} />;

  // Display projects logic: If showHidden is true, show hidden ones too.
  const dashboardProjects = projects.filter(p => {
      const isHidden = hiddenProjectIds.includes(p.id);
      if (showHidden) return true; // Show all if toggle is on
      return !isHidden; // Otherwise only show unhidden
  });

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans flex flex-col lg:flex-row overflow-hidden">
      <div className="hidden lg:flex w-72 bg-zinc-950 border-r border-zinc-900 flex-col relative z-20 justify-between p-0">
        <div className="h-24 flex items-center px-8 border-b border-zinc-900">
           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-purple-500/20 rotate-3 overflow-hidden">{LOGO_URL ? <img src={LOGO_URL} className="w-full h-full object-cover" /> : <Hexagon className="text-black w-6 h-6" />}</div>
           <span className="font-black text-white text-xl tracking-tighter">CLAN YUJO</span>
        </div>
        <nav className="flex-1 py-8 space-y-2 px-4">
          {[{ id: 'dashboard', icon: LayoutDashboard, label: 'Headquarters' },{ id: 'bookings', icon: Clock, label: 'Armory / Labs', restricted: true },{ id: 'projects', icon: Film, label: 'Missions' }, { id: 'team', icon: Users, label: 'Clan Roster', restricted: true }].map(item => (
            (!item.restricted || currentUser.role !== 'temp') && (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-white text-black shadow-lg shadow-white/10 scale-[1.02]' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}><item.icon size={20} className={activeTab === item.id ? 'text-black' : 'group-hover:text-purple-400 transition'} /><span className="ml-4 font-bold text-sm tracking-wide">{item.label}</span></button>
            )
          ))}
        </nav>
        <div className="p-4"><button onClick={() => setIsNexusOpen(!isNexusOpen)} className="w-full flex items-center justify-center p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white transition-all duration-300 group border border-zinc-800 relative"><Hexagon size={20} className="text-purple-500 group-hover:scale-110 transition"/><span className="ml-3 font-bold text-sm tracking-wider">NEXUS MENU</span>{hasUnread && <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</button></div>
      </div>
      <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800 rounded-full z-40 flex justify-around items-center p-1.5 shadow-2xl shadow-black/50">
         {[{ id: 'dashboard', label: 'Home', icon: LayoutDashboard },{ id: 'bookings', label: 'Gear', icon: Clock, restricted: true }].map(item => (
            (!item.restricted || currentUser.role !== 'temp') ? (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-3.5 rounded-full transition-all duration-300 relative group ${activeTab === item.id ? 'bg-white text-black shadow-lg scale-110' : 'text-zinc-500 hover:text-white'}`}><item.icon size={20} strokeWidth={2.5} /></button>
            ) : null
         ))}
         <button onClick={() => setIsNexusOpen(!isNexusOpen)} className="p-4 rounded-full bg-zinc-900 text-white shadow-lg border border-zinc-700 relative transform hover:scale-110 transition active:scale-95"><Hexagon size={24} className="text-purple-500" fill="currentColor" fillOpacity={0.2} />{hasUnread && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>}</button>
         {[{ id: 'projects', label: 'Work', icon: Briefcase }, { id: 'team', label: 'Clan', icon: Users, restricted: true }].map(item => (
            (!item.restricted || currentUser.role !== 'temp') ? (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-3.5 rounded-full transition-all duration-300 relative group ${activeTab === item.id ? 'bg-white text-black shadow-lg scale-110' : 'text-zinc-500 hover:text-white'}`}><item.icon size={20} strokeWidth={2.5} /></button>
            ) : null
         ))}
      </div>
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative bg-black scroll-smooth pb-32 lg:pb-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none fixed"></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none z-10"></div>
        <div className="relative z-20 max-w-7xl mx-auto">
          <div className="lg:hidden flex items-center justify-between mb-8 mt-2">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center rotate-3 overflow-hidden shadow-lg">{LOGO_URL ? <img src={LOGO_URL} className="w-full h-full object-cover" /> : <Hexagon className="text-black w-6 h-6" />}</div><span className="font-black text-white text-lg tracking-tighter">YUJO OS</span></div>
              <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700" onClick={() => setActiveTab('profile')}><img src={currentUser.avatar} className="w-full h-full object-cover"/></div>
          </div>
          <header className="hidden lg:flex justify-between items-end mb-10">
              <div><h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">{activeTab.replace('_', ' ')}</h1><p className="text-zinc-500 text-sm font-mono">OPERATOR: {currentUser.displayName.toUpperCase()} // STATUS: ONLINE</p></div>
              <div className="flex items-center gap-4"><div className="bg-zinc-900 p-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition cursor-pointer"><Bell size={20}/></div><div className="w-10 h-10 rounded-full bg-white border-2 border-zinc-800 overflow-hidden cursor-pointer hover:scale-105 transition" onClick={() => setActiveTab('profile')}><img src={currentUser.avatar} className="w-full h-full object-cover"/></div></div>
          </header>
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* YOUR ACTIVE MISSIONS WIDGET */}
                <div className="bg-gradient-to-r from-emerald-900/30 to-zinc-900 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Briefcase size={20} className="text-emerald-400"/>
                            <h3 className="text-white font-black uppercase tracking-widest text-sm">Active Assignments</h3>
                        </div>
                        <button onClick={() => setShowHidden(!showHidden)} className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 transition">
                            {showHidden ? <Eye size={12}/> : <EyeOff size={12}/>} 
                            {showHidden ? 'Hide Archives' : `Show Hidden (${hiddenProjectIds.length})`}
                        </button>
                    </div>
                    {dashboardProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dashboardProjects.map(p => {
                                const isHidden = hiddenProjectIds.includes(p.id);
                                const myRoles = [];
                                if (p.crew) {
                                    p.crew.forEach(c => { if(c.userId === currentUser.uid) myRoles.push(c.roleName); });
                                } else if (p.assignments) {
                                    Object.entries(p.assignments).forEach(([r, uid]) => { if(uid === currentUser.uid) myRoles.push(r); });
                                }
                                const isMyMission = myRoles.length > 0;

                                return (
                                    <div key={p.id} onClick={() => handleOpenProject(p)} className={`p-4 rounded-xl border transition cursor-pointer group relative ${isMyMission ? 'bg-zinc-950/90 border-emerald-500/50 hover:border-emerald-400' : (isHidden ? 'bg-zinc-900/30 border-dashed border-zinc-800 opacity-60 hover:opacity-100' : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700')}`}>
                                        <div className="flex justify-between items-start">
                                            <h4 className={`font-bold text-lg mb-1 truncate pr-6 ${isHidden ? 'text-zinc-500' : 'text-white'}`}>{p.title}</h4>
                                            <button onClick={(e) => toggleHideProject(e, p.id)} className="text-zinc-600 hover:text-white p-1 rounded-full absolute top-2 right-2">
                                                {isHidden ? <Eye size={14}/> : <EyeOff size={14}/>}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-mono mb-3">{p.type} // {p.callLocation}</p>
                                        
                                        {isMyMission ? (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {myRoles.map((r, i) => (
                                                    <span key={i} className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded font-black uppercase tracking-wide shadow-lg shadow-emerald-500/20">{r}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Status: Active</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-500 italic text-sm">No active operations available.</p>
                    )}
                </div>

                <AnnouncementsWidget announcements={announcements} isAdmin={currentUser.role === 'admin'} logActivity={logActivity} />
                {currentUser.role !== 'temp' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:h-96"><MovieDisplayWidget screening={screenings[0]} /><PollWidget poll={polls[0]} currentUser={currentUser} logActivity={logActivity} /></div>)}
                <div className="bg-zinc-900/30 rounded-3xl border border-zinc-800 p-6 lg:p-8 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6"><h3 className="font-black text-white flex items-center gap-3 text-lg tracking-wide"><Activity className="text-blue-500"/> DATA STREAM</h3><span className="text-[10px] font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded uppercase">Live</span></div>
                    <div className="space-y-0 relative pl-4 border-l border-zinc-800/50">{logs.slice(0,6).map((l, i) => (<div key={l.id} className="relative pl-6 pb-8 last:pb-0 group"><div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-950 border-2 border-zinc-700 group-hover:border-purple-500 group-hover:scale-125 transition z-10"></div><div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"><span className="text-xs font-mono text-zinc-600">{l.timestamp ? new Date(l.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span><span className="text-white font-bold text-sm hover:text-purple-400 transition cursor-default">{l.userName}</span><span className="text-zinc-400 text-sm truncate">{l.action}</span></div></div>))}</div>
                </div>
              </div>
              <div className="space-y-8">
                  <div className="bg-gradient-to-br from-purple-900/10 to-zinc-900 rounded-3xl border border-purple-500/20 p-6 lg:p-8">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-white font-black uppercase tracking-widest text-xs">System Status</h3>
                          <div className={`flex items-center gap-2 px-2 py-1 rounded border text-[10px] uppercase font-bold ${productionStatus ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-amber-900/30 border-amber-500/50 text-amber-400'}`}>
                              <div className={`w-2 h-2 rounded-full ${productionStatus ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                              {productionStatus ? 'Live' : 'Halted'}
                          </div>
                      </div>
                      <div className="space-y-4">
                          {/* PRODUCTION TOGGLE - ADMIN ONLY */}
                          {currentUser.role === 'admin' && (
                              <div className="bg-black/60 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-purple-500/30 transition">
                                  <div className="flex items-center gap-3"><Power size={18} className="text-zinc-500 group-hover:text-purple-400"/><span className="text-zinc-400 text-sm font-bold">MASTER SWITCH</span></div>
                                  <button onClick={toggleProduction} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${productionStatus ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${productionStatus ? 'translate-x-5' : 'translate-x-1'}`} />
                                  </button>
                              </div>
                          )}
                          <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-purple-500/30 transition"><div className="flex items-center gap-3"><Layers size={18} className="text-zinc-500 group-hover:text-purple-400"/><span className="text-zinc-400 text-sm font-bold">MISSIONS</span></div><span className="text-white font-mono text-xl">{projects.length}</span></div>
                          <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-purple-500/30 transition"><div className="flex items-center gap-3"><Users size={18} className="text-zinc-500 group-hover:text-purple-400"/><span className="text-zinc-400 text-sm font-bold">MEMBERS</span></div><span className="text-white font-mono text-xl">{users.length}</span></div>
                          <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-purple-500/30 transition"><div className="flex items-center gap-3"><Zap size={18} className="text-zinc-500 group-hover:text-emerald-400"/><span className="text-zinc-400 text-sm font-bold">GEAR ACTIVE</span></div><span className="text-white font-mono text-xl text-emerald-400">{bookings.filter(b => b.status === 'active').length}</span></div>
                      </div>
                  </div>
              </div>
            </div>
          )}
          {activeTab === 'bookings' && currentUser.role !== 'temp' && <BookingSystem currentUser={currentUser} bookings={bookings} users={users} requests={requests} logActivity={logActivity} productionStatus={productionStatus} />}
          {activeTab === 'projects' && <ProjectTracker projects={projects} users={users} isAdmin={currentUser.role==='admin'} logActivity={logActivity} currentUser={currentUser} navigatedProject={navigatedProject} resetNavigatedProject={() => setNavigatedProject(null)} />}
          {activeTab === 'team' && currentUser.role !== 'temp' && <TeamManager users={users} currentUser={currentUser} logActivity={logActivity} onShowProfile={setViewingProfileId} />}
          {activeTab === 'profile' && <ProfileSettings currentUser={currentUser} logActivity={logActivity} setSuccessMessage={setSuccessMessage} />}
          {activeTab === 'cinema_admin' && currentUser.role === 'admin' && <MovieNightAdmin logActivity={logActivity} />}
        </div>
        {successMessage && (
             <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
                <div className="bg-zinc-900 border border-zinc-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><CheckCircle size={14} className="text-black" /></div><span className="font-bold text-sm tracking-wide">{successMessage}</span>
                </div>
             </div>
        )}
        <NexusMenu isOpen={isNexusOpen} toggle={() => setIsNexusOpen(!isNexusOpen)} setActiveTab={setActiveTab} handleLogout={handleLogout} role={currentUser.role} openChat={() => setShowChat(true)} hasUnread={hasUnread} />
        {showChat && <GlobalChat currentUser={currentUser} users={users} onClose={() => setShowChat(false)} onShowProfile={setViewingProfileId} />}
        {/* GLOBAL PROFILE VIEWER OVERLAY */}
        {viewingProfileId && <AgentDossier userId={viewingProfileId} users={users} onClose={() => setViewingProfileId(null)} />}
      </main>
    </div>
  );
};

export default App;
