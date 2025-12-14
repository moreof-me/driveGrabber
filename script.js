class ImageGenerator {
    constructor() {
        this.currentFolder = 'Lilia';
        this.captions = [];
        this.imageManifest = {};
        
        this.init();
    }
    
    async init() {
        await this.loadManifest();
        await this.loadCaptions();
        this.setupEventListeners();
        this.updateFolderButtons();
    }
    
    async loadManifest() {
        try {
            const response = await fetch('images-manifest.json');
            if (!response.ok) throw new Error('Failed to load manifest');
            
            this.imageManifest = await response.json();
            console.log('Loaded manifest:', this.imageManifest);
        } catch (error) {
            console.error('Error loading manifest:', error);
            this.imageManifest = { Lilia: [], Leylah: [] };
        }
    }
    
    async loadCaptions() {
        try {
            const response = await fetch('captions.txt');
            if (!response.ok) throw new Error('Failed to load captions');
            
            const text = await response.text();
            this.captions = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            console.log(`Loaded ${this.captions.length} captions`);
        } catch (error) {
            console.error('Error loading captions:', error);
            this.captions = ['A beautiful moment captured.', 'Memories to cherish forever.'];
        }
    }
    
    setupEventListeners() {
        // Folder selection buttons
        document.querySelectorAll('.folder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folder = e.target.dataset.folder;
                this.selectFolder(folder);
            });
        });
        
        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateRandomImage();
        });
    }
    
    selectFolder(folder) {
        this.currentFolder = folder === 'random' 
            ? this.getRandomFolder()
            : folder;
        
        this.updateFolderButtons();
    }
    
    getRandomFolder() {
        const folders = Object.keys(this.imageManifest).filter(f => this.imageManifest[f].length > 0);
        return folders[Math.floor(Math.random() * folders.length)] || 'Lilia';
    }
    
    updateFolderButtons() {
        document.querySelectorAll('.folder-btn').forEach(btn => {
            const folder = btn.dataset.folder;
            if (folder === 'random') {
                btn.classList.toggle('active', this.currentFolder === 'random');
            } else {
                btn.classList.toggle('active', folder === this.currentFolder);
            }
        });
    }
    
    generateRandomImage() {
        try {
            const folder = this.currentFolder;
            const images = this.imageManifest[folder] || [];
            
            if (images.length === 0) {
                throw new Error(`No images found in ${folder} folder. Please check the manifest file.`);
            }
            
            // Select random image
            const randomImage = images[Math.floor(Math.random() * images.length)];
            const imageUrl = `${folder}/${randomImage}`;
            
            // Select random caption
            const randomCaption = this.captions.length > 0
                ? this.captions[Math.floor(Math.random() * this.captions.length)]
                : 'A beautiful moment captured.';
            
            // Update UI
            this.displayImage(imageUrl);
            this.displayCaption(randomCaption, folder);
            
        } catch (error) {
            console.error('Error generating image:', error);
            this.displayError(error.message);
        }
    }
    
    displayImage(imageUrl) {
        const imgElement = document.getElementById('random-image');
        const placeholder = document.getElementById('image-placeholder');
        
        imgElement.onload = () => {
            placeholder.classList.add('hidden');
            imgElement.classList.remove('hidden');
        };
        
        imgElement.onerror = () => {
            this.displayError(`Failed to load image: ${imageUrl}. Please check the file exists.`);
        };
        
        // Add cache busting to prevent browser caching
        imgElement.src = `${imageUrl}?t=${Date.now()}`;
    }
    
    displayCaption(caption, folder) {
        document.getElementById('caption-text').textContent = caption;
        document.getElementById('image-source').textContent = `Source: ${folder} folder`;
    }
    
    displayError(message) {
        document.getElementById('caption-text').textContent = `Error: ${message}`;
        document.getElementById('image-source').textContent = 'Source: Error occurred';
        
        const imgElement = document.getElementById('random-image');
        const placeholder = document.getElementById('image-placeholder');
        
        imgElement.classList.add('hidden');
        placeholder.classList.remove('hidden');
        placeholder.innerHTML = `<i class="fas fa-exclamation-triangle"></i><p>${message}</p>`;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});
