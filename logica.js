document.addEventListener("DOMContentLoaded", () => { // Nombramos un evento escucha para posteriormente hacer que el DOOM se cargue antes que el canva se desarrolle

    const button = document.getElementById("cambiocolor");
    let isWhite = true;

    button.addEventListener("click", () => {
        document.body.style.backgroundColor = isWhite ? "gray" : "white";
        document.querySelector("h1").style.color = isWhite ? "white" : "green";
        document.getElementById("game-info").style.backgroundColor = isWhite ? "gray" : "white";
        document.body.style.color = isWhite ? "white" : "black"; // Cambia el color del texto
        isWhite = !isWhite;
    });

    
    const canvas = document.getElementById("gameCanvas"); // Capturamos el canvas mediante un elemento id para poder renderizarlo en el espacio que necesitamos
    const ctx = canvas.getContext("2d") // Referimos el contexto del nivel en el que encontraremos el juego
    console.log(ctx);

    let progressDisplay = document.getElementById("progress");

    class Animal {
        constructor (x,y, imgSrc, type){ //Crearemos un constructor que capturara todos los datos presentes de todo objeto para validar referencia como diversos datos requeridos o que necesitemos dentro del objeto renderizado
            this.x = x; // Posicion en el eje x
            this.y = y; // Posicion en el eje y
            this.width = 100; // Manejaremos el ancho del objeto en este caso los objetos animales referenciandonos a la const animals
            this.height = 100; // Manejaremos el alto del objeto en este caso los objetos animales referenciandonos a la const animals
            this.speed = 5; // Manejamos la velocidad de renderizado de este caso los objetos animales referenciados a la const animals
            this.type = type; // Manejaremos el tipo de objeto al que nos referenciamos en este caso en la const de animals podemos ver la mencion de los diversos animales para poder capturar su forma o en este su tipo de animal
            this.image = new Image(); // Manejaremos la imagen de modo que podremos renderizar la imagen cargada en la ruta
            this.image.src = imgSrc; // Manejaremos la imagen de modo que podremos renderizar la imagen cargada en la ruta
            this.isLocked = false; // Concepto que usaremos para bloquear el movimiento del animal siendo true = inmovil, false = movible
            this.inFarm = false; // Concepto que usaremos para evidenciar presencia dentro de cualquier granja para poder validar localizacion exacta y poder emerger el correcto funcionamiento
        }

        //Espacio de renderizado dentro del canvas 
        draw () {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        checkCollision(newX, newY){
            if(this.locked) return true; // Hacemos una condicional buscando validar al instante de colisionar evitando o bloqueando el movimiento del objeto al recibir un true
            for (let animal of animals){

            }
        }

        // Este bloque de codigo se encarga de manipular como verificar el estado de la colision del objeto con este mismo 
        checkCollision(newX, newY){ // Usaremos variables nuevas para definir un posicionamiento nuevo o manejar la nueva posicion despues de lo requerido.
            if(this.isLocked) return true; // Condicional para manejar o verificar que el objeto no se encuentre inmovil 
            for (let animal of animals){ // Iteramos en una lista de animales referenciando cada colision existente.
                // Esta condicional tiene de funcion poder manejar cada colision como tambien verificar que el objeto mismo no tenga problemas con este mismo.
                if (animal !== this &&
                    newX < animal.x + animal.width &&
                    newX + this.width > animal.x &&
                    newY < animal.y + animal.height &&
                    newY + this.height > animal.y){
                        return true; // Si existe colision se bloqueara el movimiento
                    }
            }
            return false; // Si no hay colision se permite el movimiento
        }
    }

    // Background del Canvas
    const background = new Image(); // Nombramos la constante que nos permitira dibujar o tener en cuenta el dibujo de la imagen
    background.src = "images/pasto.jpg"; // Usaremos la ruta correcta para poder renderizar la imagen que necesitamos.
    
    // Nombramos las constantes o datos que usaremos para pode renderizar las imagenes de los animales
    const farmImages = {
        oveja: new Image(), //Primera varible - Objeto Oveja
        vaca: new Image() // Segunda variable - Objeto Vaca
    }

    // Renderizamos la imagen dentro del canvas usando esta constante
    const farmZones = {
        oveja: {x:600 , y:50, width:150, height:300},
        vaca: { x: 50, y: 300, width: 150, height: 300}
    }

    // Indicamos las imagenes de donde saldran 
    farmImages.oveja.src = "images/corrales.png";
    farmImages.vaca.src = "images/corrales.png";

    // Renderizamos imagenes de los objetos en este caso los corrales
    function drawFarms(ctx){ // Remarcamos el contexto donde sera presente la funcion al instante de arrancar con el dibujo dentro del canvas
        for (let farm in farmZones){ // Iteramos los datos en una lista para validar en un pequeño espacio la existencia de la imagen que buscamos que sea renderizado
            let zone = farmZones[farm]; //Creamos un bloque de codigo que capture datos de la zona en este caso farmZones nombrando a la constante creada

            if (farmImages[farm] && farmImages[farm].complete){ // Usaremos un condicional acompañado de un validador del modo que cumpla ambos datos hasta tener una zona completa, pero si existe algun daño o error inmediatamente saltara un false cancelando todo renderizado
                ctx.drawImage(farmImages[farm], zone.x, zone.y, zone.width, zone.height); // En el contexto manejaremos la zona que nos permitira dibujara la imagen referenciada manteniendo los datos datos en la constante
            }
        }
    }

    // Renderizamos las imagenes de los objetos en este caso los animales
    const animals = [ // Nombramos las constantes o en este caso dentro de un array manejaremos el renderizado de cada objeto
        new Animal(100, 100, "images/Oveja.png", "oveja"), // Animal sera la clase general donde se manejara toda la informacion o caracteristicas de todo objeto a crear o ingresar
        new Animal(200, 200, "images/Vaca.png", "vaca") // Animal sera la clase general donde se manejara toda la informacion o caracteristicas de todo objeto a crear o ingresar
    ]

    // Variables o bloque de codigo usado de forma global
    
    let selectAnimalIndex = 0; // Contador de cada animal 
    let isDraggin = false; // Accion de movimiento del objeto mediante el mouse en este caso se dejara false por eleccion
    let correctAnimals = 0; // Contador de los animales dejados en el granero de forma correcta
    let gameStarted = false; // Indicaremos cuando se inicia el juego por eleccion se dejara en false 


    //Movimiento del mouse
    //Al presionar el mouse
    canvas.addEventListener("mousedown", (event) => { //Haremos que el canva sea el que escucha el movimiento del mouse
        if(!gameStarted) return; // Validamos que el juego este iniciado sino existe dicha accion hara que el juego quede completamente detenido
        const {offsetX, offsetY} = event; // Presentamos la extracion de coordenadas


        animals.forEach((animal, index) => { //Iteramos en un ciclo for donde podremos manejar cada interaccion del mouse con alguno de los animales
            if(
                offsetX >= animal.x &&
                offsetX <= animal.x + animal.width &&
                offsetY >= animal.y &&
                offsetY <= animal.y + animal.height
            ){
                selectAnimalIndex = index; // Guardaremos el indice del animal almacenado
                isDraggin = true; // Permitir el movimiento del mouse es decir del objeto
            }
        })
    })

    //Al mover el mouse
    canvas.addEventListener("mousemove", (event) =>{
        if(isDraggin){ // Validaremos si existe algun movimiento 
            const {offsetX, offsetY} = event; // Mantemos la extracion de las coordenadas del mouse ahora en movimiento
            let selectAnimal = animals[selectAnimalIndex]; // Obtenemos el animal seleccionado basado en su indice 

            if(selectAnimal.isLocked)return; // Si existe un bloqueo en el animal, cancelamos el movimiento

            let newX = offsetX - selectAnimal.width / 2; 
            let newY = offsetY - selectAnimal.height / 2; // Y dentro de este bloque de codigo ubicamos una posicion exacta para poder ver el objeto centrado y sin tener un desfaz tan marcado

            let collisionDetected = animals.some((animal,i) => //Validaremos si existio alguna colision presente en el movimiento
                i !== selectAnimalIndex && selectAnimal.checkCollision(newX, newY) // Comprobaremos mediante cada seleccion de cada nueva posicion haciendo que este bloque de variable pueda comprobar el objetivo 
            )

            if(!collisionDetected){ //Si no hubo colision actualizamos la nueva posicion del objeto
                selectAnimal.x = newX;
                selectAnimal.y = newY;
            }
        }

        
    })

    //Al levantar el Mouse
    canvas.addEventListener("mouseup", () => {
        isDraggin = false; //Al levantar el mouse hara que el movimiento se detenga
        checkFarmCollision(animals[selectAnimalIndex]); //Manejaremos la funcion de la colision existente en los corrales para poder capturar un animal basado en su indice
    })
  

    // Colision de animales o presente en el coral

    function checkFarmCollision(animal) {
        if (!gameStarted) return; // No permitir acción alguna si el juego no ha sido iniciado antes
        if (animal.isLocked) return; // No permitir el movimiento de los animales ya colocados en el corral
    
        let farm = farmZones[animal.type]; // Obtener el corral correcto para este tipo de animal
    
        // Verificar si el animal está dentro del corral correcto
        let isInsideCorrectFarm =
            animal.x + animal.width / 2 > farm.x &&
            animal.x + animal.width / 2 < farm.x + farm.width &&
            animal.y + animal.height / 2 > farm.y &&
            animal.y + animal.height / 2 < farm.y + farm.height;
    
            if (isInsideCorrectFarm) {
                if (!animal.inFarm) {
                    animal.inFarm = true;
                    animal.isLocked = true;
                    correctAnimals++;
                    updateCounter();
                    updateProgress(); // Llamar a la nueva función
        
                    // Centrar el animal
                    animal.x = farm.x + (farm.width / 2 - animal.width / 2);
                    animal.y = farm.y + (farm.height / 2 - animal.height / 2);
                }
        
                if (correctAnimals === animals.length) {
                    setTimeout(() => {
                        Swal.fire({
                            title: "¡Felicidades! 🎉",
                            text: "Has completado el nivel 1!",
                            icon: "success",
                            confirmButtonText: "Siguiente nivel"
                        }).then(() => {
                            detenerTemporizador();
                            window.location.href = "index2.html"; // Redirección
                        });
                    }, 500);
                }
        } else {
            // Si el animal es incorrecto, mostrar alerta de error y regresarlo a su posición inicial
            Swal.fire({
                title: "¡Oops! 😕",
                text: "Este animal no pertenece a este corral.",
                icon: "error",
                timer: 2000,
                showConfirmButton: false
            });
    
            animal.isFarm = false; // Rechazar acción dentro del corral
            animal.isLocked = false; // Permitir su correcto movimiento

        }
    }    

    function updateProgress() {
        progressDisplay.textContent = `Progreso: ${correctAnimals}/${animals.length}`;
    }

    // Botones y funcionamiento 

    //Funciones

    // Bloques de codigo globales
    let tiempoRestante = 60;
    let temporizador;
    //Funcion encargada de manejar el temporizador
    function iniciarTemporizador(){
        detenerTemporizador(); // Funcion encargada para detener el temporizador de forma inicial por cualquier evento dentro de algun diverso boton
        const timerElement = document.getElementById('timer'); // Construimos como capturamos el espacio del temporizador
        temporizador = setInterval(() => {
            tiempoRestante--; // Iremos restante el tiempo a medida que avance este mismo
            timerElement.textContent = `Tiempo: ${tiempoRestante}s`; // Mostraremos el tiempo restante dentro del juego

            if (tiempoRestante <= 0){ // Condicional encargada de validar y verificar el instante en el que el presente tiempo culmina
                clearInterval(temporizador); // Limpiando el intervalo presente para posteriormente saltara una alerta permitiendo al usuario reiniciar el juego
                alert("¡Tiempo agotado! Intenta de nuevo.")
                reiniciarJuego(); // Funcion de reinicio de juego
            }
        }, 1000);
    }

    // Funcion encargada de manejar la actualizacion del temporizador
    function updateCounter(){
        document.getElementById("counter").innerText = `Animales en corral: ${correctAnimals}/${animals.length}`; // Capturamos un elemento dentro del html para posteriormente mostrar un texto en dicha zona que contara los animales como la longitud esperada de llegada
        if(correctAnimals === animals.length){ // Tras la verificacion correcta de ambos valores se obtendra una alerta 
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "¡Todos los animales están en su corral!",
                showConfirmButton: false,
                timer: 1500
              });
        }
    }

    //Funcion encargada para manejar cuando el temporizador se detiene
    function detenerTemporizador(){
        clearInterval(temporizador); // Limpiaremos el temporizador por ende nombramos la accion de clear interval
    }

    //Funcion encargada para reiniciar el juego
    function reiniciarJuego(){
        correctAnimals = 0; // Reiniciamos el contador de los animales
        updateCounter(); //Actualizando en el proceso el contador
        gameStarted = false; //Haciendo que el juego se detenga al momento en que se actue.

        animals.forEach(animal => { //Esto hara que cada posicion sea nueva dentro de cada accion o instante en que se presiona el reiniciar 
            animal.x = Math.random() * 300;
            animal.y = Math.random() * 300;
            animal.inFarm = false;
        })

        tiempoRestante = 60;
        
    }

    //Funcion encargada para detener el juego

    function detenerJuego(){
        gameStarted = false; // Haremos que todo juego se detenga por ende lo volveremos false
        animals.forEach(animal =>{ // Recorremos todos los animales dentro de la lista
            animal.inFarm = true; // Marcando en el proceso todos los animales dentro de la granja
        })
    }

    // Zona de botones

    document.getElementById("startButton").addEventListener("click", () => {
        gameStarted = true;
        tiempoRestante = 40;
        correctAnimals = 0;
        updateProgress(); // Mostrar 0/2 al inicio
        iniciarTemporizador();
        updateCounter();
        requestAnimationFrame(gameLoop);
    });

    document.getElementById("stopButton").addEventListener("click", () => {
        gameStarted = false;
        detenerTemporizador();
        Swal.fire({
            title: "Juego detenido. ¡Gracias por Jugar!",
            icon: "success",
            draggable: true
          });
        detenerJuego();
    })

    document.getElementById("resetButton").addEventListener("click", () => {
        detenerTemporizador();
        tiempoRestante = 40;
        correctAnimals = 0
        gameStarted = false;
        // correctAnimals = 0;
        animals.forEach(animal => {
            animal.x = Math.random() * 300;
            animal.y = Math.random() * 300;
            animal.inFarm = false;
            animal.isLocked = false;
        });

        updateCounter();

        setTimeout(() => {
            gameStarted = true;
            iniciarTemporizador();
        })
    })

    function gameLoop() { // Haremos que sea renderizado dentro del espacio dado por ende se nombra todo elemento ubicado en la logica
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        drawFarms(ctx);
        animals.forEach(animal => animal.draw());
        requestAnimationFrame(gameLoop);
    
    }

    background.onload = () => { //Y acabaremos con el inicio de todo es decir el renderizado
        gameLoop();
    };
})