'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import Textarea from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/SelectNew'
import { Switch } from '@/components/ui/Switch'
import { toast } from '@/components/ui/use-toast'
import { Database } from '@/types/database.types'
import Link from 'next/link'
import { useSupabaseContext } from '@/context/SupabaseProvider'

type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type Service = Database['public']['Tables']['services']['Row'] & {
  service_categories?: ServiceCategory | null
}

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const { supabase, user, loading: authLoading } = useSupabaseContext()

  const serviceId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [service, setService] = useState<Service | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [imageUrl, setImageUrl] = useState('')

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Don't check admin status if still loading auth state
    if (authLoading) {
      return
    }

    const checkAdminStatus = async () => {
      try {
        // If no user is logged in, redirect to login
        if (!user) {
          router.push('/login')
          return
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        // If not admin, redirect to dashboard
        if (!profile?.is_admin) {
          router.push('/dashboard')
          return
        }

        // User is admin, set state and fetch data
        setIsAdmin(true)

        // Fetch service and categories
        await Promise.all([
          fetchService(),
          fetchCategories()
        ])

        setLoading(false)
      } catch (err: any) {
        console.error('Error checking admin status:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, authLoading, supabase, router, serviceId])

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_categories (
            id,
            name
          )
        `)
        .eq('id', serviceId)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('Service not found')
      }

      setService(data)
      // Initialize form state with service data
      setName(data.name)
      setDescription(data.description || '')
      setPrice((data.price / 100).toString())
      setDuration(data.duration.toString())
      setCategoryId(data.category_id)
      setIsActive(data.is_active)
      setImageUrl(data.image_url || '')
    } catch (err: any) {
      console.error('Error fetching service:', err)
      setError(err.message)
      if (err.message === 'Service not found') {
        router.push('/admin/services')
      }
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name')

      if (error) {
        throw error
      }

      setCategories(data || [])
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setError(err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !price || !duration || !categoryId) {
      setError('Please fill in all required fields')
      return
    }

    // Convert price to cents
    const priceInCents = Math.round(parseFloat(price) * 100)

    if (isNaN(priceInCents) || priceInCents <= 0) {
      setError('Please enter a valid price')
      return
    }

    const durationMinutes = parseInt(duration)

    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      setError('Please enter a valid duration')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const { error: serviceError } = await supabase
        .from('services')
        .update({
          name,
          description,
          price: priceInCents,
          duration: durationMinutes,
          category_id: categoryId,
          is_active: isActive,
          image_url: imageUrl || null,
        })
        .eq('id', serviceId)

      if (serviceError) {
        throw serviceError
      }

      toast({
        title: 'Service Updated',
        description: 'The service has been successfully updated.',
      })

      // Redirect to services page
      router.push('/admin/services')
    } catch (err: any) {
      console.error('Error updating service:', err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Access Denied</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              You do not have permission to access this page.
            </p>
            <div className="mt-10">
              <Link href="/dashboard">
                <Button>Go to User Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Service Not Found</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              The service you are trying to edit does not exist.
            </p>
            <div className="mt-10">
              <Link href="/admin/services">
                <Button>Back to Services</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Edit Service</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Update the details for {service.name}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>
                Modify the details for this service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Service Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Gel Manicure"
                      required
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={categoryId}
                      onValueChange={setCategoryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 45.00"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 60"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the service..."
                      rows={3}
                    />
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Is Active */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <Link href="/admin/services">
                    <Button variant="outline" type="button">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 