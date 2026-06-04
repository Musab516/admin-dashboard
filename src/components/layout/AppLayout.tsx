import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Building2, LogOut } from 'lucide-react'

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm'>
        <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link to='/dashboard' className='flex items-center gap-2.5 font-semibold text-slate-900 hover:text-indigo-600 transition-colors'>
            <div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center'>
              <Building2 className='h-4 w-4 text-white' />
            </div>
            Admin Dashboard
          </Link>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center'>
                <span className='text-xs font-semibold text-indigo-600'>
                  {user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <span className='text-sm text-slate-600 hidden sm:block'>{user?.email}</span>
            </div>
            <Button variant='ghost' size='sm' onClick={handleSignOut} className='text-slate-500 hover:text-slate-900'>
              <LogOut className='h-4 w-4 mr-1.5' />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className='max-w-6xl mx-auto px-6 py-8'>
        <Outlet />
      </main>
    </div>
  )
}
