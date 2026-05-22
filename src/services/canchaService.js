import api from './api'

const getAll = (page = 0, size = 50) => api.get('/canchas', { params: { page, size } }).then(r => r.data)
const getActive = (page = 0, size = 50) => api.get('/canchas/activas', { params: { page, size } }).then(r => r.data)
const toggleEstado = (id) => api.put(`/canchas/${id}/toggle`).then(r => r.data)
const createCancha = (dto) => api.post('/canchas', dto).then(r => r.data)

export default {
  getAll,
  getActive,
  toggleEstado,
  createCancha,
}
