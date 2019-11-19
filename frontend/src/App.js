import React from 'react';
import './App.css';
import {ForceGraph2D} from 'react-force-graph';
import axios from 'axios';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.graphRef = React.createRef();

    this.state = {
      data: {
        nodes: [],
        links: []
      },
    }
  }

  requestData() {
    axios.get(`http://localhost:3001/example`)
      .then(res => {
        const data = res.data;
        console.log(data);
        this.setState({data: data});
    });
  }

  componentDidMount() {
    this.requestData();
    // applies the distance to the links dynamically after mounting
    const graph = this.graphRef.current;
    graph.d3Force('link').distance(link => link.distance).iterations(30);
  }

  render() {
    return (
      <div className="App">
        <ForceGraph2D 
          ref={this.graphRef}
          graphData={this.state.data} 
          linkWidth="width"
        />
      </div>
    );
  }
}

export default App;
