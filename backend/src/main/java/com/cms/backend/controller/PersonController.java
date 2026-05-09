package com.cms.backend.controller;

import com.cms.backend.entity.Person;
import com.cms.backend.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/persons")
@CrossOrigin("*")
public class PersonController {

    @Autowired
    private PersonService personService;

    // GET ALL PERSONS
    @GetMapping
    public List<Person> getAllPersons() {
        return personService.getAllPersons();
    }

    // SAVE PERSON
    @PostMapping
    public Person savePerson(@RequestBody Person person) {
        return personService.savePerson(person);
    }

    // GET PERSON BY ID
    @GetMapping("/{id}")
    public Person getPersonById(@PathVariable Long id) {
        return personService.getPersonById(id);
    }

    // DELETE PERSON
    @DeleteMapping("/{id}")
    public void deletePerson(@PathVariable Long id) {
        personService.deletePerson(id);
    }
}