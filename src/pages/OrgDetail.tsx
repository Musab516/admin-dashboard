import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, Users, GraduationCap, Heart, Briefcase, Clock, CheckCircle } from 'lucide-react'

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  school:    { label: 'School',    color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    icon: GraduationCap },
  nonprofit: { label: 'Nonprofit', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: Heart },
  business:  { label: 'Business',  color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200',  icon: Briefcase },
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
})
type InviteForm = z.infer<typeof inviteSchema>

export function OrgDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ['org', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .eq('created_by', user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id && !!user,
  })

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', id)
        .order('invited_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
  })

  const inviteMutation = useMutation({
    mutationFn: async ({ email }: InviteForm) => {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        'https://aultkvxpzakqipdkkktm.supabase.co/functions/v1/invite-member',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + session!.access_token,
          },
          body: JSON.stringify({ organization_id: id, email }),
        }
      )
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to invite member')
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', id] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast({ title: 'Invitation sent!', description: 'Member has been invited.' })
      reset()
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('organizations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      navigate('/dashboard')
      toast({ title: 'Organization deleted' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
  })

  if (orgLoading) {
    return (
      <div className='space-y-4'>
        <div className='h-8 w-48 bg-slate-100 rounded animate-pulse' />
        <div className='h-32 bg-slate-100 rounded-xl animate-pulse' />
      </div>
    )
  }

  if (!org) {
    return (
      <div className='text-center py-16'>
        <p className='text-slate-500'>Organization not found.</p>
        <Button variant='ghost' onClick={() => navigate('/dashboard')} className='mt-4'>Go back</Button>
      </div>
    )
  }

  const config = typeConfig[org.type]
  const Icon = config.icon

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate('/dashboard')}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div className={'w-10 h-10 rounded-xl border flex items-center justify-center ' + config.bg}>
            <Icon className={'h-5 w-5 ' + config.color} />
          </div>
          <div>
            <h1 className='text-xl font-bold text-slate-900'>{org.name}</h1>
            <span className={'text-xs px-2 py-0.5 rounded-full font-medium border ' + config.bg + ' ' + config.color}>
              {config.label}
            </span>
          </div>
        </div>
        <Button
          variant='outline'
          size='sm'
          className='text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600'
          onClick={() => { if (window.confirm('Delete this organization and all its members?')) deleteMutation.mutate() }}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Organization'}
        </Button>
      </div>

      {org.school_district && <p className='text-sm text-slate-500 ml-16'>District: {org.school_district}</p>}
      {org.registration_number && <p className='text-sm text-slate-500 ml-16'>Registration: {org.registration_number}</p>}
      {org.industry_sector && <p className='text-sm text-slate-500 ml-16'>Sector: {org.industry_sector}</p>}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-4'>
          <div className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-slate-400' />
            <h2 className='font-semibold text-slate-900'>Members</h2>
            <span className='text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full'>
              {members?.length ?? 0}
            </span>
          </div>

          {membersLoading && (
            <div className='space-y-2'>
              {[1,2].map(i => <div key={i} className='h-14 bg-slate-100 rounded-xl animate-pulse' />)}
            </div>
          )}

          {!membersLoading && members?.length === 0 && (
            <div className='text-center py-10 border-2 border-dashed border-slate-200 rounded-xl'>
              <Users className='h-8 w-8 text-slate-300 mx-auto mb-2' />
              <p className='text-slate-400 text-sm'>No members yet. Invite someone below.</p>
            </div>
          )}

          <div className='space-y-2'>
            {members?.map((member: any) => (
              <div key={member.id} className='flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center'>
                    <span className='text-sm font-semibold text-indigo-600'>
                      {member.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-slate-900'>{member.email}</p>
                    <p className='text-xs text-slate-400'>Invited {new Date(member.invited_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {member.status === 'invited' ? (
                  <span className='flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium'>
                    <Clock className='h-3 w-3' />
                    Invited
                  </span>
                ) : (
                  <span className='flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium'>
                    <CheckCircle className='h-3 w-3' />
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Card className='border-slate-200'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Mail className='h-4 w-4 text-indigo-500' />
                Invite Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((d) => inviteMutation.mutate(d))} className='space-y-3'>
                <div className='space-y-1.5'>
                  <Label className='text-slate-700 text-sm'>Email address</Label>
                  <Input type='email' placeholder='member@example.com' {...register('email')} />
                  {errors.email && <p className='text-xs text-red-500'>{errors.email.message}</p>}
                </div>
                <Button type='submit' className='w-full' disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
