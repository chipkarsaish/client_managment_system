import { useState } from "react";
import api from "../api/api";

function UploadDocument() {

    const [file, setFile] = useState(null);

    const uploadFile = async () => {

        const formData = new FormData();

        formData.append("file", file);
        formData.append("personId", 1);
        formData.append("documentType", "PAN");

        try {

            await api.post(
                "/documents/upload",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            alert("Uploaded Successfully");

        } catch(error) {
            console.log(error);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.25rem', color: '#1f2937' }}>Upload Document</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                    type="file"
                    onChange={(e) =>
                        setFile(e.target.files[0])
                    }
                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                />

                <button 
                    onClick={uploadFile}
                    style={{ 
                        background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', 
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 500, alignSelf: 'flex-start' 
                    }}
                >
                    Upload
                </button>
            </div>
        </div>
    );
}

export default UploadDocument;