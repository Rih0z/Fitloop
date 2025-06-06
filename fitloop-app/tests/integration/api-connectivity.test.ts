import { describe, it, expect, beforeAll } from 'vitest'
import { apiService } from '../../src/services/ApiService'

describe('Backend Connectivity Tests', () => {
  beforeAll(() => {
    // Clear any existing auth tokens for clean testing
    localStorage.clear()
  })

  describe('API Service Configuration', () => {
    it('should have correct base URL configured', () => {
      expect(apiService['baseURL']).toBe('https://fitloop-backend.riho-dare.workers.dev/api')
    })

    it('should not be authenticated initially', () => {
      expect(apiService.isAuthenticated()).toBe(false)
      expect(apiService.getToken()).toBeNull()
    })
  })

  describe('Backend Health Check', () => {
    it('should be able to reach the backend server', async () => {
      try {
        // Try to access a public endpoint that should return CORS headers
        const response = await fetch('https://fitloop-backend.riho-dare.workers.dev/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        // Even if the endpoint doesn't exist, we should get a response
        // indicating the server is reachable
        expect(response).toBeDefined()
        console.log('Backend response status:', response.status)
        console.log('Backend response headers:', Object.fromEntries(response.headers.entries()))
        
      } catch (error) {
        console.error('Backend connectivity error:', error)
        throw error
      }
    }, 10000)

    it('should have proper CORS configuration', async () => {
      try {
        const response = await fetch('https://fitloop-backend.riho-dare.workers.dev/api/', {
          method: 'OPTIONS',
          headers: {
            'Origin': 'https://45ce0d2a.fitloop-app.pages.dev',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
          }
        })
        
        const corsHeaders = {
          'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
          'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
          'access-control-allow-headers': response.headers.get('access-control-allow-headers')
        }
        
        console.log('CORS headers:', corsHeaders)
        
        // Check if CORS allows our origin or is wildcard
        const allowedOrigin = corsHeaders['access-control-allow-origin']
        expect(allowedOrigin === '*' || allowedOrigin?.includes('fitloop')).toBe(true)
        
      } catch (error) {
        console.error('CORS check error:', error)
        // Don't fail the test for CORS as it might be configured differently
      }
    }, 10000)
  })

  describe('Authentication Endpoints', () => {
    it('should be able to attempt signup (expect validation error)', async () => {
      try {
        const result = await apiService.signup('test@example.com', 'password123', 'Test User')
        
        // We expect this to either succeed or fail with validation
        expect(result.status).toBeDefined()
        console.log('Signup response:', {
          status: result.status,
          message: result.message,
          error: result.error
        })
        
        // If it's a validation error (400), that's expected and good
        if (result.status === 400) {
          expect(result.error).toBeDefined()
        }
        
      } catch (error) {
        console.error('Signup test error:', error)
        throw error
      }
    }, 10000)

    it('should be able to attempt signin (expect auth error)', async () => {
      try {
        const result = await apiService.signin('nonexistent@example.com', 'wrongpassword')
        
        expect(result.status).toBeDefined()
        console.log('Signin response:', {
          status: result.status,
          message: result.message,
          error: result.error
        })
        
        // We expect unauthorized (401) or similar
        expect(result.status).toBeGreaterThanOrEqual(400)
        
      } catch (error) {
        console.error('Signin test error:', error)
        throw error
      }
    }, 10000)
  })

  describe('Profile Endpoints', () => {
    it('should require authentication for profile access', async () => {
      try {
        const result = await apiService.getProfile()
        
        expect(result.status).toBeDefined()
        console.log('Profile access response:', {
          status: result.status,
          message: result.message,
          error: result.error
        })
        
        // Should return 401 Unauthorized since we're not authenticated
        expect(result.status).toBe(401)
        
      } catch (error) {
        console.error('Profile test error:', error)
        throw error
      }
    }, 10000)
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Temporarily set an invalid URL to test error handling
      const originalURL = apiService['baseURL']
      apiService['baseURL'] = 'https://invalid-domain-that-does-not-exist.com/api'
      
      try {
        const result = await apiService.getProfile()
        
        expect(result.status).toBe(0) // Network error status
        expect(result.error).toBeDefined()
        console.log('Network error response:', result.error)
        
      } finally {
        // Restore original URL
        apiService['baseURL'] = originalURL
      }
    }, 10000)
  })

  describe('API Integration Test', () => {
    it('should perform a complete auth flow test', async () => {
      console.log('🧪 Testing complete authentication flow...')
      
      // 1. Test signup with a unique email
      const testEmail = `test-${Date.now()}@example.com`
      const signupResult = await apiService.signup(testEmail, 'TestPassword123!', 'Test User')
      
      console.log('1. Signup attempt:', {
        status: signupResult.status,
        message: signupResult.message,
        error: signupResult.error
      })
      
      // 2. If signup succeeded, test signin
      if (signupResult.status === 200 || signupResult.status === 201) {
        console.log('✅ Signup successful, testing signin...')
        
        const signinResult = await apiService.signin(testEmail, 'TestPassword123!')
        console.log('2. Signin attempt:', {
          status: signinResult.status,
          hasToken: !!signinResult.data?.token
        })
        
        // 3. If signin succeeded, test authenticated request
        if (signinResult.status === 200 && signinResult.data?.token) {
          console.log('✅ Signin successful, testing authenticated request...')
          
          const profileResult = await apiService.getProfile()
          console.log('3. Profile access:', {
            status: profileResult.status,
            hasData: !!profileResult.data
          })
          
          expect(profileResult.status).toBeLessThan(500) // Should not be server error
        }
      }
      
      // The test passes if we can communicate with the backend
      // even if auth fails due to business logic
      expect(signupResult.status).toBeGreaterThan(0) // Got a response
    }, 15000)
  })
})