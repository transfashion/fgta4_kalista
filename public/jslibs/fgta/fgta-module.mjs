export function init(opt) {
	console.log('module initialization not created yet')

}

export function ready() {

	if (window.self !== window.top) {
		console.log(`module ${window.global.modulefullname} ready`);
	} else {
		console.log(`parent module ready`);
	}
}