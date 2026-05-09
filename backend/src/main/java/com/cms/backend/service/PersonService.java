package com.cms.backend.service;

import com.cms.backend.entity.Person;
import com.cms.backend.repository.DocumentRepository;
import com.cms.backend.repository.FamilyRelationRepository;
import com.cms.backend.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PersonService {

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private FamilyRelationRepository familyRelationRepository;

    @Autowired
    private DocumentRepository documentRepository;

    // Get all persons
    public List<Person> getAllPersons() {
        return personRepository.findAll();
    }

    // Save person
    public Person savePerson(Person person) {
        return personRepository.save(person);
    }

    // Get person by ID
    public Person getPersonById(Long id) {

        Optional<Person> optionalPerson =
                personRepository.findById(id);

        return optionalPerson.orElse(null);
    }

    // Delete person — cascade remove relations and documents first
    @Transactional
    public void deletePerson(Long id) {
        Person person = personRepository.findById(id).orElse(null);
        if (person == null) return;

        // Remove all family relations where this person is either side
        familyRelationRepository.deleteByPerson(person);
        familyRelationRepository.deleteByRelatedPerson(person);

        // Remove all documents belonging to this person
        documentRepository.findByPerson(person)
                .forEach(doc -> documentRepository.deleteById(doc.getId()));

        personRepository.deleteById(id);
    }
}