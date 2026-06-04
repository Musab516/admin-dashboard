import { useNavigate } from 'react-router-dom'
import { useOrganizations } from '@/hooks/useOrganizations'
import { CreateOrgDialog } from '@/components/CreateOrgDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users, Calendar, ChevronRight, GraduationCap, Heart, Briefcase } from 'lucide-react'

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  school:    { label: 'School',    color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   icon: GraduationCap },
  nonprofit: { label: 'Nonprofit', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: Heart },
  business:  { label: 'Business',  color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', icon: Briefcase },
}

export function Dashboard() {
  const { data: orgs, isLoading, error } = useOrganizations()
  const navigate = useNavigate()

  return (
    <div>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Organizations</h1>
          <p className='text-slate-500 text-sm mt-1'>Manage your organizations and their members</p>
        </div>
        <CreateOrgDialog />
      </div>

      {isLoading && (
        <div className='grid gap-3'>
          {[1,2,3].map(i => (
            <div key={i} className='h-20 rounded-xl bg-slate-100 animate-pulse' />
          ))}
        </div>
      )}

      {error && (
        <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm'>
          Failed to load organizations. Please refresh the page.
        </div>
      )}

      {!isLoading && orgs?.length === 0 && (
        <div className='text-center py-20'>
          <div className='w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <Building2 className='h-8 w-8 text-indigo-400' />
          </div>
          <p className='font-semibold text-slate-700 text-lg'>No organizations yet</p>
          <p className='text-slate-400 text-sm mt-1 mb-6'>Create your first organization to get started.</p>
          <CreateOrgDialog />
        </div>
      )}

      <div className='grid gap-3'>
        {orgs?.map((org) => {
          const config = typeConfig[org.type]
          const Icon = config.icon
          return (
            <Card
              key={org.id}
              className='cursor-pointer hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 group'
              onClick={() => navigate('/orgs/' + org.id)}
            >
              <CardContent className='flex items-center justify-between p-5'>
                <div className='flex items-center gap-4'>
                  <div className={'w-11 h-11 rounded-xl border flex items-center justify-center ' + config.bg}>
                    <Icon className={'h-5 w-5 ' + config.color} />
                  </div>
                  <div>
                    <p className='font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors'>{org.name}</p>
                    <span className={'text-xs px-2 py-0.5 rounded-full font-medium border ' + config.bg + ' ' + config.color}>
                      {config.label}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-6'>
                  <div className='flex items-center gap-1.5 text-sm text-slate-500'>
                    <Users className='h-4 w-4' />
                    <span>{org.member_count} members</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-sm text-slate-400'>
                    <Calendar className='h-4 w-4' />
                    <span>{new Date(org.created_at).toLocaleDateString()}</span>
                  </div>
                  <ChevronRight className='h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors' />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
