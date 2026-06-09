package com.docservice.careerhub.repo;

import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.entity.UserDoc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserDocRepository extends JpaRepository<UserDoc, Long> {

    Optional<UserDoc> findByIdAndOwnerEmail(Long id, String ownerEmail);

    @Query("""
            SELECT d FROM UserDoc d
            WHERE d.ownerEmail = :ownerEmail
              AND (:keyword IS NULL OR :keyword = ''
                   OR LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(d.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:type IS NULL OR d.type = :type)
            """)
    Page<UserDoc> search(@Param("ownerEmail") String ownerEmail, @Param("keyword") String keyword,
                         @Param("type") DocType type, Pageable pageable);
}
