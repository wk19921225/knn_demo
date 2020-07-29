import React from 'react';
import DrawingArea from '../../components/DrawingArea';
import PredictArea from '../../components/PredictArea';
import './App.css';
import KNN from '../../algorithm/KNN';
import mnist from 'mnist';


class App extends React.PureComponent {
  constructor( props ) {
    super(props)
    let set = mnist.set(5000, 500);
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


    let knn_classification = new KNN(10);
    knn_classification.fit(knn_set, 'input', 'output').then(
        () => {
          // 评估模型
          console.time('evaluate2')
          knn_classification.evaluate(evaluate_set);
          console.timeEnd('evaluate2')
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
        <DrawingArea knn_classification={knn_classification}/>
        <PredictArea activeItem={activeItem}/>
      </div>
    );
  }
}

export default App;
