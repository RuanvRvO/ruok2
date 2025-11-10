'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useManager } from '@/hooks/useManager'
import type { Id } from '../../../../convex/_generated/dataModel'

export default function ManagerDashboardPage() {
  const router = useRouter()
  const { manager, isLoading: managerLoading, logout } = useManager()
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'groups'>('overview')

  // Queries
  const organization = useQuery(
    api.organizations.getOrganizationByManager,
    manager ? { managerId: manager._id } : 'skip'
  )
  const organizationDetails = useQuery(
    api.organizations.getOrganizationDetails,
    organization ? { organizationId: organization._id } : 'skip'
  )
  const analytics = useQuery(
    api.analytics.getOrganizationAnalytics,
    organization ? { organizationId: organization._id, days: 30 } : 'skip'
  )
  const groupAnalytics = useQuery(
    api.analytics.getGroupAnalytics,
    organization ? { organizationId: organization._id, days: 30 } : 'skip'
  )
  const employees = useQuery(
    api.employees.getEmployeesByOrganization,
    organization ? { organizationId: organization._id } : 'skip'
  )
  const groups = useQuery(
    api.groups.getGroupsByOrganization,
    organization ? { organizationId: organization._id } : 'skip'
  )

  // Mutations
  const addEmployee = useMutation(api.employees.addEmployee)
  const createGroup = useMutation(api.groups.createGroup)
  const updateEmployeeGroup = useMutation(api.employees.updateEmployeeGroup)
  const deleteEmployee = useMutation(api.employees.deleteEmployee)
  const deleteGroup = useMutation(api.groups.deleteGroup)

  // State for forms
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showAddGroup, setShowAddGroup] = useState(false)

  useEffect(() => {
    if (!managerLoading && !manager) {
      router.push('/manager/login')
    }
  }, [manager, managerLoading, router])

  if (managerLoading || !manager || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/manager/login')
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addEmployee({
        email: newEmployeeEmail,
        organizationId: organization._id,
      })
      setNewEmployeeEmail('')
      setShowAddEmployee(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add employee')
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createGroup({
        name: newGroupName,
        organizationId: organization._id,
      })
      setNewGroupName('')
      setShowAddGroup(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create group')
    }
  }

  const handleUpdateEmployeeGroup = async (employeeId: Id<'employees'>, groupId: Id<'groups'> | undefined) => {
    try {
      await updateEmployeeGroup({ employeeId, groupId })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update employee group')
    }
  }

  const handleDeleteEmployee = async (employeeId: Id<'employees'>) => {
    if (confirm('Are you sure you want to remove this employee?')) {
      try {
        await deleteEmployee({ employeeId })
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete employee')
      }
    }
  }

  const handleDeleteGroup = async (groupId: Id<'groups'>) => {
    if (confirm('Are you sure you want to delete this group? Employees will be unassigned.')) {
      try {
        await deleteGroup({ groupId })
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete group')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800'
      case 'amber': return 'bg-yellow-100 text-yellow-800'
      case 'red': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {organizationDetails?.name || 'Dashboard'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">Welcome back, {manager.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`${
                activeTab === 'groups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Groups
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-600">Overall Status</p>
                <p className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(analytics?.overallStatus || 'none')}`}>
                    {analytics?.overallStatus?.toUpperCase() || 'N/A'}
                  </span>
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {analytics?.responseRate || 0}%
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {organizationDetails?.employeeCount || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {analytics?.totalResponses || 0}
                </p>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Status Distribution (Last 30 Days)</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics?.statusCounts.green || 0}</p>
                  <p className="text-sm text-gray-600">Green</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{analytics?.statusCounts.amber || 0}</p>
                  <p className="text-sm text-gray-600">Amber</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{analytics?.statusCounts.red || 0}</p>
                  <p className="text-sm text-gray-600">Red</p>
                </div>
              </div>
            </div>

            {/* Group Analytics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Group Performance</h2>
              <div className="space-y-4">
                {groupAnalytics && groupAnalytics.length > 0 ? (
                  groupAnalytics.map((group) => (
                    <div key={group.groupId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{group.groupName}</h3>
                        <p className="text-sm text-gray-500">{group.employeeCount} employees</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(group.status)}`}>
                          {group.status.toUpperCase()}
                        </span>
                        <div className="text-right text-sm">
                          <p className="text-gray-600">
                            <span className="text-green-600">{group.statusCounts.green}G</span> /
                            <span className="text-yellow-600"> {group.statusCounts.amber}A</span> /
                            <span className="text-red-600"> {group.statusCounts.red}R</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No groups created yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Employees</h2>
              <button
                onClick={() => setShowAddEmployee(!showAddEmployee)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Employee
              </button>
            </div>

            {showAddEmployee && (
              <form onSubmit={handleAddEmployee} className="bg-white p-4 rounded-lg shadow">
                <div className="flex gap-4">
                  <input
                    type="email"
                    placeholder="employee@company.com"
                    value={newEmployeeEmail}
                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEmployee(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees && employees.length > 0 ? (
                    employees.map((employee) => (
                      <tr key={employee._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={employee.groupId || ''}
                            onChange={(e) => handleUpdateEmployeeGroup(
                              employee._id,
                              e.target.value ? e.target.value as Id<'groups'> : undefined
                            )}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">No Group</option>
                            {groups?.map((group) => (
                              <option key={group._id} value={group._id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleDeleteEmployee(employee._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        No employees yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Groups</h2>
              <button
                onClick={() => setShowAddGroup(!showAddGroup)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Group
              </button>
            </div>

            {showAddGroup && (
              <form onSubmit={handleCreateGroup} className="bg-white p-4 rounded-lg shadow">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddGroup(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups && groups.length > 0 ? (
                groups.map((group) => (
                  <div key={group._id} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                      <button
                        onClick={() => handleDeleteGroup(group._id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">{group.employeeCount} employees</p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No groups created yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
