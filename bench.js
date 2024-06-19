import {UI} from "../../stemjs/src/ui/UIBase.js";
import {SVG} from "../../stemjs/src/ui/svg/SVGBase.js";
import {deepCopy} from "../../stemjs/src/base/Utils.js";

import {VisualList} from "./CSAVisualList.jsx";


class Arrow extends SVG.Polygon {
    getDefaultOptions() {
        return {
            x: 0,
            y: 0,
            length: 10
        }
    }

    setOptions(options) {
        super.setOptions(options);
        let arrowShaftLength = this.options.length * 0.6;
        let arrowHeadLength = this.options.length * 0.3;
        let arrowShaftWidth = this.options.length * 0.1;
        let arrowHeadWidth = this.options.length * 0.4;
        let spacing = this.options.length * 0.05;
        let startX = this.options.x + spacing;
        let startY = this.options.y - arrowShaftWidth / 2;
        this.options.points = [
            {x: startX, y: startY},
            {x: startX + arrowShaftLength, y: startY},
            {x: startX + arrowShaftLength, y: startY - (arrowHeadWidth - arrowShaftWidth)/2},
            {x: startX + arrowShaftLength + arrowHeadLength, y: startY + arrowShaftWidth/2},
            {x: startX + arrowShaftLength, y: startY + arrowShaftWidth + (arrowHeadWidth - arrowShaftWidth)/2},
            {x: startX + arrowShaftLength, y: startY + arrowShaftWidth},
            {x: startX, y: startY + arrowShaftWidth}
        ];
    }

    setCoords(x, y) {
        this.options.x = x;
        this.options.y = y;
        // TODO(@mikester): Why doesn't simple this.redraw() work?
        this.setOptions(this.options);
        this.redraw();
    }
}

class AdjacencyList extends SVG.Group {
    getDefaultOptions() {
        return {
            box: {
                x: 0,
                y: 0,
                width: 1000,
                height: 1000
            },
            visualListOptions: VisualList.prototype.getDefaultOptions()
        };
    }

    render() {
        this.options.children = [];

        // Name shortener
        let elementOptions = this.options.visualListOptions.elementOptions;

        // Create the main label
        this.options.children.push(<SVG.Text ref="mainLabel"
                                                text={this.options.mainLabel}
                                                fontSize={elementOptions.fontSize}
                                                fill={elementOptions.color}
                                                stroke={elementOptions.color}
                                                strokeWidth={elementOptions.textStrokeWidth}
                                                x={this.options.box.x + elementOptions.cellWidth / 2}
                                                y={this.options.box.y + elementOptions.cellHeight / 2}
        />);

        // Create the main arrow
        let arrowOptions = {
            x: this.options.box.x + elementOptions.cellWidth,
            y: this.options.box.y + elementOptions.cellHeight / 2,
            length: elementOptions.lineLength
        };
        this.options.children.push(<Arrow ref="arrow" {...arrowOptions}/>);

        // Set visual list box
        this.options.visualListOptions.box = {
            x: this.options.box.x + elementOptions.cellWidth * 1.5 + elementOptions.lineLength,
            y: this.options.box.y,
            width: this.options.box.width - elementOptions.cellWidth * 1.5 - elementOptions.lineLength,
            height: this.options.box.height
        };

        // Create the visual list
        this.options.children.push(<VisualList ref="visualList"
                                                    labels={this.options.labels}
                                                    {...this.options.visualListOptions}/>);
        return this.options.children;
    }

    getDesiredHeight() {
        let lastCell = this.visualList.elements.last();
        if (typeof lastCell === "undefined") {
            return 0;
        }
        return lastCell.options.coords.y + lastCell.options.cellHeight - this.options.box.y;
    }

    getCell(cellLabel) {
        return this.visualList.getCell(cellLabel);
    }

    setBox(box) {
        let elementOptions = this.options.visualListOptions.elementOptions;
        this.options.box = box;

        this.mainLabel.setPosition(
            this.options.box.x + elementOptions.cellWidth / 2,
            this.options.box.y + elementOptions.cellHeight / 2
        );

        this.arrow.setCoords(
            this.options.box.x + elementOptions.cellWidth,
            this.options.box.y + elementOptions.cellHeight / 2
        );

        this.visualList.setBox({
            x: this.options.box.x + elementOptions.cellWidth * 1.5 + elementOptions.lineLength,
            y: this.options.box.y,
            width: this.options.box.width - elementOptions.cellWidth * 1.5 - elementOptions.lineLength,
            height: this.options.box.height
        });
    }
}

