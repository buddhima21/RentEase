import React, { useEffect, useMemo, useState } from 'react'
import { useRole } from '../context/RoleContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { 
  Wifi, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Search, 
  PenTool, 
  Home,
  ShieldCheck,
  Zap,
  CreditCard
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { fetchProperties } from '@/services/propertiesService'
import { fetchTenantReviews, fetchOwnerReviews, fetchAdminReviews } from '@/services/reviewsService'
import { fetchAnalyticsOverview } from '@/services/analyticsService'

function formatCurrency(value) {
  return `LKR ${Math.round(value || 0).toLocaleString()}`
}

export default function DashboardPage() {
  const { role } = useRole()
  const [properties, setProperties] = useState([])
  const [reviews, setReviews] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const propsPromise = fetchProperties()
        const reviewsPromise = role === 'tenant'
          ? fetchTenantReviews({ size: 5 })
          : role === 'owner'
            ? fetchOwnerReviews({ size: 5 })
            : fetchAdminReviews({ size: 5 })

        const [propsRes, reviewsRes] = await Promise.all([propsPromise, reviewsPromise])

        if (!mounted) {
          return
        }

        setProperties(propsRes || [])
        setReviews(reviewsRes?.content || [])

        if (role === 'owner' || role === 'admin') {
          const analyticsRes = await fetchAnalyticsOverview({ propertyId: 'all' })
          if (mounted) {
            setAnalytics(analyticsRes)
          }
        } else {
          setAnalytics(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load dashboard data')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [role])

  const occupancyAverage = useMemo(() => {
    if (!properties.length) {
      return 0
    }
    const sum = properties.reduce((acc, item) => acc + (item.occupancyRate || 0), 0)
    return sum / properties.length
  }, [properties])

  const trendData = (analytics?.incomeTrend || []).map((item) => ({
    name: item.period,
    value: item.value || 0,
  }))

  const activeProperty = properties.find(p => p.name === 'Green View Residency') || properties[0]

  if (role === 'tenant') {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hi, Atheeq</h1>
            <p className="text-slate-500 mt-2 font-medium">Welcome back to your dashboard.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
             <img src="https://ui-avatars.com/api/?name=Atheeq&background=0D8ABC&color=fff" alt="Profile" />
          </div>
        </div>

        {/* Active Session Card */}
        <div className={`rounded-3xl p-8 text-white relative overflow-hidden ${activeProperty ? 'bg-blue-600' : 'bg-slate-800'}`}>
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap size={140} />
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1 backdrop-blur-sm">
                   Active Session
                </Badge>
                <span className="text-blue-100 text-sm font-medium">Updated 2m ago</span>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between gap-8">
                 <div>
                    <h2 className="text-3xl font-bold mb-2">{activeProperty?.name || "Loading..."}</h2>
                    <div className="flex items-center gap-2 text-blue-100 mb-6">
                       <MapPin size={16} />
                       {activeProperty?.location || "Loading..."}
                    </div>
                    
                    <div className="flex gap-6">
                       <div>
                          <p className="text-blue-200 text-xs uppercase font-bold tracking-wider mb-1">Status</p>
                          <p className="font-semibold text-lg flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                             Check-in
                          </p>
                       </div>
                       <div>
                           <p className="text-blue-200 text-xs uppercase font-bold tracking-wider mb-1">Next Payment</p>
                           <p className="font-semibold text-lg">LKR 12,500</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md min-w-[280px]">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Wifi className="text-blue-200" size={20} />
                              <div>
                                 <p className="text-xs text-blue-200 font-medium">Wifi Pass</p>
                                 <p className="font-bold">GV_RES_5G</p>
                              </div>
                           </div>
                        </div>
                        <div className="w-full h-px bg-white/10"></div>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Clock className="text-blue-200" size={20} />
                              <div>
                                 <p className="text-xs text-blue-200 font-medium">Gate Curfew</p>
                                 <p className="font-bold">10:30 PM</p>
                              </div>
                           </div>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Quick Toolbox */}
        <div>
           <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Toolbox</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-6 flex flex-col gap-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                 <PenTool size={24} />
                 <span>Write a Review</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col gap-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                 <Search size={24} />
                 <span>Find Boardings</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex flex-col gap-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                 <CreditCard size={24} />
                 <span>Payments</span>
              </Button>
               <Button variant="outline" className="h-auto py-6 flex flex-col gap-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                 <ShieldCheck size={24} />
                 <span>Report Issue</span>
              </Button>
           </div>
        </div>

        {/* Explore More Stays */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Explore More Stays</h3>
              <Button variant="link" className="text-blue-600">View All</Button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.slice(0, 3).map(property => (
                 <Card key={property.id} className="overflow-hidden border-slate-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="h-48 bg-slate-200 relative">
                       <img 
                          src={property.images?.[0] || "https://placehold.co/600x400?text=Boarding"} 
                          alt={property.name}
                          className="w-full h-full object-cover"
                       />
                       <Badge className="absolute top-3 right-3 bg-white/90 text-slate-900 hover:bg-white border-none shadow-sm backdrop-blur-sm">
                          {property.totalBeds > 0 ? 'Available' : 'Full'}
                       </Badge>
                    </div>
                    <CardContent className="p-5">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-slate-900 line-clamp-1">{property.name}</h4>
                          <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">
                             LKR {property.price ? (property.price / 1000).toFixed(1) + 'k' : 'N/A'}
                          </span>
                       </div>
                       <p className="text-slate-500 text-sm mb-4 flex items-center gap-1">
                          <MapPin size={14} /> {property.location}
                       </p>
                       <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                             <StarRating rating={4.8} size={14} />
                             <span className="text-xs font-bold text-slate-600 ml-1">4.8</span>
                          </div>
                          <Button size="sm" variant="secondary" className="h-8 text-xs">Details</Button>
                       </div>
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-2 font-medium">Live data from the backend services.</p>
      </div>

      {error && (
        <Card className="border border-red-100 bg-red-50/60">
          <CardContent className="p-4 text-red-700 font-medium">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>Total properties in scope</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-black">{loading ? '...' : properties.length}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Occupancy</CardTitle>
            <CardDescription>Across visible properties</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-black">{loading ? '...' : `${occupancyAverage.toFixed(1)}%`}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest records from API</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-black">{loading ? '...' : reviews.length}</CardContent>
        </Card>
      </div>

      {(role === 'owner' || role === 'admin') && analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Income Trend</CardTitle>
            <CardDescription>{formatCurrency(analytics?.kpis?.totalRevenue)} total revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#dbeafe" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Latest Reviews</CardTitle>
          <CardDescription>Fetched using role-aware endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-slate-500">Loading reviews...</p>}
          {!loading && reviews.length === 0 && <p className="text-slate-500">No reviews available.</p>}
          {!loading && reviews.map((review) => (
            <div key={review.id} className="border border-slate-100 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="font-bold text-slate-900">{review.title}</div>
                <Badge className="bg-slate-100 text-slate-700 border-none">{review.status}</Badge>
              </div>
              <div className="mb-2">
                <StarRating rating={review.rating || 0} size={14} />
              </div>
              <p className="text-slate-600 text-sm">{review.body}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    {properties.find(p => p.id === review.propertyId)?.name || review.propertyId}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
