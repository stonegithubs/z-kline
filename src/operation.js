import { computAxis } from './draw';
export default function operation() {
    const overCtx = this.overCtx;
    const overCanvas = this.overCanvas;

    let isDown = false;
    let lastIndex = 0;
    let lastPos = { x: -1, y: -1 };
    let lastTouchDistance = 0;

    let lock = false;

    const move = e => {
        const pos = this.getMousePos(e);
        const currentIndex = Math.floor((pos.x - this.views[0].x) / this.views[0].w * this.state.verticalRectNumber);
        var x = currentIndex * this.views[0].w / this.state.verticalRectNumber + 0.5 * this.views[0].w / this.state.verticalRectNumber + this.views[0].x;
        if (x != lastPos.x || pos.y != lastPos.y) {
            overCtx.clearRect(0, 0, this.width, this.height);
            if (isDown) {
                let num = lastIndex - currentIndex;
                if (this.state.startIndex + num < 0) {
                    num = -this.state.startIndex;
                }
                if (this.state.endIndex + num > this.state.times.length + this.state.verticalRectNumber * 0.5) {
                    num = this.state.times.length + this.state.verticalRectNumber * 0.5 - this.state.endIndex;
                }
                this.state.startIndex += num;
                this.state.endIndex += num;
                if (this.state.startIndex < 0) {
                    this.state.startIndex = 0;
                    this.state.endIndex = this.state.startIndex + this.state.verticalRectNumber;
                }
                this.draw();
            } else {
                let flag = this.isInLineView(pos);
                if (flag !== false && currentIndex + this.state.startIndex < this.state.times.length) {
                    this.overCanvas.style.cursor = 'none';
                    drawHairline.call(this, x, pos.y, currentIndex);
                } else {
                    this.overCanvas.style.cursor = 'default';
                }
            }
            lastIndex = currentIndex;
            lastPos = { x, y: pos.y };
        }
    };
    const scale = n => {
        if (n > 10) {
            n = 10;
        }
        if (n < -10) {
            n = -10;
        }
        const lastStartIndex = this.state.startIndex;
        const lastEndIndex = this.state.endIndex;
        const lastVerticalRectNumber = this.state.verticalRectNumber;
        this.state.startIndex -= n;
        this.state.endIndex += n;
        if (this.state.endIndex - this.state.startIndex > this.state.maxKLineNumber) {
            this.state.startIndex = lastStartIndex - (this.state.maxKLineNumber - lastVerticalRectNumber) / 2;
            this.state.endIndex = lastEndIndex + (this.state.maxKLineNumber - lastVerticalRectNumber) / 2;
        }
        if (this.state.endIndex - this.state.startIndex < this.state.minKLineNumber) {
            this.state.startIndex = lastStartIndex + (lastVerticalRectNumber - this.state.minKLineNumber) / 2;
            this.state.endIndex = lastEndIndex - (lastVerticalRectNumber - this.state.minKLineNumber) / 2;
        }
        this.state.verticalRectNumber = this.state.endIndex - this.state.startIndex;
        if (this.state.startIndex < 0) {
            this.state.endIndex -= this.state.startIndex;
            this.state.startIndex = 0;
        }
        if (this.state.startIndex >= this.state.times.length) {
            this.state.startIndex = this.state.times.length - 1;
            this.state.endIndex = this.state.startIndex + this.state.verticalRectNumber;
        }
        this.draw();
    };
    if (this.device == 'pc') {
        const mousedown = e => {
            isDown = true;
            const pos = this.getMousePos(e);
            const currentIndex = Math.floor((pos.x - this.views[0].x) / this.views[0].w * this.state.verticalRectNumber);
            lastIndex = currentIndex;
        };
        const mouseup = () => {
            isDown = false;
        };
        const mouseout = () => {
            isDown = false;
            overCtx.clearRect(0, 0, this.width, this.height);
        };
        overCanvas.addEventListener('mousedown', mousedown);
        overCanvas.addEventListener('mouseup', mouseup);
        overCanvas.addEventListener('mouseout', mouseout);
        overCanvas.addEventListener('mousemove', move);
        overCanvas.addEventListener('wheel', function(e) {
            e.preventDefault();
            let n = Number(e.deltaY.toFixed(0));
            scale(n);
        });
    }
    if (this.device == 'mb') {
        const touchstart = e => {
            isDown = true;
            if (e.targetTouches.length == 2) {
                const touch1 = this.getMousePos(e.targetTouches[0]);
                const touch2 = this.getMousePos(e.targetTouches[1]);
                lastTouchDistance = Math.sqrt(Math.pow(touch1.x - touch2.x, 2) + Math.pow(touch1.y - touch2.y, 2));
            }
            const pos = this.getMousePos(e.targetTouches[0]);
            const currentIndex = Math.floor((pos.x - this.views[0].x) / this.views[0].w * this.state.verticalRectNumber);
            lastIndex = currentIndex;
            const x = currentIndex * this.views[0].w / this.state.verticalRectNumber + 0.5 * this.views[0].w / this.state.verticalRectNumber + this.views[0].x;
            let flag = this.isInLineView(pos);
            if (flag !== false && currentIndex + this.state.startIndex < this.state.times.length) {
                overCtx.clearRect(0, 0, this.width, this.height);
                drawHairline.call(this, x, pos.y, currentIndex);
            }
        };
        const touchend = () => {
            isDown = false;
        };
        const touchcancel = () => {
            isDown = false;
            overCtx.clearRect(0, 0, this.width, this.height);
        };
        const touchmove = e => {
            e.preventDefault();
            if (e.targetTouches.length === 2) {
                const touch1 = this.getMousePos(e.targetTouches[0]);
                const touch2 = this.getMousePos(e.targetTouches[1]);
                const currentDistance = Math.sqrt(Math.pow(touch1.x - touch2.x, 2) + Math.pow(touch1.y - touch2.y, 2));
                let n = (this.state.verticalRectNumber - currentDistance / lastTouchDistance * this.state.verticalRectNumber);
                lastTouchDistance = currentDistance;
                if (n > 0) {
                    n = Math.ceil(n);
                } else {
                    n = Math.floor(n);
                }
                scale(n);
            } else {
                move(e.targetTouches[0]);
            }
        };
        overCanvas.addEventListener('touchstart', touchstart);
        overCanvas.addEventListener('touchend', touchend);
        overCanvas.addEventListener('touchcancel', touchcancel);
        overCanvas.addEventListener('touchmove', touchmove);
    }
}