export class AdjacencyLists extends SVG.Group {
    getDefaultOptions() {
        return {
            box: {
                x: 0,
                y: 0,
                width: 1000,
                height: 1000
            },
            listSpacing: 20,
            directed: false,
            indexType: "0",
            visibleLists: "all",
            listOptions: AdjacencyList.prototype.getDefaultOptions()
        }
    }

    getNodeLabel(nodeIndex) {
        if (this.options.indexType === "0") {
            return nodeIndex;
        } else if (this.options.indexType === "1") {
            return nodeIndex + 1;
        } else {
            return this.nodes[nodeIndex].label || "N/A";
        }
    }

    getAdjacentLabels(nodeIndex) {
        let result = [];
        for (let i = 0; i < this.options.edges.length; i += 1) {
            let edgeData = this.options.edges[i];
            if (edgeData.source === nodeIndex) {
                result.push(this.getNodeLabel(edgeData.target));
            } else if (edgeData.target === nodeIndex && !edgeData.directed === true && !this.options.directed) {
                result.push(this.getNodeLabel(edgeData.source));
            }
        }
        return result;
    }

    render() {
        this.lists = [];
        for (let i = 0; i < this.options.nodes.length; i += 1) {
            let listOptions = deepCopy({}, this.options.listOptions);
            deepCopy(listOptions.box, this.options.box);
            this.lists.push(
                <AdjacencyList
                    mainLabel={this.getNodeLabel(i)}
                    labels={this.getAdjacentLabels(i)}
                    {...listOptions}
                />);
        }

        this.options.children = [];
        for (let i = 0; i < this.lists.length; i += 1) {
            let list = this.lists[i];
            this.options.children.push(list);
        }

        return this.options.children;
    }

    setVisibleLists(visibleLists) {
        for (let i = this.options.children.length - 1; i >= 0; i -= 1) {
            let list = this.options.children[i];
            this.eraseChild(list, false);
        }

        this.options.visibleLists = visibleLists;
        if (this.options.visibleLists === "all") {
            for (let i = 0; i < this.lists.length; i += 1) {
                let list = this.lists[i];
                this.insertChild(list, i);
            }
        } else if (Array.isArray(this.options.visibleLists)) {
            for (let i = 0; i < this.options.visibleLists.length; i += 1) {
                let list = this.lists[this.options.visibleLists[i]];
                this.insertChild(list, i);
            }
        } else if (Number.isInteger(this.options.visibleLists)) {
            let list = this.lists[this.options.visibleLists];
            this.insertChild(list, 0);
        }

        this.recomputeListHeights();
    }
    
    getVisibleLists() {
        return this.options.visibleLists;
    }

    recomputeListHeights() {
        let heightSum = 0;
        for (let i = 0; i < this.options.children.length; i += 1) {
            let list = this.options.children[i];

            list.setBox({
                x: this.options.box.x,
                y: this.options.box.y + heightSum,
                width: this.options.box.width,
                height: this.options.box.height
            });

            let listHeight = list.getDesiredHeight();
            list.options.box.height = listHeight;

            heightSum += this.options.listSpacing + listHeight;
        }
    }

    getCell(listIndex, cellLabel) {
        return this.lists[listIndex].getCell(cellLabel);
    }

    getPopupPosition(listIndex, cellLabel, deltaX=0, deltaY=0) {
        let result;
        let cellCoords = this.getCell(listIndex, cellLabel).getCoords();
        result = {
            x: cellCoords.x + deltaX,
            y: cellCoords.y + deltaY
        };
        return result;
    }

    redraw() {
        // Draw the adjacency lists
        super.redraw();
        this.setVisibleLists(this.options.visibleLists);
    }
}

export class AdjacencyListsSVG extends SVG.SVGRoot {
    getDefaultOptions() {
        return {
            width: 1000,
            height: 1000,
            marginLeft: 20,
            marginTop: 40,
            directed: false
        }
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setStyle("height", this.options.height + "px");
        attr.setStyle("width", this.options.width + "px");
        return attr;
    }

    render() {
        return [<AdjacencyLists ref="adjacencyLists" {...this.options}
            box={{
                x: this.options.marginLeft,
                y: this.options.marginTop,
                width: this.options.width - this.options.marginLeft,
                height:this.options.height - this.options.marginTop}} />];
    }
}
