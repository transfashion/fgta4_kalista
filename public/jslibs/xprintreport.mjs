export function XPrintReport(opt) {
	let self = {
		options: opt,
		px_per_mm: 3.77,
		i_test: 0,
		last_element_bottom_pos: 0,
		pagecount: 0,
	};

	self.generate = async (param) => {
		if (typeof opt.onGenerate === 'function') {
			return await opt.onGenerate(self, param);
		}	
	}
	self.CreateMeasure = (id) => { return xprint_CreateMeasure(self, id) };
	self.InitializeReport = () => { return xprint_InitializeReport(self) };
	self.status = (message) => { return xprint_status(self, message) };
	self.ClaimSpace = (el, descr) => { return xprint_ClaimSpace(self, el, descr)  };
	self.finalize = () => { return xprint_finalize(self) };
	self.CreateMeasurementBox = (top, height, measure) => { return xprint_CreateMeasurementBox(self, top, height, measure) };
	self.get_px_per_mm = () => { return self.px_per_mm };

	xprint_construct(self);
	return self;
}



function xprint_construct(self) {


	// Baca setting Kertas
	var pagewidth_mm = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--page-width'));
	var pageheight_mm = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--page-height'));
	var margintop_mm = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--margin-top'));
	var marginbottom_mm = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--margin-bottom'));
	var marginleft_mm = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--margin-left'));
	var marginright_mm = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--margin-right'));
	var pageheaderheight_mm = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pageheader-height'));


	self.options.mmWidth = pagewidth_mm;
	self.options.mmHeight = pageheight_mm;
	self.options.mmMarginTop = margintop_mm;
	self.options.mmMarginBottom = marginbottom_mm;
	self.options.mmMarginLeft = marginleft_mm;
	self.options.mmMarginRight = marginright_mm;
	self.options.mmPageHeaderHeight = pageheaderheight_mm;


	// Layout Report
	var el_table_header = self.options.elements.TableHeader; //document.getElementById('obj_reporttable_header');
	var el_table_header_rect = el_table_header.getBoundingClientRect();
	var tableheaderheight_px = Math.ceil(el_table_header_rect.bottom - el_table_header_rect.top);
	
	var el_report_header = self.options.elements.ReportHeader; //document.getElementById('obj_report_header');
	var el_report_header_rect = el_report_header.getBoundingClientRect();
	var reportheaderheight_px = Math.ceil(el_report_header_rect.bottom - el_report_header_rect.top);

	var el_report_footer = self.options.elements.ReportFooter; //document.getElementById('obj_report_footer');
	var el_report_footer_rect = el_report_footer.getBoundingClientRect();
	var reportfooterheight_px = Math.ceil(el_report_footer_rect.bottom - el_report_footer_rect.top)


	self.options.pxTableHeaderHeight = tableheaderheight_px;
	self.options.pxReportHeaderHeight = reportheaderheight_px;
	self.options.pxReportFooterHeight = reportfooterheight_px;	



	// Height Adjustment
	var adj_firefox_px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--page-adjustment-height-firefox'));
	var adj_chrome_px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--page-adjustment-height-chrome'));
	var adj_edge_px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--page-adjustment-height-edge'));
	var adj_safari_px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--page-adjustment-height-safari'));
	var adj_opera_px = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--page-adjustment-height-opera'));


	var adjustment_height_data = {
		firefox: adj_firefox_px,
		chrome: adj_chrome_px,
		edge: adj_edge_px,
		safari: adj_safari_px,
		opera: adj_opera_px,
		default: 0
	}

	console.log(adjustment_height_data);

	// Detect Browser
	console.log('browser detec');
	self.browsername = 'default';
	if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {
		self.browsername = 'opera'
	} else if(navigator.userAgent.indexOf("Edg") != -1 ) {
		self.browsername = 'edge'
	} else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
		self.browsername = 'chrome'
	} else if(navigator.userAgent.indexOf("Safari") != -1) {
		self.browsername = 'safari'
	} else if(navigator.userAgent.indexOf("Firefox") != -1 ) {
		self.browsername = 'firefox'
	} 

	self.adj_height_px = adjustment_height_data[self.browsername];

}


function xprint_CreateMeasure(self, id) {
	var el_pagemeasure = document.createElement('div');
	el_pagemeasure.id = id;
	el_pagemeasure.classList.add('pagemeasure');
	document.body.appendChild(el_pagemeasure);
	
	var measurerect = el_pagemeasure.getBoundingClientRect();
	var measureheight_px = measurerect.bottom - measurerect.top;

	self.px_per_mm = measureheight_px / self.options.mmHeight;

	// remove measurement
	el_pagemeasure.parentNode.removeChild(el_pagemeasure);
}


function xprint_CreatePageFrame(self, id, top) {
	var el_container = document.getElementById('obj_framecontainer');
	var el_frame = document.createElement('div');
	el_frame.id = id;
	el_frame.classList.add('page-frame');
	el_container.appendChild(el_frame);
}


