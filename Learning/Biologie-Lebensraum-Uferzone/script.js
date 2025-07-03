let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: 'nCYZgdVESpM',
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'rel': 0
        }
    });
}