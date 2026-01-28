"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { Howl } from 'howler';

const SoundContext = createContext();

export function SoundProvider({ children }) {
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const soundsRef = useRef({});

    // Load settings from local storage
    useEffect(() => {
        const savedMuted = localStorage.getItem("sound_muted") === "true";
        const savedVolume = parseFloat(localStorage.getItem("sound_volume") || "0.5");

        setMuted(savedMuted);
        setVolume(savedVolume);
        Howler.mute(savedMuted);
        Howler.volume(savedVolume);
    }, []);

    const playSound = (soundName) => {
        if (muted) return;

        // Define sound paths map
        const soundMap = {
            'click': '/sounds/click.mp3',
            'win': '/sounds/win.mp3',
            'lose': '/sounds/lose.mp3',
            'coin-flip': '/sounds/coin-flip.mp3',
            'dice-roll': '/sounds/dice-roll.mp3',
        };

        const src = soundMap[soundName];
        if (!src) return;

        // Cache howl instances
        if (!soundsRef.current[soundName]) {
            soundsRef.current[soundName] = new Howl({
                src: [src],
                volume: 1.0,
            });
        }

        soundsRef.current[soundName].play();
    };

    const toggleMute = () => {
        const newMuted = !muted;
        setMuted(newMuted);
        Howler.mute(newMuted);
        localStorage.setItem("sound_muted", newMuted);
    };

    const updateVolume = (val) => {
        setVolume(val);
        Howler.volume(val);
        localStorage.setItem("sound_volume", val);
    };

    return (
        <SoundContext.Provider value={{ muted, volume, toggleMute, updateVolume, playSound }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    return useContext(SoundContext);
}
