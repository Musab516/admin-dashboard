import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import type { OrgType } from '@/hooks/useOrganizations'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['school', 'nonprofit', 'business']),
  school_district: z.string().optional(),
  registration_number: z.string().optional(),
  industry_sector: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CreateOrgDialog() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const selectedType = watch('type')

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from('organizations').insert({
        name: data.name,
        type: data.type,
        created_by: user!.id,
        school_district: data.type === 'school' ? (data.school_district ?? null) : null,
        registration_number: data.type === 'nonprofit' ? (data.registration_number ?? null) : null,
        industry_sector: data.type === 'business' ? (data.industry_sector ?? null) : null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast({ title: 'Organization created!' })
      reset()
      setOpen(false)
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          New Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className='space-y-4'>
          <div className='space-y-2'>
            <Label>Name</Label>
            <Input placeholder='Organization name' {...register('name')} />
            {errors.name && <p className='text-sm text-destructive'>{errors.name.message}</p>}
          </div>
          <div className='space-y-2'>
            <Label>Type</Label>
            <Select onValueChange={(v) => setValue('type', v as OrgType)}>
              <SelectTrigger>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='school'>School</SelectItem>
                <SelectItem value='nonprofit'>Nonprofit</SelectItem>
                <SelectItem value='business'>Business</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className='text-sm text-destructive'>{errors.type.message}</p>}
          </div>
          {selectedType === 'school' && (
            <div className='space-y-2'>
              <Label>School District</Label>
              <Input placeholder='e.g. Karachi Central District' {...register('school_district')} />
            </div>
          )}
          {selectedType === 'nonprofit' && (
            <div className='space-y-2'>
              <Label>Registration Number</Label>
              <Input placeholder='e.g. NP-12345' {...register('registration_number')} />
            </div>
          )}
          {selectedType === 'business' && (
            <div className='space-y-2'>
              <Label>Industry Sector</Label>
              <Input placeholder='e.g. Technology' {...register('industry_sector')} />
            </div>
          )}
          <Button type='submit' className='w-full' disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Organization'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
