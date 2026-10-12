
import { useState } from 'react'
import './App.css'

type Equipment = {
  id: number
  name: string
  department: string
  location: string
  status: string
}

function App() {
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
  const [status, setStatus] = useState('Available')

  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesDepartment =
      departmentFilter === 'All' ||
      item.department === departmentFilter

    const matchesStatus =
      statusFilter === 'All' ||
      item.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  function handleEdit(item: Equipment) {
    setEditingId(item.id)
    setName(item.name)
    setDepartment(item.department)
    setLocation(item.location)
    setStatus(item.status)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingId !== null) {
      setEquipment((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? { ...item, name, department, location, status }
            : item
        )
      )
    } else {
      const newEquipment: Equipment = {
        id: Date.now(),
        name,
        department,
        location,
        status,
      }

      setEquipment((previous) => [...previous, newEquipment])
    }

    setName('')
    setDepartment('')
    setLocation('')
    setStatus('Available')
    setEditingId(null)
  }

  function handleCancelEdit() {
    setEditingId(null)
    setName('')
    setDepartment('')
    setLocation('')
    setStatus('Available')
  }

  return (
    <div className="hospital-app">
      <h1>Smart Hospital</h1>
      <p>Healthcare Asset Management System</p>

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
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>Available</option>
            <option>In Use</option>
            <option>Under Maintenance</option>
          </select>
        </div>

        <button type="submit">
          {editingId !== null ? 'Save Changes' : 'Add Equipment'}
        </button>

        {editingId !== null && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel Edit
          </button>
        )}
      </form>

      <div className="equipment-controls">
        <input
          type="text"
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
          <option value="ICU">ICU</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Emergency">Emergency</option>
          <option value="Radiology">Radiology</option>
        </select>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="Under Maintenance">Under Maintenance</option>
        </select>
      </div>

      <h2>Equipment List</h2>

      <table>
        <thead>
          <tr>
            <th>Equipment Name</th>
            <th>Department</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredEquipment.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.department}</td>
              <td>{item.location}</td>
              <td>{item.status}</td>
              <td>
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}

          {filteredEquipment.length === 0 && (
            <tr>
              <td colSpan={5}>No equipment matches your search.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App
