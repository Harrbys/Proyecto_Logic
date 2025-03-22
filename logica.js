document.addEventListener("DOMContentLoaded", () => { //Nombramos el evento que requerimos en este caso de un evento de escucha, posteriormente hacemos que el doom se cargues antes de que el canvas cargue
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d"); //Damos un contexto pequeño para mencionar en que nivel encontraremos nuestro juego

    const background = new Image();
    background.src = "images/Granja.jpg"; // Usaremos la ruta correcta dentro de las imagenes 

    class Animal { //Usamos una clase del modo que definiremos todo funcionamiento como diseño del objeto o elemento en este caso cada animal
        constructor(x, y, imgSrc) {
            this.x = x;
            this.y = y;
            this.width = 100;
            this.height = 100;
            this.speed = 5;
            this.image = new Image();
            this.image.src = imgSrc;
        }

        draw() { //Al momento de renderizar se conoce como draw donde mencionamos cada variable mencionada o nombrada o creada dentro de la clase
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        move(dx, dy) { //Conocemos el siguiente espacio que sera el movimiento del objeto
            let newX = this.x + dx;
            let newY = this.y + dy;
            
            if (!this.checkCollision(newX, newY)) { //Damos una condicional para que pueda visualizar un espacio del evitara algun choque o colision
                this.x = newX;
                this.y = newY;
            }
        }

        checkCollision(newX, newY) { //Donde describiremos cada detalle mas en especifico mediante un ciclo for con unas condicionales evitando todo escenario existente y si llega a suceder algun escenario causara un true evitando dicho escenario, pero si no existe caera un false dejando que continue el juego en cuestion
            for (let animal of animals) {
                if (animal !== this &&
                    newX < animal.x + animal.width &&
                    newX + this.width > animal.x &&
                    newY < animal.y + animal.height &&
                    newY + this.height > animal.y) {
                    return true;
                }
            }
            return false;
        }
    }

    const animals = [ //Sera donde seran renderizadas cada objeto en este caso cada animal al instante de cargar o refrescar la pagina
        new Animal(100, 100, "images/Oveja.png"),
        new Animal(200, 200, "images/Vaca.png")
    ];

    window.addEventListener("keydown", (event) => { //Hacemos que la ventana misma sea el centro de escucha donde podra el usuario tomar y jugar con sus teclas
        switch (event.key) {
            case "ArrowUp": animals[0].move(0, -animals[0].speed); break;
            case "ArrowDown": animals[0].move(0, animals[0].speed); break;
            case "ArrowLeft": animals[0].move(-animals[0].speed, 0); break;
            case "ArrowRight": animals[0].move(animals[0].speed, 0); break;
        }
    });

    function gameLoop() { // Haremos que sea renderizado dentro del espacio dado por ende se nombra todo elemento ubicado en la logica
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        animals.forEach(animal => animal.draw());
        requestAnimationFrame(gameLoop);
    }

    background.onload = () => { //Y acabaremos con el inicio de todo es decir el renderizado
        gameLoop();
    };
});
