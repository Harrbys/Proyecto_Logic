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

    // Constantes de física
    const GRAVITY = 0.5;
    const JUMP_FORCE = -12;
    const MOVE_SPEED = 5;
    const FRAME_DELAY = 8;
    const ATTACK_COOLDOWN = 500; // 500ms loq ue se demora en cada ataque 
    const ATTACK_DURATION = 300; // 300ms loq ue dura el ataque

    const debugCollision = true; 

    // Obstaculos
    const staticObjects = [
        {
            x: 0,  
            y: 470,  
            width: 10000,  
            height: 160,
            // color: "green" 
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

    // Clase para enemigos
    class Enemy {
        constructor(x, y, width, height, health) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.health = health;
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

        update(player) {
            if(this.isAlive) {
                this.moveToPlayer(player);
            }

        }

        moveToPlayer(playerX, playerY){
            if (!this.isAlive) return;

            // Moverse hacia el jugador
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

        

        // metodo para actualizar la imagen dependiendo la direccion o el facing mucho ingles
        updateImage() {
            if (this.facing === 'right') {
                this.currentImage.src = "images/player-camina3.png"; // 
            } else {
                this.currentImage.src = "images/player-camina3l.png"; 
            }
        }

        // metodo para dibujar en el canvas
        draw() {
            if (!this.isAlive) return;

            // Dibujar enemigo
            if (!this.isAlive) return;

            // Dibujar enemigo 
            if (this.currentImage.complete) {
                ctx.drawImage(this.currentImage, this.x, this.y, this.width, this.height);
            } else {
                // Dibujo temporal mientras carga la imagen
                ctx.fillStyle = "red";
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            // Dibujar barra de salud
            const healthBarWidth = this.width;
            const healthBarHeight = 5;
            const healthPercentage = this.health / this.maxHealth;

            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y - 10, healthBarWidth, healthBarHeight);
            ctx.fillStyle = "green";
            ctx.fillRect(this.x, this.y - 10, healthBarWidth * healthPercentage, healthBarHeight);

            // Dibujar textos de daño
            for (let i = this.damageTexts.length - 1; i >= 0; i--) {
                const text = this.damageTexts[i];
                ctx.fillStyle = `rgba(255, 0, 0, ${text.alpha})`;
                ctx.font = "16px Arial";
                ctx.fillText(`-${text.amount}`, text.x, text.y);
                
                text.y -= 1;
                text.alpha -= 0.02;
                
                if (text.alpha <= 0) {
                    this.damageTexts.splice(i, 1);
                }
            }

            // mostrar la hitbox o el debug
            if (debugCollision) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }

        // metodo del daño dibujado en el canvas
        takeDamage(amount) {
            if (!this.isAlive) return;

            this.health -= amount;
            
            // Añadir texto de daño
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

    // Clase para el ataque del jugador
    class Attack {
        constructor(player) {
            this.player = player;
            this.isActive = false;
            this.startTime = 0;
            this.image = new Image();
            this.image.src = "images/attack1.png";
            this.width = 60;
            this.height = 40;
            this.damage = 10;
        }

        // metodo para saber cuando esta atacando el player
        activate() {
            this.isActive = true;
            this.startTime = Date.now();
        }

        // metodo para activar o desactivar el metodo que miestra el ataque o realzia 
        update() {
            if (!this.isActive) return;

            // Desactivar el ataque después de la duración
            if (Date.now() - this.startTime > ATTACK_DURATION) {
                this.isActive = false;
            }
        }

        // metodo para dibujar en el canvas el ataque 
        draw() {
            if (!this.isActive || !this.image.complete) return;

            const attackX = this.player.facing === 'right' 
                ? this.player.x + this.player.width 
                : this.player.x - this.width;

            ctx.drawImage(
                this.image, 
                attackX, 
                this.player.y + this.player.height / 4, 
                this.width, 
                this.height
            );

            // Mostrar el hitbox del ataque o la espada
            if (debugCollision) {
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    attackX, 
                    this.player.y + this.player.height / 4, 
                    this.width, 
                    this.height
                );
            }
        }

        // devolver la imagen despues de realizar el ataque
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
            
            // Sistema de animación del player
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

            
            // Cargar frames de animación (3 frames por dirección)
            for (let i = 1; i <= 3; i++) {
                const frameRight = new Image();
                frameRight.src = `images/player-camina${i}.png`;
                this.animations.right.frames.push(frameRight);
                
                const frameLeft = new Image();
                frameLeft.src = `images/player-camina${i}l.png`;
                this.animations.left.frames.push(frameLeft);
            }
            
            // Cargar imágenes de salto, idle y ataque
            this.animations.jump.right.src = "images/player-camina3.png";
            this.animations.jump.left.src = "images/player-camina3l.png";
            this.animations.idle.right.src = "images/player-camina3.png";
            this.animations.idle.left.src = "images/player-camina3l.png";

            // toca crear animacion de ataque ya creada
            this.animations.attack.right.src = "images/player-camina3.png";
            this.animations.attack.left.src = "images/player-camina3l.png";
            
            // Imagen actual por defecto
            this.currentImage = this.animations.idle.right;
            this.isAttacking = false;
        }

        // modificar la imagen dependiendo la accion
        updateAnimation() {
            if (this.isAttacking) {
                // Animación de ataque
                this.currentImage = this.animations.attack[this.facing];
                return;
            }

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

        // metodo para dibujar en el canvas segun el update
        draw() {
            this.updateAnimation();
            
            if (this.currentImage.complete) {
                ctx.drawImage(this.currentImage, this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = "blue";
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            
            this.attack.draw();
            
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

            enemy.moveToPlayer(player);
            // Actualizar ataque
            this.attack.update();
            
            // Aplicar gravedad
            this.velocityY += GRAVITY;
            
            // Verificar si está en el suelo
            this.grounded = this.checkGrounded();
            
            if (this.grounded && !this.isJumping && this.velocityY > 0) {
                this.velocityY = 0;
                // aca esta el pouto 
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
            
            // Limitar movimiento del salto
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
            
            // Resetear estado de ataque si ha terminado
            if (this.isAttacking && !this.attack.isActive) {
                this.isAttacking = false;
            }
        }
        

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

    // dibujar los obstaculos y moverlos segun el fondo de la tierra
    function drawStaticObjects() {
        staticObjects.forEach(obj => {
            const drawX = obj.x + background1X;
            if (obj.color) {
                ctx.fillStyle = obj.color;
                ctx.fillRect(drawX, obj.y, obj.width, obj.height);
                
                ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
                ctx.lineWidth = 1;
                ctx.strokeRect(drawX, obj.y, obj.width, obj.height);
            }
        });
    }

    // ubicacion predetermindad del player
    const player = new Player(20, 450);
    
    // Crear algunos enemigos
    const enemies = [
        new Enemy(300, 420, 50, 50, 30),
        new Enemy(600, 420, 50, 50, 30),
        new Enemy(800, 420, 50, 50, 30)
    ];

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

    // Enfocar el canvas para que funcione el teclado
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
    canvas.addEventListener('click', () => canvas.focus());

    // Verificar colisiones entre ataque y enemigos
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

    let enemy = new Enemy(300, 100, 50, 50, 100);
    let background1X = 0;  // La posición X del fondo
    let background1Width = 30000;  // Ancho total del fondo
    let background1Speed = 2;

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        drawStaticObjects();
        ctx.drawImage(background1, 0, 0, canvas.width, canvas.height);

        player.update();
        player.update(enemy);

        if(player.velocityX > 0) {
            background1X -= background1Speed;
            staticObjects.forEach(obj => obj.x -= background1Speed);
        }

        if (player.velocityX < 0) {
            background1X += background1Speed;
            staticObjects.forEach(obj => obj.x -= background1Speed);
        }

        // backgroundX = Math.max(0,backgroundX);

        // backgroundX = Math.min(backgroundX, backgroundWidth - canvas.width);

        for(let enemy of enemies) {
            enemy.moveToPlayer(player);
            enemy.update(player.x, player.y);
        }
        player.draw();
        
        // Actualizar y dibujar enemigos
        enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.draw();
            }
        });

        draw();
        
        // Verificar colisiones de ataque
        checkAttackCollisions();
        
        requestAnimationFrame(gameLoop);
    }

    function draw(){
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(background1, background1X, 0, 2000, canvas.height);
        drawStaticObjects();
    
        // Dibujar jugador y enemigos
        player.draw();
        for (let enemy of enemies) {
            enemy.draw();
        }
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
            player.animations.idle.left,
            player.animations.attack.right,
            player.animations.attack.left,
            player.attack.image
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