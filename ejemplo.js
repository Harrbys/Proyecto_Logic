function gameLoop() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
    // Dibujar objetos estáticos
    staticObjects.forEach(obj => {
        if (obj.image.complete) {
            ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
        } else {
            ctx.fillStyle = 'brown';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        }
        
        // Mostrar hitbox si está en modo debug
        if (debugCollision) {
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        }
    });
    
    // Dibujar animales
    animals.forEach(animal => animal.draw());
    
    requestAnimationFrame(gameLoop);
}