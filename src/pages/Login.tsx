import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/dashboard')
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50 px-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200'>
            <Building2 className='h-7 w-7 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-slate-900'>Welcome back</h1>
          <p className='text-slate-500 mt-1'>Sign in to your admin account</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 shadow-sm p-8'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div className='space-y-1.5'>
              <Label className='text-slate-700 font-medium'>Email</Label>
              <Input type='email' placeholder='admin@example.com' {...register('email')} />
              {errors.email && <p className='text-xs text-red-500'>{errors.email.message}</p>}
            </div>
            <div className='space-y-1.5'>
              <Label className='text-slate-700 font-medium'>Password</Label>
              <Input type='password' placeholder='••••••••' {...register('password')} />
              {errors.password && <p className='text-xs text-red-500'>{errors.password.message}</p>}
            </div>
            {error && <div className='rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600'>{error}</div>}
            <Button type='submit' className='w-full h-10' disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className='text-center text-sm text-slate-500 mt-5'>
            Don't have an account?{' '}
            <Link to='/signup' className='text-indigo-600 font-medium hover:underline'>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
