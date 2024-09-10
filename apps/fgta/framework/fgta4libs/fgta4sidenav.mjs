const self = {}

export async function set(el, options) {
	self.options = options;
	self.el = el;
	el.classList.add('fgta-sidenav-hidden');
}

export async function open() {
	self.el.classList.remove('fgta-sidenav-hidden');
}

export async function close() {
	self.el.classList.add('fgta-sidenav-removing');
	setTimeout(()=>{
		self.el.classList.remove('fgta-sidenav-removing');
		self.el.classList.add('fgta-sidenav-hidden');
	}, 400);
}