document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("cambiocolor");
    let isWhite = true;

    button.addEventListener("click", () => {
        document.body.style.backgroundColor = isWhite ? "gray" : "white";
        document.querySelector("h1").style.color = isWhite ? "white" : "green";
        document.getElementById("game-info").style.backgroundColor = isWhite ? "gray" : "white";
        document.body.style.color = isWhite ? "white" : "black";
        isWhite = !isWhite;
    });
    
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const background = new Image();
    background.src = "images/fondo3.jpg";

    // Constantes de física
    const GRAVITY = 0.5;
    const JUMP_FORCE = -12;
    const MOVE_SPEED = 5;
    const FRAME_DELAY = 8; // Velocidad de animación (menos = más rápido)

    const debugCollision = true; 

    // Objetos estáticos
    const staticObjects = [
        {
            x: 0,  
            y: 470,  
            width: 1000,  
            height: 160,
            color: "green" 
        },
        {
            x: 490,  
            y: 400,  
            width: 80,  
            height: 70,
            color: "black" 
        },
        {
            x: 163,  
            y: 400,  
            width: 127,  
            height: 10,
            color: "yellow"
        },
        {
            x: 430,
            y: 0,
            width: 5,
            height: 200,
            color: "gray"
        },
        {
            x: 705,
            y: 0,
            width: 5,
            height: 200,
            color: "gray"
        }
    ];

    class Player {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 50;
            this.height = 50;
            this.velocityX = 0;
            this.velocityY = 0;
            this.isJumping = false;
            this.grounded = false;
            this.facing = 'right';
            this.isMoving = false;
            
            // Sistema de animación
            this.animations = {
                right: {
                    frames: [],
                    currentFrame: 0,
                    frameCount: 0
                },
                left: {
                    frames: [],
                    currentFrame: 0,
                    frameCount: 0
                },
                jump: {
                    right: new Image(),
                    left: new Image()
                },
                idle: {
                    right: new Image(),
                    left: new Image()
                }
            };
            
            // Cargar frames de animación (3 frames por dirección)
            for (let i = 1; i <= 3; i++) {
                const frameRight = new Image();
                frameRight.src = `images/player-camina${i}.png`;
                this.animations.right.frames.push(frameRight);
                
                const frameLeft = new Image();
                frameLeft.src = `images/player-camina${i}l.png`;
                this.animations.left.frames.push(frameLeft);
            }
            
            // Cargar imágenes de salto e idle
            this.animations.jump.right.src = "images/Oveja.png";
            this.animations.jump.left.src = "images/Vaca.png";
            this.animations.idle.right.src = "images/player-camina3.png";
            this.animations.idle.left.src = "images/player-camina3l.png";
            
            // Imagen actual por defecto
            this.currentImage = this.animations.idle.right;
        }

        updateAnimation() {
            if (this.isJumping) {
                // Animación de salto
                this.currentImage = this.animations.jump[this.facing];
                return;
            }
            
            if (this.velocityX !== 0) {
                // Animación de caminata
                const anim = this.animations[this.facing];
                anim.frameCount++;
                
                if (anim.frameCount >= FRAME_DELAY) {
                    anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
                    anim.frameCount = 0;
                    this.currentImage = anim.frames[anim.currentFrame];
                }
            } else {
                // Animación idle (reposo)
                this.currentImage = this.animations.idle[this.facing];
            }
        }

        draw() {
            this.updateAnimation();
            
            if (this.currentImage.complete) {
                ctx.drawImage(this.currentImage, this.x, this.y, this.width, this.height);
            } else {
                // Dibujo temporal mientras cargan las imágenes
                ctx.fillStyle = "blue";
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            
            // Debug: mostrar hitbox
            if (debugCollision) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }

        checkCollision(newX, newY) {
            for (let obj of staticObjects) {
                if (newX < obj.x + obj.width &&
                    newX + this.width > obj.x &&
                    newY < obj.y + obj.height &&
                    newY + this.height > obj.y) {
                    return true;
                }
            }
            return false;
        }

        checkGrounded() {
            const checkY = this.y + this.height + 1;
            const checkX1 = this.x;
            const checkX2 = this.x + this.width;
            
            for (let obj of staticObjects) {
                if (checkY >= obj.y && checkY <= obj.y + obj.height) {
                    if ((checkX1 >= obj.x && checkX1 <= obj.x + obj.width) ||
                        (checkX2 >= obj.x && checkX2 <= obj.x + obj.width)) {
                        return true;
                    }
                }
            }
            return false;
        }

        update() {
            // Aplicar gravedad
            this.velocityY += GRAVITY;
            
            // Verificar si está en el suelo
            this.grounded = this.checkGrounded();
            
            if (this.grounded && !this.isJumping && this.velocityY > 0) {
                this.velocityY = 0;
                // Ajustar posición para que no se hunda en el suelo
                for (let obj of staticObjects) {
                    if (this.y + this.height > obj.y && this.y + this.height < obj.y + obj.height) {
                        this.y = obj.y - this.height;
                        break;
                    }
                }
            }
            
            // Calcular nueva posición
            let newX = this.x + this.velocityX;
            let newY = this.y + this.velocityY;
            
            // Limitar movimiento horizontal
            newX = Math.max(0, Math.min(newX, canvas.width - this.width));
            
            // Verificar colisiones
            if (!this.checkCollision(newX, this.y)) {
                this.x = newX;
            }
            
            if (!this.checkCollision(this.x, newY)) {
                this.y = newY;
            } else {
                if (this.velocityY > 0) {
                    this.grounded = true;
                    this.isJumping = false;
                }
                this.velocityY = 0;
            }
        }
        
        jump() {
            if (this.grounded) {
                this.velocityY = JUMP_FORCE;
                this.isJumping = true;
                this.grounded = false;
            }
        }
    }

    function drawStaticObjects() {
        staticObjects.forEach(obj => {
            if (obj.color) {
                ctx.fillStyle = obj.color;
                ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                
                ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
                ctx.lineWidth = 1;
                ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            }
        });
    }

    const player = new Player(20, 450);

    // Control del jugador
    function handleKeyEvents(e) {
        const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (arrowKeys.includes(e.key)) {
            e.preventDefault();
            
            if (e.type === 'keydown') {
                switch(e.key) {
                    case 'ArrowRight': 
                        player.velocityX = MOVE_SPEED;
                        player.facing = 'right';
                        break;
                    case 'ArrowLeft': 
                        player.velocityX = -MOVE_SPEED;
                        player.facing = 'left';
                        break;
                    case 'ArrowUp': 
                        player.jump(); 
                        break;
                    case 'ArrowDown': 
                        // Opcional: agacharse
                        break;
                }
            } else { // keyup
                if (['ArrowRight', 'ArrowLeft'].includes(e.key)) {
                    player.velocityX = 0;
                }
            }
        }
    }

    window.addEventListener('keydown', handleKeyEvents);
    window.addEventListener('keyup', handleKeyEvents);

    // Enfocar el canvas para que funcione el teclado
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
    canvas.addEventListener('click', () => canvas.focus());

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        drawStaticObjects();
        
        player.update();
        player.draw();
        
        requestAnimationFrame(gameLoop);
    }
    
    // Precargar imágenes antes de iniciar el juego
    function preloadImages() {
        const images = [
            background,
            ...player.animations.right.frames,
            ...player.animations.left.frames,
            player.animations.jump.right,
            player.animations.jump.left,
            player.animations.idle.right,
            player.animations.idle.left
        ];
        
        let loaded = 0;
        const total = images.length;
        
        images.forEach(img => {
            if (img.complete) {
                loaded++;
            } else {
                img.onload = () => {
                    loaded++;
                    if (loaded === total) {
                        gameLoop();
                    }
                };
            }
        });
        
        if (loaded === total) {
            gameLoop();
        }
    }
    
    preloadImages();
});