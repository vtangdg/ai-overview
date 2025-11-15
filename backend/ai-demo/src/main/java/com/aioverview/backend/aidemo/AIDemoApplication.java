package com.aioverview.backend.aidemo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication(exclude = HibernateJpaAutoConfiguration.class)
@EnableCaching
@MapperScan("com.aioverview.backend.aidemo.dao")
public class AIDemoApplication {

    public static void main(String[] args) {
        System.out.println("Current Working Directory: " + System.getProperty("user.dir"));
        SpringApplication.run(AIDemoApplication.class, args);
    }

}