# Project1_CS5331
AUDIO CHROMA FEATURE VISUALIZATION
![Alt text](https://github.com/Nhatmusic/Project1_CS5331/blob/master/image/Project1.gif?raw=true "Title")
Link: https://nhatmusic.github.io/Project1_CS5331/
- Note: It takes 20 second to load all 10 songs and draw them.
1. Audio Feature Extraction
- Chroma features are an interesting and powerful representation for music audio in which the entire spectrum is projected onto 12 bins     representing the 12 distinct semitones (or chroma) of the musical octave.
- Twelve chroma values represented by the set
  {C, C♯, D, D♯, E ,F, F♯, G, G♯, A, A♯, B}
- Use Meyda library https://github.com/meyda/meyda to extract Chroma Feature of 10 songs
- Sample Rate: 44100 sample/second, Window Size: 2048, 20 features were extracted per second, each window lasts 46.4 ms.
- Intensitive of chroma feature is calculated in dB.

2. Purpose of the Visualization
- Chord recognition
- Song Cover Identification
Wikipedia
![Alt text](https://github.com/Nhatmusic/Project1_CS5331/blob/master/image/chroma.jpg)

3. Finding:
For example, for the first 2 seconds of the song "Shape of You", the visualization show that the notes with dark blue (high intensitive) appear mostly including C#, E, A, D#, B. These notes match with the main chord played in the song.
![Alt text](https://github.com/Nhatmusic/Project1_CS5331/blob/master/image/shapeofyou.jpg)




