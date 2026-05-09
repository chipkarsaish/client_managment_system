package com.cms.backend.controller;

import com.cms.backend.entity.Document;
import com.cms.backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.File;
import java.io.FileInputStream;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin("*")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    // UPLOAD DOCUMENT
    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam MultipartFile file,
            @RequestParam Long personId,
            @RequestParam String documentType)
            throws IOException {

        Document document = documentService.uploadDocument(
                file,
                personId,
                documentType
        );

        return ResponseEntity.ok(document);
    }

    // GET DOCUMENTS BY PERSON
    @GetMapping("/person/{personId}")
    public List<Document> getDocumentsByPerson(
            @PathVariable Long personId) {

        return documentService.getDocumentsByPerson(personId);
    }

    // DELETE DOCUMENT
    @DeleteMapping("/{id}")
    public void deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
    }

    // REPLACE DOCUMENT
    @PutMapping("/replace/{id}")
    public ResponseEntity<Document> replaceDocument(
            @PathVariable Long id,
            @RequestParam MultipartFile file)
            throws IOException {

        Document updatedDocument =
                documentService.replaceDocument(id, file);

        return ResponseEntity.ok(updatedDocument);
    }

    // DOWNLOAD DOCUMENT
    @GetMapping("/download/{id}")
    public ResponseEntity<InputStreamResource> downloadDocument(
            @PathVariable Long id)
            throws IOException {

        File file = documentService.getDocumentFile(id);

        InputStreamResource resource =
                new InputStreamResource(
                        new FileInputStream(file));

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + file.getName()
                )
                .contentLength(file.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

}