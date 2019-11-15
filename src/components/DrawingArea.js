import React, { Component, Fragment } from 'react'
import $ from 'jquery';

class DrawingArea extends Component {

  constructor( props ) {
    super(props);
    this.canvas = null;
    this.paint=null;
    this.startX = 0;
    this.startY = 0;
    this.drawWidth = 280;
    this.drawHeight = 280;
    this.drawStatus = false;
    this.color = "black";
    this.width = 32;
    this.waitTimer = null;
    this.state = {}
  }

  componentDidMount() {
    this.init()
    this.drawMonitor()
  }

  init = () => {
    for ( let i = 0; i < $('.statisticalChartItem').length; i++ ) {
      setTimeout(() => {
        $($('.statisticalChartItem')[ i ]).addClass('predictActive')
      }, 100 * i)
    }
    setTimeout(() => {
      for ( let i = ( '.statisticalChartItem' ).length - 1; i >= 0; i-- ) {
        setTimeout(() => {
          $($('.statisticalChartItem')[ i ]).removeClass('predictActive')
        }, 100 * i)
      }
    }, 1000)

    this.canvas = $('#drawCanvas')[ 0 ];
    this.canvas.width = this.drawWidth;
    this.canvas.height = this.drawHeight;
    this.paint = this.canvas.getContext("2d");
    //背景色
    this.paint.fillStyle = "#fff";
    this.paint.fillRect(0, 0, this.drawWidth, this.drawHeight);
    $('.clear').on('click', () => {
      this.init()
    })
  }

  //每次手离开 向算法里推送本次绘图
  stackImgs = () => {
    this.waitTimer = setTimeout(() => {
      let mycanvas = document.getElementById("drawCanvas");
      let predictCanvas = document.createElement('canvas');
      predictCanvas.width = 28
      predictCanvas.height = 28
      let ctx = predictCanvas.getContext('2d');
      ctx.drawImage(mycanvas, 0, 0, 28, 28)
      ctx.scale(0.1, 0.1)
      let predictImageData = ctx.getImageData(0, 0, 28, 28)
      // console.log(predictImageData)
      // 将预测数据色值 R 取出，色值除以 255，得到新的 ArrayBuffer

      //
      const predictImageBuffer =[];
      for ( let i = 0; i < predictImageData.data.length / 4; i++ ) {
        predictImageBuffer[ i ] = predictImageData.data[ 4 * i ] / 255 === 1 ? 0 : 1;
      }
      console.log('预测时间')
      console.time('predict')
      let predictResult = this.props.knn_classification.predict(predictImageBuffer)
      console.timeEnd('predict')

      // console.log(this.props.knn_classification)
      console.log(predictResult)
      $($('.statisticalChartItem')[ predictResult.result ]).addClass('predictActive')
    }, 500)

  }

  drawMonitor = () => {
    //给画笔添加上个事件一个点击开始 ， 点击后移动 ，点击事件结束
    $(this.canvas).on("mousedown mousemove mouseup", ( event ) => {
      let endX;
      let endY;
      switch ( event.type ) {
        case "mousedown":
          // 开启绘画状态
          // console.log(event)
          this.drawStatus = true;
          //记录触屏的第一个点
          this.startX = event.offsetX;
          this.startY = event.offsetY;
          // 清空笔画计时器
          clearTimeout(this.waitTimer);
          break;
        case "mousemove":
          if ( this.drawStatus ) {
            // console.log(event)
            event.preventDefault();
            endX = event.offsetX;
            endY = event.offsetY;

            //画下线段
            this.paint.beginPath();
            this.paint.lineJoin = 'round';
            this.paint.lineCap = 'round';
            this.paint.moveTo(this.startX, this.startY);
            this.paint.lineTo(endX, endY);
            this.paint.strokeStyle = this.color;
            this.paint.lineWidth = this.width;
            this.paint.stroke();
            this.paint.closePath();

            this.startX = endX;
            this.startY = endY;
          }
          break;
        //手离开触屏是橡皮檫隐藏
        case "mouseup":
          // console.log(event)
          // 关闭绘画状态
          this.drawStatus = false;
          this.stackImgs();
          break;
      }
    });
  }

  render() {
    return (
      <div className="drawContainer">
        <h6>绘制区域</h6>
        <canvas id="drawCanvas" style={{width: '320px', height: '320px'}}></canvas>
        <button className="clear">清除</button>
      </div>
    )
  }
}

export default DrawingArea;
