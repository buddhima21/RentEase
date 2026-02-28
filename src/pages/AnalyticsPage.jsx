import React, { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { ShieldCheck } from 'lucide-react'
import { useRole } from '../context/RoleContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { fetchAnalyticsOverview } from '@/services/analyticsService'
import { fetchProperties } from '@/services/propertiesService'

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']

export default function AnalyticsPage() {
  const { role } = useRole()
  const [selectedPropertyId, setSelectedPropertyId] = useState('all')
  const [properties, setProperties] = useState([])
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (role === 'tenant') {
      return
    }

    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [propertiesRes, overviewRes] = await Promise.all([
          fetchProperties(),
          fetchAnalyticsOverview({ propertyId: selectedPropertyId }),
        ])

        if (mounted) {
          setProperties(propertiesRes || [])
          setOverview(overviewRes)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load analytics')
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
  }, [role, selectedPropertyId])

  const incomeTrend = useMemo(
    () => (overview?.incomeTrend || []).map((item) => ({ name: item.period, value: item.value || 0 })),
    [overview],
  )

  const occupancyTrend = useMemo(
    () => (overview?.occupancyTrend || []).map((item) => ({ name: item.period, value: item.value || 0 })),
    [overview],
  )

  const issueBreakdown = overview?.issueBreakdown || []
  const revenueByBoarding = overview?.revenueByBoarding || []

  if (role === 'tenant') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Access Restricted</h1>
        <p className="text-slate-500 max-w-md">Analytics are available for owner and admin roles.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin System Analytics</h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time platform performance metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-slate-100 text-slate-700 border-none">Role: {role}</Badge>
          <select
            value={selectedPropertyId}
            onChange={(event) => setSelectedPropertyId(event.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium"
          >
            <option value="all">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          <Button variant="outline" className="h-10">Refresh</Button>
        </div>
      </div>

      {error && (
        <Card className="border border-red-100 bg-red-50/60">
          <CardContent className="p-4 text-red-700 font-medium">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>All-time earnings</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-black">{loading ? '...' : `LKR ${Math.round(overview?.kpis?.totalRevenue || 0).toLocaleString()}`}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
            <CardDescription>Current utilization</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-black">{loading ? '...' : `${(overview?.kpis?.occupancyRate || 0).toFixed(1)}%`}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
            <CardDescription>Platform satisfaction</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-black">{loading ? '...' : (overview?.kpis?.averageRating || 0).toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Review Volume</CardTitle>
            <CardDescription>Total feedback</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-black">{loading ? '...' : overview?.kpis?.reviewVolume || 0}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Velocity</CardTitle>
            <CardDescription>Monthly income trajectory</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeTrend}>
                <defs>
                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Pulse</CardTitle>
            <CardDescription>Tenant retention metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyTrend}>
                 <defs>
                   <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOccupancy)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Property</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByBoarding.map((item) => ({ name: item.propertyName, value: item.revenue }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" hide />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={issueBreakdown} dataKey="count" nameKey="label" innerRadius={60} outerRadius={100} paddingAngle={5}>
                  {issueBreakdown.map((item, index) => (
                    <Cell key={`${item.label}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
