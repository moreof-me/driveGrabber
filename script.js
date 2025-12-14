class ImageGenerator {
    constructor() {
        this.currentFolder = 'Lilia';
        this.captions = [];
        this.availableFolders = ['Lilia', 'Leylah'];
        
        this.init();
    }
    
    async init() {
        this.loadCaptions();
        this.setupEventListeners();
        this.updateFolderButtons();
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
            ? this.availableFolders[Math.floor(Math.random() * this.availableFolders.length)]
            : folder;
        
        this.updateFolderButtons();
    }
    
    updateFolderButtons() {
        document.querySelectorAll('.folder-btn').forEach(btn => {
            const folder = btn.dataset.folder;
            if (folder === 'random') {
                btn.classList.toggle('active', this.currentFolder === 'random');
            } else {
                btn.classList.toggle('active', 
                    folder === this.currentFolder || 
                    (this.currentFolder === 'random' && folder === this.availableFolders[0]));
            }
        });
    }
    
    async getImageList(folder) {
        try {
            // This is a workaround for GitHub Pages since we can't list files directly
            // You'll need to create a simple JSON file or use a different approach
            // For now, we'll try to load images with common extensions
            return await this.tryToFindImages(folder);
        } catch (error) {
            console.error(`Error loading images from ${folder}:`, error);
            return [];
        }
    }
    
    async tryToFindImages(folder) {
        // Common image extensions
        const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const images = [];
        
        // Try to load common image patterns
        for (let i = 1; i <= 20; i++) {
            for (const ext of extensions) {
                const imageName = `image${i}${ext}`;
                const imageUrl = `${folder}/${imageName}`;
                
                // Check if image exists
                if (await this.imageExists(imageUrl)) {
                    images.push(imageName);
                }
            }
        }
        
        return images;
    }
    
    async imageExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
    
    async generateRandomImage() {
        try {
            const folder = this.currentFolder;
            const images = await this.getImageList(folder);
            
            if (images.length === 0) {
                throw new Error(`No images found in ${folder} folder`);
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
            this.displayError('Failed to load image. Please check the image path.');
        };
        
        imgElement.src = imageUrl;
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