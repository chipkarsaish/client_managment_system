package com.cms.backend.service;

import com.cms.backend.entity.FamilyRelation;
import com.cms.backend.repository.FamilyRelationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FamilyRelationService {

    @Autowired
    private FamilyRelationRepository familyRelationRepository;

    public List<FamilyRelation> getAllRelations() {
        return familyRelationRepository.findAll();
    }

    public FamilyRelation saveRelation(FamilyRelation relation) {
        return familyRelationRepository.save(relation);
    }

    public void deleteRelation(Long id) {
        familyRelationRepository.deleteById(id);
    }
}