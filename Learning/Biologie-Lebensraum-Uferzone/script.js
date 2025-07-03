let player;

const videoContainer = document.getElementById('video-container');
const playPauseBtn = document.getElementById('play-pause-btn');
const bigPlayBtn = document.getElementById('play-button-big');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const currentTimeElem = document.getElementById('current-time');
const totalTimeElem = document.getElementById('total-time');
const progressBar = document.getElementById('progress-bar');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const settingsBtn = document.getElementById('settings-btn');
const qualityMenu = document.getElementById('quality-menu');

const qualityLabels = {
    'hd2160': '2160p', 'hd1440': '1440p', 'hd1080': '1080p', 'hd720': '720p',
    'large': '480p', 'medium': '360p', 'small': '240p', 'tiny': '144p', 'auto': 'Auto'
};

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: 'xa2WWQLA_7c',
        playerVars: {
            'playsinline': 1, 'controls': 0, 'rel': 0, 'showinfo': 0, 'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onPlaybackQualityChange': onPlaybackQualityChange
        }
    });
}

function onPlayerReady(event) {
    setupEventListeners();
    totalTimeElem.textContent = formatTime(player.getDuration());
    progressBar.max = 100;
    updateVolumeIcon();
    populateQualityMenu();
    setInterval(updateTime, 250);
}

function onPlayerStateChange(event) {
    updatePlayPauseIcon();
}

function onPlaybackQualityChange(event) {
    updateActiveQuality();
}

function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlay);
    bigPlayBtn.addEventListener('click', togglePlay);
    muteBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', handleVolumeChange);
    progressBar.addEventListener('input', setVideoTime);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        qualityMenu.classList.toggle('active');
    });
    document.addEventListener('click', () => {
        qualityMenu.classList.remove('active');
    });
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
}

function togglePlay() {
    const playerState = player.getPlayerState();
    if (playerState === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function updatePlayPauseIcon() {
    const playerState = player.getPlayerState();
    if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.ENDED || playerState === YT.PlayerState.UNSTARTED) {
        videoContainer.classList.remove('playing');
        videoContainer.classList.add('paused');
        playPauseBtn.setAttribute('aria-label', 'Abspielen');
    } else {
        videoContainer.classList.add('playing');
        videoContainer.classList.remove('paused');
        playPauseBtn.setAttribute('aria-label', 'Pause');
    }
}

function handleVolumeChange() {
    player.setVolume(volumeSlider.value * 100);
    if (volumeSlider.value > 0 && player.isMuted()) {
        player.unMute();
    }
    updateVolumeIcon();
}

function updateVolumeIcon() {
    if (!player || typeof player.isMuted !== 'function') return;
    if (player.isMuted() || player.getVolume() === 0) {
        videoContainer.classList.add('muted');
        volumeSlider.value = 0;
        muteBtn.setAttribute('aria-label', 'Ton an');
    } else {
        videoContainer.classList.remove('muted');
        volumeSlider.value = player.getVolume() / 100;
        muteBtn.setAttribute('aria-label', 'Stumm schalten');
    }
}

function toggleMute() {
    if (player.isMuted()) {
        player.unMute();
    } else {
        player.mute();
    }
    setTimeout(updateVolumeIcon, 50);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTime() {
    if (player && typeof player.getCurrentTime === 'function') {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        currentTimeElem.textContent = formatTime(currentTime);
        const progressPercent = (duration > 0) ? (currentTime / duration) * 100 : 0;
        progressBar.value = progressPercent;
        progressBar.style.background = `linear-gradient(to right, #e50914 ${progressPercent}%, rgba(255, 255, 255, 0.4) ${progressPercent}%)`;
    }
}

function setVideoTime() {
    const newTime = (progressBar.value / 100) * player.getDuration();
    player.seekTo(newTime, true);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
            alert(`Fehler beim Aktivieren des Vollbildmodus: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
}

function updateFullscreenIcon() {
    if (document.fullscreenElement) {
        videoContainer.classList.add('fullscreen');
        fullscreenBtn.setAttribute('aria-label', 'Vollbild beenden');
    } else {
        videoContainer.classList.remove('fullscreen');
        fullscreenBtn.setAttribute('aria-label', 'Vollbild');
    }
}

function populateQualityMenu() {
    const availableQualities = player.getAvailableQualityLevels();
    qualityMenu.innerHTML = '';
    
    // Füge 'Auto' als Option hinzu
    const qualities = ['auto', ...availableQualities];

    qualities.forEach(quality => {
        const button = document.createElement('button');
        button.classList.add('quality-option');
        button.dataset.quality = quality;
        button.textContent = qualityLabels[quality] || quality;
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            player.setPlaybackQuality(quality);
            qualityMenu.classList.remove('active');
        });
        qualityMenu.appendChild(button);
    });
    updateActiveQuality();
}

function updateActiveQuality() {
    const currentQuality = player.getPlaybackQuality();
    document.querySelectorAll('.quality-option').forEach(button => {
        if (button.dataset.quality === currentQuality) {
            button.classList.add('active-quality');
        } else {
            button.classList.remove('active-quality');
        }
    });
}