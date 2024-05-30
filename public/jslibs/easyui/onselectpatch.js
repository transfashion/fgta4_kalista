(function($){
	var datebox = $.fn.datebox.defaults.onChange;
	$.fn.datebox.defaults.onChange = function(newValue, oldValue){
		$(this).closest('form').trigger('change');
		datebox.call(this, newValue, oldValue);
	};
	var combobox = $.fn.combobox.defaults.onChange;
	$.fn.combobox.defaults.onChange = function(newValue, oldValue){
		$(this).closest('form').trigger('change');
		combobox.call(this, newValue, oldValue);
	};
})(jQuery);