import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

export function NotFound() {
  const navigate = useNavigate()
  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50'>
      <div className='text-center'>
        <div className='w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
          <Building2 className='h-8 w-8 text-indigo-400' />
        </div>
        <h1 className='text-4xl font-bold text-slate-900 mb-2'>404</h1>
        <p className='text-slate-500 mb-6'>Page not found</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </div>
  )
}
