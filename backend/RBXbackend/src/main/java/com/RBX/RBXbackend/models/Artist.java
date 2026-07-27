package com.RBX.RBXbackend.models;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "artist")
public class Artist {

    @Id
    @GeneratedValue
    @Column(name = "artist_id", nullable = false)
    private UUID artist_id;

    @Column(name = "artist_name", nullable = false)
    private String artist_name;

    @Column(name = "artist_genre", nullable = false)
    private String artist_genre;

    @Column(name = "artist_contact", nullable = false)
    private String artist_contact;

    @Column(name = "artist_thumbnail", nullable = false)
    private String artist_thumbnail;

    @Column(name = "artist_vid", nullable = false)
    private String artist_vid;

    @Column(name = "artist_description", nullable = false)
    private String artist_description;
    
    @Column(name = "status", nullable = false)
    private String artist_status;

    public UUID getArtist_id() {
        return artist_id;
    }

    public void setArtist_id(UUID artist_id) {
        this.artist_id = artist_id;
    }

    public String getArtist_name() {
        return artist_name;
    }

    public void setArtist_name(String artist_name) {
        this.artist_name = artist_name;
    }

    public String getArtist_genre() {
        return artist_genre;
    }

    public void setArtist_genre(String artist_genre) {
        this.artist_genre = artist_genre;
    }

    public String getArtist_thumbnail() {
        return artist_thumbnail;
    }

    public void setArtist_thumbnail(String artist_thumbnail) {
        this.artist_thumbnail = artist_thumbnail;
    }

    public String getArtist_contact() {
        return artist_contact;
    }

    public void setArtist_contact(String artist_contact) {
        this.artist_contact = artist_contact;
    }

    public String getArtist_vid() {
        return artist_vid;
    }

    public void setArtist_vid(String artist_vid) {
        this.artist_vid = artist_vid;
    }

    public String getArtist_description() {
        return artist_description;
    }

    public void setArtist_description(String artist_description) {
        this.artist_description = artist_description;
    }

    public String getArtist_status() {
        return artist_status;
    }

    public void setArtist_status(String artist_status) {
        this.artist_status = artist_status;
    }
}
