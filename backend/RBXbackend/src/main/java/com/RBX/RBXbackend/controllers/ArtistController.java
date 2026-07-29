package com.RBX.RBXbackend.controllers;

import com.RBX.RBXbackend.models.Artist;
import com.RBX.RBXbackend.services.ArtistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/artists")
public class ArtistController {

    @Autowired
    private ArtistService artistService;

    @GetMapping
    public List<Artist> findAll() {
        return artistService.findAll();
    }

    @PostMapping
    public ResponseEntity<Artist> postArtist(@RequestBody Artist artist) {
        Artist savedArtist = artistService.postArtist(artist);
        return new ResponseEntity<>(savedArtist, HttpStatus.CREATED);
    }

}
