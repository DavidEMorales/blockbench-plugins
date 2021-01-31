/// <reference path="../types/index.d.ts" />

(function() {

var plaster_action;

Plugin.register('plaster', {
	title: 'Plaster',
	icon: 'healing',
	author: 'JannisX11',
	description: 'Fixes texture bleeding (small white or colored lines around the edges of your model)',
	version: '1.0.4',
	min_version: '3.0.5',
	variant: 'both',
	onload() {
		plaster_action = new Action({
		    id: 'plaster',
		    name: 'Plaster',
		    icon: 'healing',
		    category: 'edit',
		    condition: () => !Project.box_uv,
		    click: function(ev) {
		    	if (selected.length === 0) {
					Blockbench.showMessage('No cubes selected', 'center')
					return;
				}

				new Dialog({
					id: 'plaster',
					title: 'Plaster',
					icon: 'healing',
					form: {
						margin: {label: 'Margin', type: 'select', options: {
							s: 'Small',
							m: 'Medium',
							l: 'Large',
							xl: 'Extra Large',
						}, default: 'm'},
					},
					onConfirm: function(formData) {
						this.hide()
						//Margin
						var margin;
						switch (formData.margin) {
							case 's':
								margin = 0.016
								break;
							case 'm':
								margin = 0.032
								break;
							case 'l':
								margin = 0.06
								break;
							case 'xl':
								margin = 0.1
								break;
						}
						var fixNumber = function(number, res, isSecond) {
							//Vars
							var adapted_margin = margin * (16/res)
							var x1 = (number*res)/16
							var edge = x1%1
							var floor = Math.floor(x1)

							//Switches
							if (edge > 0.9 && !isSecond) {
								edge = 1 + adapted_margin
							} else if (edge < 0.1 && isSecond) {
								edge = -adapted_margin
							} else if (edge === 0 && !isSecond) {
								edge = adapted_margin
							}
							//Return
							return ((floor+edge)*16)/res
						}
						Undo.initEdit({elements: Cube.selected, uv_only: true})
						//Processing
						Cube.selected.forEach(function(obj) {
							for (var face in obj.faces) {
								if (obj.faces.hasOwnProperty(face) && obj.faces[face].texture !== null) {
									//Vars
									var res = 16;
									var faceTag = obj.faces[face];
									var texture_match = faceTag.getTexture();
									if (texture_match) res = texture_match.width;

									//Calculating
									faceTag.uv.forEach(function(u, i) {
										var is_mirrored = faceTag.uv[ (i>1?i-2:i) ] > faceTag.uv[i+ (i>1?0:2) ]
										faceTag.uv[i] = fixNumber(faceTag.uv[i], res, i>1 !== is_mirrored)
									})
								}
							}
							Canvas.updateUV(obj)
						})
						main_uv.loadData()
						Undo.finishEdit('plaster')
					}
				}).show()
		    }
		})
		MenuBar.addAction(plaster_action, 'filter')
	},
	onunload() {
		plaster_action.delete()
	}
});

})()
