package com.docservice.careerhub.repo;

import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.entity.DocTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocTemplateRepository extends JpaRepository<DocTemplate, Long> {

    String SEARCH_QUERY = """
            SELECT t FROM DocTemplate t
            WHERE (:keyword IS NULL OR :keyword = ''
                   OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:type IS NULL OR t.type = :type)
            """;

    @Query(SEARCH_QUERY)
    Page<DocTemplate> search(@Param("keyword") String keyword, @Param("type") DocType type, Pageable pageable);
}
