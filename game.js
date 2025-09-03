
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Игровые настройки
        this.gridSize = 20;
        this.tileCount = 15;
        this.snake = [{x: 7, y: 7}];
        this.food = {x: 10, y: 10};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStarted = false; // Новый флаг для отслеживания начала игры
        
        // Сенсорное управление
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.init();
    }
    
    init() {
        this.updateHighScore();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Кнопки управления
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restart());
        
        // Сенсорное управление
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Клавиатура для тестирования на компьютере
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        
        // Определяем направление свайпа
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Горизонтальный свайп
            if (deltaX > 0 && this.dx === 0) {
                this.dx = 1; this.dy = 0; // Вправо
                this.gameStarted = true; // Игра началась
            } else if (deltaX < 0 && this.dx === 0) {
                this.dx = -1; this.dy = 0; // Влево
                this.gameStarted = true; // Игра началась
            }
        } else {
            // Вертикальный свайп
            if (deltaY > 0 && this.dy === 0) {
                this.dx = 0; this.dy = 1; // Вниз
                this.gameStarted = true; // Игра началась
            } else if (deltaY < 0 && this.dy === 0) {
                this.dx = 0; this.dy = -1; // Вверх
                this.gameStarted = true; // Игра началась
            }
        }
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
                if (this.dy === 0) { 
                    this.dx = 0; this.dy = -1; 
                    this.gameStarted = true; // Игра началась
                }
                break;
            case 'ArrowDown':
                if (this.dy === 0) { 
                    this.dx = 0; this.dy = 1; 
                    this.gameStarted = true; // Игра началась
                }
                break;
            case 'ArrowLeft':
                if (this.dx === 0) { 
                    this.dx = -1; this.dy = 0; 
                    this.gameStarted = true; // Игра началась
                }
                break;
            case 'ArrowRight':
                if (this.dx === 0) { 
                    this.dx = 1; this.dy = 0; 
                    this.gameStarted = true; // Игра началась
                }
                break;
            case ' ':
                this.togglePause();
                break;
        }
    }
    
    togglePause() {
        if (this.gameStarted) { // Пауза только если игра началась
            this.gamePaused = !this.gamePaused;
            this.pauseBtn.textContent = this.gamePaused ? '▶️ Играть' : '⏸️ Пауза';
        }
    }
    
    restart() {
        this.snake = [{x: 7, y: 7}];
        this.food = {x: 10, y: 10};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStarted = false; // Сброс флага начала игры
        this.pauseBtn.textContent = '⏸️ Пауза';
        this.updateScore();
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused || !this.gameStarted) return; // Игра не обновляется, пока не началась
        
        // Движение змейки
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Проверка границ
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Проверка столкновения с собой
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Проверка еды
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    generateFood() {
        do {
            this.food.x = Math.floor(Math.random() * this.tileCount);
            this.food.y = Math.floor(Math.random() * this.tileCount);
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }
    
    draw() {
        // Очистка canvas
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисование змейки
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            if (i === 0) {
                // Голова змейки
                this.ctx.fillStyle = '#2E7D32';
            } else {
                this.ctx.fillStyle = '#4CAF50';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        }
        
        // Рисование еды
        this.ctx.fillStyle = '#FF5722';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize/2,
            this.food.y * this.gridSize + this.gridSize/2,
            this.gridSize/2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Сетка (опционально)
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Показываем инструкцию, если игра еще не началась
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Нажми стрелку или свайпни', this.canvas.width/2, this.canvas.height/2 - 20);
            this.ctx.fillText('для начала игры!', this.canvas.width/2, this.canvas.height/2 + 10);
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        alert(`Игра окончена! Ваш счет: ${this.score}`);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
            alert('Новый рекорд! 🎉');
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateHighScore() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        // Скорость игры зависит от длины змейки
        const speed = Math.max(100, 300 - this.snake.length * 5);
        setTimeout(() => this.gameLoop(), speed);
    }
}

// Запуск игры когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
