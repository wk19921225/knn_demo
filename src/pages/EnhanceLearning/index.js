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
let NUM_CLASSES = 4;
let IMAGE_SIZE = 300;
let TOPK = 10;
let classes = ['right', 'left', 'down', 'normal'];
let letterIndex = 0;

class EnhanceLearning extends React.Component {
    constructor() {
        super();
        this.training = -1; // -1 when no class is being trained
        this.videoPlaying = false;

        this.controller = _.throttle(this.uniControl.bind(this), 1000);
        console.log(this.controller)
        this.state = {
            currIndex: -1,
            showPredict: false,
            smallBlockArr: Object.keys(Array.from({length: 100})).map(function (item) {
                return {id: item, status: false};
            }),
            rightMessage: '',
            leftMessage: '',
            downMessage: '',
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
            case 'normal':
                preIndex += 0;
                break;
        }

        if (preIndex > 100) {
            preIndex = 0
        }

        if (preIndex < 0) {
            preIndex = 100
        }
        console.log(command)

        this.setState({
            currIndex: preIndex,
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
                case 40: pointer = 'down';break;
                case 37: pointer = 'left';break;
                case 38: pointer = 'top';break;
                case 39: pointer = 'right';break;
            }

            console.log(pointer)
            this.setState({
                showPredict: true,
            })
        }
    }

    render() {
        const {showPredict, smallBlockArr, rightMessage, leftMessage, downMessage, normalMessage, currIndex} = this.state;
        return (
            <div className="enhance">
                <h6>knn 增强学习demo</h6>
                <div className="video-container">
                    <video ref={(node) => {
                        this.video = node
                    }} autoPlay playsInline></video>
                </div>
                {
                    !showPredict && (
                        <div className="train-block">
                            <div className="train-btn-group">
                                <div className="right-content">
                                    <button id={'right'} className="btn trainBtn">向右</button>
                                    <p className="message">{rightMessage}</p>
                                </div>

                                <div className="right-content">
                                    <button id={'left'} className="btn trainBtn">向左</button>
                                    <p className="message">{leftMessage}</p>
                                </div>

                                <div className="right-content">
                                    <button id={'down'} className="btn trainBtn">向下</button>
                                    <p className="message">{downMessage}</p>
                                </div>
                                <div className="right-content">
                                    <button id={'normal'} className="btn trainBtn">正常</button>
                                    <p className="message">{normalMessage}</p>
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
                                        (value) => <div key={value.id} className={ClassNames(["small-block", {
                                            "selected": currIndex == value.id,
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