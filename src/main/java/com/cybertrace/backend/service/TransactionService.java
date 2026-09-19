package com.cybertrace.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cybertrace.backend.dto.TransactionDto.TransactionResponse;
import com.cybertrace.backend.mapper.DtoMapper;
import com.cybertrace.backend.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final DtoMapper mapper;

    public TransactionService(TransactionRepository transactionRepository, DtoMapper mapper) {
        this.transactionRepository = transactionRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(String riskLabel, String transactionType, Pageable pageable) {
        return transactionRepository.findFilteredTransactions(riskLabel, transactionType, pageable)
                .map(mapper::toTransactionResponse);
    }
}
