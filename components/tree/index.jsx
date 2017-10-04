/* Copyright (c) 2015-present, salesforce.com, inc. All rights reserved */
/* Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license */

// # Tree Component (PROTOTYPE)

// This component implements the [Tree design pattern](https://www.lightningdesignsystem.com/components/trees/) in React.

// ## Dependencies

// ### React
import React from 'react';
import PropTypes from 'prop-types';
import Mousetrap from 'mousetrap';

// Child components
import Branch from './private/branch';

// ### classNames
import classNames from 'classnames';

import isFunction from 'lodash.isfunction';

import KEYS from '../../utilities/key-code';
import mapKeyEventCallbacks from '../../utilities/key-callbacks';
import { EventUtil } from '../../utilities';

// Similar to React's PropTypes check. When in development mode, it issues errors in the console about properties.
import checkProps from './check-props';

// ## Constants
import { TREE } from '../../utilities/constants';

// ### Prop Types
const propTypes = {
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
	/**
	 * CSS style rules (not classnames!) that will be applied top-level `ul` element. Why? **Hint:** _Useful for things such as `overflow:hidden`_.
	 */
	listStyle: PropTypes.object
};


const defaultProps = {
	getNodes: (node) => node.nodes
};

/**
 * A tree is visualization of a structure hierarchy. A branch can be expanded or collapsed. This is a controlled component, since visual state is present in the `nodes` data.
 */
