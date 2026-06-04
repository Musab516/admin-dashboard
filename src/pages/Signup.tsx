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

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type SignupForm = z.infer<typeof signupSchema>

export function Signup() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } }
    })
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
          <h1 className='text-2xl font-bold text-slate-900'>Create account</h1>
          <p className='text-slate-500 mt-1'>Sign up for an admin account</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 shadow-sm p-8'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div className='space-y-1.5'>
              <Label className='text-slate-700 font-medium'>Full name</Label>
              <Input placeholder='John Doe' {...register('full_name')} />
              {errors.full_name && <p className='text-xs text-red-500'>{errors.full_name.message}</p>}
            </div>
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
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className='text-center text-sm text-slate-500 mt-5'>
            Already have an account?{' '}
            <Link to='/login' className='text-indigo-600 font-medium hover:underline'>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
