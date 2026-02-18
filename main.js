/* ============================================
   YallaShoof - main.js (ARABIC VIEW ONLY)
   Arabic content = browse only, no play
   ============================================ */

// ============================================
// 1. EMBED SOURCES
// ============================================
const EMBED_SOURCES = [
    {
        name: 'Videasy',
        movie: (id) => `https://player.videasy.net/movie/${id}`,
        tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`
    },
    {
        name: 'VidSrc Pro',
        movie: (id) => `https://vidsrc.pro/embed/movie/${id}`,
        tv: (id, s, e) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`
    },
    {
        name: 'Embed SU',
        movie: (id) => `https://embed.su/embed/movie/${id}`,
        tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`
    },
    {
        name: 'SuperEmbed',
        movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
        tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
    },
    {
        name: 'VidSrc CC',
        movie: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
        tv: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
    },
    {
        name: 'SmashyStream',
        movie: (id) => `https://player.smashy.stream/movie/${id}`,
        tv: (id, s, e) => `https://player.smashy.stream/tv/${id}/${s}/${e}`
    },
    {
        name: 'AutoEmbed',
        movie: (id) => `https://autoembed.co/movie/tmdb/${id}`,
        tv: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`
    },
    {
        name: 'VidSrc To',
        movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
        tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
    },
    {
        name: 'NontonGo',
        movie: (id) => `https://www.NontonGo.win/embed/movie/${id}`,
        tv: (id, s, e) => `https://www.NontonGo.win/embed/tv/${id}/${s}/${e}`
    },
    {
        name: 'VidSrc ICU',
        movie: (id) => `https://vidsrc.icu/embed/movie/${id}`,
        tv: (id, s, e) => `https://vidsrc.icu/embed/tv/${id}/${s}/${e}`
    },
    {
        name: '2Embed',
        movie: (id) => `https://www.2embed.cc/embed/${id}`,
        tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
    },
    {
        name: 'VidSrc XYZ',
        movie: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
        tv: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
    }
];

CONFIG.EMBED_SOURCES = EMBED_SOURCES;

// ============================================
// 2. STATE
// ============================================
var autoSwitchState = {
    isRunning: false,
    triedIndexes: [],
    currentTimer: null,
    verifyTimer: null,
    stopped: false
};
var playerShouldBeFullscreen = false;

function resetAutoSwitch() {
    autoSwitchState.isRunning = false;
    autoSwitchState.triedIndexes = [];
    autoSwitchState.stopped = true;
    if (autoSwitchState.currentTimer) { clearTimeout(autoSwitchState.currentTimer); autoSwitchState.currentTimer = null; }
    if (autoSwitchState.verifyTimer) { clearTimeout(autoSwitchState.verifyTimer); autoSwitchState.verifyTimer = null; }
}

// ============================================
// 3. CHECK IF ARABIC
// ============================================
async function checkIfArabic(type, id) {
    try {
        var data = type === 'movie' ? await getMovieDetails(id) : await getTVDetails(id);
        if (!data) return false;
        var lang = (data.original_language || '').toLowerCase();
        if (lang === 'ar') return true;
        var ac = ['EG','SA','AE','KW','LB','SY','IQ','JO','MA','TN','DZ','BH','QA'];
        if (data.production_countries) {
            for (var i = 0; i < data.production_countries.length; i++) {
                if (ac.indexOf(data.production_countries[i].iso_3166_1) !== -1) return true;
            }
        }
        if (data.origin_country) {
            for (var i = 0; i < data.origin_country.length; i++) {
                if (ac.indexOf(data.origin_country[i]) !== -1) return true;
            }
        }
    } catch(e) {}
    return false;
}

