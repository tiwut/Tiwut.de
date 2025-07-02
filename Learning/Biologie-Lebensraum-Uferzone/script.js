const video = document.getElementById('video');
const videoContainer = document.getElementById('video-container');
const playPauseBtn = document.getElementById('play-pause-btn');
const bigPlayBtn = document.getElementById('play-button-big');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const currentTimeElem = document.getElementById('current-time');
const totalTimeElem = document.getElementById('total-time');
const progressBar = document.getElementById('progress-bar');
const fullscreenBtn = document.getElementById('fullscreen-btn');

function togglePlay() {
    video.paused ? video.play() : video.pause();
}

function updatePlayPauseIcon() {
    if (video.paused) {
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
    video.volume = volumeSlider.value;
    video.muted = volumeSlider.value === '0';
}

function updateVolumeIcon() {
    if (video.muted || video.volume === 0) {
        videoContainer.classList.add('muted');
        volumeSlider.value = 0;
        muteBtn.setAttribute('aria-label', 'Ton an');
    } else {
        videoContainer.classList.remove('muted');
        volumeSlider.value = video.volume;
        muteBtn.setAttribute('aria-label', 'Stumm schalten');
    }
}

function toggleMute() {
    video.muted = !video.muted;
    updateVolumeIcon();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTime() {
    currentTimeElem.textContent = formatTime(video.currentTime);
    const progressPercent = (video.currentTime / video.duration) * 100;
    progressBar.value = progressPercent;
    progressBar.style.background = `linear-gradient(to right, #e50914 ${progressPercent}%, rgba(255, 255, 255, 0.4) ${progressPercent}%)`;
}

function setVideoTime() {
    const newTime = (progressBar.value / 100) * video.duration;
    video.currentTime = newTime;
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

playPauseBtn.addEventListener('click', togglePlay);
bigPlayBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);
video.addEventListener('play', updatePlayPauseIcon);
video.addEventListener('pause', updatePlayPauseIcon);
video.addEventListener('loadedmetadata', () => {
    totalTimeElem.textContent = formatTime(video.duration);
    progressBar.max = 100;
});
video.addEventListener('timeupdate', updateTime);
video.addEventListener('volumechange', updateVolumeIcon);
muteBtn.addEventListener('click', toggleMute);
volumeSlider.addEventListener('input', handleVolumeChange);
progressBar.addEventListener('input', setVideoTime);
fullscreenBtn.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenIcon);