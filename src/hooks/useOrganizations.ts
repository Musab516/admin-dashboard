import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export type OrgType = 'school' | 'nonprofit' | 'business'

export interface Organization {
  id: string
  name: string
  type: OrgType
  created_by: string
  created_at: string
  school_district: string | null
  registration_number: string | null
  industry_sector: string | null
  member_count?: number
}

export function useOrganizations() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*, organization_members(count)')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((org: Organization & { organization_members: { count: number }[] }) => ({
        ...org,
        member_count: org.organization_members?.[0]?.count ?? 0,
      })) as Organization[]
    },
    enabled: !!user,
  })
}