// ============================================
// 4. SHOW ARABIC COMING SOON MESSAGE
// ============================================
function showArabicComingSoon(type, id) {
    var player = document.getElementById('videoPlayer');
    var container = document.getElementById('videoPlayerContainer');

    if (!player || !container) return;

    // Show player overlay
    player.classList.add('active');
    document.body.classList.add('no-scroll');

    removeAllIframes(container);

    // Hide loading
    var loading = document.getElementById('playerLoading');
    if (loading) loading.classList.remove('active');

    var msg = document.createElement('div');
    msg.id = 'arabicComingSoonMsg';
    msg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;'
        + 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
        + 'background:linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 50%,#16213e 100%);'
        + 'color:#fff;font-family:Inter,Arial,sans-serif;text-align:center;padding:30px;';

    msg.innerHTML = ''
        // Icon
        + '<div style="width:100px;height:100px;border-radius:50%;'
        + 'background:linear-gradient(135deg,rgba(229,9,20,0.2),rgba(229,9,20,0.05));'
        + 'display:flex;align-items:center;justify-content:center;margin-bottom:25px;'
        + 'border:2px solid rgba(229,9,20,0.3)">'
        + '<i class="fas fa-lock" style="font-size:40px;color:#e50914"></i></div>'

        // Title
        + '<h2 style="font-size:24px;margin-bottom:10px;font-weight:800;'
        + 'background:linear-gradient(90deg,#fff,#e50914);-webkit-background-clip:text;'
        + '-webkit-text-fill-color:transparent">قريباً - Coming Soon</h2>'

        // Arabic text
        + '<p style="font-size:16px;color:#ccc;margin-bottom:6px;font-weight:600">'
        + 'المحتوى العربي سيكون متاحاً قريباً</p>'

        // English text
        + '<p style="font-size:13px;color:#888;margin-bottom:8px">'
        + 'Arabic content will be available for streaming soon</p>'

        // Extra info
        + '<p style="font-size:12px;color:#666;margin-bottom:30px;max-width:400px;line-height:1.6">'
        + 'نعمل على توفير أفضل تجربة مشاهدة للمحتوى العربي.<br>'
        + 'يمكنك تصفح التفاصيل ومشاهدة الإعلانات التشويقية (Trailer) حالياً.</p>'

        // Features available
        + '<div style="display:flex;gap:15px;margin-bottom:25px;flex-wrap:wrap;justify-content:center">'
        + '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);'
        + 'border-radius:12px;padding:12px 16px;text-align:center;min-width:100px">'
        + '<i class="fas fa-info-circle" style="color:#3b82f6;font-size:20px;margin-bottom:5px;display:block"></i>'
        + '<span style="font-size:11px;color:#aaa">التفاصيل متاحة</span></div>'
        + '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);'
        + 'border-radius:12px;padding:12px 16px;text-align:center;min-width:100px">'
        + '<i class="fas fa-video" style="color:#10b981;font-size:20px;margin-bottom:5px;display:block"></i>'
        + '<span style="font-size:11px;color:#aaa">التريلر متاح</span></div>'
        + '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);'
        + 'border-radius:12px;padding:12px 16px;text-align:center;min-width:100px">'
        + '<i class="fas fa-heart" style="color:#e50914;font-size:20px;margin-bottom:5px;display:block"></i>'
        + '<span style="font-size:11px;color:#aaa">أضف للقائمة</span></div>'
        + '</div>'

        // Buttons
        + '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">'
        + '<button onclick="closePlayerAndOpenDetail(\'' + type + '\',' + id + ')" '
        + 'style="background:#e50914;color:#fff;border:none;padding:14px 28px;border-radius:25px;'
        + 'font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;'
        + 'transition:transform 0.2s" onmouseover="this.style.transform=\'scale(1.05)\'" '
        + 'onmouseout="this.style.transform=\'scale(1)\'">'
        + '<i class="fas fa-info-circle"></i> عرض التفاصيل</button>'

        + '<button onclick="closePlayer()" '
        + 'style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);'
        + 'padding:14px 28px;border-radius:25px;font-size:14px;font-weight:600;cursor:pointer;'
        + 'display:flex;align-items:center;gap:8px;transition:transform 0.2s" '
        + 'onmouseover="this.style.transform=\'scale(1.05)\'" '
        + 'onmouseout="this.style.transform=\'scale(1)\'">'
        + '<i class="fas fa-arrow-left"></i> رجوع</button>'
        + '</div>';

    container.appendChild(msg);
}

function closePlayerAndOpenDetail(type, id) {
    closePlayer();
    setTimeout(function() {
        openDetail(type, id);
    }, 300);
}

