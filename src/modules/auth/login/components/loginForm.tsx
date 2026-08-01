"use client";
import { FieldErrors, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import { Eye, EyeOff, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { TLoginForm } from '../declaration';

interface Props {
  register: UseFormRegister<TLoginForm>;
  errors: FieldErrors<TLoginForm>;
  handleSubmit: UseFormHandleSubmit<TLoginForm>;
  onSubmit: (d: TLoginForm) => void;
  isPending: boolean;
}
export const LoginForm = ({ register, handleSubmit, onSubmit, isPending, errors }: Props) => {
  const [showPw, setShowPw] = useState(false);
  const errMsg = (errors.password?.message || errors.username?.message) as string | undefined;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errMsg && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background:'rgba(239,68,68,0.08)', color:'var(--danger)', border:'1px solid rgba(239,68,68,0.25)' }}>
          {errMsg}
        </div>
      )}
      <div>
        <label className="field-label">Username</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'var(--text-muted)' }}/>
          <input {...register('username')} type="text" placeholder="Enter username" className="field-input pl-10" autoFocus />
        </div>
      </div>
      <div>
        <label className="field-label">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'var(--text-muted)' }}/>
          <input {...register('password')} type={showPw?'text':'password'} placeholder="Enter password" className="field-input pl-10 pr-10"/>
          <button type="button" onClick={()=>setShowPw(s=>!s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 btn-ghost btn-icon !w-7 !h-7">
            {showPw ? <EyeOff className="w-3.5 h-3.5" style={{color:'var(--text-muted)'}}/> : <Eye className="w-3.5 h-3.5" style={{color:'var(--text-muted)'}}/>}
          </button>
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary w-full py-3 text-base gap-2 mt-2">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <>Sign In <ArrowRight className="w-4 h-4"/></>}
      </button>
    </form>
  );
};
