import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,         // <-- send cookies to your API
})

export default {
  completeOnboarding: (payload: { bio: string; profilePicture?: string }) =>
  api.put('/user', payload),

  uploadAvatar: (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/user/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
  }
}


