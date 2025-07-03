let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: 'xa2WWQLA_7c',
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'rel': 0
        }
    });
}