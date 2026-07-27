package com.RBX.RBXbackend.services.implementations;


import com.RBX.RBXbackend.models.Artist;
import com.RBX.RBXbackend.repositories.ArtistRepository;
import com.RBX.RBXbackend.services.ArtistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ArtistServiceImplementation implements ArtistService {

    @Autowired
    private ArtistRepository artistRepository;


    @Override
    public List<Artist> findAll() {

        List<Artist> liste = new ArrayList<Artist>();
        artistRepository.findAll().forEach(liste::add);
        return liste;
    }
}
