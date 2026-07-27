package com.RBX.RBXbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class RbXbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(RbXbackendApplication.class, args);
	}

}
