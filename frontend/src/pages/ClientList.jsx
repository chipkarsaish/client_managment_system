import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Users, Search, MapPin, Phone, Calendar, X, ShieldCheck, Heart, Plus, FileText, User, Trash2 } from "lucide-react";
import api from "../api/api";

function ClientList() {
    // State Management
    const [persons, setPersons] = useState([]);
    const [locations, setLocations] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [documents, setDocuments] = useState([]);
    
    // Family Members State
    const [familyMembers, setFamilyMembers] = useState([]);
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
    const [relationFormData, setRelationFormData] = useState({ relatedPersonId: '', relationType: 'Husband' });
    const [isSavingRelation, setIsSavingRelation] = useState(false);
    
    // Inverse Relation State
    const [isInverseModalOpen, setIsInverseModalOpen] = useState(false);
    const [inverseRelationData, setInverseRelationData] = useState({ relationType: 'Brother' });
    const [isSavingInverse, setIsSavingInverse] = useState(false);
    
    // UI State
    const [activeTab, setActiveTab] = useState('overview');

    const location = useLocation();

    // Fetch Data
    useEffect(() => {
        fetchPersons();
        fetchLocations();
    }, []);

    const fetchPersons = async () => {
        try {
            const response = await api.get("/persons");
            const fetchedPersons = response.data;
            setPersons(fetchedPersons);

            // Check if we came from global search
            if (location.state?.selectedPersonId) {
                const targetPerson = fetchedPersons.find(p => p.id === location.state.selectedPersonId);
                if (targetPerson) {
                    setSelectedPerson(targetPerson);
                }
            }
        } catch (error) {
            console.error("Error fetching persons:", error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await api.get("/locations");
            setLocations(response.data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    useEffect(() => {
        if (selectedPerson) {
            fetchDocuments(selectedPerson.id);
            fetchFamilyMembers(selectedPerson.id);
        } else {
            setDocuments([]);
            setFamilyMembers([]);
        }
    }, [selectedPerson]);

    const fetchDocuments = async (personId) => {
        try {
            const response = await api.get(`/documents/person/${personId}`);
            setDocuments(response.data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    const fetchFamilyMembers = async (personId) => {
        try {
            const response = await api.get("/family");
            const relations = response.data.filter(rel => rel.person?.id === personId);
            setFamilyMembers(relations);
        } catch (error) {
            console.error("Error fetching family members:", error);
        }
    };

    const handleSaveRelation = async (e) => {
        e.preventDefault();
        if (!relationFormData.relatedPersonId || !relationFormData.relationType) return;
        
        setIsSavingRelation(true);
        try {
            const payload = {
                person: { id: selectedPerson.id },
                relatedPerson: { id: parseInt(relationFormData.relatedPersonId) },
                relationType: relationFormData.relationType
            };
            await api.post("/family", payload);
            
            setIsFamilyModalOpen(false);
            setIsInverseModalOpen(true);
            fetchFamilyMembers(selectedPerson.id);
        } catch (error) {
            console.error("Error saving relation:", error);
            alert("Failed to add relation");
        } finally {
            setIsSavingRelation(false);
        }
    };

    const handleSaveInverseRelation = async (e) => {
        e.preventDefault();
        setIsSavingInverse(true);
        try {
            const payload = {
                person: { id: parseInt(relationFormData.relatedPersonId) },
                relatedPerson: { id: selectedPerson.id },
                relationType: inverseRelationData.relationType
            };
            await api.post("/family", payload);
            
            closeInverseModal();
        } catch (error) {
            console.error("Error saving inverse relation:", error);
            alert("Failed to save reverse relation");
        } finally {
            setIsSavingInverse(false);
        }
    };

    const closeInverseModal = () => {
        setIsInverseModalOpen(false);
        setRelationFormData({ relatedPersonId: '', relationType: 'Husband' });
        setInverseRelationData({ relationType: 'Brother' });
    };

    const handleDeleteRelation = async (relId) => {
        if (!window.confirm('Are you sure you want to remove this family relation?')) return;
        try {
            await api.delete(`/family/${relId}`);
            fetchFamilyMembers(selectedPerson.id);
        } catch (error) {
            console.error('Error deleting relation:', error);
            alert('Failed to delete relation.');
        }
    };

    const filteredPersons = persons.filter(person => {
        const matchesSearch = `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (person.mobile && person.mobile.includes(searchQuery));
        const matchesLocation = locationFilter ? person.location?.id?.toString() === locationFilter : true;
        return matchesSearch && matchesLocation;
    });

    const REQUIRED_DOCS = ["PAN Card", "Aadhar Card", "Driving License", "Electricity Bill"];
    const uploadedDocTypes = documents.map(doc => doc.documentType);
    const uploadedDocs = REQUIRED_DOCS.filter(doc => uploadedDocTypes.includes(doc));
    const missingDocs = REQUIRED_DOCS.filter(doc => !uploadedDocTypes.includes(doc));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Top Information Banner */}
            <div style={{ 
                backgroundColor: 'var(--bg-body)', 
                padding: '16px 24px', 
                borderRadius: 'var(--radius-lg)', 
                marginBottom: '24px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />
                <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Read-Only Master Directory</h3>
                    
                </div>
            </div>

            {/* Main Content Split Area */}
            <div style={{ display: 'flex', gap: '24px', flex: 1, alignItems: 'flex-start' }}>
                
                {/* Left Side: Person List */}
                <div className="card" style={{ flex: selectedPerson ? 1 : '1 1 100%', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={20} />
                            Client Directory
                        </h2>
                        
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search clients..." 
                                    style={{ paddingLeft: '36px', width: selectedPerson ? '180px' : '260px' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <select 
                                className="form-control" 
                                style={{ width: '180px' }}
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            >
                                <option value="">All Locations</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.city || loc.name || `Location ${loc.id}`}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container" style={{ border: 'none', borderRadius: 0, maxHeight: '650px' }}>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPersons.length > 0 ? (
                                    filteredPersons.map(person => (
                                        <tr key={person.id} style={{ cursor: 'pointer', backgroundColor: selectedPerson?.id === person.id ? 'var(--bg-selected)' : 'transparent' }} onClick={() => setSelectedPerson(person)}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div className="avatar">
                                                        {person.firstName?.charAt(0)}{person.lastName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                            {person.firstName} {person.lastName}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            ID: #{person.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                                    <Phone size={14} />
                                                    {person.mobile || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                                                    <span style={{ 
                                                        background: 'var(--bg-body)', padding: '4px 8px', 
                                                        borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 
                                                    }}>
                                                        {person.location?.city || person.location?.name || 'Unassigned'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                            No clients found. Try adjusting your search or filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side: Details Panel */}
                {selectedPerson && (
                    <div className="card" style={{ width: '380px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease', flexShrink: 0, maxHeight: '650px' }}>
                        <div style={{ height: '80px', backgroundColor: 'var(--bg-body)', position: 'relative', flexShrink: 0 }}>
                            <button 
                                className="btn btn-ghost" 
                                style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px', background: 'var(--bg-light-faint)', borderRadius: '50%' }}
                                onClick={() => {
                                    setSelectedPerson(null);
                                    setActiveTab('overview');
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 20px 20px', marginTop: '-32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            <div className="avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem', border: '3px solid rgba(255, 255, 255, 0.1)', boxShadow: 'var(--shadow-sm)', marginBottom: '12px' }}>
                                {selectedPerson.firstName?.charAt(0)}{selectedPerson.lastName?.charAt(0)}
                            </div>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>{selectedPerson.firstName} {selectedPerson.lastName}</h3>
                            <span style={{ 
                                background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 10px', 
                                borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, marginBottom: '20px' 
                            }}>
                                Active Client
                            </span>

                            {/* Tab Bar */}
                            <div style={{ 
                                display: 'flex', width: '100%', borderBottom: '1px solid var(--border)', marginBottom: '20px' 
                            }}>
                                <button 
                                    style={{ 
                                        flex: 1, padding: '12px 0', background: 'transparent', border: 'none', 
                                        borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
                                        color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: activeTab === 'overview' ? 600 : 500, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.875rem'
                                    }}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    <User size={16} /> Overview
                                </button>
                                <button 
                                    style={{ 
                                        flex: 1, padding: '12px 0', background: 'transparent', border: 'none', 
                                        borderBottom: activeTab === 'documents' ? '2px solid var(--primary)' : '2px solid transparent',
                                        color: activeTab === 'documents' ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: activeTab === 'documents' ? 600 : 500, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.875rem'
                                    }}
                                    onClick={() => setActiveTab('documents')}
                                >
                                    <FileText size={16} /> Documents
                                </button>
                                <button 
                                    style={{ 
                                        flex: 1, padding: '12px 0', background: 'transparent', border: 'none', 
                                        borderBottom: activeTab === 'family' ? '2px solid var(--primary)' : '2px solid transparent',
                                        color: activeTab === 'family' ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: activeTab === 'family' ? 600 : 500, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.875rem'
                                    }}
                                    onClick={() => setActiveTab('family')}
                                >
                                    <Heart size={16} /> Family
                                </button>
                            </div>

                            {/* TAB CONTENT: Overview */}
                            {activeTab === 'overview' && (
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', backgroundColor: 'var(--bg-light-faint)', padding: '16px', borderRadius: 'var(--radius-md)', animation: 'fadeIn 0.2s ease' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                        <Phone size={18} style={{ color: 'var(--primary)' }} />
                                        <span>{selectedPerson.mobile || 'No mobile provided'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                        <Calendar size={18} style={{ color: 'var(--primary)' }} />
                                        <span>{selectedPerson.dob || 'DOB unknown'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                        <MapPin size={18} style={{ color: 'var(--primary)' }} />
                                        <span>{selectedPerson.location?.city || selectedPerson.location?.name || 'No location set'}</span>
                                    </div>
                                </div>
                            )}



                            {/* TAB CONTENT: Documents */}
                            {activeTab === 'documents' && (
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', animation: 'fadeIn 0.2s ease' }}>
                                    {uploadedDocs.length > 0 && (
                                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                                            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <ShieldCheck size={14} /> Uploaded Documents
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {uploadedDocs.map(doc => (
                                                    <span key={doc} style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{doc}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {missingDocs.length > 0 && (
                                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FileText size={14} /> Remaining Required
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {missingDocs.map(doc => (
                                                    <span key={doc} style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{doc}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {uploadedDocs.length === 0 && missingDocs.length === 0 && (
                                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0', fontSize: '0.875rem' }}>No documents to display.</p>
                                    )}
                                </div>
                            )}

                            {/* TAB CONTENT: Family Members Module */}
                            {activeTab === 'family' && (
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', animation: 'fadeIn 0.2s ease' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                                        <Heart size={16} style={{ color: '#ef4444' }} /> 
                                        Family Members
                                        <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                            {familyMembers.length}
                                        </span>
                                    </h4>

                                <button 
                                    className="btn btn-outline" 
                                    style={{ 
                                        width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', 
                                        borderRadius: '999px', padding: '8px', fontSize: '0.875rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)', transition: 'all 0.2s ease', cursor: 'pointer'
                                    }}
                                    onClick={() => setIsFamilyModalOpen(true)}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                                >
                                    <Plus size={16} style={{ color: 'var(--primary)' }} />
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Add Relation</span>
                                </button>

                                {/* Family List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {familyMembers.length > 0 ? (
                                        familyMembers.map((rel, index) => {
                                            const relatedP = rel.relatedPerson;
                                            if (!relatedP) return null;
                                            
                                            // Dynamic Badge Colors
                                            let badgeBg = 'rgba(79, 70, 229, 0.15)';
                                            let badgeColor = '#818cf8';
                                            if (rel.relationType === 'Husband' || rel.relationType === 'Wife') { badgeBg = 'rgba(219, 39, 119, 0.15)'; badgeColor = '#f472b6'; }
                                            else if (rel.relationType === 'Son' || rel.relationType === 'Daughter') { badgeBg = 'rgba(22, 163, 74, 0.15)'; badgeColor = '#4ade80'; }
                                            else if (rel.relationType === 'Father' || rel.relationType === 'Mother') { badgeBg = 'rgba(217, 119, 6, 0.15)'; badgeColor = '#fbbf24'; }

                                            return (
                                                <div key={index} style={{ 
                                                    backgroundColor: 'var(--bg-light-faint)', padding: '12px', borderRadius: 'var(--radius-md)', 
                                                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px',
                                                    boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', cursor: 'default'
                                                }}>
                                                    <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.8rem', color: '#ffffff' }}>
                                                        {relatedP.firstName?.charAt(0)}{relatedP.lastName?.charAt(0)}
                                                    </div>
                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {relatedP.firstName} {relatedP.lastName}
                                                        </div>
                                                        <div style={{ 
                                                            display: 'inline-block', marginTop: '4px', padding: '2px 8px', 
                                                            borderRadius: '999px', fontSize: '0.65rem', fontWeight: 600,
                                                            backgroundColor: badgeBg, color: badgeColor
                                                        }}>
                                                            {rel.relationType}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="btn btn-ghost"
                                                        style={{ padding: '6px', color: 'var(--danger)', flexShrink: 0 }}
                                                        onClick={() => handleDeleteRelation(rel.id)}
                                                        title="Remove relation"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div style={{ 
                                            textAlign: 'center', padding: '24px 16px', backgroundColor: 'var(--bg-light-faint)', 
                                            borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' 
                                        }}>
                                            <Heart size={24} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No family relations added yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Relation Modal */}
            {isFamilyModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '400px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.25rem' }}>Add Family Relation</h3>
                            <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={() => setIsFamilyModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveRelation} style={{ padding: '24px' }}>
                            <div className="form-group">
                                <label className="form-label">Related Person</label>
                                <select 
                                    className="form-control" 
                                    value={relationFormData.relatedPersonId}
                                    onChange={(e) => setRelationFormData({...relationFormData, relatedPersonId: e.target.value})}
                                    required
                                >
                                    <option value="" disabled>Select a person...</option>
                                    {persons
                                        .filter(p => p.id !== selectedPerson?.id) // exclude self
                                        .map(p => (
                                            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            
                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label className="form-label">Relation Type</label>
                                <select 
                                    className="form-control" 
                                    value={relationFormData.relationType}
                                    onChange={(e) => setRelationFormData({...relationFormData, relationType: e.target.value})}
                                    required
                                >
                                    <option value="Husband">Husband</option>
                                    <option value="Wife">Wife</option>
                                    <option value="Son">Son</option>
                                    <option value="Daughter">Daughter</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Brother">Brother</option>
                                    <option value="Sister">Sister</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsFamilyModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSavingRelation || !relationFormData.relatedPersonId}>
                                    {isSavingRelation ? 'Saving...' : 'Save Relation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Inverse Relation Prompt Modal */}
            {isInverseModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1000 }}>
                    <div className="modal-content" style={{ width: '400px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.25rem' }}>Map Reverse Relation</h3>
                            <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={closeInverseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveInverseRelation} style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#93c5fd' }}>
                                    You mapped this person as a <strong>{relationFormData.relationType}</strong>. <br/><br/>
                                    What is <strong>{selectedPerson.firstName}</strong> to them?
                                </p>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Relation Type</label>
                                <select 
                                    className="form-control" 
                                    value={inverseRelationData.relationType}
                                    onChange={(e) => setInverseRelationData({ relationType: e.target.value })}
                                    required
                                >
                                    <option value="Husband">Husband</option>
                                    <option value="Wife">Wife</option>
                                    <option value="Son">Son</option>
                                    <option value="Daughter">Daughter</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Brother">Brother</option>
                                    <option value="Sister">Sister</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-ghost" onClick={closeInverseModal}>
                                    Skip
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSavingInverse}>
                                    {isSavingInverse ? 'Saving...' : 'Save Reverse Relation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientList;