// ============================================
// 5. FULLSCREEN + LANDSCAPE
// ============================================
function enterAutoFullscreen() {
    var player = document.getElementById('videoPlayer');
    if (!player) return;
    playerShouldBeFullscreen = true;
    try {
        if (player.requestFullscreen) {
            player.requestFullscreen().then(function() {
                lockLandscape(); updateFullscreenButton(true); hideRecoveryBanner();
            }).catch(function() { lockLandscape(); showRecoveryBanner(); });
        } else if (player.webkitRequestFullscreen) {
            player.webkitRequestFullscreen(); lockLandscape(); updateFullscreenButton(true);
        } else if (player.mozRequestFullScreen) {
            player.mozRequestFullScreen(); lockLandscape(); updateFullscreenButton(true);
        } else if (player.msRequestFullscreen) {
            player.msRequestFullscreen(); lockLandscape(); updateFullscreenButton(true);
        } else { lockLandscape(); }
    } catch(e) { lockLandscape(); showRecoveryBanner(); }
}

function lockLandscape() {
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function(){}); } catch(e) {}
}
function unlockOrientation() {
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch(e) {}
}

// ============================================
// 6. RECOVERY BANNER
// ============================================
function showRecoveryBanner() {
    if (!playerShouldBeFullscreen || isFullscreen()) return;
    var player = document.getElementById('videoPlayer');
    if (!player || !player.classList.contains('active')) return;
    hideRecoveryBanner();
    var banner = document.createElement('div');
    banner.id = 'fullscreenRecoveryBanner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:linear-gradient(135deg,#e50914,#b20710);color:#fff;padding:12px 20px;text-align:center;font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 4px 15px rgba(0,0,0,0.5);';
    banner.innerHTML = '<i class="fas fa-expand" style="font-size:18px"></i><span>Tap to restore fullscreen</span>';
    banner.onclick = function(e) { e.preventDefault(); e.stopPropagation(); enterAutoFullscreen(); };
    var container = document.getElementById('videoPlayerContainer');
    if (container) container.appendChild(banner);
}
function hideRecoveryBanner() { var b = document.getElementById('fullscreenRecoveryBanner'); if (b) b.remove(); }

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        var p = document.getElementById('videoPlayer');
        if (p && p.classList.contains('active') && playerShouldBeFullscreen) {
            setTimeout(function() { if (!isFullscreen()) { lockLandscape(); showRecoveryBanner(); } }, 300);
        }
    }
});
window.addEventListener('focus', function() {
    var p = document.getElementById('videoPlayer');
    if (p && p.classList.contains('active') && playerShouldBeFullscreen) {
        setTimeout(function() { if (!isFullscreen()) { lockLandscape(); showRecoveryBanner(); } }, 500);
    }
});
document.addEventListener('fullscreenchange', function() {
    updateFullscreenButton(isFullscreen());
    var p = document.getElementById('videoPlayer');
    if (p && p.classList.contains('active')) {
        if (!isFullscreen() && playerShouldBeFullscreen) setTimeout(function() { showRecoveryBanner(); lockLandscape(); }, 200);
        else hideRecoveryBanner();
    }
});
document.addEventListener('webkitfullscreenchange', function() { updateFullscreenButton(isFullscreen()); });

