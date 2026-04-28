package com.MMM.taskmanager.service;

import com.MMM.taskmanager.mapper.UserMapper;
import com.MMM.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;

}
