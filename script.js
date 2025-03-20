// Major time zones of the world (organized from earliest to latest)
const timeZones = [
    { value: 'America/New_York', label: 'New York' },
    { value: 'America/Chicago', label: 'Chicago' },
    { value: 'America/Denver', label: 'Denver' },
    { value: 'America/Los_Angeles', label: 'Los Angeles' },
    { value: 'America/Anchorage', label: 'Anchorage' },
    { value: 'Pacific/Honolulu', label: 'Honolulu' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Europe/Berlin', label: 'Berlin' },
    { value: 'Europe/Moscow', label: 'Moscow' },
    { value: 'Asia/Dubai', label: 'Dubai' },
    { value: 'Asia/Karachi', label: 'Karachi' },
    { value: 'Asia/Kolkata', label: 'Mumbai' },
    { value: 'Asia/Dhaka', label: 'Dhaka' },
    { value: 'Asia/Bangkok', label: 'Bangkok' },
    { value: 'Asia/Singapore', label: 'Singapore' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Seoul', label: 'Seoul' },
    { value: 'Australia/Darwin', label: 'Darwin' },
    { value: 'Australia/Adelaide', label: 'Adelaide' },
    { value: 'Australia/Sydney', label: 'Sydney' },
    { value: 'Pacific/Auckland', label: 'Auckland' },
    { value: 'Pacific/Fiji', label: 'Fiji' },
    { value: 'Pacific/Tongatapu', label: 'Tongatapu' }
];

// Three.js Globe Setup
let scene, camera, renderer, globe, timezoneLines;
let isRotating = true;
let showTimezones = true;

// Mouse interaction variables
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let globeRotation = { x: 0, y: 0 };

function initGlobe() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = null;

    // Create camera with adjusted field of view and position
    const globeContainer = document.getElementById('globe');
    const aspect = globeContainer.clientWidth / globeContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.z = 6;

    // Create renderer with proper pixel ratio
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    globeContainer.appendChild(renderer.domElement);

    // Create Earth with higher resolution
    const geometry = new THREE.SphereGeometry(2, 128, 128);
    const textureLoader = new THREE.TextureLoader();
    
    // Load multiple textures for better detail
    const texture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const bumpMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
    const specularMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
    
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: bumpMap,
        bumpScale: 0.05,
        specularMap: specularMap,
        specular: new THREE.Color(0x333333),
        shininess: 15
    });
    
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add ambient light with increased intensity
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Add directional light with better positioning
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Add hemisphere light for better overall lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemisphereLight);

    // Create timezone lines with adjusted opacity
    createTimeZoneLines();

    // Add event listeners
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('toggleRotation').addEventListener('click', toggleRotation);
    document.getElementById('toggleTimezones').addEventListener('click', toggleTimezones);

    // Add mouse event listeners
    const container = document.getElementById('globe');
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onMouseWheel);
    container.addEventListener('mouseleave', onMouseUp);
}

function createTimeZoneLines() {
    timezoneLines = new THREE.Group();
    
    // Create lines for each timezone
    for (let i = 0; i < 24; i++) {
        const angle = (i * Math.PI) / 12;
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        
        // Create a line from pole to pole with more detail
        for (let lat = -90; lat <= 90; lat += 0.5) {
            const phi = (90 - lat) * (Math.PI / 180);
            const x = 2 * Math.sin(phi) * Math.cos(angle);
            const y = 2 * Math.cos(phi);
            const z = 2 * Math.sin(phi) * Math.sin(angle);
            vertices.push(x, y, z);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.LineBasicMaterial({ 
            color: 0x3498db, 
            transparent: true, 
            opacity: 0.3
        });
        const line = new THREE.Line(geometry, material);
        timezoneLines.add(line);
    }
    
    scene.add(timezoneLines);
}

function toggleRotation() {
    isRotating = !isRotating;
    document.getElementById('toggleRotation').innerHTML = 
        `<i class="fas fa-sync"></i> ${isRotating ? 'Stop Rotation' : 'Start Rotation'}`;
}

function toggleTimezones() {
    showTimezones = !showTimezones;
    timezoneLines.visible = showTimezones;
    document.getElementById('toggleTimezones').innerHTML = 
        `<i class="fas fa-globe"></i> ${showTimezones ? 'Hide Timezones' : 'Show Timezones'}`;
}

function onWindowResize() {
    const globeElement = document.getElementById('globe');
    const width = globeElement.clientWidth;
    const height = globeElement.clientHeight;
    
    // Update camera aspect ratio
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Update renderer size and pixel ratio
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}

// Mouse interaction functions
function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (!isDragging) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    // Rotate globe based on mouse movement
    globeRotation.y += deltaMove.x * 0.005;
    globeRotation.x += deltaMove.y * 0.005;

    // Limit vertical rotation to prevent flipping
    globeRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globeRotation.x));

    // Apply rotation to both globe and timezone lines
    globe.rotation.x = globeRotation.x;
    globe.rotation.y = globeRotation.y;
    timezoneLines.rotation.x = globeRotation.x;
    timezoneLines.rotation.y = globeRotation.y;

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseUp() {
    isDragging = false;
}