// ============================================
// 7. PLAY MEDIA - BLOCKS ARABIC
// ============================================
async function playMedia(type, id, season, episode) {
    season = season || 1;
    episode = episode || 1;

    // Check if Arabic FIRST before doing anything
    var isArabic = await checkIfArabic(type, id);

    if (isArabic) {
        // Show coming soon message - DON'T play
        showArabicComingSoon(type, id);
        return;
    }

    // Normal content - proceed with playing
    closeModal();

    if (type === 'movie') markMovieWatched(id);
    else {
        markAsWatched(id, season, episode);
        setTimeout(function() { updateEpisodeWatchedUI(id, season, episode); }, 300);
    }

    state.currentPlayInfo = { type: type, id: id, season: season, episode: episode };
    resetAutoSwitch();
    autoSwitchState.stopped = false;

    var player = document.getElementById('videoPlayer');
    var container = document.getElementById('videoPlayerContainer');
    var loading = document.getElementById('playerLoading');
    var titleEl = document.getElementById('playerTitle');
    var clickZone = document.getElementById('playerClickZone');

    if (!player || !container) { showToast('Player error', 'error'); return; }
    if (clickZone) clickZone.style.display = 'none';
    removeAllIframes(container);

    if (loading) loading.classList.add('active');
    updateSourceDisplay('🔍 Searching...');
    player.classList.add('active');
    document.body.classList.add('no-scroll');
    enterAutoFullscreen();

    // Get title
    try {
        var detailData = type === 'movie' ? await getMovieDetails(id) : await getTVDetails(id);
        if (detailData) {
            titleEl.textContent = type === 'tv'
                ? (detailData.name || 'Series') + ' — S' + season + ':E' + episode
                : (detailData.title || detailData.name || 'Movie');
        }
    } catch(e) {}

    showToast('🔄 Auto-finding best server...', 'info');

    autoSwitchState.isRunning = true;
    autoSwitchState.triedIndexes = [];
    tryNextSource(type, id, season, episode, 0);

    showPlayerUI();
    autoHideUI();
}

// ============================================
// 8. TRY NEXT SOURCE
// ============================================
function tryNextSource(type, id, season, episode, startIndex) {
    if (autoSwitchState.stopped) return;
    if (!state.currentPlayInfo || state.currentPlayInfo.id !== id) return;

    var container = document.getElementById('videoPlayerContainer');
    var loading = document.getElementById('playerLoading');
    if (!container) return;

    var totalSources = EMBED_SOURCES.length;

    var sourceIndex = startIndex;
    var loopCount = 0;
    while (autoSwitchState.triedIndexes.indexOf(sourceIndex) !== -1 && loopCount < totalSources) {
        sourceIndex = (sourceIndex + 1) % totalSources;
        loopCount++;
    }

    if (loopCount >= totalSources) {
        if (loading) loading.classList.remove('active');
        autoSwitchState.isRunning = false;
        showToast('⚠️ Tried all servers. Use Switch button.', 'warning');
        forceLoadSource(type, id, season, episode, 0);
        return;
    }

    autoSwitchState.triedIndexes.push(sourceIndex);
    state.currentEmbedIndex = sourceIndex;

    var source = EMBED_SOURCES[sourceIndex];
    var tryNum = autoSwitchState.triedIndexes.length;

    var url = type === 'movie' ? source.movie(id) : source.tv(id, season, episode);

    updateSourceDisplay(source.name + ' (' + tryNum + '/' + totalSources + ')');
    if (loading) loading.classList.add('active');

    if (tryNum <= 3 || tryNum % 3 === 0) {
        showToast('🔄 ' + source.name + ' (' + tryNum + '/' + totalSources + ')', 'info');
    }

    removeAllIframes(container);

    var iframe = document.createElement('iframe');
    iframe.id = 'mainPlayerIframe';
    iframe.src = url;
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('webkitallowfullscreen', '');
    iframe.setAttribute('mozallowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture; gyroscope; accelerometer');
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;z-index:2;background:#000;';

    var hasDecided = false;

    function decideResult(isGood, reason) {
        if (hasDecided || autoSwitchState.stopped) return;
        hasDecided = true;
        if (autoSwitchState.currentTimer) { clearTimeout(autoSwitchState.currentTimer); autoSwitchState.currentTimer = null; }
        if (autoSwitchState.verifyTimer) { clearTimeout(autoSwitchState.verifyTimer); autoSwitchState.verifyTimer = null; }

        if (isGood) {
            autoSwitchState.isRunning = false;
            if (loading) loading.classList.remove('active');
            updateSourceDisplay('✅ ' + source.name);
            showToast('✅ ' + source.name, 'success');
            if (!isFullscreen() && playerShouldBeFullscreen) setTimeout(enterAutoFullscreen, 500);
        } else {
            var nextIndex = (sourceIndex + 1) % totalSources;
            setTimeout(function() { tryNextSource(type, id, season, episode, nextIndex); }, 300);
        }
    }

    iframe.onload = function() {
        if (hasDecided || autoSwitchState.stopped) return;

        autoSwitchState.verifyTimer = setTimeout(function() {
            if (hasDecided || autoSwitchState.stopped) return;

            var currentFrame = document.getElementById('mainPlayerIframe');
            if (!currentFrame) { decideResult(false, 'removed'); return; }

            try {
                var doc = currentFrame.contentDocument || currentFrame.contentWindow.document;
                var bodyHTML = doc.body ? doc.body.innerHTML : '';
                var bodyText = doc.body ? doc.body.innerText : '';
                var lower = bodyText.toLowerCase();

                var errorWords = ['not found', 'unavailable', 'this media', 'no sources',
                    'we are unable', 'error', '404', 'blocked', 'removed', 'dmca',
                    'not available', 'access denied', '403', 'something went wrong',
                    'doesn\'t exist', 'no video', 'no embed'];

                for (var w = 0; w < errorWords.length; w++) {
                    if (lower.includes(errorWords[w])) {
                        decideResult(false, errorWords[w]);
                        return;
                    }
                }

                if (bodyText.trim().length > 0 && bodyText.trim().length < 30 &&
                    !bodyHTML.includes('iframe') && !bodyHTML.includes('video') && !bodyHTML.includes('player')) {
                    decideResult(false, 'Too short');
                    return;
                }

                if (bodyHTML.includes('<video') || bodyHTML.includes('<iframe') ||
                    bodyHTML.includes('player') || bodyHTML.includes('jwplayer') ||
                    bodyHTML.includes('plyr') || bodyHTML.includes('hls')) {
                    decideResult(true, 'Has player');
                    return;
                }

                if (bodyText.trim().length > 50 || bodyHTML.length > 500) {
                    decideResult(true, 'Content OK');
                    return;
                }
            } catch(e) {
                decideResult(true, 'CORS');
                return;
            }
            decideResult(true, 'Default');
        }, 2500);
    };

    iframe.onerror = function() { decideResult(false, 'error'); };

    autoSwitchState.currentTimer = setTimeout(function() {
        if (!hasDecided && !autoSwitchState.stopped) {
            var f = document.getElementById('mainPlayerIframe');
            if (!f) decideResult(false, 'timeout');
            else {
                try {
                    var d = f.contentDocument;
                    if (d && d.body && d.body.innerHTML.length < 10) decideResult(false, 'timeout empty');
                    else decideResult(true, 'timeout content');
                } catch(e) { decideResult(true, 'timeout CORS'); }
            }
        }
    }, 7000);

    container.appendChild(iframe);
}

