'use client'

import { useState } from 'react'
import { useSupabaseContext } from '@/context/SupabaseProvider'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { toast } from 'sonner'

export function AddAdminForm() {
  const { supabase } = useSupabaseContext()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = async () => {
    if (!email) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_admin')
        .ilike('email', `%${email}%`)
        .limit(5)

      if (error) throw error

      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const handleMakeAdmin = async (userId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId)

      if (error) throw error

      toast.success('User successfully made admin')
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, is_admin: true } : user
        )
      )
    } catch (error) {
      console.error('Error making user admin:', error)
      toast.error('Failed to make user admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Admin User</CardTitle>
        <CardDescription>
          Search for users by email and make them administrators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Search by email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={loading || !email}
            >
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.full_name || 'No name'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Button
                    onClick={() => handleMakeAdmin(user.id)}
                    disabled={loading || user.is_admin}
                    variant={user.is_admin ? 'secondary' : 'default'}
                  >
                    {user.is_admin ? 'Already Admin' : 'Make Admin'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 