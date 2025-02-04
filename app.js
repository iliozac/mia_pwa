document.addEventListener('DOMContentLoaded', () => {
    const puntiInteresseContainer = document.getElementById('punti-interesse');
    const audioPlayer = document.getElementById('audio-player');

    // Recupera i punti di interesse dall'API REST
    fetch('https://iltuosito.it/wp-json/wp/v2/punti-di-interesse')
        .then(response => response.json())
        .then(punti => {
            punti.forEach(punto => {
                const puntoDiv = document.createElement('div');
                puntoDiv.className = 'punto-interesse';

                const titolo = document.createElement('h2');
                titolo.textContent = punto.title.rendered;
                puntoDiv.appendChild(titolo);

                const coordinate = document.createElement('p');
                coordinate.textContent = `Coordinate: ${punto.acf.coordinate_gps}`;
                puntoDiv.appendChild(coordinate);

                const playButton = document.createElement('button');
                playButton.textContent = 'Ascolta Audio';
                playButton.addEventListener('click', () => {
                    audioPlayer.src = punto.acf.file_audio;
                    audioPlayer.style.display = 'block';
                    audioPlayer.play();
                });
                puntoDiv.appendChild(playButton);

                puntiInteresseContainer.appendChild(puntoDiv);
            });
        })
        .catch(error => console.error('Errore:', error));
});
