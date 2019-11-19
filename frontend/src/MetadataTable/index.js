import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import _ from 'lodash';
import './index.css';

export default class MetadataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            node: this.props.node
        }
    }

    outputMetadataRows() {
        const emptyData = [
            <TableRow key="empty">
                <TableCell colSpan={2}>No Data</TableCell>
            </TableRow>
        ];

        const rows = [];
        _.forEach(this.state.node.metadata, function(val, key) {
            rows.push(
                    <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{val}</TableCell>
                    </TableRow>
            );
        });
        return (rows.length === 0) ? emptyData : rows;
    }

    render() {
        return (
        <div>
            <div id="metadata-title">Displaying metadata for: {this.state.node.name}</div>
            <Table size="small" aria-label="a dense table">
                <TableHead>
                <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {this.outputMetadataRows()}
                </TableBody>
            </Table>
        </div>
        )
    }
}