import React from 'react';
import ClassNames from 'classnames';
import * as _ from 'lodash';
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import './index.css';

let testPrediction = false;
let startPrediction = false;
let training = true;
let NUM_CLASSES = 5;
let IMAGE_SIZE = 300;
let TOPK = 10;
let classes = ['normal', 'right', 'left', 'down', 'up'];
let letterIndex = 0;

class EnhanceLearning extends React.Component {
    constructor() {
        super();
        this.training = -1; // -1 when no class is being trained
        this.videoPlaying = false;

        this.controller = _.throttle(this.uniControl.bind(this), 1000);
        console.log(this.controller)
        this.state = {
            currIndex: 2,
            snakePoint: [0, 1, 2],
            blockPoint: [9, 24, 95, 69, 52],
            showPredict: false,
            smallBlockArr: Object.keys(Array.from({length: 100})).map(function (item) {
                return {id: parseInt(item), status: false};
            }),
            rightMessage: '',
            leftMessage: '',
            downMessage: '',
            upMessage: '',
            normalMessage: '',
        }
    }

    componentDidMount() {
        navigator.mediaDevices.getUserMedia({video: true, audio: false})
            .then((stream) => {
                if (this.video) {
                    this.video.srcObject = stream;
                    this.video.width = IMAGE_SIZE;
                    this.video.height = IMAGE_SIZE;

                    this.video.addEventListener('playing', () => this.videoPlaying = true);
                    this.video.addEventListener('paused', () => this.videoPlaying = false);
                }
            })

        this.bindEvent();
        this.bindPage();
        // this.bindKeyboardEvent()
    }


    bindPage = async () => {
        this.knn = knnClassifier.create();
        this.mobilenet = await mobilenetModule.load();

        this.start();
    };

    start = () => {
        if (this.timer) {
            this.stop();
        }
        this.video.play();
        this.timer = requestAnimationFrame(this.animate.bind(this));
    };

    stop = () => {
        this.video.pause();
        cancelAnimationFrame(this.timer);
    };

    animate = async () => {
        if (this.videoPlaying) {
            const image = tf.browser.fromPixels(this.video);

            let logits;
            const infer = () => this.mobilenet.infer(image, 'conv_preds');

            if (this.training != -1) {
                logits = infer();
                this.knn.addExample(logits, this.training)
            }

            const numClasses = this.knn.getNumClasses();

            if (testPrediction) {
                training = false;
                if (numClasses > 0) {

                    // If classes have been added run predict
                    logits = infer();
                    const res = await this.knn.predictClass(logits, TOPK);

                    for (let i = 0; i < NUM_CLASSES; i++) {
                        const exampleCount = this.knn.getClassExampleCount();
                        if (res.classIndex == i) {
                            if (startPrediction) {
                                console.log(this.controller)
                                this.controller(classes[res.classIndex])
                            }
                        }

                        // Update info text
                        if (exampleCount[i] > 0) {
                            this.setState({
                                [`${classes[i]}Message`]: `${exampleCount[i]}：${res.confidences[i] * 100}%`,
                            })
                        }
                    }
                }
            }


            if (training) {
                // The number of examples for each class
                const exampleCount = this.knn.getClassExampleCount();

                for (let i = 0; i < NUM_CLASSES; i++) {
                    // Update info text
                    if (exampleCount[i] > 0) {
                        this.setState({
                            [`${classes[i]}Message`]: `${exampleCount[i]}张样本`,
                        })

                    }
                }
            }


            // Dispose image when done
            image.dispose();
            if (logits != null) {
                logits.dispose();
            }
        }
        this.timer = requestAnimationFrame(this.animate.bind(this));
    }


    uniControl(command) {
        console.log(command)
        let preIndex = this.state.currIndex;
        switch (command) {
            case 'right':
                preIndex += 1;
                break;
            case 'left':
                preIndex -= 1;
                break;
            case 'down':
                preIndex += 10;
                break;
            case 'up':
                preIndex -= 10;
                break;
                case 'normal':
                    preIndex += 0;
                break;
        }



        let PresSnakePoint = this.state.snakePoint;
        let PreBlockPoint = this.state.blockPoint;
        let headPoint = PresSnakePoint[PresSnakePoint.length - 1]
        switch (command) {
            case "down":
                headPoint += 10;
                break;
            case "up":
                headPoint -= 10;
                break;
            case "left":
                headPoint -= 1;
                break;
            case "right":
                headPoint += 1;
                break;
            case "normal":
                headPoint += 0;
                break;
        }

        if (headPoint < 100 && headPoint >= 0 && command != 'normal') {
            // 去掉尾部
            PresSnakePoint.shift();
            PresSnakePoint.push(headPoint);
            console.log(PresSnakePoint);
        }

        if(PreBlockPoint.indexOf(headPoint) !== -1) {
            let index = PreBlockPoint.indexOf(headPoint)
            PreBlockPoint.splice(index, 1)
            PresSnakePoint.unshift(PresSnakePoint[0]-1)
        }



        this.setState({
            snakePoint: PresSnakePoint,
            currIndex: headPoint,
        })
    };

