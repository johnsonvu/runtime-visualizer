import React from 'react';
import './App.css';
import {ForceGraph2D} from 'react-force-graph';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
// import MetadataTable from './MetadataTable'
import _ from 'lodash';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.graphRef = React.createRef();

    this.state = {
      data: {
        nodes: [],
        links: []
      },
      currentNode: null,
      familyNodes: [],
      familyLinks: []
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

  isASourceNode(nodeId) {
    if(this.state.data.links) {
      for(var i = 0; i < this.state.data.links.length; i++) {
        if(this.state.data.links[i].source.id === nodeId) {
          // console.log("source id " + this.state.data.links[i].source.id);
          // console.log("target id " + this.state.data.links[i].target.id);
          this.state.familyLinks.push(this.state.data.links[i]); // keep track of all the links in the path
          return this.state.data.links[i].target.id; // next node we need to look up
        }
      }
    }
    return null;
  }

  selectCurrentNode(node) {
    this.setState({currentNode: node});
    this.setState({familyNodes: []}); // clear family nodes
    this.setState({familyLinks: []}); // clear family links

    // builds a list of the path to leaf child
    if(node) {
      // add root
      var currentNode = node.id;
      this.state.familyNodes.push(currentNode);
      
      // determine family nodes
      currentNode = this.isASourceNode(currentNode);
      while(currentNode != null) {
        this.state.familyNodes.push(currentNode);
        currentNode = this.isASourceNode(currentNode);
      }
    }
  }

  componentDidMount() {
    this.requestData();
    // applies the distance to the links dynamically after mounting
    const graph = this.graphRef.current;
    graph.d3Force('link').distance(link => link.distance).iterations(30);
  }

  // check if the node is a child of the current node
  isChild(nodeId) {
    const familyNodes = this.state.familyNodes;
    for(var i=0; i<familyNodes.length;i++) {
      if(nodeId === familyNodes[i]) {
        return true;
      }
    }
    return false;
  }

  // check if the node is a child of the current node
  isChildLink(link) {
    for(var i=0; i<this.state.familyLinks.length;i++) {
      if(link === this.state.familyLinks[i]) {
        return true;
      }
    }
    return false;
  }
  
  render() {
    const renderNode = (node, ctx, global) => {
      const isChild = this.isChild(node.id);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // node name
      ctx.fillStyle = "black";
      ctx.font = "bold 7px Georgia";
      ctx.fillText(node.name, node.x, (isChild && node.metadata) ? node.y-(node.val/3) : node.y);
      
      // metadata
      if(isChild) {
        ctx.font = "bold 5px Georgia";
        var i = 1;
        _.forEach(node.metadata, function(val, key) {
          // get width of text
          var txt = key +": "+val;
          var width = ctx.measureText(txt).width;
          // render metadata bg
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = "gray";
          ctx.fillRect(node.x-width/2, node.y-(node.val/3)+7*i-2.5, width, 6);

          // render metadata text
          ctx.globalAlpha = 1;
          ctx.fillStyle = "black";
          ctx.fillText(txt, node.x, node.y-(node.val/3)+7*i);
          i++;
        });

        // highlight ring
        ctx.beginPath();
        const r = Math.sqrt(Math.max(0, node.val || 1)) * 4 + 2; // from force-graph calculations
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.stroke();
      }
    }

    const renderLink = (link, ctx, global) => {
      if(link.name && this.isChildLink(link)) {
        const MAX_FONT_SIZE = 4;
        const LABEL_NODE_MARGIN = 4 * 1.5;
        const start = link.source;
        const end = link.target;
        // ignore unbound links
        if (typeof start !== 'object' || typeof end !== 'object') return;
        
        // calculate label positioning
        const textPos = Object.assign(...['x', 'y'].map(c => ({
          [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
        })));
        const relLink = { x: end.x - start.x, y: end.y - start.y };
        const maxTextLength = Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) - LABEL_NODE_MARGIN * 2;
        let textAngle = Math.atan2(relLink.y, relLink.x) + (Math.PI/2);

        // keeps labels upright
        if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
        if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

        const label = link.name;
        // estimate fontSize to fit in link length
        ctx.font = '1px Georgia';
        const fontSize = Math.min(MAX_FONT_SIZE, maxTextLength / ctx.measureText(label).width);
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

        // draw link label
        ctx.save();
        ctx.translate(textPos.x, textPos.y);
        ctx.rotate(textAngle);
        ctx.fillStyle = 'rgba(3, 3, 3, 0.6)';
        ctx.fillRect(- bckgDimensions[0] / 2, - bckgDimensions[1] / 2, ...bckgDimensions);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'darkgrey';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
    }

    return (
      <Grid container spacing={1}>
        <Grid container item xs={10} spacing={0}>
          <div className="App">
            <ForceGraph2D 
              ref={this.graphRef}
              graphData={this.state.data} 
              linkWidth="width"
              linkDirectionalArrowLength={10}
              linkDirectionalArrowRelPos={1}
              linkDirectionalParticles={(link) => this.isChildLink(link) ? 5 : 1}
              nodeLabel={() => ''}
              nodeCanvasObject={renderNode}
              nodeCanvasObjectMode={()=> 'after'}
              linkLabel={() => ''}
              linkCanvasObject={renderLink}
              linkCanvasObjectMode={()=> 'after'}
              onNodeHover={(node, prevNode) => {this.selectCurrentNode(node)} }
            />
          </div>
        </Grid>
        {/* <Grid container item xs={2} spacing={0}>
          { (this.state.currentNode) && <div id="metadata"><MetadataTable node={this.state.currentNode}/></div>}
        </Grid> */}
      </Grid>
    );
  }
}

export default App;
