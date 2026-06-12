package com.docservice.careerhub.dto.constants;

/**
 * Paid plans. Price is INR (Cashfree major unit) and is the single source of truth — the client
 * never sends an amount. {@code credits} is the number of resumes a purchase unlocks; null = unlimited.
 */
public enum Plan {
    BASIC(99.0, 1),
    STANDARD(199.0, 5),
    UNLIMITED(399.0, null);

    private final double priceInr;
    private final Integer credits;

    Plan(double priceInr, Integer credits) {
        this.priceInr = priceInr;
        this.credits = credits;
    }

    public double getPriceInr() {
        return priceInr;
    }

    public Integer getCredits() {
        return credits;
    }

    public boolean isUnlimited() {
        return credits == null;
    }
}
