/* Copyright (c) 2015-present, salesforce.com, inc. All rights reserved */
/* Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license */

// # Tree Component (PROTOTYPE)

// THIS IS A PROTOTYPE and does NOT meet accessibility standards. It implements the [Tree design pattern](https://www.lightningdesignsystem.com/components/trees/) in React.

// ## Dependencies

// ### React
import React from 'react';
import PropTypes from 'prop-types';
import Mousetrap from 'mousetrap';

// Child components
import Branch from './private/branch';

// ### classNames
import classNames from 'classnames';

// Similar to React's PropTypes check. When in development mode, it issues errors in the console about properties.
import checkProps from './check-props';

// ## Constants
import { TREE } from '../../utilities/constants';


/**
 * A tree is visualization of a structure hierarchy. A branch can be expanded or collapsed. This is a controlled component, since visual state is present in the `nodes` data.
 */
class Tree extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			nodes: props.nodes,
			visibleNodes: [],
			focusedNode: props.ariaActiveTabIndex || 0
		};
	}

	componentDidMount () {
		console.log('[componentDidMount]', this.state.nodes);
		this._logNodes();

		this.setState({
			visibleNodes: this._getVisibleNodes(this.state.nodes)
		});

		Mousetrap.bind('?', () => { alert('keyboard shortcuts'); });

		Mousetrap.bind('down', () => {
			// console.log('[down] runs!', this._getVisibleNodes(this.state.nodes));

			this.setState({
				visibleNodes: this._getVisibleNodes(this.state.nodes)
			});
			
			let focusedNodeToFind = this.state.focusedNode + 1;
			if (this.state.focusedNode === this.state.visibleNodes.length - 1) {
				focusedNodeToFind = 0;
			}
			console.log('focusedNodeToFind', focusedNodeToFind);
			
			// find the index of the _next_ visible node
			const currentFocusedNodeID = this.state.visibleNodes[this.state.focusedNode];
			const newFocusedNodeID =  this.state.visibleNodes[focusedNodeToFind];
			
			//  =  this.state.visibleNodes.findIndex(function (thang) {
			// 	return thang === this.state.focusedNode;
			// });
			// const newFocusedNodeIndex = currentFocusedNodeIndex + 1;
			
			console.log('currentFocusedNodeID', currentFocusedNodeID);
			console.log('newFocusedNodeID', newFocusedNodeID || 'undefined');
			
			this.setState({
				focusedNode: focusedNodeToFind
			});

		});

		Mousetrap.bind('up', () => {
			console.log('[up] runs!', this._getVisibleNodes(this.state.nodes));

			this.setState({
				visibleNodes: this._getVisibleNodes(this.state.nodes)
			});
			
			let focusedNodeToFind = this.state.focusedNode - 1;
			if (this.state.focusedNode === 0) {
				focusedNodeToFind = this.state.visibleNodes.length - 1;
			}
			console.log('focusedNodeToFind', focusedNodeToFind);
			
			// find the index of the _next_ visible node
			const currentFocusedNodeID = this.state.visibleNodes[this.state.focusedNode];
			const newFocusedNodeID =  this.state.visibleNodes[focusedNodeToFind];
			
			//  =  this.state.visibleNodes.findIndex(function (thang) {
			// 	return thang === this.state.focusedNode;
			// });
			// const newFocusedNodeIndex = currentFocusedNodeIndex + 1;
			
			console.log('currentFocusedNodeID', currentFocusedNodeID);
			console.log('newFocusedNodeID', newFocusedNodeID || 'undefined');
			
			this.setState({
				focusedNode: focusedNodeToFind
			});
		});
	};

	componentWillUnmount () {
		Mousetrap.unbind('?', () => { alert('keyboard shortcuts'); });
		Mousetrap.unbind('down', () => {});
		Mousetrap.unbind('up', () => {});
	}

	_getNodeHtmlIdFromId (id) {
			
	};

	_logNodes () {
		this.state.nodes.forEach((node) => {
			// console.log('node', node);

			// Or, using array extras
			// console.log('node.nodes type', typeof node.nodes);
			// console.log('is undefined?', typeof node.nodes === 'undefined');

			// Object.entries(node).forEach(([key, value]) => {
			// 	console.log(key + ' ' + value);
			// });

			// for (const [key, value] of node) {
			// 	console.log(`${key}'s \`nodes\` is: `, value);
			// }
		});
	};

	_getVisibleNodes (nodesToTest) {
		// the array of nodes we will return
		let visibleNodes = [];

		nodesToTest.forEach((node) => {
			// console.group('[nodesToTest.forEach] node.label', node.label);
			if (
				(
					typeof node.expanded === 'undefined'
					||
					node.expanded === false
				)
				&&
				typeof node.nodes === 'undefined'
			) {
				visibleNodes.push(node.id);
			} else if (
				(
					typeof node.expanded === 'undefined'
					||
					node.expanded === false
				)
				&&
				typeof node.nodes !== 'undefined'
			) {
				visibleNodes.push(node.id);
			} else if (
				node.expanded === true
				&&
				typeof node.nodes !== 'undefined'
				&&
				node.nodes.length > 0
			) {
				visibleNodes.push(node.id);
				visibleNodes = visibleNodes.concat(this._getVisibleNodes(node.nodes));
			} else if (
				node.expanded === false
				&&
				typeof node.nodes !== 'undefined'
				&&
				node.nodes.length > 0
			) {
				visibleNodes.push(node.id);
			} else if (
				node.expanded === true
				&&
				typeof node.nodes === 'undefined'
			) {
				visibleNodes.push(node.id);
			} else if (
				node.expanded === true
				&&
				(
					typeof node.nodes !== 'undefined'
					&&
					node.nodes.length === 0
				)
			) {
				visibleNodes.push(node.id);
			}
			// console.groupEnd();
		});

		// console.log('[_getVisibleNodes] will return: visibleNodes', visibleNodes);
		return visibleNodes;
	}

	render () {
		checkProps(TREE, this.props);

		const {
			ariaActiveTabIndex,
			assistiveText,
			className,
			heading,
			id,
			listClassName,
			nodes,
			onClick,
			onExpandClick,
			onScroll,
			searchTerm,
			listStyle
		} = this.props;

		// One of these is required to pass accessibility tests
		const headingText = assistiveText || heading;

		// Start the zero level branch--that is the tree root. There is no label for
		// the tree root, but is required by all other nodes
		return (
			<div id={id} className={classNames('slds-tree_container', className)} /* role="application" */>
				<h4
					className={classNames('slds-text-title--caps', { 'slds-assistive-text': assistiveText })}
					id={`${id}__heading`}
				>{headingText}</h4>
				<Branch
					getNodes={this.props.getNodes}
					initalClassName={listClassName}
					ariaActiveTabIndex={this.state.ariaActiveTabIndex}
					htmlId={id}
					initialStyle={listStyle}
					level={0}
					node={{ nodes }}
					onClick={onClick}
					onExpandClick={onExpandClick}
					onScroll={onScroll}
					searchTerm={searchTerm}
					treeId={id}
				/>
			</div>
		);
	}
};


