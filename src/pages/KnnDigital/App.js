import React from 'react';
import DrawingArea from '../../components/DrawingArea';
import PredictArea from '../../components/PredictArea';
import './App.css';
import KNN from '../../algorithm/KNN';
import minist from 'mnist';

class App extends React.Component {
  constructor( props ) {
    super(props)
    let set = minist.set(10000, 500);
    // {
    //   input: [ 0, 0, 0, 1, 1, ... , 0, 0 ],
    //   // a 784-length array of floats representing each pixel of the 28 x 28 image, normalized between 0 and 1
    //   output: [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ]
    //   // a 10-length binary array that tells which digits (from 0 to 9) is in that image
    // }
    let train_set = set.training;
    let knn_set = train_set.map(( value ) => {
      let input = value.input;
      let output = value.output;
      let returnInput = input.map(i => i || 0 ? 1 : 0)
      let returnOutput = output.lastIndexOf(1);
      return {
        input: returnInput,
        output: returnOutput,
      }
    })

    let test_set = set.test;
    let evaluate_set = test_set.map(( value ) => {
      let input = value.input;
      let output = value.output;
      let returnInput = input.map(i => i || 0 ? 1 : 0)
      let returnOutput = output.lastIndexOf(1);
      return {
        input: returnInput,
        output: returnOutput,
      }
    })


    let knn_classification = new KNN(15);
    knn_classification.fit(knn_set, 'input', 'output').then(
        () => {
          // 评估模型
          // console.time('evaluate2')
          // knn_classification.evaluate(evaluate_set);
          // console.timeEnd('evaluate2')
        }
    )



    this.state = {
      activeItem: -1,
      knn_classification: knn_classification,
    }
  }

  render() {
    const {activeItem, knn_classification} = this.state;
    return (
      <div className="container">
        <DrawingArea
          knn_classification={knn_classification}
        ></DrawingArea>
        <PredictArea activeItem={activeItem}></PredictArea>
      </div>
    );
  }

}

export default App;
