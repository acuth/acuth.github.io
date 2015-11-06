var _itemTitles = ['An Introduction to Items',
              'Everything you wanted to know about items but were afraid to ask',
              'Well Known Item Types'];
              
              
	function fixLayout() {
			  var header = $('#item-header');
			  var content = $('#item-content');
			  var top = header.height()+'px';
			  var height = (_awac.getDims().height-header.height())+'px';
			  console.log('top '+top);
			  console.log('height '+height);
			  content.show().css('top',top).css('height',height);
			}