Tree.defaultProps = {
	getNodes: (node) => node.nodes
};

// ### Display Name
// Always use the canonical component name as the React display name.
Tree.displayName = TREE;

// ### Prop Types
Tree.propTypes = {
	/**
	 * For users of assistive technology, if set, sets the `tabindex` to `0` for the . Is the HTML `id` attribute of the currently focused `treeitem` node.
	 */
	ariaActiveTabIndex: PropTypes.string,
	/**
	 * For users of assistive technology, if set the heading will be hidden. One of `heading` or `assistiveText` must be set in order to label the tree.
	 */
	assistiveText: PropTypes.string,
	/**
	 * Class names to be added to the container element which has the heading and the `ul.slds-tree` element as children.
	 */
	className: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object,
		PropTypes.string]),
	/**
	 * Class names to be added to the top-level `ul` element of the tree.
	 */
	listClassName: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object,
		PropTypes.string]),
	/**
	 * A function that will be called by every branch to receive its child nodes. The parent `node` object with the branch data is passed into this function: `getNodes(node)`. If your state engine is Flux or Redux, then your tree data structure will probably be flattened or normalized within the store. This will allow you to build out your tree without transversing an actual tree of data and may be more performant.
	 */
	getNodes: PropTypes.func,
	/**
	 * This is the tree's heading and describes its contents. It can be hidden, see `assistiveText`.
	 * */
	heading: PropTypes.string,
	/**
	 * HTML `id` of primary element that has `.slds-tree` on it. This component has a wrapping container element outside of `.slds-tree`.
	 */
	id: PropTypes.string.isRequired,
	/**
	 * Array of items starting at the top of the tree. The required shape is: `{expanded: string, id: string, label: string, selected: string, type: string, nodes: array}`, but only `id` and `label` are required. Use `type: 'branch'` for folder and categories.
	 */
	nodes: PropTypes.array,
	/**
	 * Function that will run whenever an item or branch is clicked.
	 */
	onClick: PropTypes.func.isRequired,
	/**
	 * This function triggers when the expand or collapse icon is clicked.
	 */
	onExpandClick: PropTypes.func.isRequired,
	/**
	 * This function triggers when the top-level `ul` element scrolls. This can be used to implement an "infinite scroll" pattern and update the `nodes` prop accordingly.
	 */
	onScroll: PropTypes.func,
	/**
	 * Highlights term if found in node label. This does not auto-expand branches.
	 */
	searchTerm: PropTypes.string,
	/*
	 * Styles to be added to the top-level `ul` element. Useful for `overflow:hidden`.
	 */
	listStyle: PropTypes.object
};

module.exports = Tree;
