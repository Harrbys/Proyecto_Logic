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
    background.src = "images/fondo_nubes.jpg";

    const background1 = new Image();
    background1.src = "images/fondo_tierra.png";

    const LEVEL_GOAL = 2800; // Meta final en coordenada X
    const LEVEL_START = 20;   // Punto de inicio del jugador
    
    // Variables para el temporizador y progreso
    let startTime = Date.now();
    let isGameCompleted = false;
    
    // Elementos del DOM
    const levelInfoElement = document.getElementById("level-info");
    const progressElement = document.getElementById("progress");
    const timerElement = document.getElementById("timer");

    // Constantes de física
    const GRAVITY = 0.5;
    const JUMP_FORCE = -15;
    const MOVE_SPEED = 5;
    const FRAME_DELAY = 8;
    const ATTACK_COOLDOWN = 300;
    const ATTACK_DURATION = 100;
    const CAMERA_SPEED = 2;

    const debugCollision = true;
    
    const staticImages = {};

    // Variables de la cámara
    let cameraX = 0;
    const worldWidth = 3000;

    // Obstáculos
    const staticObjects = [
        { // suelo
            x: 0,  
            y: 475,  
            width: 3000,  
            height: 160,
        },
        { // obstculo de roca  1
            x: 490,  
            y: 405,  
            width: 80,  
            height: 70,
            imageSrc: "images/rock.png"
        },
        { // obstculo en roca doble
            x: 690,  
            y: 325,  
            width: 80,  
            height: 150,
            imageSrc: "images/obstaculo-2.png"
        },
        { // obstculo en roca doble
            x: 740,  
            y: 405,  
            width: 80,  
            height: 70,
            imageSrc: "images/rock.png"
        },
        { // obstculo en roca doble
            x: 690,  
            y: 20,  
            width: 80,  
            height: 150,
            imageSrc: "images/obstaculo-2.png"
        },
        { // obstculo en roca doble
            x: 690,  
            y: 0,  
            width: 80,  
            height: 70,
            imageSrc: "images/rock.png"
        },
        { // obstculo en roca doble parte de arriba
            x: 890,  
            y: 20,  
            width: 80,  
            height: 150,
            imageSrc: "images/obstaculo-2.png"
        },
        { // obstculo en roca doble parte de aarriba
            x: 890,  
            y: 0,  
            width: 80,  
            height: 70,
            imageSrc: "images/rock.png"
        },
        { // obstculo en roca doble
            x: 950,  
            y: 325,  
            width: 80,  
            height: 150,
            imageSrc: "images/obstaculo-2.png"
        },
        { // obstculo en roca doble
            x: 1000,  
            y: 405,  
            width: 80,  
            height: 70,
            imageSrc: "images/rock.png"
        },
        { // plataforma
            x: 163,  
            y: 410,  
            width: 127,  
            height: 10, 
            imageSrc: "images/rock.png"
        },
        // PLATAFORMA BAJA Y CAMINO
        {
            x: 1200,
            y: 420,
            width: 127,
            height: 10,
            imageSrc: "images/rock.png"
        },
        {
            x: 1350,
            y: 420,
            width: 127,
            height: 10,
            imageSrc: "images/rock.png"
        },

        // SALTO A PLATAFORMA MÁS ALTA
        {
            x: 1500,
            y: 370,
            width: 127,
            height: 10,
            imageSrc: "images/rock.png"
        },

        // MURO DOBLE CON BASE
        {
            x: 1650,
            y: 320,
            width: 80,
            height: 150,
            imageSrc: "images/obstaculo-2.png"
        },

        // ESCALÓN A PLATAFORMA SUPERIOR
        {
            x: 1800,
            y: 400,
            width: 127,
            height: 10,
            imageSrc: "images/rock.png"
        },

        // ZONA DE DESCANSO
        {
            x: 1950,
            y: 400,
            width: 200,
            height: 15,
            imageSrc: "images/rock.png"
        },

        // MURO VERTICAL CON ROCA ABAJO
        {
            x: 2200,
            y: 340,
            width: 80,
            height: 130,
            imageSrc: "images/obstaculo-2.png"
        },

        // SALTO FINAL A PLATAFORMA Y ESCALÓN
        {
            x: 2350,
            y: 420,
            width: 127,
            height: 10,
            imageSrc: "images/rock.png"
        },
        {
            x: 2500,
            y: 420,
            width: 80,
            height: 50,
            imageSrc: "images/rock.png"
        }

        
    ];

    // busca cada objeto dentro del array para dibujar su imagen
    staticObjects.forEach(obj => {
        if (obj.imageSrc) {
            const img = new Image();
            img.src = obj.imageSrc;
            staticImages[obj.imageSrc] = img;
        }
    });

    // Clase para enemigos
    class Enemy {
        constructor(x, y, width, height, health) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.health = 10;
            this.maxHealth = health;
            this.color = "red";
            this.isAlive = true;
            this.damageTexts = [];
            this.facing = 'left';
            this.currentImage = new Image();
            this.currentImage.src = "images/player-camina3l.png";
            this.isMoving = false;
            this.speed = 2;
        }

        // este pedazo se encraga de mover a los enemigos donde se mueva el player
        update(player) {
            if(this.isAlive) {
                this.moveToPlayer(player);
            }
        }

    // de la mano con el de arriba 
        moveToPlayer(playerX, playerY){
            if (!this.isAlive) return;

            if (this.x < playerX) {
                this.x += this.speed;
                this.facing = 'right';
            } else if (this.x > playerX) {
                this.x -= this.speed;
                this.facing = 'left';
            }

            if (this.y < playerY) {
                this.y += this.speed;
            }else if (this.y > playerY) {
                this.y -= this.speed;
            }

            this.updateImage();
        }

        // actualizar la imagen dependiendo donde persiga la player
        updateImage() {
            if (this.facing === 'right') {
                this.currentImage.src = "images/player-camina3.png";
            } else {
                this.currentImage.src = "images/player-camina3l.png"; 
            }
        }

        // dibujar la imagen del enemigo 
        draw() {
            if (!this.isAlive) return;

            const screenX = this.x - cameraX;
            const screenY = this.y;

            if (this.currentImage.complete) {
                ctx.drawImage(this.currentImage, screenX, screenY, this.width, this.height);
            } else {
                ctx.fillStyle = "red";
                ctx.fillRect(screenX, screenY, this.width, this.height);
            }
            
            const healthBarWidth = this.width;
            const healthBarHeight = 5;
            const healthPercentage = this.health / this.maxHealth;

            // dibuajr la la vida y de loq que quita
            ctx.fillStyle = "red";
            ctx.fillRect(screenX, screenY - 10, healthBarWidth, healthBarHeight);
            ctx.fillStyle = "green";
            ctx.fillRect(screenX, screenY - 10, healthBarWidth * healthPercentage, healthBarHeight);

            
            for (let i = this.damageTexts.length - 1; i >= 0; i--) {
                const text = this.damageTexts[i];
                ctx.fillStyle = `rgba(255, 0, 0, ${text.alpha})`;
                ctx.font = "16px Arial";
                ctx.fillText(`-${text.amount}`, text.x - cameraX, text.y);
                
                text.y -= 1;
                text.alpha -= 0.02;
                
                if (text.alpha <= 0) {
                    this.damageTexts.splice(i, 1);
                }
            }

            if (debugCollision) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect(screenX, screenY, this.width, this.height);
            }
        }

        takeDamage(amount) {
            if (!this.isAlive) return;

            this.health -= amount;
            
            this.damageTexts.push({
                amount: amount,
                x: this.x + this.width / 2,
                y: this.y - 20,
                alpha: 1
            });

            if (this.health <= 0) {
                this.isAlive = false;
            }
        }
    }

    // Clase Attack modificada para ambos lados
    class Attack {
        constructor(player) {
            this.player = player;
            this.isActive = false;
            this.startTime = 0;
            this.rightImage = new Image();
            this.rightImage.src = "images/attack1.png";
            this.leftImage = new Image();
            this.leftImage.src = "images/attack1l.png";
            this.width = 60;
            this.height = 40;
            this.damage = 1;
        }

        activate() {
            this.isActive = true;
            this.startTime = Date.now();
        }

        update() {
            if (!this.isActive) return;

            if (Date.now() - this.startTime > ATTACK_DURATION) {
                this.isActive = false;
            }
        }

        draw() {
            if (!this.isActive) return;

            const attackX = this.player.facing === 'right' 
                ? this.player.x + this.player.width 
                : this.player.x - this.width;

            const screenX = attackX - cameraX;
            const screenY = this.player.y + this.player.height / 4;

            const currentImage = this.player.facing === 'right' ? this.rightImage : this.leftImage;

            if (currentImage.complete) {
                ctx.drawImage(
                    currentImage, 
                    screenX, 
                    screenY, 
                    this.width, 
                    this.height
                );
            }

            if (debugCollision) {
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    screenX, 
                    screenY, 
                    this.width, 
                    this.height
                );
            }
        }

        getHitbox() {
            if (!this.isActive) return null;

            return {
                x: this.player.facing === 'right' 
                    ? this.player.x + this.player.width 
                    : this.player.x - this.width,
                y: this.player.y + this.player.height / 4,
                width: this.width,
                height: this.height
            };
        }
    }

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
            this.lastAttackTime = 0;
            this.attack = new Attack(this);
            
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
                },
                attack: {
                    right: new Image(),
                    left: new Image()
                }
            };

            for (let i = 1; i <= 3; i++) {
                const frameRight = new Image();
                frameRight.src = `images/player-camina${i}.png`;
                this.animations.right.frames.push(frameRight);
                
                const frameLeft = new Image();
                frameLeft.src = `images/player-camina${i}l.png`;
                this.animations.left.frames.push(frameLeft);
            }
            
            this.animations.jump.right.src = "images/player-camina3.png";
            this.animations.jump.left.src = "images/player-camina3l.png";
            this.animations.idle.right.src = "images/player-camina3.png";
            this.animations.idle.left.src = "images/player-camina3l.png";
            this.animations.attack.right.src = "images/player-camina3.png";
            this.animations.attack.left.src = "images/player-camina3l.png";
            
            this.currentImage = this.animations.idle.right;
            this.isAttacking = false;
        }

        updateAnimation() {
            if (this.isAttacking) {
                this.currentImage = this.animations.attack[this.facing];
                return;
            }

            if (this.isJumping) {
                this.currentImage = this.animations.jump[this.facing];
                return;
            }
            
            if (this.velocityX !== 0) {
                const anim = this.animations[this.facing];
                anim.frameCount++;
                
                if (anim.frameCount >= FRAME_DELAY) {
                    anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
                    anim.frameCount = 0;
                    this.currentImage = anim.frames[anim.currentFrame];
                }
            } else {
                this.currentImage = this.animations.idle[this.facing];
            }
        }

        draw() {
            this.updateAnimation();
            
            const screenX = this.x - cameraX;
            const screenY = this.y;

            if (this.currentImage.complete) {
                ctx.drawImage(this.currentImage, screenX, screenY, this.width, this.height);
            } else {
                ctx.fillStyle = "blue";
                ctx.fillRect(screenX, screenY, this.width, this.height);
            }
            
            this.attack.draw();
            
            if (debugCollision) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect(screenX, screenY, this.width, this.height);
            }
        }

        checkCollision(x, y, width = this.width, height = this.height) {
            const margin = 3;
            for (let obj of staticObjects) {
                if (x + margin < obj.x + obj.width - margin &&
                    x + width - margin > obj.x + margin &&
                    y + margin < obj.y + obj.height - margin &&
                    y + height - margin > obj.y + margin) {
                    return true;
                }
            }
            return false;
        }
        

        checkGrounded() {
            const y = this.y + this.height + 1;
            const margin = 2;
        
            for (let obj of staticObjects) {
                const isAlignedHorizontally = 
                    (this.x + margin < obj.x + obj.width) &&
                    (this.x + this.width - margin > obj.x);
        
                const isJustAbove = 
                    y > obj.y && y < obj.y + 5; // rango pequeño debajo
        
                if (isAlignedHorizontally && isJustAbove) {
                    return true;
                }
            }
            return false;
        }
        
        
        checkBoxCollision(x, y, width, height) {
            for (let obj of staticObjects) {
                if (
                    x < obj.x + obj.width &&
                    x + width > obj.x &&
                    y < obj.y + obj.height &&
                    y + height > obj.y
                ) {
                    return true;
                }
            }
            return false;
        }
        
        
        

        update() {
            // Movimiento de cámara
            if (this.x - cameraX > canvas.width * 2 / 3 && this.velocityX > 0) {
                cameraX += this.velocityX;
            } else if (this.x - cameraX < canvas.width * 1 / 3 && this.velocityX < 0 && cameraX > 0) {
                cameraX += this.velocityX;
            }
            cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
        
            this.attack.update();
        
            // Aplicar gravedad
            this.velocityY = Math.min(this.velocityY + GRAVITY, 15);
        
            // Movimiento horizontal
            let newX = this.x + this.velocityX;
            if (!this.checkBoxCollision(newX, this.y, this.width, this.height)) {
                this.x = newX;
            }

        
            // Movimiento vertical
            let newY = this.y + this.velocityY;
            let collided = false;
        
            for (let obj of staticObjects) {
                const overlapX = this.x + this.width > obj.x + 2 && this.x < obj.x + obj.width - 2;
                const overlapY = newY + this.height > obj.y && newY < obj.y + obj.height;
        
                if (overlapX && overlapY) {
                    collided = true;
        
                    if (this.velocityY > 0) {
                        // Aterrizaje
                        this.y = obj.y - this.height;
                        this.velocityY = 0;
                        this.isJumping = false;
                    } else if (this.velocityY < 0) {
                        // Golpe con techo
                        this.y = obj.y + obj.height;
                        this.velocityY = 0;
                    }
                    break;
                }
            }
        
            if (!collided) {
                this.y = newY;
            }
        
            // Verificar si está en el suelo (al final del movimiento vertical)
            this.grounded = this.checkGrounded();
        
            // Mejora caída si está saltando
            if (this.isJumping) {
                this.velocityY = Math.max(this.velocityY, JUMP_FORCE * 0.6);
            }
        
            // Fin del ataque
            if (this.isAttacking && !this.attack.isActive) {
                this.isAttacking = false;
            }
        }
        

        // metodo del salto del payer
        jump() {
            if (this.grounded) {
                this.velocityY = JUMP_FORCE;
                this.isJumping = true;
                this.grounded = false;
            }
        }

        performAttack() {
            const now = Date.now();
            if (now - this.lastAttackTime > ATTACK_COOLDOWN) {
                this.isAttacking = true;
                this.attack.activate();
                this.lastAttackTime = now;
            }
        }
    }

    function drawStaticObjects() {
        staticObjects.forEach(obj => {
            const screenX = obj.x - cameraX;
    
            // Dibujar imagen o placeholder
            if (obj.imageSrc && staticImages[obj.imageSrc].complete) {
                ctx.drawImage(staticImages[obj.imageSrc], screenX, obj.y, obj.width, obj.height);
            } else {
                ctx.fillStyle = "transparent";
                ctx.fillRect(screenX, obj.y, obj.width, obj.height);
            }
    
            // Dibujo del área de colisión en rojo si debug está activado
            if (debugCollision) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect(screenX, obj.y, obj.width, obj.height);
            }
        });
    }
    

    const player = new Player(20, 500);
    const enemies = [
        // enemigo x    y  wid  hea vida
        new Enemy(300, 425, 50, 50, 10),
        new Enemy(600, 425, 50, 50, 10),
        new Enemy(800, 425, 50, 50, 10)
    ];

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
                        break;
                }
            } else {
                if (['ArrowRight', 'ArrowLeft'].includes(e.key)) {
                    player.velocityX = 0;
                }
            }
        }
        
        if (e.key === ' ' && e.type === 'keydown') {
            player.performAttack();
        }
    }

    window.addEventListener('keydown', handleKeyEvents);
    window.addEventListener('keyup', handleKeyEvents);

    canvas.setAttribute('tabindex', '0');
    canvas.focus();
    canvas.addEventListener('click', () => canvas.focus());

    function checkAttackCollisions() {
        if (!player.attack.isActive) return;
        
        const attackHitbox = player.attack.getHitbox();
        if (!attackHitbox) return;
        
        for (let enemy of enemies) {
            if (!enemy.isAlive) continue;
            
            if (attackHitbox.x < enemy.x + enemy.width &&
                attackHitbox.x + attackHitbox.width > enemy.x &&
                attackHitbox.y < enemy.y + enemy.height &&
                attackHitbox.y + attackHitbox.height > enemy.y) {
                
                enemy.takeDamage(player.attack.damage);
            }
        }
    }

    function updateGameUI() {
        if (isGameCompleted) return;
        
        // Actualizar temporizador
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        timerElement.textContent = `Tiempo: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Actualizar progreso
        const progress = Math.min(Math.max(0, player.x - LEVEL_START), LEVEL_GOAL - LEVEL_START);
        const progressPercentage = Math.floor((progress / (LEVEL_GOAL - LEVEL_START)) * 100);
        progressElement.textContent = `Progreso: ${progressPercentage}% - Código KINAMI :)`;
        
        // Verificar si el jugador llegó a la meta
        if (player.x >= LEVEL_GOAL && !isGameCompleted) {
            isGameCompleted = true;
            levelInfoElement.textContent = "¡Nivel Completado!";
            progressElement.textContent = `¡Felicidades! Tiempo final: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Detener al jugador
            player.velocityX = 0;
            player.velocityY = 0;
        }
    }

    // Modificar la función gameLoop para incluir la actualización de UI
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(background1, -cameraX * 0.8, 0, 2600, canvas.height);
        
        drawStaticObjects();
        
        player.update();
        player.draw();
        
        enemies.forEach(enemy => {
            enemy.update(player.x, player.y);
            enemy.draw();
        });

        checkAttackCollisions();
        updateGameUI(); // <-- Añadir esta línea
        
        requestAnimationFrame(gameLoop);
    }

    function preloadImages() {
        const images = [
            background,
            background1,
            ...player.animations.right.frames,
            ...player.animations.left.frames,
            player.animations.jump.right,
            player.animations.jump.left,
            player.animations.idle.right,
            player.animations.idle.left,
            player.animations.attack.right,
            player.animations.attack.left,
            player.attack.rightImage,
            player.attack.leftImage
        ];
        
        Object.values(staticImages).forEach(img => images.push(img));
        
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