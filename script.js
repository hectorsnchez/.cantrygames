class GamesPortal {
    constructor() {
        this.games = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentEditGameId = null;
        this.siteConfig = {};
        this.apiBase = '/api';
        
        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.applySiteConfig();
        this.setupEventListeners();
        this.renderGames();
        this.renderCategories();
    }

    async loadInitialData() {
        try {
            const [gamesResponse, categoriesResponse, configResponse] = await Promise.all([
                fetch(`${this.apiBase}/games`),
                fetch(`${this.apiBase}/categories`),
                fetch(`${this.apiBase}/config`)
            ]);

            this.games = await gamesResponse.json();
            this.categories = await categoriesResponse.json();
            this.siteConfig = await configResponse.json();
        } catch (error) {
            console.error('Error loading initial data:', error);
            // Fallback to default values
            this.games = [];
            this.categories = [];
            this.siteConfig = {
                logoUrl: 'attached_assets/image-removebg-preview_1752337327762.png',
                primaryColor: '#8B5CF6',
                secondaryColor: '#667eea',
                textColor: '#333333',
                siteTitle: 'Cantry - Portal de Juegos'
            };
        }
    }

    setupEventListeners() {
        // Search bar expandable functionality
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('searchInput');
        const searchExpanded = document.getElementById('searchExpanded');

        if (searchBar && searchInput && searchExpanded) {
            // Show expanded search when clicking on search bar
            searchBar.addEventListener('click', () => {
                searchExpanded.classList.add('show');
            });

            // Hide expanded search when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-section')) {
                    searchExpanded.classList.remove('show');
                }
            });

            // Search functionality
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderGames();
            });
        }

        // Category selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-item')) {
                document.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('active');
                });
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderGames();
                
                // Hide expanded search after category selection
                const searchExpanded = document.getElementById('searchExpanded');
                if (searchExpanded) {
                    searchExpanded.classList.remove('show');
                }
            }
        });

        // Worker access
        document.getElementById('workerAccess').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPinModal();
            
            // Hide expanded search when opening PIN modal
            const searchExpanded = document.getElementById('searchExpanded');
            if (searchExpanded) {
                searchExpanded.classList.remove('show');
            }
        });

        // PIN modal
        document.getElementById('closePinModal').addEventListener('click', () => {
            this.hidePinModal();
        });

        document.getElementById('submitPin').addEventListener('click', () => {
            this.verifyPin();
        });

        document.getElementById('pinInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifyPin();
            }
        });

        // Admin modal
        document.getElementById('closeAdminModal').addEventListener('click', () => {
            this.hideAdminModal();
        });

        // Admin tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Add game
        document.getElementById('addGameBtn').addEventListener('click', () => {
            this.addGame();
        });

        // Add category
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.addCategory();
        });

        // Game modal
        document.getElementById('closeGameModal').addEventListener('click', () => {
            this.hideGameModal();
        });

        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.requestFullscreen();
        });

        // Edit game modal
        document.getElementById('closeEditGameModal').addEventListener('click', () => {
            this.hideEditGameModal();
        });

        document.getElementById('updateGameBtn').addEventListener('click', () => {
            this.updateGame();
        });

        // Website config
        document.getElementById('saveWebsiteConfig').addEventListener('click', () => {
            this.saveWebsiteConfig();
        });

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    applySiteConfig() {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', this.siteConfig.primaryColor);
        root.style.setProperty('--secondary-color', this.siteConfig.secondaryColor);
        root.style.setProperty('--text-color', this.siteConfig.textColor);
        
        document.title = this.siteConfig.siteTitle;
        
        if (this.siteConfig.logoUrl) {
            const logoImage = document.querySelector('.logo-image');
            if (logoImage) {
                logoImage.src = this.siteConfig.logoUrl;
            }
        }
    }

    renderGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        
        let filteredGames = this.games;
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            const categoryObj = this.categories.find(cat => cat.slug === this.currentCategory);
            if (categoryObj) {
                filteredGames = filteredGames.filter(game => 
                    game.categoryId === categoryObj.id
                );
            }
        }
        
        // Filter by search query
        if (this.searchQuery) {
            filteredGames = filteredGames.filter(game => {
                const nameMatch = game.name.toLowerCase().includes(this.searchQuery);
                const keysMatch = game.keys && game.keys.some(key => 
                    key.toLowerCase().includes(this.searchQuery)
                );
                return nameMatch || keysMatch;
            });
        }
        
        if (filteredGames.length === 0) {
            gamesGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No se encontraron juegos</h3>
                    <p>Intenta con una búsqueda diferente o selecciona otra categoría.</p>
                </div>
            `;
            return;
        }
        
        gamesGrid.innerHTML = filteredGames.map(game => `
            <div class="game-card ${game.size || 'medium'}" data-game-id="${game.id}">
                <img src="${game.cover}" alt="${game.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA4N0gxMTNWMTEzSDg3Vjg3WiIgZmlsbD0iIzlCA0E3RiIvPgo8L3N2Zz4K'">
                ${game.videoPreview ? `
                    <video class="game-video" muted loop>
                        <source src="${game.videoPreview}" type="video/mp4">
                    </video>
                ` : ''}
                <div class="game-overlay">
                    <div class="game-name">${game.name}</div>
                    <div class="game-category">${this.getCategoryName(game.categoryId)}</div>
                </div>
            </div>
        `).join('');

        // Handle video play/pause on hover
        document.querySelectorAll('.game-card').forEach(card => {
            const video = card.querySelector('.game-video');
            if (video) {
                card.addEventListener('mouseenter', () => {
                    video.play().catch(e => console.log('Video autoplay blocked'));
                });
                card.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0;
                });
            }
        });
        
        // Add click listeners to game cards
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameId = parseInt(card.dataset.gameId);
                this.playGame(gameId);
            });
        });
    }

    renderCategories() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        const gameCategory = document.getElementById('gameCategory');
        
        const categoriesHTML = `
            <div class="category-item active" data-category="all">Todos</div>
            ${this.categories.map(cat => `
                <div class="category-item" data-category="${cat.slug}">${cat.name}</div>
            `).join('')}
        `;
        
        categoriesContainer.innerHTML = categoriesHTML;
        
        // Update game category select
        if (gameCategory) {
            gameCategory.innerHTML = `
                <option value="">Seleccionar categoría</option>
                ${this.categories.map(cat => `
                    <option value="${cat.id}">${cat.name}</option>
                `).join('')}
            `;
        }
    }

    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Sin categoría';
    }

    showPinModal() {
        document.getElementById('pinModal').classList.add('active');
        document.getElementById('pinInput').focus();
    }

    hidePinModal() {
        document.getElementById('pinModal').classList.remove('active');
        document.getElementById('pinInput').value = '';
        document.getElementById('pinError').textContent = '';
    }

    verifyPin() {
        const pin = document.getElementById('pinInput').value;
        const errorElement = document.getElementById('pinError');
        
        if (pin === '2729') {
            this.hidePinModal();
            this.showAdminModal();
        } else {
            errorElement.textContent = 'PIN incorrecto. Inténtalo de nuevo.';
            document.getElementById('pinInput').value = '';
        }
    }

    showAdminModal() {
        document.getElementById('adminModal').classList.add('active');
        this.renderAdminContent();
    }

    hideAdminModal() {
        document.getElementById('adminModal').classList.remove('active');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        this.renderAdminContent();
    }

    renderAdminContent() {
        this.renderExistingGames();
        this.renderExistingCategories();
        this.loadWebsiteConfigForm();
    }

    loadWebsiteConfigForm() {
        document.getElementById('logoUrl').value = this.siteConfig.logoUrl;
        document.getElementById('primaryColor').value = this.siteConfig.primaryColor;
        document.getElementById('secondaryColor').value = this.siteConfig.secondaryColor;
        document.getElementById('textColor').value = this.siteConfig.textColor;
        document.getElementById('siteTitle').value = this.siteConfig.siteTitle;
    }

    renderExistingGames() {
        const existingGames = document.getElementById('existingGames');
        
        existingGames.innerHTML = this.games.map(game => `
            <div class="game-item">
                <div>
                    <strong>${game.name}</strong><br>
                    <small>${this.getCategoryName(game.categoryId)} - ${game.size || 'mediano'}</small>
                </div>
                <div class="game-actions">
                    <button class="edit-btn" onclick="gamesPortal.editGame(${game.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-btn" onclick="gamesPortal.deleteGame(${game.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderExistingCategories() {
        const existingCategories = document.getElementById('existingCategories');
        
        existingCategories.innerHTML = this.categories.map(category => `
            <div class="category-item-admin">
                <strong>${category.name}</strong>
                <button class="delete-btn" onclick="gamesPortal.deleteCategory(${category.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `).join('');
    }

    async addGame() {
        const name = document.getElementById('gameName').value.trim();
        const cover = document.getElementById('gameCover').value.trim();
        const url = document.getElementById('gameUrl').value.trim();
        const videoPreview = document.getElementById('gameVideoPreview').value.trim();
        const keys = document.getElementById('gameKeys').value.trim();
        const categoryId = document.getElementById('gameCategory').value;
        const size = document.getElementById('gameSize').value;
        
        if (!name || !cover || !url || !categoryId) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/games`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    cover,
                    url,
                    videoPreview: videoPreview || null,
                    keys: keys ? keys.split(',').map(k => k.trim()) : [],
                    categoryId: parseInt(categoryId),
                    size
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add game');
            }
            
            const newGame = await response.json();
            this.games.push(newGame);
            this.renderGames();
            this.renderExistingGames();
            
            // Clear form
            document.getElementById('gameName').value = '';
            document.getElementById('gameCover').value = '';
            document.getElementById('gameUrl').value = '';
            document.getElementById('gameVideoPreview').value = '';
            document.getElementById('gameKeys').value = '';
            document.getElementById('gameCategory').value = '';
            document.getElementById('gameSize').value = 'medium';
            
            alert('Juego agregado exitosamente.');
        } catch (error) {
            console.error('Error adding game:', error);
            alert('Error al agregar el juego. Inténtalo de nuevo.');
        }
    }

    async deleteGame(gameId) {
        if (confirm('¿Estás seguro de que quieres eliminar este juego?')) {
            try {
                const response = await fetch(`${this.apiBase}/games/${gameId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete game');
                }
                
                this.games = this.games.filter(game => game.id !== gameId);
                this.renderGames();
                this.renderExistingGames();
            } catch (error) {
                console.error('Error deleting game:', error);
                alert('Error al eliminar el juego. Inténtalo de nuevo.');
            }
        }
    }

    async addCategory() {
        const name = document.getElementById('categoryName').value.trim();
        
        if (!name) {
            alert('Por favor, ingresa un nombre para la categoría.');
            return;
        }
        
        const slug = name.toLowerCase().replace(/\s+/g, '_');
        
        // Check if category already exists
        if (this.categories.find(cat => cat.slug === slug)) {
            alert('Esta categoría ya existe.');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, slug })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add category');
            }
            
            const newCategory = await response.json();
            this.categories.push(newCategory);
            this.renderCategories();
            this.renderExistingCategories();
            
            // Clear form
            document.getElementById('categoryName').value = '';
            
            alert('Categoría agregada exitosamente.');
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Error al agregar la categoría. Inténtalo de nuevo.');
        }
    }

    async deleteCategory(categoryId) {
        // Don't allow deletion if games exist in this category
        const gamesInCategory = this.games.filter(game => game.categoryId === categoryId);
        if (gamesInCategory.length > 0) {
            alert('No se puede eliminar esta categoría porque contiene juegos.');
            return;
        }
        
        if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
            try {
                const response = await fetch(`${this.apiBase}/categories/${categoryId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete category');
                }
                
                this.categories = this.categories.filter(cat => cat.id !== categoryId);
                this.renderCategories();
                this.renderExistingCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Error al eliminar la categoría. Inténtalo de nuevo.');
            }
        }
    }

    playGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;
        
        document.getElementById('gameTitle').textContent = game.name;
        document.getElementById('gameFrame').src = game.url;
        document.getElementById('gameModal').classList.add('active');
    }

    requestFullscreen() {
        const gameFrame = document.getElementById('gameFrame');
        
        if (gameFrame.requestFullscreen) {
            gameFrame.requestFullscreen();
        } else if (gameFrame.webkitRequestFullscreen) {
            gameFrame.webkitRequestFullscreen();
        } else if (gameFrame.msRequestFullscreen) {
            gameFrame.msRequestFullscreen();
        }
    }

    hideGameModal() {
        document.getElementById('gameModal').classList.remove('active');
        document.getElementById('gameFrame').src = '';
    }

    editGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;
        
        this.currentEditGameId = gameId;
        
        // Populate form with game data
        document.getElementById('editGameName').value = game.name;
        document.getElementById('editGameCover').value = game.cover;
        document.getElementById('editGameUrl').value = game.url;
        document.getElementById('editGameVideoPreview').value = game.videoPreview || '';
        document.getElementById('editGameKeys').value = game.keys ? game.keys.join(', ') : '';
        document.getElementById('editGameCategory').value = game.categoryId;
        document.getElementById('editGameSize').value = game.size || 'medium';
        
        // Update category options
        const editCategorySelect = document.getElementById('editGameCategory');
        editCategorySelect.innerHTML = `
            <option value="">Seleccionar categoría</option>
            ${this.categories.map(cat => `
                <option value="${cat.id}" ${cat.id === game.categoryId ? 'selected' : ''}>${cat.name}</option>
            `).join('')}
        `;
        
        document.getElementById('editGameModal').classList.add('active');
    }

    hideEditGameModal() {
        document.getElementById('editGameModal').classList.remove('active');
        this.currentEditGameId = null;
    }

    async updateGame() {
        if (!this.currentEditGameId) return;
        
        const name = document.getElementById('editGameName').value.trim();
        const cover = document.getElementById('editGameCover').value.trim();
        const url = document.getElementById('editGameUrl').value.trim();
        const videoPreview = document.getElementById('editGameVideoPreview').value.trim();
        const keys = document.getElementById('editGameKeys').value.trim();
        const categoryId = document.getElementById('editGameCategory').value;
        const size = document.getElementById('editGameSize').value;
        
        if (!name || !cover || !url || !categoryId) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/games/${this.currentEditGameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    cover,
                    url,
                    videoPreview: videoPreview || null,
                    keys: keys ? keys.split(',').map(k => k.trim()) : [],
                    categoryId: parseInt(categoryId),
                    size
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update game');
            }
            
            const updatedGame = await response.json();
            const gameIndex = this.games.findIndex(g => g.id === this.currentEditGameId);
            if (gameIndex !== -1) {
                this.games[gameIndex] = updatedGame;
            }
            
            this.renderGames();
            this.renderExistingGames();
            this.hideEditGameModal();
            
            alert('Juego actualizado exitosamente.');
        } catch (error) {
            console.error('Error updating game:', error);
            alert('Error al actualizar el juego. Inténtalo de nuevo.');
        }
    }

    async saveWebsiteConfig() {
        const logoUrl = document.getElementById('logoUrl').value.trim();
        const primaryColor = document.getElementById('primaryColor').value;
        const secondaryColor = document.getElementById('secondaryColor').value;
        const textColor = document.getElementById('textColor').value;
        const siteTitle = document.getElementById('siteTitle').value.trim();
        
        try {
            const response = await fetch(`${this.apiBase}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    logoUrl: logoUrl || this.siteConfig.logoUrl,
                    primaryColor: primaryColor || this.siteConfig.primaryColor,
                    secondaryColor: secondaryColor || this.siteConfig.secondaryColor,
                    textColor: textColor || this.siteConfig.textColor,
                    siteTitle: siteTitle || this.siteConfig.siteTitle
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save config');
            }
            
            this.siteConfig = await response.json();
            this.applySiteConfig();
            
            alert('Configuración guardada exitosamente.');
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Error al guardar la configuración. Inténtalo de nuevo.');
        }
    }


}

// Initialize the portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gamesPortal = new GamesPortal();
});
