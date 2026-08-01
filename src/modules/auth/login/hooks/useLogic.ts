"use client";
import { useRouter } from 'next/navigation';
import { UseFormSetError } from 'react-hook-form';
import { useMutation } from '@/hooks/useMutation';
import { useAuthStore } from '@/store/authStore';
import { LoginReq } from '@/schemas/auth/request';
import { LoginRes } from '@/schemas/auth/response';
import { postLogin } from '@/services/api/auth';
import type { TLoginForm } from '../declaration';
import { LOGIN_KEY } from '../constants';

export const useLoginLogic = (setError: UseFormSetError<TLoginForm>) => {
  const router  = useRouter();
  const { setAuth } = useAuthStore();

  const { mutate, isPending } = useMutation({
    apiConfig:      postLogin,
    requestSchema:  LoginReq,
    responseSchema: LoginRes,
    loadingKey:     LOGIN_KEY,
    onError: (res) => {
      setError('password', { message: (res as any).message ?? 'Invalid username or password' });
    },
    onSuccess: (res) => {
      if (res.data?.user && res.data?.accessToken) {
        setAuth(res.data.user as any, res.data.accessToken);
        router.replace('/dashboard');
      }
    },
  });

  return { onSubmit: (d: TLoginForm) => mutate(d), isPending };
};
