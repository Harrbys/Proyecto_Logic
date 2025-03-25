document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const background = new Image();
    background.src = "images/Granja.avif";

    const animalImages = {
        oveja: "images/Oveja.png",
        vaca: "images/Vaca.png"
    };

    const debugCollision = true; 

    // colicion de la granja corral o lo que querramos
    const staticObjects = [
        {
            x: 40,  
            y: 0,  
            width: 40,  
            height: 150,
            // color: "brown" 
        },
        {
            x: 150,  
            y: 0,  
            width: 40,  
            height: 150,
            // color: "brown" 
        },
        {
            x: 80,  
            y: 0,  
            width: 70,  
            height: 100,
            // color: "brown"
        },
        {
            x: 215,
            y: 0,
            width: 5,
            height: 140,
            // color: "gray"
        },
        {
            x: 350,
            y: 0,
            width: 5,
            height: 140,
            // color: "gray"
        }
    ];

    class Animal {
        static lastId = 0;
        constructor(x, y, imgSrc) {
            this.id = ++Animal.lastId;
            this.x = x;
            this.y = y;
            this.width = 50;
            this.height = 50;
            this.speed = 5;
            this.hestoryposicion = [];
            this.lastMove = null; // Guarda la última dirección de movimiento
            this.recordPosition(x, y);
            this.image = new Image();
            this.image.src = imgSrc;
        }

        recordPosition(x, y) {
            this.hestoryposicion.push({ x, y, timestamp: new Date().toISOString() });
            if (this.hestoryposicion.length > 100) {
                this.hestoryposicion.shift();
            }
        }

        draw() {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            if (debugCollision) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                ctx.fillStyle = "red";
                ctx.font = "12px Arial";
                ctx.fillText(`ID:${this.id}`, this.x + 5, this.y + 15);
            }
        }

        move(dx, dy, direction) {
            // Verificar si el movimiento es el opuesto al anterior
            // if ((this.lastMove === "up" && direction === "up" && this.lastMove === "down" && this.lastMove === "down") ||
            //     (this.lastMove === "left" && direction === "right") ) {
            //         console.log(this.lastMove)
            //     alert("Error: Movimiento inválido (dirección opuesta inmediata)");
            //     return;
            // }
            let newX = this.x + dx;
            let newY = this.y + dy;

            if (newX < 0 || newX + this.width > canvas.width ||
                newY < 0 || newY + this.height > canvas.height) {
                return;
            }

            if (!this.checkCollision(newX, newY)) {
                this.recordPosition(newX, newY);
                this.x = newX;
                this.y = newY;
                this.lastMove = direction;
            }
        }

        checkCollision(newX, newY) {
            for (let animal of animals) {
                if (animal !== this) {
                    if (newX < animal.x + animal.width &&
                        newX + this.width > animal.x &&
                        newY < animal.y + animal.height &&
                        newY + this.height > animal.y) {
                        return true;
                    }
                }
            }

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
    }

    const animals = [];
    let activeAnimalIndex = -1;

    function addAnimal() {
        const animalWidth = 50;
        const animalHeight = 50;
        let newAnimal;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 4;

        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            const x = 89;
            const y = 100;
            
            const tempAnimal = {
                x: x,
                y: y,
                width: animalWidth,
                height: animalHeight,
                checkCollision: function(otherX, otherY) {
                    return this.x < otherX + animalWidth &&
                        this.x + this.width > otherX &&
                        this.y < otherY + animalHeight &&
                        this.y + this.height > otherY;
                }
            };
            
            validPosition = true;
            for (const animal of animals) {
                if (tempAnimal.checkCollision(animal.x, animal.y)) {
                    validPosition = false;
                    console.log(`Intento ${attempts}: Colisión en (${x},${y}) con animal ID ${animal.id}`);
                    break;
                }
            }
            
            if (validPosition) {
                newAnimal = new Animal(x, y, animalImages.oveja);
                animals.push(newAnimal);
                activeAnimalIndex = animals.length - 1;
                console.log(`Oveja ID ${newAnimal.id} agregada en (${x},${y})`);
                return newAnimal;
            }
        }
        
        alert("No se pudo encontrar posición sin colisión después de " + maxAttempts + " intentos");
        return null;
    }

    const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let konamiIndex = 0;

    window.addEventListener("keydown", (event) => {
        if (activeAnimalIndex < 0 || activeAnimalIndex >= animals.length) return;
        const activeAnimal = animals[activeAnimalIndex];
        
        switch (event.key) {
            case "ArrowUp": activeAnimal.move(0, -activeAnimal.speed, "up"); break;
            case "ArrowDown": activeAnimal.move(0, activeAnimal.speed, "down"); break;
            case "ArrowLeft": activeAnimal.move(-activeAnimal.speed, 0, "left"); break;
            case "ArrowRight": activeAnimal.move(activeAnimal.speed, 0, "right"); break;
            case "a": activeAnimal.move(-activeAnimal.speed, -activeAnimal.speed, "a"); break;
            case "b": activeAnimal.move(activeAnimal.speed, activeAnimal.speed, "b"); break;
        }
        
        if (event.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                alert("¡Código Konami activado! 🎉");
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function gameLoop() {
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        animals.forEach(animal => animal.draw());
        requestAnimationFrame(gameLoop);
    }

    background.onload = () => {
        gameLoop();
    };

    document.getElementById("newoveja").addEventListener("click", () => {
        addAnimal();
    });
});
