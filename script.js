window.onload = function () {
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    var delay = 100;
    var widthInBlock = canvasWidth / blockSize;
    var heightInBlock = canvasHeight / blockSize;
    

    var theApple;
    var theSnake;

    init();

    
    function init() {
        /* 
        Dessiner un canvas de 900px de long et 600px de large
        avec une bordure noir de 1px et enfin l'ajouter au body
        */
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "1px solid";
        document.body.appendChild(canvas);

        /*
            Faire un dessin en 2D dans le cancas avec :
            - la courleur rouge
            - 30px 30px (coordonner dans le canvas) => premiere position du snake
            - 100px de long et 50px de large (le snake par defaut)
            ctx = canvas.getContext('2d');
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(30,30,100,50);
        */
       ctx = canvas.getContext('2d');
       theSnake = new snake([
            [6,4],
            [5,4],
            [4,4],
            [3,4],
            [2,4]
        ], "right");
       theApple = new Apple([10,10]);
       refreshCanvas();
        
    }

    function refreshCanvas() {
        theSnake.advance();
        if(theSnake.checkCollision()){
            //game over
            gameOver();
        }
        else {
            if(theSnake.eatApple(theApple)){
                theSnake.grow = true;
                //le snake a mange la pomme
                do {
                    theApple.setNewPosition();
                }while(theApple.isOnSnake(theSnake));
                //theApple.setNewPosition();
            }
            ctx.clearRect(0 , 0 , canvasWidth, canvasHeight);
            theSnake.draw();
            theApple.draw();
            setTimeout(refreshCanvas,theSnake.delay);
        }
         
    }

    
    function gameOver() {
        ctx.save();
        ctx.fillText("Game over", 5, 15);
        ctx.fillText("Press spacebar to replay : ", 5 ,30);
        ctx.restore(); 
    }

    function restart() {
       theSnake = new snake([
            [6,4],
            [5,4],
            [4,4],
            [3,4],
            [2,4]
        ], "right");
       theApple = new Apple([10,10]);
       theScore = new Score(0);
       refreshCanvas();
    }

    function Score() {
        this.score = 0;
        this.write = function() {
            ctx.save();
            ctx.fillText("Score : " + this.score,  5, canvasHeight -15);
            ctx.restore;
        }
        
    }
    function drawBlock(ctx, position) {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x , y , blockSize, blockSize);
    }

    function snake(body,direction) {
        this.body = body;
        this.direction = direction;
        this.grow = false;
        this.score = 0;
        this.cpt = 10;
        this.delay = 100;
        this.level = 1;
        //methode
        this.draw = function () {
            ctx.save();
            ctx.fillStyle = "#ff0000";
            ctx.fillText("Level : " + this.level, 5,canvasHeight - 30);
            ctx.fillText("Score  : " + this.score, 5, canvasHeight - 15);
            for(var i = 0; i < this.body.length ; i++) {
                drawBlock(ctx , this.body[i]);
            };
            ctx.restore();
        };

        this.advance = function() {
            var nextPosition = this.body[0].slice();
            
            switch(this.direction){
                case "right" : 
                    nextPosition[0] += 1;
                    break;
                case "up" : 
                    nextPosition[1] -= 1;
                    break;   
                case "down" :
                    nextPosition[1] += 1;
                    break;
                case "left" : 
                    nextPosition[0] -= 1;
                    break;
                default :
                    throw("invalid direction"); 

            }
            this.body.unshift(nextPosition);
            if(!this.grow)
                this.body.pop();
            else 
                this.score += 1;
                if(this.score === this.cpt){
                    this.delay -= 1;
                    this.cpt += 10;
                    this.level += 1;
                } 
                this.grow = false;
        };

        this.setDirection = function(newDirection) {
            var allowedDirection;
            switch(this.direction)
            {
                case "left" :
                case "right" :
                    allowedDirection = ["up" , "down"];
                    break;
                case "down" :
                case "up" :
                    allowedDirection = ["left", "right"];
                    break;    
                default :
                    throw("invalid direction");
            }
            if(allowedDirection.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        };

        this.checkCollision = function() {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1); //le rest du corps du serpent
            var snakex = head[0];
            var snakey = head[1];
            var minx = 0;
            var miny = 0;
            var maxx = widthInBlock - 1;
            var maxy = heightInBlock - 1;
            var isNotBetweenHorizontalWalls = snakex < minx || snakex > maxx;
            var isNotBetweenVerticalWalls = snakey < miny || snakey > maxy;
            
            if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls){
                wallCollision = true;
            }

            for(var i = 0; i<rest.length ; i++){
                if(snakex === rest[i][0] && snakey == rest[i][1]) {
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        };

        this.eatApple = function(apple) {
            var head = this.body[0];
            if(head[0] === apple.position[0] && head[1] === apple.position[1]) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    function Apple(position) {
        this.position = position;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var radius = blockSize / 2;
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            ctx.arc(x,y,radius, 0,Math.PI*2, true);
            ctx.fill();
            ctx.restore();
        };

        this.setNewPosition = function() {
            var newX = Math.round(Math.random() * (widthInBlock - 1));
            var newY = Math.round(Math.random() * (heightInBlock - 1));
            this.position = [newX, newY];
        };

        this.isOnSnake = function(snake) {
            var isOnSnake = false;
            for(var i = 0; i< snake.body.length ; i++){
                if(
                    this.position[0] === snake.body[i][0]
                    &&
                    this.position[1] === snake.body[i][1]){
                        isOnSnake = true;
                    }
            }
            return isOnSnake;
        }
    }

    document.onkeydown = function handleKeyDown(e) {
        var key = e.keyCode;
        var newDirection;
        switch(key) {
            case 37 :
                newDirection = "left";
                break;
            case 38 :
                newDirection = "up";
                break;
            case 39 : 
                newDirection = "right";
                break;
            case 40 : 
                newDirection = "down";
                break;
            case 32 :
                restart();
                return;
            default :
                return;
        }

        theSnake.setDirection(newDirection);
    }
    
}