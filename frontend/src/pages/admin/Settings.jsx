import React, { useState, useEffect } from 'react';
import './Settings.css';
import { getCSRFToken } from "../../utils/csrf";
import RoleChangeConfirmModal from '../../components/admin/RoleChangeConfirmModal';


const Settings = () => {
    const [admins, setAdmins] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('admin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterRole, setFilterRole] = useState('admin');
    const [roleChangeRequest, setRoleChangeRequest] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await fetch('/api/admin/admins', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setAdmins(data);
            } else {
                setError('Failed to fetch admins');
            }
        } catch (err) {
            setError('Error fetching admins');
        }
    };

    const addAdmin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRF-TOKEN": getCSRFToken(),
                },
                credentials: 'include',
                body: JSON.stringify({ email: newEmail, role: newRole }),
            });

            if (response.ok) {
                setNewEmail('');
                setNewRole('admin');
                fetchAdmins();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to add admin');
            }
        } catch (err) {
            setError('Error adding admin');
        } finally {
            setLoading(false);
        }
    };

    const updateAdmin = (email, newRole) => {
        const admin = admins.find(a => a.email === email);
        if (admin && admin.role !== newRole) {
            setRoleChangeRequest({ admin, newRole });
        }
    };

    const confirmRoleChange = async () => {
        if (!roleChangeRequest) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/admin/admins/${roleChangeRequest.admin.email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRF-TOKEN": getCSRFToken(),
                },
                credentials: 'include',
                body: JSON.stringify({ role: roleChangeRequest.newRole }),
            });

            if (response.ok) {
                fetchAdmins();
                setRoleChangeRequest(null);
            } else {
                setError('Failed to update admin');
            }
        } catch (err) {
            setError('Error updating admin');
        } finally {
            setLoading(false);
        }
    };

    const deleteAdmin = async (email) => {
        if (!window.confirm(`Are you sure you want to delete admin ${email}?`)) return;

        try {
            const response = await fetch(`/api/admin/admins/${email}`, {
                method: 'DELETE',
                headers: {
                    "X-CSRF-TOKEN": getCSRFToken(),
                },
                credentials: 'include',
            });

            if (response.ok) {
                fetchAdmins();
            } else {
                setError('Failed to delete admin');
            }
        } catch (err) {
            setError('Error deleting admin');
        }
    };

    return (
        <div className="settings-page">
            <h1>Admin Settings</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="add-admin-section">
                <h2>Add New Admin</h2>
                <form onSubmit={addAdmin}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role:</label>
                        <select
                            id="role"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                        >
                            <option value="admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                            <option value="Auditor">Auditor</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Admin'}
                    </button>
                </form>
            </div>

            <div className="admins-table-section">
                <h2>Current Admins</h2>
                <div className="filter-buttons">
                    <button onClick={() => setFilterRole('admin')} className={filterRole === 'admin' ? 'active' : ''}>Admin</button>
                    <button onClick={() => setFilterRole('Manager')} className={filterRole === 'Manager' ? 'active' : ''}>Manager</button>
                    <button onClick={() => setFilterRole('Staff')} className={filterRole === 'Staff' ? 'active' : ''}>Staff</button>
                    <button onClick={() => setFilterRole('Auditor')} className={filterRole === 'Auditor' ? 'active' : ''}>Auditor</button>
                    <button onClick={() => setFilterRole('none')} className={filterRole === 'none' ? 'active' : ''}>Unassigned</button>
                </div>
                <table className="admins-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.filter(admin => admin.role === filterRole).map((admin) => (
                            <tr key={admin.email}>
                                <td>{admin.email}</td>
                                <td>
                                    <select
                                        value={admin.role}
                                        onChange={(e) => updateAdmin(admin.email, e.target.value)}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Auditor">Auditor</option>
                                        <option value="none">None</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className="delete-btn"
                                        onClick={() => deleteAdmin(admin.email)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {roleChangeRequest && (
                <RoleChangeConfirmModal
                    admin={roleChangeRequest.admin}
                    newRole={roleChangeRequest.newRole}
                    onConfirm={confirmRoleChange}
                    onCancel={() => setRoleChangeRequest(null)}
                    isLoading={loading}
                />
            )}
        </div>
    );
};

export default Settings;
