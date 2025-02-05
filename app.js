document.addEventListener('DOMContentLoaded', () => {
    const puntiInteresseContainer = document.getElementById('punti-interesse');
    const audioPlayer = document.getElementById('audio-player');
    const notificaBox = document.getElementById('notifica-box');
    const notificaMessaggio = document.getElementById('notifica-messaggio');
    const riproduciAudioBtn = document.getElementById('riproduci-audio');

    // Registrazione del Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker registrato'))
            .catch(error => console.error('Errore nella registrazione del Service Worker:', error));
    }

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

    // Gestione del pulsante di riproduzione
    riproduciAudioBtn.addEventListener('click', () => {
        audioPlayer.play();
        notificaBox.style.display = 'none'; // Nascondi la box dopo aver avviato la riproduzione
    });
});

function avviaGeolocalizzazione(punti) {
    if (navigator.geolocation) {
        const gestisciPosizione = (position) => {
            console.log('Posizione aggiornata:', position.coords);
            verificaPosizioneUtente(position, punti);
        };

        const gestisciErrore = (error) => {
            console.error('Errore nella geolocalizzazione:', error.message);
            // Nascondi la box in caso di errore
            const notificaBox = document.getElementById('notifica-box');
            notificaBox.style.display = 'none';
        };

        // Avvia il monitoraggio della posizione
        navigator.geolocation.watchPosition(gestisciPosizione, gestisciErrore, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 10000 // Timeout di 10 secondi
        });
    } else {
        console.error('Geolocalizzazione non supportata dal browser.');
    }
}
function verificaPosizioneUtente(position, punti) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const notificaBox = document.getElementById('notifica-box');
    const notificaMessaggio = document.getElementById('notifica-messaggio');
    const audioPlayer = document.getElementById('audio-player');

    let puntoVicinoTrovato = false; // Flag per indicare se è stato trovato un punto vicino

    for (const punto of punti) {
        const [puntoLat, puntoLon] = punto.acf.coordinate_gps.split(',').map(coord => parseFloat(coord.trim()));

        // Calcola la distanza tra l'utente e il punto di interesse
        const distanza = calcolaDistanza(userLat, userLon, puntoLat, puntoLon);

        // Soglia di prossimità (in chilometri)
        const sogliaProssimita = 0.1; // 100 metri

        if (distanza < sogliaProssimita) {
            // Mostra la box con il messaggio
            notificaMessaggio.textContent = `Sei vicino a: ${punto.title.rendered}`;
            notificaBox.style.display = 'block';

            // Imposta il file audio da riprodurre
            audioPlayer.src = punto.acf.file_audio;

            puntoVicinoTrovato = true; // Imposta il flag a true
            break; // Esci dal ciclo
        }
    }

    // Nascondi la box se nessun punto di interesse è vicino
    if (!puntoVicinoTrovato) {
        notificaBox.style.display = 'none';
    }
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
