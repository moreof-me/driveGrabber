class ImageGenerator {
    constructor() {
        this.currentFolder = 'Lilia';
        this.captions = [];
        this.imageManifest = {};
        
        this.init();
    }
    
    async init() {
        console.log('Starting app initialization...');
        
        try {
            // Load the manifest file
            await this.loadManifest();
            
            // Load captions
            await this.loadCaptions();
            
            // Setup UI
            this.setupEventListeners();
            this.updateFolderButtons();
            
            console.log('✅ App initialized successfully!');
            console.log(`📁 Lilia: ${this.imageManifest.Lilia.length} images`);
            console.log(`📁 Leylah: ${this.imageManifest.Leylah.length} images`);
            console.log(`📝 Captions: ${this.captions.length}`);
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.displayError('Failed to initialize. Check console.');
        }
    }
    
    async loadManifest() {
        console.log('📄 Loading images-manifest.json...');
        
        try {
            const response = await fetch('images-manifest.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.imageManifest = data;
            
            console.log('✅ Manifest loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading manifest:', error);
            throw error;
        }
    }
    
    async loadCaptions() {
        console.log('📝 Loading captions.txt...');
        
        try {
            const response = await fetch('captions.txt');
            
            if (response.ok) {
                const text = await response.text();
                this.captions = text.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
            } else {
                // Fallback captions if file not found
                this.captions = [
                    'A beautiful moment captured.',
                    'Memories that will last forever.',
                    'Pure happiness in a frame.',
                    'A snapshot of joy.',
                    'Time stands still here.'
                ];
            }
            
            console.log(`✅ Loaded ${this.captions.length} captions`);
            
        } catch (error) {
            console.warn('⚠️ Using fallback captions:', error);
            this.captions = ['A beautiful moment captured.'];
        }
    }
    
    setupEventListeners() {
        // Folder buttons
        document.querySelectorAll('.folder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folder = e.currentTarget.dataset.folder;
                this.selectFolder(folder);
            });
        });
        
        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateRandomImage();
        });
        
        // Generate first image on load
        setTimeout(() => this.generateRandomImage(), 1000);
    }
    
    selectFolder(folder) {
        if (folder === 'random') {
            const folders = ['Lilia', 'Leylah'];
            this.currentFolder = folders[Math.floor(Math.random() * folders.length)];
        } else {
            this.currentFolder = folder;
        }
        
        this.updateFolderButtons();
        console.log(`📁 Selected: ${this.currentFolder}`);
    }
    
    updateFolderButtons() {
        document.querySelectorAll('.folder-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.folder === this.currentFolder) {
                btn.classList.add('active');
            }
        });
    }
    
    generateRandomImage() {
        console.log(`🎲 Generating random image from ${this.currentFolder}...`);
        
        const images = this.imageManifest[this.currentFolder];
        
        if (!images || images.length === 0) {
            this.displayError(`No images in ${this.currentFolder} folder`);
            return;
        }
        
        // Pick random image
        const randomIndex = Math.floor(Math.random() * images.length);
        const imageFile = images[randomIndex];
        const imagePath = `${this.currentFolder}/${imageFile}`;
        
        // Pick random caption
        const captionIndex = Math.floor(Math.random() * this.captions.length);
        const caption = this.captions[captionIndex];
        
        console.log(`🖼️ Loading: ${imagePath}`);
        
        // Display everything
        this.displayImage(imagePath);
        this.displayCaption(caption);
    }
    
    displayImage(imagePath) {
        const imgElement = document.getElementById('random-image');
        const placeholder = document.getElementById('image-placeholder');
        
        // Show loading
        placeholder.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Loading image...</p>';
        placeholder.classList.remove('hidden');
        imgElement.classList.add('hidden');
        
        // Create test image first
        const testImg = new Image();
        
        testImg.onload = () => {
            // Image exists, display it
            imgElement.src = imagePath;
            imgElement.alt = `Image from ${this.currentFolder}`;
            
            imgElement.onload = () => {
                placeholder.classList.add('hidden');
                imgElement.classList.remove('hidden');
                console.log('✅ Image loaded:', imagePath);
            };
            
            imgElement.onerror = () => {
                this.displayError(`Failed to display: ${imagePath}`);
            };
        };
        
        testImg.onerror = () => {
            this.displayError(`Image not found: ${imagePath}`);
        };
        
        testImg.src = imagePath;
    }
    
    displayCaption(caption) {
        document.getElementById('caption-text').textContent = caption;
        document.getElementById('image-source').textContent = `Source: ${this.currentFolder} folder`;
    }
    
    displayError(message) {
        console.error('❌', message);
        
        const placeholder = document.getElementById('image-placeholder');
        placeholder.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i>
            <p style="color: #dc3545;">${message}</p>
            <small>Check browser console for details</small>
        `;
        placeholder.classList.remove('hidden');
        
        document.getElementById('random-image').classList.add('hidden');
        document.getElementById('caption-text').textContent = 'Error loading content';
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    window.imageApp = new ImageGenerator();
});
