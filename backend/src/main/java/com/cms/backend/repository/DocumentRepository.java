package com.cms.backend.repository;

import com.cms.backend.entity.Document;
import com.cms.backend.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository
        extends JpaRepository<Document, Long> {

    List<Document> findByPerson(Person person);
}