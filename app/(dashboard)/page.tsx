import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // console.log('profile', profile)
  // console.log('proofile.role', profile?.role)
  if (profile?.role === 'employer') {
    redirect('/employer/dashboard')
  } else if (profile?.role === 'candidate') {
    redirect('/candidate/dashboard')
  }

  redirect('/onboarding')
}