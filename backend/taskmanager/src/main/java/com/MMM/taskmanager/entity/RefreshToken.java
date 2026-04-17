package com.MMM.taskmanager.entity;

import com.MMM.taskmanager.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "refreshtoken")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private long id;

    @OneToOne(fetch = FetchType.LAZY)

    @JoinColumn(name = "user_id", referencedColumnName = "user_id") 
    private User user;

    @Column(name = "token", nullable = false, unique = true, length = 255)
    private String token;

    @Column(name = "expiry_date", nullable = false, columnDefinition = "DATETIME(6)")
    private Instant expiryDate;
}