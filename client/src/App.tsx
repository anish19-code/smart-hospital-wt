
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Login, { type UserRole } from './login'
import './App.css'

type EquipmentStatus = 'Available' | 'In Use' | 'Under Maintenance'

type Equipment = {
  id: number
  assetTag: string
  name: string
  department: string
  location: string
  status: EquipmentStatus
}

type ApiEquipment = {
  id: number
  assetTag: string
  name: string
  category: string
  location: string
  status: string
}

type ApiResponse<T> = {
  success: boolean
  message?: string
  count?: number
  data?: T
}

const API_URL = 'http://localhost:5000/api/equipment'

const statuses: EquipmentStatus[] = [
  'Available',
  'In Use',
  'Under Maintenance',
]

function toApiStatus(status: EquipmentStatus): string {
  if (status === 'In Use') return 'IN_USE'
  if (status === 'Under Maintenance') return 'UNDER_MAINTENANCE'
  return 'AVAILABLE'
}

function mapApiEquipment(item: ApiEquipment): Equipment {
  let status: EquipmentStatus = 'Available'

  if (
    item.status === 'IN_USE' ||
    item.status === 'IN USE' ||
    item.status === 'In Use'
  ) {
    status = 'In Use'
  } else if (
    item.status === 'UNDER_MAINTENANCE' ||
    item.status === 'UNDER MAINTENANCE' ||
    item.status === 'Under Maintenance'
  ) {
    status = 'Under Maintenance'
  }

  return {
    id: item.id,
    assetTag: item.assetTag,
    name: item.name,
    department: item.category,
    location: item.location,
    status,
  }
}

