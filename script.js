document.addEventListener('DOMContentLoaded', () => {
    const bgContainer = document.getElementById('slideshow-bg');
    const currentPhotoEl = document.getElementById('current-photo');
    const totalPhotosEl = document.getElementById('total-photos');

    // Controls
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    // State
    let currentIndex = 0;
    let isPlaying = true;
    let autoPlayTimer;
    const slideDuration = 6000; // 6 seconds per slide

    // Audio Configuration
    const playlist = [
        'Music/PEDRO VALENÇA - Canção da Família (Vídeo Oficial) [P-5lHK-nRZo].mp3',
        'Music/Minha Família é uma Benção ｜ Frei Gilson [sHRPneSwevc].mp3',
        'Music/Utopia-｜-Cover-_MdFnhZ64DaA_.mp3'
    ];
    let currentTrackIndex = 0;
    const audioPlayer = new Audio();
    audioPlayer.src = playlist[currentTrackIndex];

    // Audio Events
    audioPlayer.addEventListener('ended', () => {
        currentTrackIndex++;
        if (currentTrackIndex >= playlist.length) {
            currentTrackIndex = 0;
        }
        audioPlayer.src = playlist[currentTrackIndex];
        if (isPlaying) {
            audioPlayer.play().catch(e => console.log("Audio play error:", e));
        }
    });

    // 1. Initialize
    if (typeof galleryImages === 'undefined' || galleryImages.length === 0) {
        bgContainer.innerHTML = '<p>Nenhuma imagem encontrada</p>';
        return;
    }

    totalPhotosEl.innerText = galleryImages.length;

    function showSlide(index) {
        // Wrap index
        if (index >= galleryImages.length) currentIndex = 0;
        else if (index < 0) currentIndex = galleryImages.length - 1;
        else currentIndex = index;

        const filename = galleryImages[currentIndex];

        // Toggle Content Visibility
        const header = document.querySelector('header');
        const quote = document.querySelector('.quote-card');

        if (currentIndex === 0) {
            if (header) header.style.opacity = '1';
            if (quote) quote.style.opacity = '1';
        } else {
            if (header) header.style.opacity = '0';
            if (quote) quote.style.opacity = '0';
        }

        // Create new slide div
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.style.backgroundImage = `url('img/${filename}')`;

        // Force load image before showing
        const imgLoader = new Image();
        imgLoader.src = `img/${filename}`;

        imgLoader.onload = () => {
            bgContainer.appendChild(slide);

            // Trigger reflow/anim
            setTimeout(() => {
                slide.classList.add('active');
            }, 50);

            // Cleanup old slides
            const oldSlides = document.querySelectorAll('.slide:not(:last-child)');
            if (oldSlides.length > 0) {
                // Wait for transition to finish (2s)
                setTimeout(() => {
                    oldSlides.forEach(s => s.remove());
                }, 2000);
            }

            // Update counter
            currentPhotoEl.innerText = currentIndex + 1;
        };
    }

    // Playback Logic
    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    function startTimer() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(nextSlide, slideDuration);
    }

    function stopTimer() {
        clearInterval(autoPlayTimer);
    }

    function playSlideshow() {
        isPlaying = true;
        startTimer();
        updatePlayBtn();
        // Try to play audio
        audioPlayer.play().catch(e => {
            console.warn("Autoplay blocked, waiting for user interaction", e);
        });
    }

    function pauseSlideshow() {
        isPlaying = false;
        stopTimer();
        updatePlayBtn();
        audioPlayer.pause();
    }

    function togglePlay() {
        if (isPlaying) pauseSlideshow();
        else playSlideshow();
    }

    function updatePlayBtn() {
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    // State
    const progressEl = document.getElementById('progress-bar');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const enterFullscreenIcon = document.getElementById('enter-fullscreen');
    const exitFullscreenIcon = document.getElementById('exit-fullscreen');

    // Audio - Progress Logic
    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressEl.style.width = `${percent}%`;
        }
    });

    // Fullscreen Logic
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.log(`Error attempting to enable fullscreen: ${e.message} (${e.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    function updateFullscreenBtn() {
        if (document.fullscreenElement) {
            enterFullscreenIcon.style.display = 'none';
            exitFullscreenIcon.style.display = 'block';
        } else {
            enterFullscreenIcon.style.display = 'block';
            exitFullscreenIcon.style.display = 'none';
        }
    }

    fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', updateFullscreenBtn);

    // Bind Events
    nextBtn.addEventListener('click', () => {
        nextSlide();
        // If playing, just reset the timer, don't stop music
        if (isPlaying) startTimer();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        if (isPlaying) startTimer();
    });

    pauseBtn.addEventListener('click', togglePlay);

    // Optional: Add a document click listener to start audio if autoplay was blocked initially
    document.addEventListener('click', function unlockAudio() {
        if (isPlaying && audioPlayer.paused) {
            audioPlayer.play().catch(e => console.log("Still blocked:", e));
        }
        // Remove listener after first interaction
        document.removeEventListener('click', unlockAudio);
    }, { once: true });

    // Idle Detection (Auto-hide UI)
    let idleTimer;
    const idleTimeoutSeconds = 10;

    function resetIdleTimer() {
        document.body.classList.remove('user-inactive');
        clearTimeout(idleTimer);

        if (document.fullscreenElement) {
            // Optional: only hide in fullscreen? Or always? User asked generally.
            // Applying always for consistent experience.
        }

        idleTimer = setTimeout(() => {
            document.body.classList.add('user-inactive');
        }, idleTimeoutSeconds * 1000);
    }

    // Monitor interactions
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('click', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);

    // Initial trigger
    resetIdleTimer();

    // Start
    showSlide(0); // Load first immediately
    playSlideshow(); // This now handles timer and audio
});
