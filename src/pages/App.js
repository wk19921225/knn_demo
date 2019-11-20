import React from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import KnnDigital from './KnnDigital/App';
import EnhanceLearning from './EnhanceLearning';

class App extends React.Component{


    render() {
        return (
            <Router>
                <Route exact path="/" component={KnnDigital} />
                <Route path="/transform" component={EnhanceLearning}></Route>

            </Router>
        )
    }
}

export default App;