
import { useState } from 'react'
import type { FormEvent } from 'react'
import Login, { type UserRole } from './Login'
import './App.css'

type EquipmentStatus = 'Available' | 'In Use' | 'Under Maintenance'

type Equipment = {
  id: number
  name: string
  department: string
  location: string
  status: EquipmentStatus
}

const departments = ['ICU', 'Cardiology', 'Emergency', 'Radiology']

const statuses: EquipmentStatus[] = [
  'Available',
  'In Use',
  'Under Maintenance',
]

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)

  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: 1,
      name: 'Ventilator',
      department: 'ICU',
      location: 'Room 101',
      status: 'Available',
    },
    {
      id: 2,
      name: 'ECG Machine',
      department: 'Cardiology',
      location: 'Room 202',
      status: 'In Use',
    },
    {
      id: 3,
      name: 'Patient Monitor',
      department: 'Emergency',
      location: 'Room 105',
      status: 'Available',
    },
  ])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<EquipmentStatus>('Available')

  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

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

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())

    const matchesDepartment =
      departmentFilter === 'All' || item.department === departmentFilter

    const matchesStatus =
      statusFilter === 'All' || item.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  function handleCancelEdit() {
    setEditingId(null)
    setName('')
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
    if (currentRole !== 'Admin') return

    setEditingId(item.id)
    setName(item.name)
    setDepartment(item.department)
    setLocation(item.location)
    setStatus(item.status)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(item: Equipment) {
    if (currentRole !== 'Admin') return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${item.name}?`,
    )

    if (!confirmed) return

    setEquipment((previous) =>
      previous.filter((equipmentItem) => equipmentItem.id !== item.id),
    )

    if (editingId === item.id) {
      handleCancelEdit()
    }
  }

  function handleStatusChange(id: number, newStatus: EquipmentStatus) {
    if (currentRole !== 'Admin' && currentRole !== 'Staff') return

    setEquipment((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    )

    if (editingId === id) {
      setStatus(newStatus)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (currentRole !== 'Admin') return

    const cleanName = name.trim()
    const cleanDepartment = department.trim()
    const cleanLocation = location.trim()

    if (!cleanName || !cleanDepartment || !cleanLocation) {
      window.alert('Please fill in all fields.')
      return
    }

    if (editingId !== null) {
      setEquipment((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: cleanName,
                department: cleanDepartment,
                location: cleanLocation,
                status,
              }
            : item,
        ),
      )
    } else {
      const newEquipment: Equipment = {
        id: Date.now(),
        name: cleanName,
        department: cleanDepartment,
        location: cleanLocation,
        status,
      }

      setEquipment((previous) => [...previous, newEquipment])
    }

    handleCancelEdit()
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
            <span className="brand-accent-line"></span>
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
                <label htmlFor="name">Equipment Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. X-Ray Machine"
                  required
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
                >
                  {statuses.map((itemStatus) => (
                    <option key={itemStatus} value={itemStatus}>
                      {itemStatus}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit">
                  {editingId !== null ? 'Save Changes' : 'Add Equipment'}
                </button>

                {editingId !== null && (
                  <button type="button" onClick={handleCancelEdit}>
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
            aria-label="Search equipment by name"
            placeholder="Search equipment..."
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
        </div>

        <div className="equipment-list-heading">
          <h2>Equipment List</h2>
          <p aria-live="polite">
            Showing {filteredEquipment.length} of {totalEquipment} equipment
            {totalEquipment === 1 ? ' item' : ' items'}
          </p>
        </div>

        <div className="equipment-table-wrapper">
          <table>
            <thead>
              <tr>
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
                  <td>{item.name}</td>
                  <td>{item.department}</td>
                  <td>{item.location}</td>
                  <td>
                    {canUpdateStatus ? (
                      <select
                        aria-label={`Update status for ${item.name}`}
                        value={item.status}
                        onChange={(event) =>
                          handleStatusChange(
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
                          aria-label={`Edit ${item.name}`}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          aria-label={`Delete ${item.name}`}
                        >
                          Delete
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
                  <td colSpan={5} className="empty-state">
                    No equipment matches your search or selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default App