// ============================================
// 9. FORCE LOAD SOURCE
// ============================================
function forceLoadSource(type, id, season, episode, sourceIndex) {
    var container = document.getElementById('videoPlayerContainer');
    var loading = document.getElementById('playerLoading');
    if (!container) return;
    removeAllIframes(container);
    autoSwitchState.isRunning = false;
    var source = EMBED_SOURCES[sourceIndex] || EMBED_SOURCES[0];
    state.currentEmbedIndex = sourceIndex;
    var url = type === 'movie' ? source.movie(id) : source.tv(id, season, episode);
    updateSourceDisplay(source.name);
    var iframe = document.createElement('iframe');
    iframe.id = 'mainPlayerIframe';
    iframe.src = url;
    iframe.frameBorder = '0'; iframe.scrolling = 'no';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('webkitallowfullscreen', '');
    iframe.setAttribute('mozallowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture; gyroscope; accelerometer');
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;z-index:2;background:#000;';
    iframe.onload = function() { if (loading) loading.classList.remove('active'); };
    if (loading) loading.classList.add('active');
    container.appendChild(iframe);
    setTimeout(function() { if (loading) loading.classList.remove('active'); }, 8000);
}

// ============================================
// 10. MANUAL CONTROLS
// ============================================
function loadEmbedSource(type, id, season, episode, sourceIndex) {
    resetAutoSwitch(); autoSwitchState.stopped = true;
    forceLoadSource(type, id, season, episode, sourceIndex);
    showToast('▶ ' + (EMBED_SOURCES[sourceIndex] || EMBED_SOURCES[0]).name, 'info');
}

function updateSourceDisplay(name) {
    var el = document.getElementById('currentSourceName');
    if (el) el.textContent = name || 'Source';
}

