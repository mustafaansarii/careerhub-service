package com.docservice.careerhub.repo;

import com.docservice.careerhub.dto.constants.PaymentOrderStatus;
import com.docservice.careerhub.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderId(String orderId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update PaymentOrder o set o.status = :paid where o.orderId = :orderId and o.status = :expected")
    int markPaid(@Param("orderId") String orderId,
                 @Param("paid") PaymentOrderStatus paid,
                 @Param("expected") PaymentOrderStatus expected);
}