async function readResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const result = await response.json() as ApiResponse<T>

  if (!response.ok || !result.success) {
    throw new Error(result.message || `Request failed (${response.status})`)
  }

  return result
}

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [assetTag, setAssetTag] = useState('')
  const [department, setDepartment] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<EquipmentStatus>('Available')

  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  async function loadEquipment(showLoading = true) {
    if (showLoading) setLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL)
      const result = await readResponse<ApiEquipment[]>(response)

      if (!Array.isArray(result.data)) {
        throw new Error('Unexpected response from the equipment API')
      }

      setEquipment(result.data.map(mapApiEquipment))
    } catch (err) {
      console.error('Error loading equipment:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load equipment. Check that the backend is running.',
      )
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    void loadEquipment()
  }, [])

  const totalEquipment = equipment.length

  const availableEquipment = equipment.filter(
    (item) => item.status === 'Available',
  ).length

  const inUseEquipment = equipment.filter(
    (item) => item.status === 'In Use',
  ).length

  const maintenanceEquipment = equipment.filter(
    (item) => item.status === 'Under Maintenance',
  ).length

  const departments = [
    ...new Set(equipment.map((item) => item.department)),
  ].sort()

  const filteredEquipment = equipment.filter((item) => {
    const search = searchTerm.trim().toLowerCase()

    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      item.assetTag.toLowerCase().includes(search) ||
      String(item.id).includes(search)

    const matchesDepartment =
      departmentFilter === 'All' ||
      item.department === departmentFilter

    const matchesStatus =
      statusFilter === 'All' || item.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  function handleCancelEdit() {
    setEditingId(null)
    setName('')
    setAssetTag('')
    setDepartment('')
    setLocation('')
    setStatus('Available')
  }

  function handleResetFilters() {
    setSearchTerm('')
    setDepartmentFilter('All')
    setStatusFilter('All')
  }

  function handleEdit(item: Equipment) {
    if (currentRole !== 'Admin' || saving) return

    setEditingId(item.id)
    setName(item.name)
    setAssetTag(item.assetTag)
    setDepartment(item.department)
    setLocation(item.location)
    setStatus(item.status)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(item: Equipment) {
    if (currentRole !== 'Admin' || deletingId !== null || saving) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${item.name} (${item.assetTag})? This cannot be undone.`,
    )

    if (!confirmed) return

    setDeletingId(item.id)

    try {
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: 'DELETE',
      })

      await readResponse<ApiEquipment>(response)

      if (editingId === item.id) {
        handleCancelEdit()
      }

      await loadEquipment(false)
      window.alert('Equipment deleted successfully.')
    } catch (err) {
      console.error('Error deleting equipment:', err)
      window.alert(
        err instanceof Error ? err.message : 'Could not delete equipment.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  async function handleStatusChange(
    id: number,
    newStatus: EquipmentStatus,
  ) {
    if (
      (currentRole !== 'Admin' && currentRole !== 'Staff') ||
      saving ||
      deletingId !== null
    ) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: toApiStatus(newStatus) }),
      })

      await readResponse<ApiEquipment>(response)
      await loadEquipment(false)
    } catch (err) {
      console.error('Error updating status:', err)
      window.alert(
        err instanceof Error ? err.message : 'Could not update status.',
      )
      await loadEquipment(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (currentRole !== 'Admin' || saving) return

    const cleanName = name.trim()
    const cleanAssetTag = assetTag.trim()
    const cleanDepartment = department.trim()
    const cleanLocation = location.trim()

    if (
      !cleanName ||
      !cleanAssetTag ||
      !cleanDepartment ||
      !cleanLocation
    ) {
      window.alert('Please fill in all fields.')
      return
    }

    const payload = {
      name: cleanName,
      assetTag: cleanAssetTag,
      category: cleanDepartment,
      location: cleanLocation,
      status: toApiStatus(status),
      condition: 'GOOD',
    }

    setSaving(true)

    try {
      const isEditing = editingId !== null
      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      await readResponse<ApiEquipment>(response)

      await loadEquipment(false)
      handleCancelEdit()

      window.alert(
        isEditing
          ? 'Equipment updated successfully!'
          : 'Equipment added successfully!',
      )
    } catch (err) {
      console.error('Error saving equipment:', err)
      window.alert(
        err instanceof Error
          ? err.message
          : 'Could not save equipment. Check the backend.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (currentRole === null) {
    return <Login onLogin={setCurrentRole} />
  }

  const canManageEquipment = currentRole === 'Admin'
  const canUpdateStatus =
    currentRole === 'Admin' || currentRole === 'Staff'

  return (
    <div className="hospital-app">
      <header className="hospital-header">
        <div className="brand-box">
          <div className="brand-medical-logo" aria-label="Medical logo">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M32 5L51 13V28C51 41 43 51 32 58C21 51 13 41 13 28V13L32 5Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M32 19V39M22 29H42"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M17 45H25L29 37L35 48L40 40H47"
                stroke="#7EF0D0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="brand-text">
            <h1>Smart Hospital</h1>
            <p>Healthcare Asset Management System</p>
            <span className="brand-accent-line" />
          </div>
        </div>
      </header>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          padding: '14px 24px',
        }}
      >
        <p style={{ margin: 0 }}>
          Signed in as <strong>{currentRole}</strong>
          {' · '}
          {currentRole === 'Admin'
            ? 'Full equipment management'
            : currentRole === 'Staff'
              ? 'Equipment status updates'
              : 'Read-only access'}
        </p>

        <button
          type="button"
          onClick={() => {
            handleCancelEdit()
            setCurrentRole(null)
          }}
        >
          Log Out
        </button>
      </div>

      <div className="dashboard-top-layout">
        {canManageEquipment && (
          <section className="equipment-form-section">
            <h2>{editingId !== null ? 'Edit Equipment' : 'Add Equipment'}</h2>

            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="assetTag">Asset Tag</label>
                <input
                  id="assetTag"
                  value={assetTag}
                  onChange={(event) => setAssetTag(event.target.value)}
                  placeholder="e.g. HSP-021"
                  required
                  disabled={editingId !== null || saving}
                />
              </div>

              <div>
                <label htmlFor="name">Equipment Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. X-Ray Machine"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="e.g. Radiology"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Room 301"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as EquipmentStatus)
                  }
                  disabled={saving}
                >
                  {statuses.map((itemStatus) => (
                    <option key={itemStatus} value={itemStatus}>
                      {itemStatus}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={saving}>
                  {saving
                    ? 'Saving...'
                    : editingId !== null
                      ? 'Save Changes'
                      : 'Add Equipment'}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        <section className="dashboard-cards" aria-label="Equipment summary">
          <div className="dashboard-card">
            <h3>Total Equipment</h3>
            <p>{totalEquipment}</p>
          </div>

          <div className="dashboard-card">
            <h3>Available</h3>
            <p>{availableEquipment}</p>
          </div>

          <div className="dashboard-card">
            <h3>In Use</h3>
            <p>{inUseEquipment}</p>
          </div>

          <div className="dashboard-card">
            <h3>Under Maintenance</h3>
            <p>{maintenanceEquipment}</p>
          </div>
        </section>
      </div>

      <section className="equipment-list-section">
        <div className="equipment-controls">
          <input
            type="search"
            aria-label="Search by equipment name, ID, or asset tag"
            placeholder="Search name, ID, or asset tag..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            aria-label="Filter by department"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((itemDepartment) => (
              <option key={itemDepartment} value={itemDepartment}>
                {itemDepartment}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            {statuses.map((itemStatus) => (
              <option key={itemStatus} value={itemStatus}>
                {itemStatus}
              </option>
            ))}
          </select>

          <button type="button" onClick={handleResetFilters}>
            Reset Filters
          </button>

          <button type="button" onClick={() => void loadEquipment()}>
            Refresh
          </button>
        </div>

        <div className="equipment-list-heading">
          <h2>Equipment List</h2>
          <p aria-live="polite">
            Showing {filteredEquipment.length} of {totalEquipment} equipment
            {totalEquipment === 1 ? ' item' : ' items'}
          </p>
        </div>

        {loading && <p>Loading equipment from database...</p>}

        {error && (
          <div role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => void loadEquipment()}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="equipment-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Asset Tag</th>
                  <th scope="col">Equipment Name</th>
                  <th scope="col">Department</th>
                  <th scope="col">Location</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    {canManageEquipment
                      ? 'Actions'
                      : canUpdateStatus
                        ? 'Update Status'
                        : 'Access'}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEquipment.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.assetTag}</td>
                    <td>{item.name}</td>
                    <td>{item.department}</td>
                    <td>{item.location}</td>
                    <td>
                      {canUpdateStatus ? (
                        <select
                          aria-label={`Update status for ${item.name}`}
                          value={item.status}
                          disabled={saving || deletingId !== null}
                          onChange={(event) =>
                            void handleStatusChange(
                              item.id,
                              event.target.value as EquipmentStatus,
                            )
                          }
                        >
                          {statuses.map((itemStatus) => (
                            <option key={itemStatus} value={itemStatus}>
                              {itemStatus}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`status-badge ${item.status
                            .toLowerCase()
                            .replace(/\s+/g, '-')}`}
                        >
                          {item.status}
                        </span>
                      )}
                    </td>

                    <td>
                      {canManageEquipment ? (
                        <div className="equipment-actions">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            disabled={saving || deletingId !== null}
                            aria-label={`Edit ${item.name}`}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            disabled={saving || deletingId !== null}
                            aria-label={`Delete ${item.name}`}
                          >
                            {deletingId === item.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      ) : currentRole === 'Staff' ? (
                        <span>Status only</span>
                      ) : (
                        <span>Read only</span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredEquipment.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      No equipment matches your search or selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default App