class Tree extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			nodes: props.nodes,
			flattenedNodes: this._getFlattenedNodes(props.nodes),
			visibleNodes: this._getVisibleNodes(props.nodes),
			visibleFocusedNodeId: props.ariaActiveTabIndex || -1,
			visibleFocusedNodeValue: props.ariaActiveTabValue || -1
		};
		this.handleClick = this.handleClick.bind(this);
		this.handleExpandClick = this.handleExpandClick.bind(this);
	}

	/**
	 * Lifecycle methods
	 */
	componentDidMount () {
		console.log('[componentDidMount]', this.state.nodes);

		/**
		 * **Expected Keyboard Navigation**
		 *
		 * Clicking on a tree item creates a selection
		 * Up and Down arrow keys move :focus and aria-selected. Previous selections are cleared
		 * Right arrow key to expand collapsed node.
		 * Left arrow key to collapse expanded node.
		 * Left arrow key on an end child node, collapses the group and moves :focus and aria-selected to the parent treeitem
		 * Enter performs the default action on an end tree item (if there is one).
		 * Ctrl + Up and Ctrl + Down moves focus. Current selection is maintained
		 * Ctrl + Space will add or remove the currently focused tree item to the selection
		 */

		this._logNodes();

		this.setState({
			visibleNodes: this._getVisibleNodes(this.state.nodes),
			flattenedNodes: this._getFlattenedNodes(this.state.nodes)
		});

		Mousetrap.bind('?', () => { alert('keyboard shortcuts'); });

		Mousetrap.bind('tab', () => {
			console.log('tab!');
			
			let focusedNodeToFind = this.state.visibleFocusedNodeId + 1;
			// Allows "wrapping" of the nodes -- if the visibleFocusedNodeId is bigger than the array of visible nodes we manually set it to 0.
			if (this.state.visibleFocusedNodeId === this.state.visibleNodes.length - 1) {
				focusedNodeToFind = 0;
			}
			
			this.setState({
				visibleFocusedNodeId: focusedNodeToFind,
				visibleFocusedNodeValue: this.state.visibleNodes[focusedNodeToFind]
			});
		});

		Mousetrap.bind('right', (event) => {
			this.handleExpandClick(event, this.props);
		});
		Mousetrap.bind('left', (event) => {
			this.handleExpandClick(event, this.props);
		});

		Mousetrap.bind('down', () => {
			this.handleMoveFocus('next');
		});

		Mousetrap.bind('up', () => {
			this.handleMoveFocus('previous');
		});

		// console.log('[componentDidMount] visibleNodes', this.state.visibleNodes);
		// console.log('[componentDidMount] flattenedNodes', this.state.flattenedNodes);
	}

	componentWillUnmount () {
		Mousetrap.unbind('?', () => { alert('keyboard shortcuts'); });
		Mousetrap.unbind('tab', () => {});
		Mousetrap.unbind('down', () => {});
		Mousetrap.unbind('right', () => {});
		Mousetrap.unbind('left', () => {});
		Mousetrap.unbind('up', () => {});
	}

	handleMoveFocus = (direction) => {
		let focusedNodeToFind;

		// console.log("direction !== 'next' && direction !== 'previous'", direction !== 'next' && direction !== 'previous');

		if (direction !== 'next' && direction !== 'previous') {
			return;
		} else 	if (direction === 'next') {
			focusedNodeToFind = this.state.visibleFocusedNodeId + 1;
			// Allows "wrapping" of the nodes -- if the visibleFocusedNodeId is bigger than the array of visible nodes we manually set it to 0.
			if (this.state.visibleFocusedNodeId === this.state.visibleNodes.length - 1) {
				focusedNodeToFind = 0;
			}
		} else if (direction === 'previous') {
			focusedNodeToFind = this.state.visibleFocusedNodeId - 1;
			// Allows "wrapping" of the nodes -- if the visibleFocusedNodeId is 0, we manually set it to the last node in visible nodes.
			if (this.state.visibleFocusedNodeId === 0) {
				focusedNodeToFind = this.state.visibleNodes.length - 1;
			}
		}

		this.setState({
			visibleFocusedNodeId: focusedNodeToFind,
			visibleFocusedNodeValue: this.state.visibleNodes[focusedNodeToFind]
		});
	};


	_getNodeHtmlIdFromId (id) {
			
	}
	
	handleClick = (event, props) => {
		if (isFunction(this.props.onClick)) {
			this.props.onClick(event, {
				node: props.node,
				select: !props.node.selected,
				treeIndex: props.treeIndex
			});
		}
		
		this.setState({
			visibleNodes: this._getVisibleNodes(this.state.nodes)
		});
	};

	getTreeNodeById (nodeId, theObject = this.state.nodes) {
		let result = null;
		let found = false;

		if (theObject instanceof Object && 'id' in theObject && theObject.id === nodeId) {
			return theObject;
		} else 	if (theObject instanceof Array) {
			for (let nodesIndex = 0; nodesIndex < theObject.length; nodesIndex++) {
				result = this.getTreeNodeById(nodeId, theObject[nodesIndex]);
				if (result instanceof Object && result.id === nodeId) {
					break;
				}
			}
		} else {
			for (const [key, value] of Object.entries(theObject)) {
				if (key === 'id' && theObject[key] === nodeId) {
					found = true;
					result = theObject;
					break;
				} else if (theObject[key] instanceof Object || theObject[key] instanceof Array) {
					result = this.getTreeNodeById(nodeId, theObject[key]);
				}
			}
		}
		return result;
	}

	
	handleExpandClick = (event, props) => {
		let theNode;
		let newVisibleFocusedNodeId;
		let newVisibleFocusedNodeValue;
		let newExpandValue;
		let doTheExpand = true;
		let overrideDoTheExpand = true;
		let isFromMouse = false;

		if (props.node instanceof Object) {
			/**
			 * If we pass in a `node` in props it is **for sure from a mouse click**, not from a keyboard shortcut.
			 */
			isFromMouse = true;

			/**
			 * Set `theNode` by the passed in node's id.
			 */
			theNode = this.getTreeNodeById(props.node.id);
			
			// We got one... so we'll need to set `visibleFocusedNodeId` and `visibleFocusedNodeValue` in state.
			
			// First we'll figure out where in the `visibleNodes` array the new `visibleFocusedNodeValue` is.
			newVisibleFocusedNodeId = this.state.visibleNodes.indexOf(props.node.id);
			newVisibleFocusedNodeValue = props.node.id;
		} else if (this.state.visibleFocusedNodeValue !== -1) {
			// ...so it was from keyboard shortcut, not from a mouse click.
			theNode = this.getTreeNodeById(this.state.visibleFocusedNodeValue);
			newVisibleFocusedNodeId = this.state.visibleNodes.indexOf(this.state.visibleFocusedNodeValue);
			newVisibleFocusedNodeValue = this.state.visibleFocusedNodeValue;
		}

		if (event.key === 'ArrowRight') {
			/**
			 * `newExpandValue` is _always_ true when we hit the right arrow key.
			 */
			newExpandValue = true;
		} else if (event.key === 'ArrowLeft') {
			/**
			 * `newExpandValue` is _always_ false when we hit the left arrow key.
			 */
			newExpandValue = false;

			// but move focus to parent node
			if ((theNode.type === 'item') || (theNode.expanded === false && theNode.type === 'branch')) {
				const oldNodeType = theNode.type;
				
				// get the parent node of the thing we just hit a left arrow key on -- it will get the new focus
				const parentNode = this.state.flattenedNodes.filter(
					(node2) => node2.id === theNode.id
				)[0];
				
				// Some items do not have parents, they have `-1` as their `parentNode` value. They are special, but in all other cases we change the node we are working with to the parent node.
				if (parentNode.parentId !== -1) {
					theNode = this.getTreeNodeById(
						this.state.flattenedNodes.filter(
							(node) => node.id === parentNode.parentId
						)[0].id);
				}
				/**
				 * When hitting left arrow, we only actually bother toggling the expanded attribute if we are on a branch and it simply needs closed.
				 *
				 * If we are on an already closed branch or on an item, we move the focus up to the parent but do not toggle any expansion.
				 */
				doTheExpand = oldNodeType.type === 'branch';

				//
				overrideDoTheExpand = true;
				newVisibleFocusedNodeId = this.state.visibleNodes.indexOf(theNode.id);
				newVisibleFocusedNodeValue = theNode.id;
			}
		}
		if (isFromMouse) {
			newExpandValue = !theNode.expanded;
		}
		if (newExpandValue === theNode.expanded && overrideDoTheExpand === false) {
			doTheExpand = false;
		}

		if (doTheExpand) {
			console.log('doTheExpand', doTheExpand);
			if (isFunction(this.props.onExpandClick)) {
				this.props.onExpandClick(event, {
					node: theNode,
					expand: newExpandValue,
					treeIndex: props.treeIndex
				});
			}
		}

		this.setState({
			visibleNodes: this._getVisibleNodes(this.state.nodes),
			flattenedNodes: this._getFlattenedNodes(this.state.nodes),
			visibleFocusedNodeId: newVisibleFocusedNodeId,
			visibleFocusedNodeValue: newVisibleFocusedNodeValue
		});

		// console.log(JSON.stringify(this.state.flattenedNodes));
	};
	
	_logNodes () {
		// this.state.nodes.forEach((node) => {
		// });
	}

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

	_getFlattenedNodes (nodesToTest, parentId = -1) {
		// the array of nodes we will return
		
		let flattenedNodes = [];
		const newParentId = parentId;
		
		nodesToTest.forEach((node) => {
			// console.group('[nodesToTest.forEach] node.label', node.label);
			// console.log('-----> , node.id' , node.id);
			// console.log('-----> , parentId' , parentId);
			const htmlId = `${this.props.id}-${node.id}`;
			// let parentId = null;
			// console.group(node.label, node.id);
			if (
				typeof node.nodes !== 'undefined'
				&&
				node.nodes.length > 0
			) {
				flattenedNodes.push({ id: node.id, label: node.label, htmlId, parentId: newParentId, expanded: (node.expanded || false), type: node.type, nodes: node.nodes });
				parentId = node.id;
				flattenedNodes = flattenedNodes.concat(this._getFlattenedNodes(node.nodes, parentId));
			} else {
				flattenedNodes.push({ id: node.id, label: node.label, htmlId, parentId: newParentId, expanded: (node.expanded || false), type: node.type });
			}
			// console.groupEnd();
		});
		return flattenedNodes;
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
					className={classNames({
						'slds-text-title--caps': true,
						'slds-assistive-text': assistiveText
					})}
					id={`${id}__heading`}
				>{headingText}</h4>
				<Branch
					getNodes={this.props.getNodes}
					initalClassName={listClassName}
					visibleFocusedNodeId={this.state.visibleFocusedNodeId}
					visibleFocusedNodeValue={this.state.visibleFocusedNodeValue}
					htmlId={id}
					initialStyle={listStyle}
					level={0}
					node={{ nodes }}
					onClick={this.handleClick}
					onExpandClick={this.handleExpandClick}
					onScroll={onScroll}
					searchTerm={searchTerm}
					treeId={id}
				/>
			</div>
		);
	}
}


Tree.displayName = TREE;
Tree.defaultProps = defaultProps;
Tree.propTypes = propTypes;

export default Tree;