    bindEvent = () => {
        let btnArr = document.getElementsByClassName('trainBtn');

        if (!btnArr && !btnArr.length) {
            return;
        }

        console.log('绑定事件')

        for (let i = 0; i < btnArr.length; i++) {
            let button = btnArr[i];
            button.addEventListener('mousedown', () => this.training = i);
            button.addEventListener('touchstart', () => this.training = i);
            button.addEventListener('mouseup', () => this.training = -1);
            button.addEventListener('touchend', () => this.training = -1);
        }
    }

    startTrain = () => {
        testPrediction = true;
    };

    startPredict = () => {
        startPrediction = true;
        this.setState({
            showPredict: true,
        })
    };

    bindKeyboardEvent = () => {
        document.onkeydown = (event) => {
            let pointer = '';
            let key = event.keyCode;
            switch (key) {
                case 40:
                    pointer = 'down';
                    break;
                case 37:
                    pointer = 'left';
                    break;
                case 38:
                    pointer = 'top';
                    break;
                case 39:
                    pointer = 'right';
                    break;
            }

            console.log(pointer)

            let PresSnakePoint = this.state.snakePoint;
            let PreBlockPoint = this.state.blockPoint;
            let headPoint = PresSnakePoint[PresSnakePoint.length - 1]
            switch (pointer) {
                case "down":
                    headPoint+=10;
                    break;
                case "top":
                    headPoint-=10;
                    break;
                case "left":
                    headPoint-=1;
                    break;
                case "right":
                    headPoint+=1;
                    break;
            }

            if (headPoint < 100 && headPoint >= 0) {
                // 去掉尾部
                PresSnakePoint.shift();
                PresSnakePoint.push(headPoint)
                console.log(PresSnakePoint)
            }

            if(PreBlockPoint.indexOf(headPoint) !== -1) {
                let index = PreBlockPoint.indexOf(headPoint)
                PreBlockPoint.splice(index, 1)
               PresSnakePoint.unshift(PresSnakePoint[0]-1)
            }



            this.setState({
                snakePoint: PresSnakePoint,
                currIndex: headPoint,
            })
        }

        this.setState({
            showPredict: true,
        })
    }

    render() {
        const {showPredict, smallBlockArr, rightMessage, leftMessage,normalMessage, downMessage, upMessage, currIndex, snakePoint, blockPoint} = this.state;
        return (
            <div className="enhance">
                <h6>knn demo</h6>
                <div className="video-container">
                    <video ref={(node) => {
                        this.video = node
                    }} autoPlay playsInline></video>
                </div>
                {
                    !showPredict && (
                        <div className="train-block">
                            <div className="train-btn-group">
                                <div className="normal-content">
                                    <button id={'normal'} className="btn trainBtn">正常</button>
                                    <p className="message">{normalMessage}</p>
                                </div>
                                <div className="right-content">
                                    <button id={'right'} className="btn trainBtn">向右</button>
                                    <p className="message">{rightMessage}</p>
                                </div>

                                <div className="left-content">
                                    <button id={'left'} className="btn trainBtn">向左</button>
                                    <p className="message">{leftMessage}</p>
                                </div>

                                <div className="down-content">
                                    <button id={'down'} className="btn trainBtn">向下</button>
                                    <p className="message">{downMessage}</p>
                                </div>
                                <div className="up-content">
                                    <button id={'up'} className="btn trainBtn">向上</button>
                                    <p className="message">{upMessage}</p>
                                </div>
                            </div>

                            <div className="confirm-btn-group">
                                <button className="btn train" onClick={() => {
                                    this.startTrain();
                                }}>训练
                                </button>
                                <button className="btn start" onClick={() => {
                                    this.startPredict();
                                }}>开始
                                </button>
                            </div>
                        </div>
                    )
                }

                {
                    !!showPredict && (
                        <div className="predict-block">
                            <div>{currIndex}</div>
                            <div className="predict">
                                {
                                    smallBlockArr.map(
                                        (value) => <div key={value.id}
                                                        className={ClassNames(["small-block", {
                                                            "selected": snakePoint.indexOf(value.id) !== -1,
                                                            "block": blockPoint.indexOf(value.id) !== -1,
                                                        }])}></div>)
                                }
                            </div>
                        </div>
                    )
                }


            </div>
        )

    }
}

export default EnhanceLearning;