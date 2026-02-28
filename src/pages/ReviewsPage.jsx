import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRole } from '../context/RoleContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/StarRating'
import { AlertTriangle, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import {
  fetchTenantReviews,
  fetchTenantReviewWriteOptions,
  fetchOwnerReviews,
  fetchAdminReviews,
  createReview,
  updateReview,
  deleteReview,
  ownerHideReview,
  ownerUnhideReview,
  adminHideReview,
  adminUnhideReview,
  adminRemoveReview,
  adminRestoreReview,
} from '@/services/reviewsService'
import { fetchProperties } from '@/services/propertiesService'
import { toast } from 'sonner'

const EMPTY_CREATE_FORM = {
  propertyId: '',
  rentalAgreementId: '',
  rating: 5,
  title: '',
  body: '',
}

const EMPTY_EDIT_FORM = {
  rating: 5,
  title: '',
  body: '',
}

function statusTone(status) {
  if (status === 'PUBLISHED') {
    return 'bg-emerald-50 text-emerald-700'
  }
  if (status === 'HIDDEN') {
    return 'bg-amber-50 text-amber-700'
  }
  if (status === 'REMOVED' || status === 'REMOVED_BY_TENANT') {
    return 'bg-rose-50 text-rose-700'
  }
  return 'bg-slate-100 text-slate-700'
}

function validateReviewForm(form, requireAgreement) {
  if (requireAgreement) {
    if (!form.propertyId) {
      return 'Please select a property'
    }
    if (!form.rentalAgreementId) {
      return 'Please select a verified rental agreement'
    }
  }

  const rating = Number(form.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return 'Rating must be between 1 and 5'
  }

  const title = (form.title || '').trim()
  if (!title) {
    return 'Title is required'
  }
  if (title.length > 80) {
    return 'Title must be 80 characters or fewer'
  }

  const body = (form.body || '').trim()
  if (!body) {
    return 'Review body is required'
  }
  if (body.length > 2000) {
    return 'Review body must be 2000 characters or fewer'
  }

  return ''
}

export default function ReviewsPage() {
  const { role } = useRole()
  const requestTokenRef = useRef(0)

  const [properties, setProperties] = useState([])
  const [reviews, setReviews] = useState([])
  const [writeOptions, setWriteOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM)
  const [creating, setCreating] = useState(false)

  const [editingReviewId, setEditingReviewId] = useState('')
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM)
  const [savingReviewId, setSavingReviewId] = useState('')
  const [deletingReviewId, setDeletingReviewId] = useState('')
  const [actingReviewId, setActingReviewId] = useState('')

  const propertyById = useMemo(() => {
    const map = {}
    properties.forEach((item) => {
      map[item.id] = item
    })
    return map
  }, [properties])

  const tenantPropertyOptions = useMemo(() => {
    const map = {}
    writeOptions.forEach((option) => {
      if (!map[option.propertyId]) {
        map[option.propertyId] = option.propertyName || option.propertyId
      }
    })
    return Object.entries(map).map(([id, name]) => ({ id, name }))
  }, [writeOptions])

  const agreementsForSelectedProperty = useMemo(() => {
    if (!createForm.propertyId) {
      return []
    }
    return writeOptions.filter((option) => option.propertyId === createForm.propertyId)
  }, [writeOptions, createForm.propertyId])

  function resetTransientState() {
    setShowCreateForm(false)
    setCreateForm(EMPTY_CREATE_FORM)
    setEditingReviewId('')
    setEditForm(EMPTY_EDIT_FORM)
    setCreating(false)
    setSavingReviewId('')
    setDeletingReviewId('')
    setActingReviewId('')
  }

  function prepareCreateForm() {
    if (!writeOptions.length) {
      setCreateForm(EMPTY_CREATE_FORM)
      return
    }

    const first = writeOptions[0]
    setCreateForm((current) => ({
      ...current,
      propertyId: first.propertyId,
      rentalAgreementId: first.rentalAgreementId,
      rating: 5,
      title: '',
      body: '',
    }))
  }

  async function loadReviews() {
    const token = ++requestTokenRef.current
    setLoading(true)
    setError('')

    try {
      const [propertiesRes, reviewsRes, writeOptionsRes] = await Promise.all([
        fetchProperties(),
        role === 'tenant'
          ? fetchTenantReviews({ size: 50 })
          : role === 'owner'
            ? fetchOwnerReviews({ size: 50 })
            : fetchAdminReviews({ size: 50 }),
        role === 'tenant' ? fetchTenantReviewWriteOptions() : Promise.resolve([]),
      ])

      if (token !== requestTokenRef.current) {
        return
      }

      setProperties(propertiesRes || [])
      setReviews(reviewsRes?.content || [])
      setWriteOptions(writeOptionsRes || [])
    } catch (err) {
      if (token !== requestTokenRef.current) {
        return
      }
      setError(err.message || 'Failed to load reviews')
    } finally {
      if (token === requestTokenRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    resetTransientState()
    setWriteOptions([])
    loadReviews()

    return () => {
      requestTokenRef.current += 1
    }
  }, [role])

  function openCreateForm() {
    prepareCreateForm()
    setShowCreateForm(true)
  }

  function closeCreateForm() {
    setShowCreateForm(false)
    setCreateForm(EMPTY_CREATE_FORM)
  }

  function startEditReview(review) {
    setEditingReviewId(review.id)
    setEditForm({
      rating: review.rating || 1,
      title: review.title || '',
      body: review.body || '',
    })
  }

  function cancelEditReview() {
    setEditingReviewId('')
    setEditForm(EMPTY_EDIT_FORM)
  }

  function onCreatePropertyChange(propertyId) {
    const agreements = writeOptions.filter((option) => option.propertyId === propertyId)
    setCreateForm((current) => ({
      ...current,
      propertyId,
      rentalAgreementId: agreements[0]?.rentalAgreementId || '',
    }))
  }

  function onCreateAgreementChange(rentalAgreementId) {
    const option = writeOptions.find((item) => item.rentalAgreementId === rentalAgreementId)
    setCreateForm((current) => ({
      ...current,
      rentalAgreementId,
      propertyId: option?.propertyId || current.propertyId,
    }))
  }

  async function handleTenantCreate() {
    if (creating) {
      return
    }

    const errorText = validateReviewForm(createForm, true)
    if (errorText) {
      toast.error(errorText)
      return
    }

    const selectedOption = writeOptions.find((item) => item.rentalAgreementId === createForm.rentalAgreementId)
    if (!selectedOption || selectedOption.propertyId !== createForm.propertyId) {
      toast.error('Selected agreement does not match selected property')
      return
    }

    setCreating(true)
    try {
      await createReview(createForm.propertyId, {
        rentalAgreementId: createForm.rentalAgreementId,
        rating: Number(createForm.rating),
        title: createForm.title.trim(),
        body: createForm.body.trim(),
        tags: [],
        photoUrls: [],
      })
      toast.success('Review created')
      closeCreateForm()
      await loadReviews()
    } catch (err) {
      toast.error(err.message || 'Failed to create review')
    } finally {
      setCreating(false)
    }
  }

  async function handleTenantSave(review) {
    if (savingReviewId) {
      return
    }

    const errorText = validateReviewForm(editForm, false)
    if (errorText) {
      toast.error(errorText)
      return
    }

    const confirmed = window.confirm('Are you sure you want to update this review?')
    if (!confirmed) {
      return
    }

    setSavingReviewId(review.id)
    try {
      await updateReview(review.id, {
        rating: Number(editForm.rating),
        subRatings: review.subRatings || null,
        title: editForm.title.trim(),
        body: editForm.body.trim(),
        tags: review.tags || [],
        photoUrls: review.photoUrls || [],
      })
      toast.success('Review updated')
      cancelEditReview()
      await loadReviews()
    } catch (err) {
      toast.error(err.message || 'Failed to update review')
    } finally {
      setSavingReviewId('')
    }
  }

  async function handleTenantDelete(reviewId) {
    if (deletingReviewId) {
      return
    }

    const confirmed = window.confirm('Are you sure you want to delete this review?')
    if (!confirmed) {
      return
    }

    setDeletingReviewId(reviewId)
    try {
      await deleteReview(reviewId)
      toast.success('Review removed')
      await loadReviews()
    } catch (err) {
      toast.error(err.message || 'Failed to delete review')
    } finally {
      setDeletingReviewId('')
    }
  }

  async function handleOwnerToggle(review) {
    if (actingReviewId) {
      return
    }
    if (review.status !== 'PUBLISHED' && review.status !== 'HIDDEN') {
      return
    }

    setActingReviewId(review.id)
    try {
      if (review.status === 'HIDDEN') {
        await ownerUnhideReview(review.id)
        toast.success('Review is visible again')
      } else {
        await ownerHideReview(review.id)
        toast.success('Review hidden')
      }
      await loadReviews()
    } catch (err) {
      toast.error(err.message || 'Owner action failed')
    } finally {
      setActingReviewId('')
    }
  }

  async function handleAdminAction(review, action) {
    if (actingReviewId) {
      return
    }

    if (action === 'hide' && review.status !== 'PUBLISHED') {
      return
    }
    if (action === 'unhide' && review.status !== 'HIDDEN') {
      return
    }
    if (action === 'restore' && review.status !== 'REMOVED') {
      return
    }

    setActingReviewId(review.id)
    try {
      if (action === 'hide') {
        await adminHideReview(review.id)
      } else if (action === 'unhide') {
        await adminUnhideReview(review.id)
      } else if (action === 'remove') {
        await adminRemoveReview(review.id)
      } else if (action === 'restore') {
        await adminRestoreReview(review.id)
      }
      toast.success('Action completed')
      await loadReviews()
    } catch (err) {
      toast.error(err.message || 'Admin action failed')
    } finally {
      setActingReviewId('')
    }
  }

  if (role === 'tenant') {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Boarding Reviews</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your feedback and experiences.</p>
          </div>
          <Button onClick={openCreateForm} className="gap-2" variant="outline" disabled={loading}>
            <Plus size={16} />
            Write a Review
          </Button>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}
        {loading && <p className="text-slate-500">Loading your reviews...</p>}

        {showCreateForm && (
          <Card className="border border-blue-100">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
              <CardDescription>Only verified stays are available for review submission.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!writeOptions.length && (
                <div className="rounded-lg bg-amber-50 text-amber-700 p-3 text-sm">
                  No eligible verified stays available right now.
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-slate-600 font-medium">Property</span>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                    value={createForm.propertyId}
                    onChange={(event) => onCreatePropertyChange(event.target.value)}
                    disabled={!writeOptions.length || creating}
                  >
                    <option value="">Select property</option>
                    {tenantPropertyOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="text-slate-600 font-medium">Rental Agreement</span>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                    value={createForm.rentalAgreementId}
                    onChange={(event) => onCreateAgreementChange(event.target.value)}
                    disabled={!agreementsForSelectedProperty.length || creating}
                  >
                    <option value="">Select agreement</option>
                    {agreementsForSelectedProperty.map((option) => (
                      <option key={option.rentalAgreementId} value={option.rentalAgreementId}>
                        {option.rentalAgreementId} ({option.agreementStatus})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <span className="text-slate-600 font-medium text-sm">Rating</span>
                <StarRating
                  rating={Number(createForm.rating)}
                  interactive
                  onRatingChange={(value) => setCreateForm((current) => ({ ...current, rating: value }))}
                />
              </div>

              <label className="block space-y-2 text-sm">
                <span className="text-slate-600 font-medium">Title</span>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                  value={createForm.title}
                  maxLength={80}
                  onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                  disabled={creating}
                />
                <span className="text-xs text-slate-400">{createForm.title.length}/80</span>
              </label>

              <label className="block space-y-2 text-sm">
                <span className="text-slate-600 font-medium">Review</span>
                <textarea
                  className="w-full min-h-32 rounded-xl border border-slate-200 bg-white p-3 text-sm"
                  value={createForm.body}
                  maxLength={2000}
                  onChange={(event) => setCreateForm((current) => ({ ...current, body: event.target.value }))}
                  disabled={creating}
                />
                <span className="text-xs text-slate-400">{createForm.body.length}/2000</span>
              </label>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={closeCreateForm} disabled={creating}>
                  Cancel
                </Button>
                <Button onClick={handleTenantCreate} disabled={creating || !writeOptions.length}>
                  {creating ? 'Saving...' : 'Submit Review'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {!loading && reviews.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-500">You have not posted any reviews yet.</p>
              <Button className="mt-4" variant="outline" onClick={openCreateForm}>
                Write a Review
              </Button>
            </div>
          )}

          {!loading &&
            reviews.map((review) => (
              <div key={review.id} className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      {propertyById[review.propertyId]?.name || review.propertyId}
                    </h3>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating || 0} size={14} />
                      <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge className={`${statusTone(review.status)} border-none`}>{review.status}</Badge>
                </div>

                {editingReviewId === review.id ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-sm text-slate-600 font-medium">Rating</span>
                      <StarRating
                        rating={Number(editForm.rating)}
                        interactive
                        onRatingChange={(value) => setEditForm((current) => ({ ...current, rating: value }))}
                      />
                    </div>
                    <input
                      type="text"
                      className="w-full p-3 rounded-xl border border-slate-200"
                      value={editForm.title}
                      maxLength={80}
                      onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                    />
                    <textarea
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200"
                      rows={4}
                      maxLength={2000}
                      value={editForm.body}
                      onChange={(event) => setEditForm((current) => ({ ...current, body: event.target.value }))}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={cancelEditReview} disabled={savingReviewId === review.id}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleTenantSave(review)} disabled={savingReviewId === review.id}>
                        {savingReviewId === review.id ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold text-slate-800 mb-2">{review.title}</h4>
                    <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl text-sm border border-slate-50">
                      {review.body}
                    </p>
                  </>
                )}

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                  <div className="flex gap-2">
                    {(review.tags || []).map((tag) => (
                      <span key={tag} className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {review.status === 'PUBLISHED' && (
                      <Button size="sm" variant="outline" onClick={() => startEditReview(review)} disabled={!!savingReviewId || !!deletingReviewId}>
                        Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleTenantDelete(review.id)}
                      disabled={deletingReviewId === review.id || !!savingReviewId}
                    >
                      {deletingReviewId === review.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {role === 'admin' ? 'Platform Moderation' : 'Review Management'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {role === 'admin' ? 'Monitor and moderate content across the platform.' : 'Manage reviews for your properties.'}
          </p>
        </div>
        <Badge className="bg-slate-100 text-slate-700 border-none">Role: {role}</Badge>
      </div>

      {error && (
        <Card className="border border-red-100 bg-red-50/60">
          <CardContent className="p-4 text-red-700 font-medium">{error}</CardContent>
        </Card>
      )}

      {loading && <p className="text-slate-500">Loading reviews...</p>}
      {!loading && !reviews.length && <p className="text-slate-500">No reviews found.</p>}

      <div className="grid gap-5">
        {!loading &&
          reviews.map((review) => {
            const propertyName = propertyById[review.propertyId]?.name || review.propertyId
            const isFlagged = (review.reportsCount || 0) > 0

            return (
              <Card key={review.id} className={`border ${isFlagged ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {isFlagged && <AlertTriangle className="text-amber-500" size={20} />}
                      <div>
                        <CardTitle className="text-lg">{review.title}</CardTitle>
                        <CardDescription>
                          {propertyName} • {new Date(review.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating || 0} size={14} />
                      <Badge className={`${statusTone(review.status)} border-none`}>{review.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">{review.body}</p>

                  {!!(review.tags || []).length && (
                    <div className="flex flex-wrap gap-2">
                      {review.tags.map((tag) => (
                        <Badge key={tag} className="bg-white border border-slate-200 text-slate-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100/50 justify-end">
                    {role === 'owner' && (review.status === 'PUBLISHED' || review.status === 'HIDDEN') && (
                      <Button
                        variant={review.status === 'HIDDEN' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOwnerToggle(review)}
                        disabled={!!actingReviewId}
                      >
                        {review.status === 'HIDDEN' ? <Eye size={14} className="mr-2" /> : <EyeOff size={14} className="mr-2" />}
                        {review.status === 'HIDDEN' ? 'Show Review' : 'Hide Review'}
                      </Button>
                    )}

                    {role === 'admin' && (
                      <>
                        {review.status === 'PUBLISHED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => handleAdminAction(review, 'hide')}
                            disabled={!!actingReviewId}
                          >
                            <EyeOff size={14} className="mr-2" /> Hide
                          </Button>
                        )}
                        {review.status === 'HIDDEN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => handleAdminAction(review, 'unhide')}
                            disabled={!!actingReviewId}
                          >
                            <Eye size={14} className="mr-2" /> Restore Visibility
                          </Button>
                        )}
                        {review.status !== 'REMOVED' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAdminAction(review, 'remove')}
                            disabled={!!actingReviewId}
                          >
                            <Trash2 size={14} className="mr-2" /> Remove
                          </Button>
                        )}
                        {review.status === 'REMOVED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => handleAdminAction(review, 'restore')}
                            disabled={!!actingReviewId}
                          >
                            <Eye size={14} className="mr-2" /> Restore
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
