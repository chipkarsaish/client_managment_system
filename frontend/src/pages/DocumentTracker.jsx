import React, { useEffect, useState } from "react";
import { Users, FileText, CheckCircle, AlertCircle, Upload, Search, MapPin, Phone, X, Download, Trash2, RefreshCw } from "lucide-react";
import api from "../api/api";

const REQUIRED_DOCS = ["PAN Card", "Aadhar Card", "Driving License", "Electricity Bill"];

function DocumentTracker() {
    const [persons, setPersons] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContext, setSelectedContext] = useState({ person: null, documentType: null, existingDoc: null });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch all persons
            const personsResponse = await api.get("/persons");
            const allPersons = personsResponse.data;

            // 2. Fetch documents for each person in parallel
            const personsWithDocs = await Promise.all(
                allPersons.map(async (person) => {
                    try {
                        const docsResponse = await api.get(`/documents/person/${person.id}`);
                        return { ...person, documents: docsResponse.data };
                    } catch (error) {
                        console.error(`Error fetching docs for person ${person.id}:`, error);
                        return { ...person, documents: [] };
                    }
                })
            );

            setPersons(personsWithDocs);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBadgeClick = (person, documentType) => {
        const existingDoc = person.documents?.find(d => d.documentType === documentType) || null;
        setSelectedContext({ person, documentType, existingDoc });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedContext({ person: null, documentType: null, existingDoc: null }), 300);
    };

    const handleModalFileChange = async (e, isReplace = false) => {
        const file = e.target.files[0];
        if (!file || !selectedContext.person || !selectedContext.documentType) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            if (isReplace && selectedContext.existingDoc) {
                await api.put(`/documents/replace/${selectedContext.existingDoc.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } else {
                formData.append("personId", selectedContext.person.id);
                formData.append("documentType", selectedContext.documentType);
                await api.post("/documents/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }
            
            // Refresh documents
            const docsResponse = await api.get(`/documents/person/${selectedContext.person.id}`);
            setPersons(prevPersons => prevPersons.map(p => 
                p.id === selectedContext.person.id ? { ...p, documents: docsResponse.data } : p
            ));
            
            handleCloseModal();
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload document");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDocument = async () => {
        if (!selectedContext.existingDoc || !window.confirm("Are you sure you want to delete this document?")) return;
        
        setIsUploading(true);
        try {
            await api.delete(`/documents/${selectedContext.existingDoc.id}`);
            
            // Refresh documents
            const docsResponse = await api.get(`/documents/person/${selectedContext.person.id}`);
            setPersons(prevPersons => prevPersons.map(p => 
                p.id === selectedContext.person.id ? { ...p, documents: docsResponse.data } : p
            ));
            
            handleCloseModal();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete document");
        } finally {
            setIsUploading(false);
        }
    };

    const filteredPersons = persons.filter(person => {
        return `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getDocStatus = (personDocs, docType) => {
        return personDocs.some(doc => doc.documentType === docType);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} style={{ color: 'var(--primary)' }} />
                        Document Tracker
                    </h2>
                    
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search clients..." 
                            style={{ paddingLeft: '36px', width: '260px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="table-container" style={{ border: 'none', borderRadius: 0, flex: 1, overflowY: 'auto' }}>
                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading clients and documents...</div>
                    ) : (
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th style={{ minWidth: '250px' }}>Client</th>
                                    {REQUIRED_DOCS.map(docType => (
                                        <th key={docType} style={{ textAlign: 'center' }}>{docType}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPersons.length > 0 ? (
                                    filteredPersons.map(person => (
                                        <tr key={person.id}>
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
                                            
                                            {REQUIRED_DOCS.map(docType => {
                                                const existingDoc = person.documents?.find(d => d.documentType === docType) || null;
                                                const isUploaded = !!existingDoc;
                                                
                                                return (
                                                    <td key={docType} style={{ textAlign: 'center' }}>
                                                        {isUploaded ? (
                                                            <div 
                                                                style={{ 
                                                                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                                                    padding: '6px 12px', borderRadius: '999px', 
                                                                    backgroundColor: 'var(--success-bg)', color: 'var(--success)',
                                                                    fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.2s'
                                                                }}
                                                                onClick={() => handleBadgeClick(person, docType)}
                                                                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                                                                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                                                title="Manage Document"
                                                            >
                                                                <CheckCircle size={14} />
                                                                Uploaded
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                className="btn btn-outline"
                                                                style={{ 
                                                                    padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', 
                                                                    backgroundColor: 'var(--bg-light-faint)', border: '1px dashed var(--border)',
                                                                    color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px'
                                                                }}
                                                                onClick={() => handleBadgeClick(person, docType)}
                                                            >
                                                                <Upload size={14} />
                                                                Upload Now
                                                            </button>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={REQUIRED_DOCS.length + 1} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                            No clients found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Document Management Modal */}
            {isModalOpen && selectedContext.person && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '450px' }}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.25rem' }}>Manage {selectedContext.documentType}</h3>
                            <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                                    {selectedContext.person.firstName?.charAt(0)}{selectedContext.person.lastName?.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedContext.person.firstName} {selectedContext.person.lastName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: #{selectedContext.person.id}</div>
                                </div>
                            </div>

                            {selectedContext.existingDoc ? (
                                // --- DOCUMENT EXISTS VIEW ---
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ backgroundColor: 'var(--bg-light-faint)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', padding: '12px', borderRadius: '8px' }}>
                                            <FileText size={24} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {selectedContext.existingDoc.fileName}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                Uploaded on {new Date(selectedContext.existingDoc.uploadedDate).toLocaleDateString()}
                                            </div>
                                            <a 
                                                href={`http://localhost:8080/api/documents/download/${selectedContext.existingDoc.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline" 
                                                style={{ marginTop: '12px', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                                            >
                                                <Download size={16} /> Download File
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <label className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                                            {isUploading ? 'Uploading...' : <><RefreshCw size={16} /> Replace</>}
                                            <input type="file" style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleModalFileChange(e, true)} />
                                        </label>
                                        <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.12)' }} onClick={handleDeleteDocument} disabled={isUploading} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // --- NO DOCUMENT VIEW ---
                                <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '40px 24px', textAlign: 'center', backgroundColor: 'var(--bg-light-faint)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', padding: '16px', borderRadius: '50%' }}>
                                            <Upload size={32} />
                                        </div>
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Upload {selectedContext.documentType}</h4>
                                    <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select a file from your computer</p>
                                    
                                    <label className="btn btn-primary" style={{ display: 'inline-flex', cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                                        {isUploading ? 'Uploading...' : 'Browse Files'}
                                        <input type="file" style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleModalFileChange(e, false)} />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentTracker;