function drawHairline(x, y, currentIndex) {
    x = x || this.lastPos.x;
    y = y || this.lastPos.y;
    var overCtx = this.overCtx;
    overCtx.lineWidth = this.dpr;
    overCtx.strokeStyle = this.colors.subline;
    overCtx.beginPath();
    // 画横线
    overCtx.moveTo(0, y);
    overCtx.lineTo(this.width, y);
    overCtx.stroke();
    // 画竖线
    overCtx.moveTo(x, 0);
    overCtx.lineTo(x, this.height);
    overCtx.stroke();
    overCtx.closePath();

    // 画x轴的坐标
    var currentTime = this.state.times[this.state.startIndex + currentIndex];
    overCtx.textAlign = 'center';
    overCtx.textBaseline = 'bottom';
    overCtx.fillStyle = this.colors.background;
    overCtx.fillRect(x - overCtx.measureText(currentTime).width * 0.5 - 10 * this.dpr, this.height - 50, overCtx.measureText(currentTime).width + 20 * this.dpr, 50 - this.dpr);
    overCtx.strokeStyle = this.colors.textFrameColor;
    overCtx.strokeRect(x - overCtx.measureText(currentTime).width * 0.5 - 10 * this.dpr, this.height - 50, overCtx.measureText(currentTime).width + 20 * this.dpr, 50 - this.dpr);
    overCtx.fillStyle = this.colors.textColor;
    overCtx.fillText(this.option.overTimeFilter(currentTime), x, this.height - 7);

    // 画y轴坐标
    // 根据intervalY计算y轴显示的最大和最小的数值
    const { max, min } = computAxis.call(this);
    let view = this.views[1];
    let w = this.width - view.x;
    overCtx.textAlign = 'right';
    overCtx.textBaseline = 'middle';
    overCtx.fillStyle = this.colors.background;
    overCtx.fillRect(view.x, y - 16, w, 32);
    overCtx.strokeStyle = this.colors.textFrameColor;
    overCtx.strokeRect(view.x, y - 16, w, 32);
    overCtx.fillStyle = this.colors.textColor;

    const csiStr = this.option.csi2[0];
    let flag = this.isInLineView({ x, y });
    if (flag === 0) {
        const yText = max - (max - min) * (y - view.y) / view.h;
        overCtx.fillText(this.option.overYFilter(yText), view.x + view.w, y);
    } else if (flag === 1) {
        view = this.views[3];
        if (csiStr === 'volume') {
            const yText = (1 - (y - view.y) / view.h) * (this.csiYAxisSector[0] - this.csiYAxisSector[1]);
            overCtx.fillText(this.setDP(yText), view.x + view.w, y);
        }
        if (csiStr === 'macd') {
            const yText = this.csiYAxisSector[1] * (y - view.y) / view.h + this.csiYAxisSector[0] * (1 - (y - view.y) / view.h);
            overCtx.fillText(this.setDP(yText), view.x + view.w, y);
        }
    }
    this.select.call(this, {
        time: this.state.times[currentIndex + this.state.startIndex],
        start: this.state.start[currentIndex + this.state.startIndex],
        hi: this.state.hi[currentIndex + this.state.startIndex],
        lo: this.state.lo[currentIndex + this.state.startIndex],
        close: this.state.close[currentIndex + this.state.startIndex],
        volume: this.state.volume[currentIndex + this.state.startIndex],
        [this.option.csi + 7]: this.state[this.option.csi + 7][currentIndex + this.state.startIndex],
        [this.option.csi + 30]: this.state[this.option.csi + 30][currentIndex + this.state.startIndex],
    }, 0);

    let ma7Color = this.colors.ma7Color;
    let ma30Color = this.colors.ma30Color;
    if (csiStr === 'volume') {
        this.select.call(this, {
            volume: this.state.volume[currentIndex + this.state.startIndex],
            ma7: this.state.volumeMa7[currentIndex + this.state.startIndex],
            ma30: this.state.volumeMa30[currentIndex + this.state.startIndex],
        }, 1);
    }
    if (csiStr === 'macd') {
        this.select.call(this, {
            dif: this.state.dif[currentIndex + this.state.startIndex],
            dea: this.state.dea[currentIndex + this.state.startIndex],
            macd: this.state.macd[currentIndex + this.state.startIndex],
        }, 1);
    }
}
