package com.cms.backend.service;

import com.cms.backend.entity.Document;
import com.cms.backend.entity.Person;
import com.cms.backend.repository.DocumentRepository;
import com.cms.backend.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private PersonRepository personRepository;

    private final String uploadDir = "uploads/";

    // UPLOAD DOCUMENT
    public Document uploadDocument(
            MultipartFile file,
            Long personId,
            String documentType) throws IOException {

        // Find person
        Person person = personRepository.findById(personId)
                .orElseThrow(() ->
                        new RuntimeException("Person not found"));

        // Ensure upload directory exists
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate unique filename
        String fileName = UUID.randomUUID() + "_"
                + file.getOriginalFilename();

        // File path
        String filePath = uploadDir + fileName;

        // Save file physically
        File destFile = new File(filePath).getAbsoluteFile();
        file.transferTo(destFile);

        // Save metadata in database
        Document document = new Document();

        document.setDocumentType(documentType);
        document.setFileName(fileName);
        document.setFilePath(filePath);
        document.setUploadedDate(LocalDateTime.now());
        document.setPerson(person);

        return documentRepository.save(document);
    }

    // GET DOCUMENTS BY PERSON
    public List<Document> getDocumentsByPerson(Long personId) {

        Person person = personRepository.findById(personId)
                .orElseThrow(() ->
                        new RuntimeException("Person not found"));

        return documentRepository.findByPerson(person);
    }

    // DELETE DOCUMENT
    public void deleteDocument(Long id) {

        Document document = documentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Document not found"));

        // Delete physical file
        File file = new File(document.getFilePath());

        if(file.exists()) {
            file.delete();
        }

        // Delete DB record
        documentRepository.delete(document);
    }

    // REPLACE DOCUMENT
    public Document replaceDocument(
            Long documentId,
            MultipartFile newFile)
            throws IOException {

        // Find existing document
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException("Document not found"));

        // Delete old physical file
        File oldFile = new File(document.getFilePath());

        if(oldFile.exists()) {
            oldFile.delete();
        }

        // Ensure upload directory exists
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate new filename
        String newFileName = UUID.randomUUID()
                + "_" + newFile.getOriginalFilename();

        // New file path
        String newFilePath = uploadDir + newFileName;

        // Save new file
        File destFile = new File(newFilePath).getAbsoluteFile();
        newFile.transferTo(destFile);

        // Update database values
        document.setFileName(newFileName);
        document.setFilePath(newFilePath);
        document.setUploadedDate(LocalDateTime.now());

        return documentRepository.save(document);
    }

    // DOWNLOAD DOCUMENT
    public File getDocumentFile(Long documentId) {

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException("Document not found"));

        return new File(document.getFilePath());
    }
}