function xprint_InitializeReport(self) {





	self.last_element_bottom_pos = 0;
	self.pagecount = 1;
	self.pxWidth = Math.ceil(xprint_mm_to_px(self, self.options.mmWidth));
	self.pxHeight = Math.ceil(xprint_mm_to_px(self, self.options.mmHeight));
	self.pxMarginTop = Math.ceil(xprint_mm_to_px(self, self.options.mmMarginTop));
	self.pxMarginBottom = Math.ceil(xprint_mm_to_px(self, self.options.mmMarginBottom));
	self.pxMarginLeft = Math.ceil(xprint_mm_to_px(self, self.options.mmMarginLeft));
	self.pxMarginRight = Math.ceil(xprint_mm_to_px(self, self.options.mmMarginRight));
	self.pxPageHeaderHeight = Math.ceil(xprint_mm_to_px(self, self.options.mmPageHeaderHeight));
	

	self.currentpage_available_space = self.pxHeight;

	// adjust report header
	// self.options.pxReportHeaderHeight = self.options.pxReportHeaderHeight + 2;

	xprint_ClaimSpace_Px(self, self.pxMarginTop, 'margin-top'); // first page, margin top
	xprint_ClaimSpace_Px(self, self.options.pxReportHeaderHeight - self.pxMarginTop, 'report-header'); // report header
	xprint_ClaimSpace_Px(self, self.options.pxTableHeaderHeight - (self.pxMarginTop + self.pxPageHeaderHeight), 'table-header'); // table header


	xprint_CreatePageFrame(self, 'page-1');
}

function xprint_status(self, message) {
	if (message!==undefined) {
		self.options.elements.Status.innerHTML = message;
		self.options.elements.Status.style.display = 'block';
		scrollTo(0, document.body.scrollHeight); // scroll ke paling bawah
	} else {
		self.options.elements.Status.innerHTML = '';
		self.options.elements.Status.style.display = 'none';
		scrollTo(0, 0); // load selesai, scroll kembali ke paling atas
	}
}

function xprint_ClaimSpace(self, el, descr) {
	var height_px = el.offsetHeight;
	var claiminfo = xprint_ClaimSpace_Px(self, height_px, descr);
	if (descr=='footer') {
		if (claiminfo.newpage) {
			console.log('footer on newpage');
			// el.style.paddingTop = `${self.pxMarginTop+self.pxPageHeaderHeight}px`;
			el.classList.add('report-footer-alone');
		}
	}

	return claiminfo;
}

function xprint_ClaimSpace_Px(self, height_px, descr) {
	var claiminfo = {}


	var tobeclaimed = height_px;
	var max_available = self.currentpage_available_space - self.pxMarginBottom;

	if (descr=='footer') {
		console.log('footer');
		if ((tobeclaimed-max_available)<=15) {
			max_available = tobeclaimed;
		}
	}

	var top_px = self.last_element_bottom_pos;
	if (tobeclaimed<=max_available) {
		// langsung pasang
		xprint_CreateMeasurementBox(self, top_px, tobeclaimed, descr);
		self.last_element_bottom_pos += tobeclaimed;
		self.currentpage_available_space -= tobeclaimed

		claiminfo = {
			newpage: false,
			forcebreakbefore: false
		}

	} else {
		
		// console.log('tambah halaman, reset posisi');
		var adjust = 0; //self.pagecount%8==0 ? 1: 0 ;
		var sisaclaim = adjust + max_available + self.pxMarginBottom;
		var els = xprint_CreateMeasurementBox(self, top_px, sisaclaim, descr + ' claim sisa'); // claim dulu sisa
		// console.log(max_available, sisaclaim, 'claim sisa');
		// console.log(els);
		self.last_element_bottom_pos += sisaclaim;
		
		
		// halaman baru
		self.pagecount++;
		self.currentpage_available_space = self.pxHeight + self.adj_height_px;


		xprint_ClaimSpace_Px(self, self.pxMarginTop); // first page, margin top
		xprint_ClaimSpace_Px(self, self.pxPageHeaderHeight); //page header
		xprint_ClaimSpace_Px(self, self.options.pxTableHeaderHeight - (self.pxMarginTop + self.pxPageHeaderHeight)); // table header

		xprint_CreatePageFrame(self, `page-${self.pagecount}`);


		var top_px = self.last_element_bottom_pos;
		xprint_CreateMeasurementBox(self, top_px, tobeclaimed, descr);
		self.last_element_bottom_pos += tobeclaimed;
		// console.log(max_available, tobeclaimed, descr);
		self.currentpage_available_space -= tobeclaimed

		claiminfo = {
			newpage: true,
			forcebreakbefore: true
		}

	}


	return claiminfo;

}

function xprint_finalize(self) {
	console.log('PAGE COUNT', self.pagecount);
	var elpghead = document.getElementById('obj_pageheader');
	var elpgdescr = elpghead.querySelector('.page-descr');
	var elpgpaging = elpghead.querySelector('.page-paging');
	
	var els = document.querySelectorAll('.page-frame');
	var page = 1;
	for (var el of els) {
		el.classList.add('page-frame-printonly');
		if (page>1) {
			elpgpaging.innerHTML = `page ${page} of ${self.pagecount}`;
			// console.log(elpghead.innerHTML);
			var elhead = document.createElement('div');
			elhead.classList.add('report-page-header-content');
			elhead.innerHTML = elpghead.innerHTML;
			el.appendChild(elhead);
		}
		page++;
	}


	var el_paging_page_1 = document.getElementById('obj_paging_page_1');
	el_paging_page_1.innerHTML = `page 1 of ${self.pagecount}`;
	
}


function xprint_CreateMeasurementBox(self, top_px, height_px, descr) {
	return;

	self.i_test++;
	var el = document.createElement('div')
	el.id = "testbox-" + self.i_test;
	if (descr!==undefined) {
		el.innerHTML = descr;
	}
	el.setAttribute('descr', descr);
	el.classList.add('testbox');
	if (self.i_test%2 == 0) {
		el.style.borderColor = 'red';
		el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)'
	} else {
		el.style.borderColor = 'blue';
		el.style.backgroundColor = 'rgba(0, 0, 255, 0.1)'
	}

	el.style.top = `${top_px}px`;
	el.style.height = `${height_px-1}px`;

	document.body.appendChild(el);

	return el;
}


function xprint_mm_to_px(self, mm) {
	return mm * self.px_per_mm;
}