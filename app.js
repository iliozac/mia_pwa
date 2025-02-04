document.addEventListener('DOMContentLoaded', () => {
    const puntiInteresseContainer = document.getElementById('punti-interesse');
    const audioPlayer = document.getElementById('audio-player');

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

            // Mostra i punti di interesse
            punti.forEach(punto => {
                const puntoDiv = document.createElement('div');
                puntoDiv.className = 'punto-interesse';

                const titolo = document.createElement('h2');
                titolo.textContent = punto.title.rendered;
                puntoDiv.appendChild(titolo);

                const coordinate = document.createElement('p');
                coordinate.textContent = `Coordinate: ${punto.acf.coordinate_gps}`;
                puntoDiv.appendChild(coordinate);

                puntiInteresseContainer.appendChild(puntoDiv);
            });

            // Avvia la geolocalizzazione
            avviaGeolocalizzazione(punti);
        })
        .catch(error => {
            console.error('Errore:', error);
            puntiInteresseContainer.innerHTML = '<p>Errore nel caricamento dei punti di interesse.</p>';
        });
});

function avviaGeolocalizzazione(punti) {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => verificaPosizioneUtente(position, punti),
            (error) => console.error('Errore nella geolocalizzazione:', error),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
    } else {
        console.error('Geolocalizzazione non supportata dal browser.');
    }
}

function verificaPosizioneUtente(position, punti) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    punti.forEach(punto => {
        const [puntoLat, puntoLon] = punto.acf.coordinate_gps.split(',').map(coord => parseFloat(coord.trim()));

        // Calcola la distanza tra l'utente e il punto di interesse
        const distanza = calcolaDistanza(userLat, userLon, puntoLat, puntoLon);

        // Soglia di prossimità (in chilometri)
        const sogliaProssimita = 0.1; // 100 metri

        if (distanza < sogliaProssimita) {
            // Riproduci il file audio
            const audioPlayer = document.getElementById('audio-player');
            audioPlayer.src = punto.acf.file_audio;
            audioPlayer.style.display = 'block';
            audioPlayer.play();

            // Mostra una notifica
            alert(`Sei vicino a: ${punto.title.rendered}`);
        }
    });
}

function calcolaDistanza(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio della Terra in chilometri
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distanza in chilometri
}

// Chiamata alla funzione dopo aver caricato i punti di interesse
fetch('https://ecorizzonti.it/wp-json/wp/v2/punti-di-interesse')
    .then(response => response.json())
    .then(punti => {
        verificaPosizioneUtente(punti);
    });

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registrato'))
        .catch(error => console.error('Errore nella registrazione del Service Worker:', error));
}
