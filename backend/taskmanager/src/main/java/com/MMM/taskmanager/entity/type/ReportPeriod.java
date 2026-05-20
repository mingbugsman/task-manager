package com.MMM.taskmanager.entity.type;

import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;

import java.util.Locale;

public enum ReportPeriod {
    WEEK(7),
    MONTH(30),
    QUARTER(90);

    private final int days;

    ReportPeriod(int days) {
        this.days = days;
    }

    public int getDays() {
        return days;
    }

    public static ReportPeriod fromParam(String value) {
        if (value == null || value.isBlank()) {
            return WEEK;
        }
        try {
            return ReportPeriod.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }
}