function switchSource() {
    if (!state.currentPlayInfo) { showToast('Nothing playing', 'warning'); return; }
    resetAutoSwitch(); autoSwitchState.stopped = true;
    var info = state.currentPlayInfo;
    state.currentEmbedIndex = (state.currentEmbedIndex + 1) % EMBED_SOURCES.length;
    var source = EMBED_SOURCES[state.currentEmbedIndex];
    showToast('🔄 ' + source.name + ' (' + (state.currentEmbedIndex + 1) + '/' + EMBED_SOURCES.length + ')', 'info');
    forceLoadSource(info.type, info.id, info.season, info.episode, state.currentEmbedIndex);
}

function smartSwitch() {
    if (!state.currentPlayInfo) { showToast('Nothing playing', 'warning'); return; }
    resetAutoSwitch(); autoSwitchState.stopped = false;
    var info = state.currentPlayInfo;
    showToast('🔍 Re-scanning...', 'info');
    autoSwitchState.isRunning = true; autoSwitchState.triedIndexes = [];
    tryNextSource(info.type, info.id, info.season, info.episode, (state.currentEmbedIndex + 1) % EMBED_SOURCES.length);
}

// ============================================
// 11. REMOVE IFRAMES
// ============================================
function removeAllIframes(container) {
    if (!container) return;
    var frames = container.querySelectorAll('iframe');
    for (var i = 0; i < frames.length; i++) {
        try { frames[i].src = 'about:blank'; } catch(e) {}
        try { frames[i].remove(); } catch(e) { frames[i].parentNode.removeChild(frames[i]); }
    }
    var msg = container.querySelector('#arabicComingSoonMsg'); if (msg) msg.remove();
}

// ============================================
// 12. CLOSE PLAYER
// ============================================
function closePlayer() {
    resetAutoSwitch();
    playerShouldBeFullscreen = false;
    hideRecoveryBanner();
    var player = document.getElementById('videoPlayer');
    var container = document.getElementById('videoPlayerContainer');
    var clickZone = document.getElementById('playerClickZone');
    if (container) removeAllIframes(container);
    if (clickZone) clickZone.style.display = '';
    if (player) player.classList.remove('active');
    document.body.classList.remove('no-scroll');

    if (state.currentPlayInfo && state.currentPlayInfo.type === 'tv') {
        var si = { id: state.currentPlayInfo.id, season: state.currentPlayInfo.season };
        setTimeout(function() {
            var m = document.getElementById('detailModal');
            if (m && m.classList.contains('active')) {
                var sel = document.getElementById('seasonSelect');
                if (sel) loadSeasonEpisodes(si.id, parseInt(sel.value));
            }
        }, 300);
    }
    state.currentPlayInfo = null; state.currentEmbedIndex = 0;
    exitFullscreenSafe(); unlockOrientation();
}

// ============================================
// 13. EPISODE UI
// ============================================
function updateEpisodeWatchedUI(tvId, season, episode) {
    var items = document.querySelectorAll('.episode-item');
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
        if (parseInt(items[i].dataset.episode) === episode) {
            items[i].classList.add('watched');
            var n = items[i].querySelector('.episode-num-badge');
            if (n) n.innerHTML = '<i class="fas fa-check-circle episode-watched-icon"></i>';
            var m = items[i].querySelector('.episode-meta-row');
            if (m && !m.querySelector('.episode-watched-badge')) {
                var b = document.createElement('span'); b.className = 'episode-watched-badge';
                b.innerHTML = '<i class="fas fa-eye"></i> Watched'; m.appendChild(b);
            }
            break;
        }
    }
}

// ============================================
// 14. FETCH TITLE
// ============================================
async function fetchPlayerTitle(type, id, season, episode) {
    var el = document.getElementById('playerTitle'); if (!el) return;
    try {
        var d = type === 'movie' ? await getMovieDetails(id) : await getTVDetails(id);
        if (d) el.textContent = type === 'movie' ? (d.title || d.name || 'Movie') : (d.name || 'Series') + ' — S' + season + ':E' + episode;
    } catch(e) { el.textContent = type === 'movie' ? 'Movie' : 'S' + season + ':E' + episode; }
}

