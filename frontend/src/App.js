import React from 'react';
import './App.css';
import {ForceGraph2D} from 'react-force-graph';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import MetadataTable from './MetadataTable'

class App extends React.Component {
  constructor(props) {
    super(props);

    this.graphRef = React.createRef();

    this.state = {
      data: {
        nodes: [],
        links: []
      },
      currentNode: null
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

  selectCurrentNode(node) {
    this.setState({currentNode: node});
  }

  componentDidMount() {
    this.requestData();
    // applies the distance to the links dynamically after mounting
    const graph = this.graphRef.current;
    graph.d3Force('link').distance(link => link.distance).iterations(30);
  }

  render() {
    return (
      <Grid container spacing={1}>
        <Grid container item xs={10} spacing={0}>
          <div className="App">
            <ForceGraph2D 
              ref={this.graphRef}
              graphData={this.state.data} 
              linkWidth="width"
              onNodeHover={(node, prevNode) => this.selectCurrentNode(node) }
            />
          </div>
        </Grid>
        <Grid container item xs={2} spacing={0}>
          { (this.state.currentNode) && <div id="metadata"><MetadataTable node={this.state.currentNode}/></div>}
        </Grid>
      </Grid>
    );
  }
}

export default App;
