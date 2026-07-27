package com.RBX.RBXbackend.repositories;

import com.RBX.RBXbackend.models.Artist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ArtistRepository extends JpaRepository<Artist, UUID> {
}