// ============================================
// 15. PLAYER UI
// ============================================
function setupPlayerEvents() {
    var c = document.getElementById('videoPlayerContainer'); if (!c) return;
    c.addEventListener('mousemove', function() { showPlayerUI(); autoHideUI(); });
    c.addEventListener('touchstart', function() { showPlayerUI(); autoHideUI(); }, { passive: true });
    var z = document.getElementById('playerClickZone');
    if (z) z.addEventListener('dblclick', function() { toggleFullscreen(); });
}
function showPlayerUI() { var c = document.getElementById('videoPlayerContainer'); if (c) c.classList.add('show-controls'); }
function hidePlayerUI() { var c = document.getElementById('videoPlayerContainer'); if (c) c.classList.remove('show-controls'); }
function autoHideUI() { if (state.controlsTimer) clearTimeout(state.controlsTimer); state.controlsTimer = setTimeout(hidePlayerUI, CONFIG.CONTROLS_TIMEOUT); }

// ============================================
// 16. FULLSCREEN
// ============================================
function toggleFullscreen() {
    if (!isFullscreen()) { playerShouldBeFullscreen = true; enterAutoFullscreen(); }
    else { playerShouldBeFullscreen = false; exitFullscreenSafe(); unlockOrientation(); hideRecoveryBanner(); }
}
function isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement); }
function exitFullscreenSafe() {
    try {
        if (document.fullscreenElement) document.exitFullscreen().catch(function(){});
        else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
        else if (document.mozFullScreenElement) document.mozCancelFullScreen();
        else if (document.msFullscreenElement) document.msExitFullscreen();
    } catch(e) {}
    updateFullscreenButton(false);
}
function updateFullscreenButton(f) {
    var b = document.getElementById('playerFullscreenBtn'); if (!b) return;
    b.innerHTML = f ? '<i class="fas fa-compress"></i><span>Exit</span>' : '<i class="fas fa-expand"></i><span>Fullscreen</span>';
}

// ============================================
// 17. KEYBOARD
// ============================================
document.addEventListener('keydown', function(e) {
    var p = document.getElementById('videoPlayer');
    if (!p || !p.classList.contains('active')) return;
    var k = e.key ? e.key.toLowerCase() : '';
    if (k === 'f') { e.preventDefault(); toggleFullscreen(); }
    if (k === 'escape') { e.preventDefault(); closePlayer(); }
    if (k === 's') { e.preventDefault(); switchSource(); }
    if (k === 'a') { e.preventDefault(); smartSwitch(); }
});

// ============================================
// 18. TRAILER
// ============================================
async function playTrailer(type, id) {
    try {
        var d = type === 'movie' ? await getMovieDetails(id) : await getTVDetails(id);
        if (!d) { showToast('Cannot load trailer', 'error'); return; }
        var v = (d.videos && d.videos.results) || [];
        if (!v.length) { showToast('No trailer', 'warning'); return; }
        var t = null;
        for (var i = 0; i < v.length; i++) { if (v[i].type === 'Trailer' && v[i].site === 'YouTube' && v[i].official) { t = v[i]; break; } }
        if (!t) for (var i = 0; i < v.length; i++) { if (v[i].type === 'Trailer' && v[i].site === 'YouTube') { t = v[i]; break; } }
        if (!t) for (var i = 0; i < v.length; i++) { if (v[i].site === 'YouTube') { t = v[i]; break; } }
        if (!t) { showToast('No trailer found', 'warning'); return; }
        var modal = document.getElementById('trailerModal');
        var cont = document.getElementById('trailerContainer');
        if (!modal || !cont) return;
        cont.innerHTML = '<iframe src="https://www.youtube.com/embed/' + t.key + '?autoplay=1&rel=0" allow="autoplay; fullscreen; encrypted-media" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"></iframe>';
        modal.classList.add('active');
    } catch(e) { showToast('Trailer failed', 'error'); }
}
function closeTrailer() {
    var m = document.getElementById('trailerModal');
    var c = document.getElementById('trailerContainer');
    if (c) c.innerHTML = ''; if (m) m.classList.remove('active');
}