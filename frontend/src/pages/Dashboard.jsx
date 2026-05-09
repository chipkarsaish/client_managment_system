import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, FileText, Activity, Search, Plus, X, MapPin, Phone, Calendar, ChevronRight, User, Folder, LayoutGrid, UploadCloud, Download, Trash2, File, RefreshCw, AlertCircle, Heart } from "lucide-react";
import api from "../api/api";

function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // State Management
    const [persons, setPersons] = useState([]);
    const [locations, setLocations] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    
    // Modal & Details State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        mobile: "",
        dob: "",
        locationId: ""
    });

    // Document State
    const [documents, setDocuments] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDocType, setUploadDocType] = useState("PAN Card");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Replace Document State
    const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
    const [documentToReplace, setDocumentToReplace] = useState(null);
    const [replaceFile, setReplaceFile] = useState(null);
    const [isReplacing, setIsReplacing] = useState(false);
    const replaceFileInputRef = useRef(null);

    // Family State
    const [familyMembers, setFamilyMembers] = useState([]);
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
    const [relationFormData, setRelationFormData] = useState({ relatedPersonId: '', relationType: 'Husband' });
    const [isSavingRelation, setIsSavingRelation] = useState(false);
    
    // Inverse Relation State
    const [isInverseModalOpen, setIsInverseModalOpen] = useState(false);
    const [inverseRelationData, setInverseRelationData] = useState({ relationType: 'Brother' });
    const [isSavingInverse, setIsSavingInverse] = useState(false);
    
    // UI State
    const [activeTab, setActiveTab] = useState('documents');

    // Fetch Data
    useEffect(() => {
        fetchPersons();
        fetchLocations();
    }, []);

    useEffect(() => {
        if (selectedPerson) {
            fetchDocuments(selectedPerson.id);
            fetchFamilyMembers(selectedPerson.id);
        } else {
            setDocuments([]);
            setUploadFile(null);
            setFamilyMembers([]);
        }
    }, [selectedPerson]);

    useEffect(() => {
        if (location.pathname === '/add-client') {
            setIsAddModalOpen(true);
        }
    }, [location.pathname]);

    const fetchPersons = async () => {
        try {
            const response = await api.get("/persons");
            setPersons(response.data);
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

    // Filter Logic
    const filteredPersons = persons.filter(person => {
        const matchesSearch = `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (person.mobile && person.mobile.includes(searchQuery));
        const matchesLocation = locationFilter ? person.location?.id?.toString() === locationFilter : true;
        return matchesSearch && matchesLocation;
    });

    const handleCloseAddModal = (isSubmit = false) => {
        setIsAddModalOpen(false);
        if (location.pathname === '/add-client') {
            if (isSubmit === true) {
                navigate('/');
            } else {
                navigate(-1);
            }
        }
    };

    // Handle Form Input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Add Client Submit
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobile: formData.mobile,
                dob: formData.dob,
                location: formData.locationId ? { id: parseInt(formData.locationId) } : null
            };

            await api.post("/persons", payload);
            handleCloseAddModal(true);
            setFormData({ firstName: "", lastName: "", mobile: "", dob: "", locationId: "" });
            fetchPersons(); 
        } catch (error) {
            console.error("Error adding client:", error);
            alert("Failed to add client. Please check the console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete Client
    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete this client?")) {
            try {
                await api.delete(`/persons/${id}`);
                setPersons(persons.filter(p => p.id !== id));
                if (selectedPerson?.id === id) setSelectedPerson(null);
            } catch (error) {
                console.error("Error deleting person:", error);
                alert("Failed to delete person.");
            }
        }
    };

    // --- Document Handlers ---

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile || !selectedPerson) return;
        
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("personId", selectedPerson.id);
        formData.append("documentType", uploadDocType);

        try {
            await api.post("/documents/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setUploadFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchDocuments(selectedPerson.id);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload document");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = (docId) => {
        window.open(`http://localhost:8080/api/documents/download/${docId}`, '_blank');
    };

    const handleDeleteDoc = async (docId) => {
        if(window.confirm("Are you sure you want to delete this document?")) {
            try {
                await api.delete(`/documents/${docId}`);
                fetchDocuments(selectedPerson.id);
            } catch (error) {
                console.error("Delete error:", error);
                alert("Failed to delete document");
            }
        }
    };

    const openReplaceModal = (doc) => {
        setDocumentToReplace(doc);
        setIsReplaceModalOpen(true);
    };

    const handleReplaceSubmit = async (e) => {
        e.preventDefault();
        if (!replaceFile || !documentToReplace) return;

        setIsReplacing(true);
        const formData = new FormData();
        formData.append("file", replaceFile);

        try {
            await api.put(`/documents/replace/${documentToReplace.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setIsReplaceModalOpen(false);
            setReplaceFile(null);
            setDocumentToReplace(null);
            if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
            fetchDocuments(selectedPerson.id);
        } catch (error) {
            console.error("Replace error:", error);
            alert("Failed to replace document");
        } finally {
            setIsReplacing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Top Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: 'var(--primary)', borderRadius: '12px', color: 'white' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Total Clients</p>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>{persons.length}</h3>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#10b981', borderRadius: '12px', color: 'white' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>System Documents</p>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>Active</h3>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#8b5cf6', borderRadius: '12px', color: 'white' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>System Status</p>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>Online</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Split Area */}
            <div style={{ display: 'flex', gap: '24px', flex: 1, alignItems: 'flex-start', overflow: 'hidden' }}>
                
                {/* Left Side: Person List */}
                <div className="card" style={{ flex: selectedPerson ? 1 : '1 1 100%', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Client Directory</h2>
                        
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search clients..." 
                                    style={{ paddingLeft: '36px', width: selectedPerson ? '180px' : '220px' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <select 
                                className="form-control" 
                                style={{ width: '160px' }}
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            >
                                <option value="">All Locations</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.city || loc.name || `Location ${loc.id}`}</option>
                                ))}
                            </select>

                            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                <Plus size={18} />
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container" style={{ border: 'none', borderRadius: 0, maxHeight: '600px' }}>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    {!selectedPerson && <th>Contact</th>}
                                    {!selectedPerson && <th>Location</th>}
                                    <th>Actions</th>
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
                                            {!selectedPerson && (
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                                        <Phone size={14} />
                                                        {person.mobile || 'N/A'}
                                                    </div>
                                                </td>
                                            )}
                                            {!selectedPerson && (
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
                                            )}
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                                                    <button className="btn btn-ghost" style={{ padding: '6px', color: 'var(--primary)' }} onClick={() => { setSelectedPerson(person); setActiveTab('documents'); }} title="View Documents">
                                                        <Folder size={18} />
                                                    </button>
                                                    <button className="btn btn-ghost" style={{ padding: '6px', color: '#ef4444' }} onClick={() => { setSelectedPerson(person); setActiveTab('family'); }} title="Manage Family">
                                                        <Heart size={18} />
                                                    </button>
                                                    <button className="btn btn-ghost" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => handleDelete(person.id)} title="Delete">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={selectedPerson ? "2" : "4"} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                            No clients found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side: Document Management Panel */}
                {selectedPerson && (
                    <div className="card" style={{ flex: 1.2, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
                        {/* Person Details Header & Tabs */}
                        <div style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.25rem', border: '1px solid var(--border)' }}>
                                        {selectedPerson.firstName?.charAt(0)}{selectedPerson.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{selectedPerson.firstName} {selectedPerson.lastName}</h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', marginTop: '4px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14}/> {selectedPerson.mobile || 'N/A'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {selectedPerson.location?.city || 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>
                                <button className="btn btn-ghost" onClick={() => setSelectedPerson(null)} title="Close Panel">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {/* Tab Bar */}
                            <div style={{ display: 'flex', padding: '0 24px' }}>
                                <button 
                                    style={{ 
                                        padding: '12px 24px', background: 'transparent', border: 'none', 
                                        borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
                                        color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: activeTab === 'overview' ? 600 : 500, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem'
                                    }}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    <User size={16} /> Overview
                                </button>
                                <button 
                                    style={{ 
                                        padding: '12px 24px', background: 'transparent', border: 'none', 
                                        borderBottom: activeTab === 'documents' ? '2px solid var(--primary)' : '2px solid transparent',
                                        color: activeTab === 'documents' ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: activeTab === 'documents' ? 600 : 500, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem'
                                    }}
                                    onClick={() => setActiveTab('documents')}
                                >
                                    <FileText size={16} /> Documents
                                </button>
                                <button 
                                    style={{ 
                                        padding: '12px 24px', background: 'transparent', border: 'none', 
                                        borderBottom: activeTab === 'family' ? '2px solid var(--primary)' : '2px solid transparent',
                                        color: activeTab === 'family' ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: activeTab === 'family' ? 600 : 500, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem'
                                    }}
                                    onClick={() => setActiveTab('family')}
                                >
                                    <Heart size={16} /> Family
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '24px', overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
                            
                            {/* TAB CONTENT: Overview */}
                            {activeTab === 'overview' && (
                                <div style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Profile Overview</h4>
                                    <div style={{ backgroundColor: 'var(--bg-light-faint)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                            <Phone size={18} style={{ color: 'var(--primary)' }} />
                                            <span>{selectedPerson.mobile || 'No mobile provided'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                            <Calendar size={18} style={{ color: 'var(--primary)' }} />
                                            <span>{selectedPerson.dob ? `Born: ${selectedPerson.dob}` : 'DOB unknown'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                                            <MapPin size={18} style={{ color: 'var(--primary)' }} />
                                            <span>{selectedPerson.location?.city || selectedPerson.location?.name || 'No location set'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB CONTENT: Documents */}
                            {activeTab === 'documents' && (
                                <div style={{ animation: 'fadeIn 0.2s ease' }}>
                            <div style={{ 
                                border: '2px dashed var(--border)', 
                                borderRadius: 'var(--radius-lg)', 
                                padding: '24px', 
                                backgroundColor: uploadFile ? 'var(--success-bg)' : 'var(--bg-light-faint)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '16px',
                                transition: 'all 0.2s ease',
                                marginBottom: '24px'
                            }}>
                                <div style={{ display: 'flex', gap: '16px', width: '100%', alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Document Type</label>
                                        <select 
                                            className="form-control" 
                                            value={uploadDocType} 
                                            onChange={(e) => setUploadDocType(e.target.value)}
                                        >
                                            <option>PAN Card</option>
                                            <option>Aadhar Card</option>
                                            <option>Driving License</option>
                                            <option>Electricity Bill</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 2, display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            style={{ display: 'none' }} 
                                            onChange={handleFileChange}
                                        />
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.02)', justifyContent: 'flex-start' }}
                                            onClick={handleUploadClick}
                                        >
                                            <UploadCloud size={18} style={{ color: 'var(--primary)' }}/>
                                            {uploadFile ? uploadFile.name : "Select File"}
                                        </button>
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={handleUploadSubmit}
                                            disabled={!uploadFile || isUploading}
                                        >
                                            {isUploading ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Document List Table */}
                            <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '1rem' }}>Uploaded Documents ({documents.length})</h4>
                            
                            {documents.length > 0 ? (
                                <div className="table-container" style={{ border: '1px solid var(--border)' }}>
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>File Name</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {documents.map(doc => (
                                                <tr key={doc.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                                            <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                                                            {doc.documentType}
                                                        </div>
                                                    </td>
                                                    <td style={{ color: 'var(--text-secondary)' }}>
                                                        {doc.fileName || `doc_${doc.id}.pdf`}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button 
                                                                className="btn btn-outline" 
                                                                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '999px' }}
                                                                onClick={() => handleDownload(doc.id)}
                                                            >
                                                                <Download size={14} /> View
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline" 
                                                                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '999px' }}
                                                                onClick={() => openReplaceModal(doc)}
                                                            >
                                                                <RefreshCw size={14} /> Replace
                                                            </button>
                                                            <button 
                                                                className="btn btn-danger-outline" 
                                                                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '999px' }}
                                                                onClick={() => handleDeleteDoc(doc.id)}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ 
                                    padding: '48px 24px', 
                                    textAlign: 'center', 
                                    border: '1px dashed var(--border)', 
                                    borderRadius: 'var(--radius-lg)',
                                    backgroundColor: 'var(--bg-light-faint)' 
                                }}>
                                    <Folder size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                                    <h4 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>No Documents Found</h4>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Upload documents for {selectedPerson.firstName} to see them here.</p>
                                </div>
                            )}

                                </div>
                            )}

                            {/* TAB CONTENT: Family Members */}
                            {activeTab === 'family' && (
                                <div style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                            Family Relations
                                            <span style={{ marginLeft: '8px', backgroundColor: 'var(--bg-body)', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {familyMembers.length}
                                            </span>
                                        </h4>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                                            onClick={() => setIsFamilyModalOpen(true)}
                                        >
                                            <Plus size={16} /> Add Relation
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {familyMembers.length > 0 ? (
                                            familyMembers.map((rel, index) => {
                                                const relatedP = rel.relatedPerson;
                                                if (!relatedP) return null;
                                                
                                                let badgeBg = 'rgba(79, 70, 229, 0.15)';
                                                let badgeColor = '#818cf8';
                                                if (rel.relationType === 'Husband' || rel.relationType === 'Wife') { badgeBg = 'rgba(219, 39, 119, 0.15)'; badgeColor = '#f472b6'; }
                                                else if (rel.relationType === 'Son' || rel.relationType === 'Daughter') { badgeBg = 'rgba(22, 163, 74, 0.15)'; badgeColor = '#4ade80'; }
                                                else if (rel.relationType === 'Father' || rel.relationType === 'Mother') { badgeBg = 'rgba(217, 119, 6, 0.15)'; badgeColor = '#fbbf24'; }

                                                return (
                                                    <div key={index} style={{ 
                                                        backgroundColor: 'var(--bg-light-faint)', padding: '16px', borderRadius: 'var(--radius-md)', 
                                                        border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px',
                                                        boxShadow: 'var(--shadow-sm)'
                                                    }}>
                                                        <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', color: '#ffffff' }}>
                                                            {relatedP.firstName?.charAt(0)}{relatedP.lastName?.charAt(0)}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                                                {relatedP.firstName} {relatedP.lastName}
                                                            </div>
                                                            <div style={{ 
                                                                display: 'inline-block', marginTop: '4px', padding: '2px 8px', 
                                                                borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
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
                                                padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--border)', 
                                                borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-light-faint)' 
                                            }}>
                                                <Heart size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
                                                <h4 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>No Family Mapped</h4>
                                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Map family members to see them listed here.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>

            {/* Replace Document Modal */}
            {isReplaceModalOpen && documentToReplace && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.25rem' }}>Replace Document</h3>
                            <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={() => setIsReplaceModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-light-faint)', borderRadius: 'var(--radius-md)' }}>
                                <AlertCircle size={24} style={{ color: 'var(--primary)' }} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{documentToReplace.documentType}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>You are replacing {documentToReplace.fileName}</p>
                                </div>
                            </div>
                            
                            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Select New File</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                ref={replaceFileInputRef}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setReplaceFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setIsReplaceModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleReplaceSubmit} disabled={!replaceFile || isReplacing}>
                                {isReplacing ? 'Replacing...' : 'Confirm Replace'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Client Modal (Existing) */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.25rem' }}>Add New Client</h3>
                            <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={handleCloseAddModal}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit}>
                            <div className="modal-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">First Name *</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="firstName"
                                            required 
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <select 
                                        className="form-control"
                                        name="locationId"
                                        value={formData.locationId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select a location...</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.city || loc.name || `Location ${loc.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={handleCloseAddModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Family Relation Modal */}
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
                                        .filter(p => p.id !== selectedPerson?.id)
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
                                <button type="button" className="btn btn-ghost" onClick={() => setIsFamilyModalOpen(false)}>
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
                            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e3a8a' }}>
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

export default Dashboard;