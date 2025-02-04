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

function verificaPosizioneUtente(punti) {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            punti.forEach(punto => {
                const [puntoLat, puntoLon] = punto.acf.coordinate_gps.split(',').map(coord => parseFloat(coord.trim()));

                // Calcola la distanza tra l'utente e il punto di interesse
                const distanza = Math.sqrt(Math.pow(userLat - puntoLat, 2) + Math.pow(userLon - puntoLon, 2));
                if (distanza < 0.01) { // Soglia di prossimità (puoi regolarla)
                    alert(`Sei vicino a: ${punto.title.rendered}`);
                }
            });
        }, (error) => {
            console.error('Errore nella geolocalizzazione:', error);
        });
    } else {
        console.error('Geolocalizzazione non supportata dal browser.');
    }
}

// Chiamata alla funzione dopo aver caricato i punti di interesse
fetch('https://iltuosito.it/wp-json/wp/v2/punti-di-interesse')
    .then(response => response.json())
    .then(punti => {
        verificaPosizioneUtente(punti);
    });

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registrato'))
        .catch(error => console.error('Errore nella registrazione del Service Worker:', error));
}
