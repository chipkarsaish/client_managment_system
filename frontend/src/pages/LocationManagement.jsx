import React, { useEffect, useState } from "react";
import { MapPin, Plus, CheckCircle2, Map, Globe, Activity, Trash2 } from "lucide-react";
import api from "../api/api";

function LocationManagement() {
    const [locations, setLocations] = useState([]);
    const [newLocationName, setNewLocationName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await api.get("/locations");
            setLocations(response.data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        
        if (!newLocationName.trim()) {
            setErrorMessage("Please enter a location name.");
            return;
        }
        
        setErrorMessage("");
        setIsSaving(true);
        try {
            await api.post("/locations", { name: newLocationName.trim() });
            setNewLocationName("");
            fetchLocations(); // Refresh the list
            
            // Show toast/success indicator
            setSuccessMessage("Location added successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error adding location:", error);
            alert("Failed to add location.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteLocation = async (id) => {
        if (!window.confirm("Are you sure you want to delete this location?")) {
            return;
        }

        try {
            setErrorMessage("");
            await api.delete(`/locations/${id}`);
            setSuccessMessage("Location deleted successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchLocations(); // Refresh list
        } catch (error) {
            console.error("Error deleting location:", error);
            if (error.response && error.response.status === 409) {
                setErrorMessage(error.response.data || "Cannot delete location as it is associated with existing clients.");
            } else {
                setErrorMessage("Failed to delete location. Please try again later.");
            }
            setTimeout(() => setErrorMessage(""), 6000);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
            
            {/* Header Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: 'var(--primary)', borderRadius: '12px', color: 'white' }}>
                        <Globe size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Total Locations</p>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>{locations.length}</h3>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#10b981', borderRadius: '12px', color: 'white' }}>
                        <Map size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Active Regions</p>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>{locations.length > 0 ? 'All Active' : 'None'}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* Left Side: Add Location Form */}
                <div className="card" style={{ flex: '1 1 350px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ padding: '8px', backgroundColor: '#e0e7ff', borderRadius: '8px', color: 'var(--primary)' }}>
                            <MapPin size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Add New Location</h2>
                    </div>
                    
                    <form onSubmit={handleAddLocation}>
                        <div className="form-group" style={{ marginBottom: errorMessage ? '8px' : '24px' }}>
                            <label className="form-label">Location Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. Thane, Pune, Mumbai"
                                value={newLocationName}
                                onChange={(e) => {
                                    setNewLocationName(e.target.value);
                                    if (errorMessage) setErrorMessage("");
                                }}
                            />
                        </div>

                        {errorMessage && (
                            <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '24px' }}>
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                padding: '12px', backgroundColor: 'var(--success-bg)', 
                                color: 'var(--success)', borderRadius: 'var(--radius-md)',
                                marginBottom: '24px', fontSize: '0.875rem', fontWeight: 500
                            }}>
                                <CheckCircle2 size={16} />
                                {successMessage}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                            disabled={isSaving}
                        >
                            <Plus size={18} />
                            {isSaving ? 'Saving...' : 'Add Location'}
                        </button>
                    </form>

                    
                </div>

                {/* Right Side: Locations Table */}
                <div className="card" style={{ flex: '2 1 500px', padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Location Master Directory</h2>
                    </div>
                    
                    <div className="table-container" style={{ border: 'none', borderRadius: 0, maxHeight: '600px' }}>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '100px' }}>ID</th>
                                    <th>Location Name</th>
                                    <th>Status</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.length > 0 ? (
                                    locations.map(loc => (
                                        <tr key={loc.id}>
                                            <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                #{loc.id}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                    <MapPin size={16} style={{ color: 'var(--primary)' }} />
                                                    {loc.name || loc.city || 'Unnamed'}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ 
                                                    background: 'var(--success-bg)', color: 'var(--success)', padding: '4px 12px', 
                                                    borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600
                                                }}>
                                                    Active
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleDeleteLocation(loc.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--danger)',
                                                        cursor: 'pointer',
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                    title="Delete Location"
                                                >
                                                    <Trash2 size={16} style={{ color: '#ef4444' }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                            No locations available. Add your first location to populate the master list.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default LocationManagement;
