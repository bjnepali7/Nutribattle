package com.nutribattle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.nutribattle")
public class NutribattleBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NutribattleBackendApplication.class, args);
    }
}