function onMouseWheel(event) {
    // Prevent default scrolling
    event.preventDefault();

    // Zoom in/out based on mouse wheel
    const zoomSpeed = 0.1;
    const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    
    // Update camera position
    camera.position.z = Math.max(3, Math.min(8, camera.position.z + delta));
}

function animate() {
    requestAnimationFrame(animate);

    if (isRotating && !isDragging) {
        globe.rotation.y += 0.001;
        timezoneLines.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
}

// Create and show the timezone selection modal
function createTimezoneModal() {
    const modal = document.createElement('div');
    modal.className = 'timezone-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add Timezone</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="timezone-search">
                    <input type="text" placeholder="Search timezone..." id="timezoneSearch">
                </div>
                <div class="timezone-list">
                    ${timeZones.map(tz => `
                        <div class="timezone-item" data-timezone="${tz.value}">
                            <span class="timezone-label">${tz.label}</span>
                            <span class="timezone-value">${tz.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const closeBtn = modal.querySelector('.close-btn');
    const searchInput = modal.querySelector('#timezoneSearch');
    const timezoneItems = modal.querySelectorAll('.timezone-item');

    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        timezoneItems.forEach(item => {
            const label = item.querySelector('.timezone-label').textContent.toLowerCase();
            const value = item.querySelector('.timezone-value').textContent.toLowerCase();
            if (label.includes(searchTerm) || value.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    timezoneItems.forEach(item => {
        item.addEventListener('click', () => {
            const timezone = {
                value: item.dataset.timezone,
                label: item.querySelector('.timezone-label').textContent
            };
            addTimezoneCard(timezone);
            modal.remove();
        });
    });
}

// Create a clock card element
function createClockCard(timezone) {
    const clockCard = document.createElement('div');
    clockCard.className = 'clock-card';
    clockCard.dataset.timezone = timezone.value;
    clockCard.innerHTML = `
        <div class="location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${timezone.label}</span>
            <button class="remove-timezone" title="Remove timezone">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="time"></div>
        <div class="date"></div>
    `;

    // Add remove button functionality
    const removeBtn = clockCard.querySelector('.remove-timezone');
    removeBtn.addEventListener('click', () => {
        clockCard.remove();
        // Save the current timezone cards to localStorage
        saveTimezoneCards();
    });

    return clockCard;
}

// Function to add a new timezone card
function addTimezoneCard(timezone) {
    const clocksContainer = document.querySelector('.clocks-container');
    
    // Check if timezone already exists
    const existingCard = clocksContainer.querySelector(`[data-timezone="${timezone.value}"]`);
    if (existingCard) {
        return; // Don't add if it already exists
    }

    const clockCard = createClockCard(timezone);
    clocksContainer.appendChild(clockCard);
    // Save the current timezone cards to localStorage
    saveTimezoneCards();
}

// Function to save current timezone cards to localStorage
function saveTimezoneCards() {
    const clocksContainer = document.querySelector('.clocks-container');
    const timezoneCards = Array.from(clocksContainer.querySelectorAll('.clock-card')).map(card => ({
        value: card.dataset.timezone,
        label: card.querySelector('.location span').textContent
    }));
    localStorage.setItem('timezoneCards', JSON.stringify(timezoneCards));
}

// Function to load saved timezone cards from localStorage
function loadTimezoneCards() {
    const savedCards = localStorage.getItem('timezoneCards');
    if (savedCards) {
        const timezoneCards = JSON.parse(savedCards);
        const clocksContainer = document.querySelector('.clocks-container');
        clocksContainer.innerHTML = ''; // Clear existing cards
        timezoneCards.forEach(timezone => {
            const clockCard = createClockCard(timezone);
            clocksContainer.appendChild(clockCard);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js globe
    initGlobe();
    animate();

    // Load saved timezone cards or create initial ones
    loadTimezoneCards();
    if (!localStorage.getItem('timezoneCards')) {
        // Create initial clock cards for first 3 timezones if no saved cards exist
        const clocksContainer = document.querySelector('.clocks-container');
        timeZones.slice(0, 3).forEach(timezone => {
            const clockCard = createClockCard(timezone);
            clocksContainer.appendChild(clockCard);
        });
        saveTimezoneCards();
    }

    // Add Timezone button functionality
    const addMoreBtn = document.getElementById('addMoreTimezones');
    addMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Add Timezone';
    addMoreBtn.addEventListener('click', createTimezoneModal);

    // Update all clocks every second
    setInterval(updateAllClocks, 1000);
    updateAllClocks();

    // Theme toggle functionality
    const themeToggle = document.getElementById('toggleTheme');
    const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    updateThemeIcon(isDarkTheme);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        updateThemeIcon(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
});

// Update all clocks
function updateAllClocks() {
    document.querySelectorAll('.clock-card').forEach(card => {
        const timezone = card.dataset.timezone;
        const timeElement = card.querySelector('.time');
        const dateElement = card.querySelector('.date');
        
        const now = new Date();
        const options = { 
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        
        const timeString = now.toLocaleTimeString('en-US', options);
        const dateString = now.toLocaleDateString('en-US', {
            timeZone: timezone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        timeElement.textContent = timeString;
        dateElement.textContent = dateString;
    });
}

// Helper function to update theme icon
function updateThemeIcon(isDark) {
    const themeToggle = document.getElementById('toggleTheme');
    themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i> Toggle Theme`;
} 