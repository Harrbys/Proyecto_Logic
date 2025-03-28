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
            x: 80,  
            y: 0,  
            width: 83,  
            height: 220,
            color: "brown" 
        },
        {
            x: 290,  
            y: 0,  
            width: 80,  
            height: 220,
            color: "brown" 
        },
        {
            x: 163,  
            y: 0,  
            width: 127,  
            height: 160,
            color: "brown"
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

    let lastAnimal = null;
    let activeAnimalIndex = -1;
    let lastActiveIndex = -1; 
    const animals = []; 

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
            // this.lastMove = null; // Guarda la última dirección de movimiento
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
            // este codicional loq ue hace es mostrar el hitbox de la oveja con la que hace colision
            // if (debugCollision) {
            //     // ctx.strokeStyle = "red";
            //     // ctx.lineWidth = 2;
            //     // ctx.strokeRect(this.x, this.y, this.width, this.height);
            //     // ctx.fillStyle = "red";
            //     // ctx.font = "12px Arial";
            //     // ctx.fillText(`ID:${this.id}`, this.x + 5, this.y + 15);
            // }
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
                // se hace seguimiento de la posicion del animal 
                console.log(`Animal ID ${this.id} se movió a X:${this.x}, Y:${this.y}`);
            }
        }

        // basado en el seguimiento se hace el metodo de colicion con otro animal
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
            // se hace la colision con los objetos staticos que son el granero y el corral
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

    // funcion para dibujar los objetos staticos para comodar la hitbox del mapa
    function drawStaticObjects() {
        staticObjects.forEach(obj => {
            if (obj.color) {
                ctx.fillStyle = obj.color;
                ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                
                // Opcional: borde para mejor visibilidad
                ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
                ctx.lineWidth = 1;
                ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            }
        });
    }

    // const animals = [];
    // let activeAnimalIndex = -1;

    function addAnimal() {
        const animalWidth = 50;
        const animalHeight = 50;
        let newAnimal;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 2;

        // se hace seguimiento de la utima posicion guardada del animal antes de generar otro nuevo
        if (animals.length > 0) {
            const lastAnimal = animals[animals.length - 1];
            lastAnimalPosition = { id: lastAnimal.id, x: lastAnimal.x, y: lastAnimal.y };
            console.log(`Última posición guardada - ID: ${lastAnimalPosition.id}, Posición: (${lastAnimalPosition.x}, ${lastAnimalPosition.y})`);
        } else {
            console.log("No hay animales en el corral. Se agregará el primero.");
            lastAnimalPosition = null;
        }

        // aca aseguro la posicion estandar de la aparicion del nuevo animal
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            const x = 205;
            const y = 168;
            
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
            // aca se hace la verificacion o check de la collicion con un manejo de intentos por si las moscas la verdad no estaba siguiendo el video de youtu pero para nosotros no sirve de nada 
            validPosition = true;
            for (const animal of animals) {
                if (tempAnimal.checkCollision(animal.x, animal.y)) {
                    validPosition = false;
                    console.log(`Intento ${attempts}: Colisión en (${x},${y}) con animal ID ${animal.id}`);
                    break;
                }
            }

            // se valida la posicion para la coliciion despues de eso se guarda el penultimo animal u objeto y despues se agrega o renderiza el nuevo
            
            if (validPosition) {
                if (animals.length > 0) {
                    // aca se guarda el penultimo
                    lastAnimal = animals[animals.length - 1]; 
                }
                newAnimal = new Animal(x, y, animalImages.oveja);
                animals.push(newAnimal);
                // aca activanos el ultimo agregado
                activeAnimalIndex = animals.length - 1; 
                console.log(`Oveja ID ${newAnimal.id} agregada en (${x},${y})`);
                return newAnimal;
            }
        }
        
        alert("No se pudo encontrar posición sin colisión después de " + maxAttempts + " intentos");
        return null;
    }

    // se supone que era para mover el anterior del ultimo pero se corrompio o se rompio el codigo para se ve bonito pero no funciona

    // function moveLastAnimal(dx, dy, direction) {
    //     if (lastAnimalPosition) {
    //         const lastAnimal = animals.find(animal => animal.id === lastAnimalPosition.id);
    
    //         if (lastAnimal) {
    //             lastAnimal.move(dx, dy, direction);
    //             console.log(`Animal ID ${lastAnimal.id} movido a (${lastAnimal.x}, ${lastAnimal.y})`);
    //         } else {
    //             console.log("El último animal guardado ya no existe en la lista.");
    //         }
    //     } else {
    //         console.log("No hay ningún animal guardado para mover.");
    //     }
    // }


    // se define los codigos para vida infinita :)
    const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let konamiIndex = 0;

    let konamiActive = false;

// Modifica el evento keydown para el Konami Code
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
            konamiActive = !konamiActive; // Alternar estado
            alert(`Modo caos ${konamiActive ? "activado" : "desactivado"}! 🎉`);
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// Agrega esta función para movimiento aleatorio
function randomMovement(animal) {
    if (!konamiActive) return;
    
    const directions = [
        // Arriba
        { dx: 0, dy: -animal.speed }, 
        // Abajo
        { dx: 0, dy: animal.speed },  
        // Izquierda
        { dx: -animal.speed, dy: 0 }, 
        // Derecha
        { dx: animal.speed, dy: 0 },  
        // Diagonal abajo-derecha
        { dx: animal.speed, dy: animal.speed }, 
        // Diagonal arriba-izquierda
        { dx: -animal.speed, dy: -animal.speed } 
    ];
    
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    animal.move(randomDir.dx, randomDir.dy, "random");
}

function gameLoop() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    // drawStaticObjects();
    
    // Mover animales aleatoriamente si Konami está activo
    if (konamiActive) {
        animals.forEach(animal => {
            if (!animal.isLocked) {
                randomMovement(animal);
            }
        });
    }
    
    animals.forEach(animal => animal.draw());
    requestAnimationFrame(gameLoop);
}

    background.onload = () => {
        gameLoop();
    };

    document.getElementById("newoveja").addEventListener("click", () => {
        addAnimal();  
    });

    // este boton temporal sera remplazdo con el mouse pero por el momento no tenego ni la minima idea de como implementarlo entonces complazerno con esto 
    document.getElementById("oldoveja").addEventListener("click", () => {
        // valido si hay mas de dos animales a los cuales poder alternar sino un error y chao
        if (animals.length < 2) { 
            alert("No hay suficientes animales para alternar.");
            return;
        }

        // aqui validamos si esta activo el animal el cual queremos mover 
        if (activeAnimalIndex < 0 || activeAnimalIndex >= animals.length) {
            console.log("No hay un animal activo actualmente.");
            return;
        }
    
        // se guarda el id del ultimo antes de alternar o cambair 
        lastActiveIndex = activeAnimalIndex;
    
        // se busca el siguiente a alternar y lo activamos
        let newIndex = (activeAnimalIndex - 1 + animals.length) % animals.length;
    
        // y aca lo cambiamos oara poderlo mover 
        activeAnimalIndex = newIndex;
    
        console.log(`Cambio completado. Ahora controlas el ID ${animals[activeAnimalIndex].id}`);
    });
    
    document.addEventListener("click", (event) => {
        console.log(`Clic en X: ${event.clientX}, Y: ${event.clientY}`);
    });

    
});