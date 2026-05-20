package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.contact.ContactMessageRequest;

public interface ContactService {

    void submitContactMessage(ContactMessageRequest request);
}
