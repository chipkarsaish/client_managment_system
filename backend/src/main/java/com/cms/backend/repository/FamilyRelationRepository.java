package com.cms.backend.repository;

import com.cms.backend.entity.FamilyRelation;
import com.cms.backend.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FamilyRelationRepository extends JpaRepository<FamilyRelation, Long> {

    void deleteByPerson(Person person);
    void deleteByRelatedPerson(Person person);

}