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
            return dX/parseFloat(dTime);
        }
    }

    /**
     * 
     * @returns Y速度
     */
    getVelocityY(){
        if (!this.lastTouch) {
            return 0;
        }else {
            const dTime = this.currentTime - this.lastTime;
            const dY = this.currentTouch.pageY - this.lastTouch.pageY;
            return dY/parseFloat(dTime);
        }
    }
}

export class Scroller{
    constructor(){
        this.a = 0.0025;//反作用力
    }

    fling(startX, startY, velocityX, velocityY, minX,maxX, minY,maxY){
        if (velocityX == 0 && velocityY == 0) {
            this._isFinished = true;
            return;
        }
        this.startTime = new Date().getTime();
        this.startX = startX;
        this.startY = startY;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
        this._isFinished = false;
        this.aX = -this.a * velocityX/Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        this.aY = -this.a * velocityY/Math.sqrt(velocityX * velocityX + velocityY * velocityY)
    }

    isFinished(){
        if (!this._isFinished) {
            const dTime = this._getDeltaTime();
            const currX = this._getCurrX();
            const currY = this._getCurrY();
            this._isFinished =  Math.abs(this.velocityX) <= Math.abs(this.aX * dTime) && Math.abs(this.velocityY)  <= Math.abs(this.aY * dTime) || currX >= this.maxX || currX <= this.minX || currY >=this.maxY || currY <=this.minY;
            if (this._isFinished) {
                console.log(123);
            }
            
        }
        return this._isFinished;
    }

    abortAnimation(){
        this._isFinished = true;
    }

    /**
     * 
     * @returns 时间间隔
     */
    _getDeltaTime(){
        return new Date().getTime() - this.startTime;
    }

    /**
     * 计算未做限制的当前X值
     * @returns 当前X偏移量
     */
    _getCurrX(){
        const dTime = this._getDeltaTime();
        let currX = this.startX +  this.velocityX * dTime + this.aX * dTime * dTime/2;
        return currX;
    }


    getCurrX(){
        let currX = this._getCurrX();
        if (currX >= this.maxX) {
            currX = this.maxX;
        }else if (currX <= this.minX) {
            currX = this.minX
        }
        return currX;
    } 

    /**
     * 计算未做限制的当前Y值
     * @returns 当前X偏移量
     */
    _getCurrY(){
        const dTime = this._getDeltaTime();
        let currY =this.startY +  this.velocityY * dTime + this.aY * dTime * dTime/2.0;
        return currY;
    }

    getCurrY(){
        let currY = this._getCurrY();
        if (currY >= this.maxY) {
            currY = this.maxY;
        }else if (currY <= this.minY) {
            currY = this.minY;            
        }
        return currY;
    }
}

