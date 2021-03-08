export class VelocityTracker{
    
    constructor(){

    }

    /**
     * 添加事件
     * @param {pageX:number,pageY:number} event 
     */
    addMotionEvent(event){
        this.lastTouch = this.currentTouch;
        if (event.touches.length > 0) {
            this.currentTouch = event.touches[0];
            this.lastTime = this.currentTime;
            this.currentTime = new Date().getTime();
        }

    }

    /**
     * 
     * @returns X速度
     */
    getVelocityX(){
        if (!this.lastTouch) {
            return 0;
        }else {
            const dTime = this.currentTime - this.lastTime;
            const dX = this.currentTouch.pageX - this.lastTouch.pageX;
            return dX/dTime;
        }
    }

    /**
     * 
     * @returns Y速度
     */
    getVelocityY(){
        if (!this.lastTouch) {
            return 0;
        }
    }
}

export class Scroller{
    constructor(){
        this.a = 2;//反作用力
    }

    fling(startX, startY, velocityX, velocityY, minX,maxX, minY,maxY){
        this.startTime = new Date().getTime();
        this.startX = startX;
        this.startY = startY;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
        this.isFinished = false;
    }

    isFinished(){
        if (!this.isFinished) {
            const dTime = this._getDeltaTime();
            this.isFinished = Math.abs(this.velocityX) - this.a * dTime == 0 && Math.abs(this.velocityY) - this.a * dTime == 0; 
        }
    }

    abortAnimation(){
        this.isFinished = true;
    }

    _getDeltaTime(){
        return new Date().getTime() - this.startTime();
    }

    getCurrX(){

    } 

    getCurrY(){
        
    }
}

