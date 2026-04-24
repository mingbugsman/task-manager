package com.MMM.taskmanager.config;

import com.cloudinary.Cloudinary;

import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${MMM.taskmanager.cloudinary.cloudinaryApiKey}")
    private String cloudinaryApiKey;

    @Value("${MMM.taskmanager.cloudinary.cloudinaryName}")
    private String cloudinaryName;

    @Value("${MMM.taskmanager.cloudinary.cloudinaryApiSecret}")
    private String cloudinaryApiSecret;


    @Bean
    public Cloudinary cloudinary() {

        return new Cloudinary(ObjectUtils.asMap("cloud_name", cloudinaryName,
                "api_key", cloudinaryApiKey,
                "api_secret", cloudinaryApiSecret,
                "secure",true
        ));
    }
}
