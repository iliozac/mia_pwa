document.addEventListener('DOMContentLoaded', () => {
    const puntiInteresseContainer = document.getElementById('punti-interesse');

    // Recupera i punti di interesse dall'API REST
    fetch('https://ecorizzonti.it/wp-json/wp/v2/punti-di-interesse')
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nel recupero dei dati');
            }
            return response.json();
        })
        .then(punti => {
            if (punti.length === 0) {
                puntiInteresseContainer.innerHTML = '<p>Nessun punto di interesse trovato.</p>';
                return;
            }

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
                    const audioPlayer = document.getElementById('audio-player');
                    audioPlayer.src = punto.acf.file_audio;
                    audioPlayer.style.display = 'block';
                    audioPlayer.play();
                });
                puntoDiv.appendChild(playButton);

                puntiInteresseContainer.appendChild(puntoDiv);
            });
        })
        .catch(error => {
            console.error('Errore:', error);
            puntiInteresseContainer.innerHTML = '<p>Errore nel caricamento dei punti di interesse.</p>';
        });
});
