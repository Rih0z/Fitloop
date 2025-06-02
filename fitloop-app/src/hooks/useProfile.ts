import { useState, useEffect, useCallback } from 'react'
import type { UserProfile } from '../models/user'
import { ProfileService } from '../services/ProfileService'
import { StorageManager } from '../lib/db'

const storage = new StorageManager()
const profileService = new ProfileService(storage)

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const savedProfile = await profileService.getProfile()
      setProfile(savedProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    setLoading(true)
    setError(null)
    try {
      await profileService.saveProfile(newProfile)
      setProfile(newProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) {
      throw new Error('No profile to update')
    }

    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    }

    await saveProfile(updatedProfile)
  }, [profile, saveProfile])

  // Load profile on mount
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return {
    profile,
    loading,
    error,
    saveProfile,
    updateProfile,
    reloadProfile: loadProfile
  }
}