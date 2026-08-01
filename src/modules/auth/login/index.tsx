"use client";
import { Layers, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import { useThemeStore } from '@/store/themeStore';
import { LoginForm } from './components/loginForm';
import { useLoginForm } from './hooks/useFormHandle';
import { useLoginLogic } from './hooks/useLogic';

export default function LoginModule() {
  const { theme, toggleTheme } = useThemeStore();
  const { register, handleSubmit, errors, setError } = useLoginForm();
  const { onSubmit, isPending } = useLoginLogic(setError);

  const logoImage = '/images/VRLlogo1.png';

  return (
    <div className="min-h-screen flex" style={{ background:'var(--bg)' }}>
      {/* ── Left panel ───────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
        style={{ background:'linear-gradient(145deg,#09090F 0%,#0D1220 55%,#0A0E1A 100%)' }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{background:'rgba(79,142,247,0.15)'}}/>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{background:'rgba(52,211,153,0.08)'}}/>

        <div className="relative z-10 p-10 flex items-center gap-3">
          <div className="flex items-center justify-center">
            <Image
              src={logoImage} 
              width={60}
              height={60}
              className="h-auto w-auto object-contain"
              alt="VRL Logo"
            />
          </div>
          <div>
            <div className="text-lg font-bold text-white">ERP Software</div>
            <div className="text-xs" style={{color:'#757f9b'}}>Unified Business Platform</div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 pb-10">
          <svg viewBox="0 0 440 340" className="w-full max-w-lg mb-8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="20" width="380" height="280" rx="16" fill="#0F1629" stroke="#1F2840" strokeWidth="1.5"/>
            <rect x="30" y="20" width="380" height="42" rx="16" fill="#13192A"/>
            <rect x="30" y="46" width="380" height="16" fill="#13192A"/>
            <circle cx="58" cy="41" r="7" fill="#EF4444" opacity=".8"/>
            <circle cx="80" cy="41" r="7" fill="#EAB308" opacity=".8"/>
            <circle cx="102" cy="41" r="7" fill="#22C55E" opacity=".8"/>
            <text x="200" y="46" textAnchor="middle" fontSize="9" fill="#4B5675" fontWeight="600">NexERP — Dashboard</text>
            <rect x="30" y="62" width="72" height="238" rx="0" fill="#0D1220"/>
            <rect x="44" y="80"  width="44" height="6" rx="3" fill="#1F2840"/>
            <rect x="44" y="96"  width="44" height="6" rx="3" fill="#00B1DE" opacity=".6"/>
            <rect x="44" y="112" width="44" height="6" rx="3" fill="#1F2840"/>
            <rect x="44" y="128" width="44" height="6" rx="3" fill="#1F2840"/>
            <rect x="44" y="144" width="44" height="6" rx="3" fill="#1F2840"/>
            <rect x="114" y="72"  width="70" height="52" rx="8" fill="#1F2840"/>
            <rect x="114" y="72"  width="70" height="4"  rx="2" fill="#34D399"/>
            <text x="122" y="97"  fontSize="15" fontWeight="800" fill="#34D399">₹48L</text>
            <text x="120" y="112" fontSize="7" fill="#4B5675">Revenue</text>
            <rect x="194" y="72"  width="70" height="52" rx="8" fill="#1F2840"/>
            <rect x="194" y="72"  width="70" height="4"  rx="2" fill="#A78BFA"/>
            <text x="202" y="97"  fontSize="15" fontWeight="800" fill="#A78BFA">47</text>
            <text x="200" y="112" fontSize="7" fill="#4B5675">Employees</text>
            <rect x="274" y="72"  width="70" height="52" rx="8" fill="#1F2840"/>
            <rect x="274" y="72"  width="70" height="4"  rx="2" fill="#FBBF24"/>
            <text x="282" y="97"  fontSize="15" fontWeight="800" fill="#FBBF24">28</text>
            <text x="280" y="112" fontSize="7" fill="#4B5675">Leads</text>
            <rect x="354" y="72"  width="48" height="52" rx="8" fill="#1F2840"/>
            <rect x="354" y="72"  width="48" height="4"  rx="2" fill="#FB7185"/>
            <text x="362" y="97"  fontSize="15" fontWeight="800" fill="#FB7185">8</text>
            <text x="358" y="112" fontSize="7" fill="#4B5675">Low Stock</text>
            <rect x="114" y="136" width="170" height="104" rx="8" fill="#13192A" stroke="#1F2840" strokeWidth="1"/>
            <text x="124" y="152" fontSize="7" fontWeight="700" fill="#4B5675">MONTHLY REVENUE</text>
            <rect x="120" y="220" width="14" height="28" rx="2" fill="rgba(52,211,153,0.25)"/>
            <rect x="142" y="210" width="14" height="38" rx="2" fill="rgba(52,211,153,0.25)"/>
            <rect x="164" y="215" width="14" height="33" rx="2" fill="rgba(52,211,153,0.25)"/>
            <rect x="186" y="196" width="14" height="52" rx="2" fill="#34D399"/>
            <rect x="208" y="206" width="14" height="42" rx="2" fill="rgba(52,211,153,0.35)"/>
            <rect x="230" y="190" width="14" height="58" rx="2" fill="#34D399" opacity=".7"/>
            <circle cx="334" cy="190" r="42" fill="#13192A" stroke="#1F2840" strokeWidth="1"/>
            <circle cx="334" cy="190" r="42" stroke="#00B1DE" strokeWidth="16" strokeDasharray="80 184" strokeDashoffset="-46" opacity=".9"/>
            <circle cx="334" cy="190" r="42" stroke="#34D399" strokeWidth="16" strokeDasharray="56 184" strokeDashoffset="34"  opacity=".9"/>
            <circle cx="334" cy="190" r="42" stroke="#FBBF24" strokeWidth="16" strokeDasharray="48 184" strokeDashoffset="90"  opacity=".9"/>
            <circle cx="334" cy="190" r="25" fill="#13192A"/>
            <text x="327" y="194" fontSize="10" fontWeight="700" fill="#EEF2FF">78%</text>
            <rect x="114" y="252" width="288" height="40" rx="8" fill="#13192A" stroke="#1F2840" strokeWidth="1"/>
            <rect x="124" y="262" width="60" height="5" rx="2" fill="#1F2840"/>
            <rect x="200" y="262" width="40" height="5" rx="2" fill="#1F2840"/>
            <rect x="260" y="262" width="50" height="5" rx="2" fill="#1F2840"/>
            <rect x="124" y="277" width="60" height="5" rx="2" fill="#34D399" opacity=".3"/>
            <rect x="200" y="277" width="40" height="5" rx="2" fill="#00B1DE" opacity=".3"/>
            <rect x="260" y="277" width="50" height="5" rx="2" fill="#A78BFA" opacity=".3"/>
          </svg>
          <p className="text-sm text-center max-w-xs" style={{color:'#747e97'}}>
            Finance · HRMS · Inventory · CRM — real-time business management.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {[['Finance','#34D399'],['HRMS','#A78BFA'],['Inventory','#FBBF24'],['CRM','#FB7185'],].map(([m,c]) => (
              <span key={m} className="px-3 py-1 rounded-full text-xs font-semibold border"
                style={{background:`${c}15`,color:c,borderColor:`${c}30`}}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ─────────────────────── */}
      <div className="flex flex-col w-full lg:w-[600px] shrink-0" >
        <div className="flex justify-between items-center px-8 pt-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{background:'linear-gradient(135deg,#00B1DE,#2563EB)'}}>
              <Layers className="w-3.5 h-3.5 text-white"/>
            </div>
            <span className="font-bold text-sm" style={{color:'var(--text-primary)'}}>NexERP</span>
          </div>
          <div className="lg:ml-auto">
            <button onClick={toggleTheme} className="btn-ghost btn-icon">
              {theme==='dark' ? <Sun className="w-4 h-4" style={{color:'#FBBF24'}}/> : <Moon className="w-4 h-4" style={{color:'var(--brand)'}}/>}
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center px-8 py-10">
          <div className="mb-8 flex justify-center w-full">
            <Image src={logoImage} width={100} height={70} className="w-[40%] h-auto" content="contain" alt="logoImage" />
          </div>
          <div className="max-w-sm w-full mx-auto">
            {/* <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1.5" style={{color:'var(--text-primary)'}}>Welcome back</h2>
              <p className="text-sm" style={{color:'var(--text-muted)'}}>Sign in to your NexERP account</p>
            </div> */}
            <LoginForm register={register} errors={errors} handleSubmit={handleSubmit} onSubmit={onSubmit} isPending={isPending}/>
          </div>
        </div>
        <div className="px-8 pb-6 text-center">
          <p className="text-xs" style={{color:'var(--text-muted)'}}>© 2026 VRL Software · All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
