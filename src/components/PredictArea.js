import React, { Component, Fragment } from 'react'
import classnames from 'classnames';

class PredictArea extends Component {

  constructor( props ) {
    super(props);
    this.state = {
      data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
  }


  render() {
    const {data} = this.state;
    const {activeItem} = this.props;
    return (

      <div className="predictResult">
        <h6>预测结果</h6>
        <div className="statisticalChart">
          {
            data.map(
              (value, index) => (
                <div key={index}
                     className={
                       classnames(
                         ['statisticalChartItem'],
                         {'predictActive': index == activeItem}
                       )}
                ></div>
              )
            )
          }
        </div>
        <div className="statisticalTag">
          {
            data.map(
              value => (
                <div key={value}
                     className="statisticalTagNumber">
                  {value}
                </div>
              )
            )
          }

        </div>
      </div>
    )
  }
}

export default PredictArea;
