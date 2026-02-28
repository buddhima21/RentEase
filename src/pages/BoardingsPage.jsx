import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, MapPin, Users, Star, LoaderCircle, CheckCircle, BedDouble, Wifi, Filter, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { StarRating } from '@/components/ui/StarRating'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { fetchProperties, fetchPropertyById, fetchPropertyReviews } from '@/services/propertiesService'

export default function BoardingsPage() {
  const [properties, setProperties] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [propertyDetail, setPropertyDetail] = useState(null)
  const [propertyReviews, setPropertyReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchProperties()
        if (mounted) {
          setProperties(data || [])
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load properties')
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
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadDetail() {
      if (!selectedPropertyId) {
        setPropertyDetail(null)
        setPropertyReviews([])
        return
      }

      setDetailLoading(true)
      setError('')
      try {
        const [detail, reviewsRes] = await Promise.all([
          fetchPropertyById(selectedPropertyId),
          fetchPropertyReviews(selectedPropertyId, { size: 20 }),
        ])

        if (mounted) {
          setPropertyDetail(detail)
          setPropertyReviews(reviewsRes?.content || [])
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load property details')
        }
      } finally {
        if (mounted) {
          setDetailLoading(false)
        }
      }
    }

    loadDetail()
    return () => {
      mounted = false
    }
  }, [selectedPropertyId])

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getImageUrl = (images) => {
      if (images && images.length > 0) return images[0];
      return 'https://placehold.co/600x400?text=Boarding+Image'; 
  }

  if (selectedPropertyId && propertyDetail) {
    return (
      <div className='space-y-6 max-w-5xl mx-auto'>
        <Button variant='ghost' onClick={() => setSelectedPropertyId('')} className='gap-2'>
          <ArrowLeft className='w-4 h-4' />
          Back to boardings
        </Button>

        {error && (
          <div className='border border-red-100 bg-red-50/60 p-4 rounded-xl text-red-700 font-medium'>
             {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
                 <img 
                    src={getImageUrl(propertyDetail.images)} 
                    alt={propertyDetail.name} 
                    className='w-full h-80 object-cover rounded-3xl shadow-lg border border-slate-100'
                    onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Image+N/A' }}
                 />
                 <div className='grid grid-cols-3 gap-2'>
                    {propertyDetail.images?.slice(1).map((img, i) => (
                        <img key={i} src={img} alt='Gallery' className='w-full h-24 object-cover rounded-xl border border-slate-100 cursor-pointer hover:opacity-90 active:scale-95 transition-all' />
                    ))}
                 </div>
            </div>
            
            <div className='space-y-8'>
                <div>
                    <div className='flex items-center gap-2 mb-2'>
                        <Badge className='bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'>Student Boarding</Badge>
                        {propertyDetail.totalBeds > (propertyDetail.occupiedBeds || 0) && (
                            <Badge className='bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'>Available Now</Badge>
                        )}
                    </div>
                    <h1 className='text-4xl font-black text-slate-900 tracking-tight leading-tight'>{propertyDetail.name}</h1>
                    <div className='flex items-center gap-2 text-slate-500 mt-3 font-medium'>
                        <MapPin className='w-4 h-4 text-rose-500' />
                        {propertyDetail.location}
                    </div>
                </div>

                <div className='grid grid-cols-4 gap-4'>
                    <Card className='bg-slate-50 border-none shadow-none'>
                         <CardContent className='p-4 flex flex-col items-center justify-center text-center'>
                            <Wifi className='w-6 h-6 text-slate-400 mb-2' />
                            <span className='text-xs font-bold text-slate-600'>Free Wi-Fi</span>
                         </CardContent>
                    </Card>
                    <Card className='bg-slate-50 border-none shadow-none'>
                         <CardContent className='p-4 flex flex-col items-center justify-center text-center'>
                            <BedDouble className='w-6 h-6 text-slate-400 mb-2' />
                            <span className='text-xs font-bold text-slate-600'>Furnished</span>
                         </CardContent>
                    </Card>
                     <Card className='bg-slate-50 border-none shadow-none'>
                         <CardContent className='p-4 flex flex-col items-center justify-center text-center'>
                            <Users className='w-6 h-6 text-slate-400 mb-2' />
                            <span className='text-xs font-bold text-slate-600'>Boys Only</span>
                         </CardContent>
                    </Card>
                     <Card className='bg-slate-50 border-none shadow-none'>
                         <CardContent className='p-4 flex flex-col items-center justify-center text-center'>
                            <CheckCircle className='w-6 h-6 text-slate-400 mb-2' />
                            <span className='text-xs font-bold text-slate-600'>Verified</span>
                         </CardContent>
                    </Card>
                </div>

                <div className='flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100'>
                    <div className='space-y-1'>
                       <span className='text-3xl font-black text-slate-900'>4.8</span>
                       <div className='flex gap-1'>
                          {[1,2,3,4,5].map(i => <Star key={i} className='w-4 h-4 fill-amber-400 text-amber-400' />)}
                       </div>
                       <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mt-1'>Out of 5 Stars</p>
                    </div>

                    <div className='w-px h-16 bg-slate-200 mx-4'></div>

                    <div className='space-y-2 flex-1 max-w-xs'>
                       <div className='flex items-center gap-2 text-xs font-bold text-slate-600'>
                          <span className='w-16'>Cleanliness</span>
                          <div className='flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden'>
                             <div className='h-full bg-blue-600 w-[96%]'></div>
                          </div>
                          <span>4.8</span>
                       </div>
                       <div className='flex items-center gap-2 text-xs font-bold text-slate-600'>
                          <span className='w-16'>Safety</span>
                          <div className='flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden'>
                             <div className='h-full bg-blue-600 w-[100%]'></div>
                          </div>
                          <span>5.0</span>
                       </div>
                       <div className='flex items-center gap-2 text-xs font-bold text-slate-600'>
                          <span className='w-16'>Wi-Fi</span>
                          <div className='flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden'>
                             <div className='h-full bg-blue-600 w-[90%]'></div>
                          </div>
                          <span>4.5</span>
                       </div>
                    </div>
                </div>
            </div>
        </div>

        <div className='bg-white rounded-3xl border border-slate-200 p-8 mt-8'>
            <h3 className='font-bold text-xl text-slate-900 mb-6'>Student Reviews</h3>
            
            <div className='grid gap-6'>
                {!detailLoading && propertyReviews.map((review) => (
                  <div key={review.id} className='border-b border-slate-100 last:border-0 pb-6 last:pb-0'>
                      <div className='flex items-start justify-between mb-3'>
                          <div className='flex items-center gap-3'>
                             <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold'>
                                {review.title?.charAt(0) || 'U'}
                             </div>
                             <div>
                                <h4 className='font-bold text-slate-900 text-sm'>{review.title}</h4>
                                <div className='flex items-center gap-1 text-xs text-slate-400'>
                                   <CheckCircle className='w-3 h-3 text-emerald-500' />
                                   Verified Stay • {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                             </div>
                          </div>
                          <div className='flex text-amber-400'>
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} className='w-3 h-3' />
                             ))}
                          </div>
                      </div>
                      
                      <p className='text-slate-600 text-sm italic mb-3'>&quot;{review.body}&quot;</p>
                      
                      {review.tags && (
                         <div className='flex gap-2'>
                            {review.tags.map(tag => (
                               <Badge key={tag} variant='secondary' className='text-[10px] px-2 h-5 bg-slate-100 text-slate-600 hover:bg-slate-200'>
                                  {tag.replace('_', ' ')}
                               </Badge>
                            ))}
                         </div>
                      )}
                  </div>
                ))}
            </div>
            
             <div className='mt-8 pt-8 border-t border-slate-100'>
                 <div className='flex items-center justify-between p-6 bg-slate-50 rounded-2xl'>
                     <div>
                        <p className='text-xs text-slate-500 font-bold uppercase mb-1'>Total Due</p>
                        <p className='text-2xl font-black text-blue-600'>LKR {propertyDetail.price ? propertyDetail.price.toLocaleString() : 'N/A'}</p>
                     </div>
                     <Button size='lg' className='rounded-xl px-8 font-bold'>Request Booking</Button>
                 </div>
             </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-8 max-w-7xl mx-auto'>
      <div>
        <h1 className='text-4xl font-black text-slate-900 tracking-tight'>Student Hub Boardings</h1>
        <p className='text-slate-500 mt-2 font-medium'>Discover the highest-rated student accommodation in Malabe.</p>
      </div>

      <div className='flex gap-4'>
         <div className='relative flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group focus-within:ring-2 ring-blue-500/20 transition-all'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors' />
            <Input 
               placeholder='Search location...' 
               className='pl-12 h-14 border-none text-base bg-transparent shadow-none focus-visible:ring-0' 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <Button variant='outline' className='h-14 w-14 rounded-2xl border-slate-200 hover:bg-slate-50 p-0 flex items-center justify-center shrink-0'>
            <Filter className='h-5 w-5 text-slate-600' />
         </Button>
      </div>

      {error && (
        <div className='border border-red-100 bg-red-50/60 p-4 rounded-xl text-red-700 font-medium'>{error}</div>
      )}

      {loading ? (
        <div className='flex flex-col items-center justify-center h-64 gap-4 text-slate-400'>
          <LoaderCircle className='w-8 h-8 animate-spin text-blue-500' />
          <p className='font-medium'>Loading properties...</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8'>
          {filteredProperties.map((property) => (
            <Card 
               key={property.id} 
               className='group cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-300 bg-white rounded-3xl ring-1 ring-slate-100' 
               onClick={() => setSelectedPropertyId(property.id)}
            >
              <div className='h-64 overflow-hidden relative'>
                  <img 
                    src={getImageUrl(property.images)} 
                    alt={property.name} 
                    className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
                  />
                  {/* Price Tag */}
                  <div className='absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-slate-900 px-4 py-2 rounded-full text-sm font-black shadow-lg'>
                     LKR {property.price ? property.price.toLocaleString() : 'N/A'}
                  </div>
                  
                  {/* Verified Badge */}
                  <div className='absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5'>
                      <CheckCircle className='w-3.5 h-3.5' />
                      Verified
                  </div>
                  
                  {/* Rating Badge */}
                  <div className='absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 border border-white/10'>
                      <Star className='w-3.5 h-3.5 fill-amber-400 text-amber-400' />
                      4.8 (42)
                  </div>
              </div>
              
              <CardContent className='p-6'>
                  <div className='mb-4'>
                    <h3 className='font-extrabold text-2xl text-slate-900 group-hover:text-blue-600 transition-colors mb-2 tracking-tight'>{property.name}</h3>
                    <div className='flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider'>
                        <MapPin className='w-3.5 h-3.5 text-rose-500' />
                        {property.location}
                    </div>
                  </div>

                  <div className='flex items-center gap-4 mb-6'>
                     <div className='flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold'>
                        <Wifi className='w-3.5 h-3.5' /> Wi-Fi
                     </div>
                     <div className='flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold'>
                        <Users className='w-3.5 h-3.5' /> Study Area
                     </div>
                     <div className='flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold'>
                        <CheckCircle className='w-3.5 h-3.5' /> CCTV
                     </div>
                  </div>
                  
                  {/* Live Occupancy */}
                  <div className='space-y-2'>
                      <div className='flex justify-between items-end'>
                         <span className='text-xs font-bold text-slate-400 uppercase tracking-wider'>Live Occupancy</span>
                         <span className='text-xl font-black text-slate-900'>{((property.occupiedBeds || 0) / property.totalBeds * 100).toFixed(0)}%</span>
                      </div>
                      <div className='h-2.5 w-full bg-slate-100 rounded-full overflow-hidden'>
                         <div 
                            className='h-full bg-blue-600 rounded-full transition-all duration-1000' 
                            style={{ width: `${((property.occupiedBeds || 0) / property.totalBeds * 100)}%` }}
                         ></div>
                      </div>
                  </div>
                  
                  <div className='mt-6 pt-6 border-t border-slate-100 flex justify-end'>
                      <Button variant='outline' className='rounded-xl font-bold hover:bg-slate-50 border-slate-200'>
                          Details
                          <ArrowLeft className='w-4 h-4 rotate-180 ml-2' />
                      </Button>
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!loading && !properties.length && <p className='text-slate-500 text-center py-12'>No properties matches your search.</p>}
    </div>
  )
}
