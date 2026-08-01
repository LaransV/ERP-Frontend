"use client";
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldValues, useForm, UseFormProps } from 'react-hook-form';
import type { ZodSchema } from 'zod';

export const useFormHandler = <T extends FieldValues>({
  validationSchema, ...rest
}: UseFormProps<T> & { validationSchema?: ZodSchema } = {}) =>
  useForm<T>({ resolver: validationSchema ? zodResolver(validationSchema) : undefined, ...rest });
