import np from "jsnumpy";
// import { getExportFunction } from '../wasm/loadWebAssembly.js';

class KNN {
  constructor( k ) {
    this.k = k;
    this._train_set = null;
    this._lableX = '';
    this._lableY = '';
  }

  static knn_computer = null;

fun = (x) => x*x ;

  load = async () => {
    // const {_knn_computer, _add_knn_computer, _Square} = await getExportFunction('test.wasm');
    // KNN.knn_computer = _knn_computer;
    // KNN.add_knn_computer = _add_knn_computer;
    // KNN.Square = _Square;
  };



  async fit( train_set, lableX, lableY ) {
    this._train_set = train_set;
    this._lableX = lableX;
    this._lableY = lableY;
  }

  // 只能输入一个预测值
  predict( x_predict ) {
    let result=[];
    let knn = this._getKnn(x_predict);
    let dists = knn.dists;
    for ( let i of knn.classify ) {
      result.push({
        label: i,
        value: 0
      });
    }
    dists.map(( item ) => {
      for ( let i of result ) {
        if ( i.label === item.oriData[ this._lableY ] ) {
          i.value++;
          break;
        }
      }
    });
    result.sort(function ( a, b ) {
      return b.value - a.value;
    });
    let predictNum = result[ 0 ].label
    return {
      result: predictNum,
      resultArr: result,
      dists: dists
    };
  }

  evaluate( test_set ) {
    return new Promise(resolve => {
      let accuracyLength = 0;
      let testLength = test_set.length;
      test_set.map(item  => {
        let predictValue = this.predict(item[this._lableX])
        // console.log(predictValue)
        // console.log(item[ this._lableY ])
        if ( predictValue.result == item[ this._lableY ] ) {
          accuracyLength += 1;
        }
      })
      let accuracyRate = parseFloat(accuracyLength / testLength);
      console.log('准确数：' + accuracyLength)
      console.log('测试集长度：' + testLength)
      console.log('准确率：' + accuracyRate)
    })
  }
  _clear() {
    this.result = [];
  }


  // x_test   x_train  1 * 784
  _euclidean(x_test, x_train) {
    let distence = 0;
    let temp = 0;

    /* 计算公式方法 */
    //
    // for ( let index = 0; index < x_train.length; index++ ) {
    //   let x = Number(x_test[ index ]);
    //   let y = Number(x_train[ index ]);
    //   if ( index !== ( x_train.length - 1 ) ) {
    //     temp += ( x - y ) ** 2;
    //   } else {
    //     distence = Math.sqrt(temp + ( x - y ) ** 2);
    //   }
    // }

    /* 使用webassembly */
  //   for ( let index = 0; index < x_train.length; index++ ) {
  //     let x = Number(x_test[ index ]);
  //     let y = Number(x_train[ index ]);
  //     if ( index !== ( x_train.length - 1 ) ) {
  //       temp = temp + KNN.add_knn_computer(x, y);
  //     } else {
  //       distence = Math.sqrt(temp + KNN.add_knn_computer(x, y));
  //     }
  // }

    /* 使用 numpyjs */
// let sum = np.sum(np.abs(np.subtract(x_test, x_train)));
// distence = Math.sqrt(sum);


    /* 真值表 */
for ( let index = 0; index < x_train.length; index++ ) {
  let x = x_test[ index ];
  let y = x_train[ index ];
  if ( index !== ( x_train.length - 1 ) ) {
    temp += x ^ y;
  } else {
    distence = Math.sqrt(temp + (x ^ y));
  }
}
    return distence;

  }

  _getKnn( x_predict ) {
    let dists = [];//存放最接近的
    let classify = [];//分类标识
    this._train_set.map(( item ) => {
      if ( classify.indexOf(item[ this._lableY ]) < 0 ) classify.push(item[ this._lableY ]);
      let result = {};
      result.oriData = item;
      result.distance = this._euclidean(
        x_predict, item[ this._lableX ]
      );
      dists.push(result);
    });
    dists.sort(function ( a, b ) {//排序
      return a.distance - b.distance;
    });
    return {dists: dists.slice(0, this.k), classify: classify};
  }
}

export default KNN;
