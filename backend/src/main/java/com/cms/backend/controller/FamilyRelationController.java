package com.cms.backend.controller;

import com.cms.backend.entity.FamilyRelation;
import com.cms.backend.service.FamilyRelationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family")
@CrossOrigin("*")
public class FamilyRelationController {

    @Autowired
    private FamilyRelationService familyRelationService;

    @GetMapping
    public List<FamilyRelation> getAllRelations() {
        return familyRelationService.getAllRelations();
    }

    @PostMapping
    public FamilyRelation saveRelation(
            @RequestBody FamilyRelation relation) {

        return familyRelationService.saveRelation(relation);
    }

    @DeleteMapping("/{id}")
    public void deleteRelation(@PathVariable Long id) {
        familyRelationService.deleteRelation(id);
    }
}