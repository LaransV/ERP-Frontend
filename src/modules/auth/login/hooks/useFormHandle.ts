"use client";
import { useFormHandler } from '@/hooks/useFormHandler';
import { LoginSchema } from '@/schemas/auth/request';
import type { TLoginForm } from '../declaration';
export const useLoginForm = () => {
  const { register, handleSubmit, setError, formState:{ errors } } =
    useFormHandler<TLoginForm>({ validationSchema: LoginSchema });
  return { register, handleSubmit, errors, setError };
};
