const treeNodesWithInitialState = [
		{
				label: 'Grains',
				type: 'item',
				id: 'grains',
				selected: true
		},
		{
				label: 'Legumes',
				type: 'item',
				id: 'legumes',
				selected: false
		},
		{
				label: 'Fruits',
				type: 'branch',
				id: 'fruits',
				expanded: true,
				nodes: [
						{
								label: 'Ground Fruits',
								type: 'branch',
								id: 'ground-fruits',
								nodes: [
										{
												label: 'Watermelon',
												type: 'item',
												id: 'watermelon'
										}, {
												label: 'Canteloupe',
												type: 'item',
												'canteloupe': 'glyphicon-file',
												id: 'canteloupe'
										}, {
												label: 'Strawberries',
												type: 'item',
												id: 'strawberries'
										}
								]
						}, {
								label: 'Tree Fruits',
								type: 'branch',
								id: 'tree-fruits',
								selected: true,
								nodes: [
										{
												label: 'Peaches',
												type: 'item',
												id: 'peaches'
										}, {
												label: 'Pears',
												type: 'item',
												'pears': 'glyphicon-file',
												id: 'pears'
										}, {
												label: 'Citrus',
												type: 'branch',
												id: 'citrus',
												nodes: [
														{
																label: 'Orange',
																type: 'item',
																id: 'orange'
														}, {
																label: 'Grapefruit',
																type: 'item',
																id: 'grapefruit'
														}, {
																label: 'Lemon',
																type: 'item',
																id: 'lemon'
														}, {
																label: 'Lime',
																type: 'item',
																id: 'lime'
														}
												]
										}, {
												label: 'Apples',
												type: 'branch',
												id: 'apples',
												nodes: [
														{
																label: 'Granny Smith',
																type: 'item',
																id: 'granny-smith'
														}, {
																label: 'Pinklady',
																type: 'item',
																id: 'pinklady'
														}, {
																label: 'Rotten',
																type: 'item',
																id: 'rotten'
														}, {
																label: 'Jonathan',
																type: 'item',
																id: 'jonathan'
														}
												]
										}, {
												label: 'Cherries',
												type: 'branch',
												id: 'cherries',
												nodes: [
														{
																label: 'Balaton',
																type: 'item',
																id: 'balaton'
														}, {
																label: 'Erdi Botermo',
																type: 'item',
																id: 'erdi-botermo'
														}, {
																label: 'Montmorency',
																type: 'item',
																id: 'montmorency'
														}, {
																label: 'Queen Ann',
																type: 'item',
																id: 'queen-ann'
														}, {
																label: 'Ulster',
																type: 'item',
																id: 'ulster'
														}, {
																label: 'Viva',
																type: 'item',
																id: 'viva'
														}
												]
										}, {
												label: 'Raspberries',
												type: 'item',
												id: 'raspberries'
										}
								]
						}
				]
		}, {
				label: 'Nuts',
				type: 'branch',
				'nuts': 'glyphicon-file',
				id: 'nuts',
				nodes: [
						{
								label: 'Almonds',
								type: 'item',
								id: 'almonds'
						}, {
								label: 'Cashews',
								type: 'item',
								id: 'cashews'
						}, {
								label: 'Pecans',
								type: 'item',
								id: 'pecans'
						}, {
								label: 'Walnuts',
								type: 'item',
								id: 'walnuts'
						}
				]
		}, {
				label: 'Empty folder',
				type: 'branch',
				id: 'empty-folder',
				expanded: true
		}
];

export default treeNodesWithInitialState;
