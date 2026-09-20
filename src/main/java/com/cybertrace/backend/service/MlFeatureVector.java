package com.cybertrace.backend.service;

public record MlFeatureVector(

        int hour,
        int dayOfWeek,
        int isWeekend,

        long complaintsLast1h,
        long complaintsLast6h,
        long complaintsLast24h,

        long withdrawalsLast1h,
        long withdrawalsLast6h,
        long withdrawalsLast24h,

        long withdrawalCount,
        double totalWithdrawalAmount,
        double averageWithdrawal,
        long uniqueAccounts,
        double transactionVelocity,

        long complaints1km,
        long complaints3km,

        long fraudEvents1km,
        long fraudEvents3km,

        double distanceFromRecentFraud,
        long historicalFraudCount,
        double historicalHotspotScore
) {}
