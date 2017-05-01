function placeCaretAtEnd(el) {
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function insertAtCaret(jqTxtarea, text) {
		if (!jqTxtarea) return;
    var txtvalue = jqTxtarea.val();
    console.log('txtvalue='+txtvalue);
    var txtarea = jqTxtarea.get();
    console.log('txtarea='+txtarea);

		var scrollPos = txtarea.scrollTop;
		var strPos = 0;
		var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
			"ff" : (document.selection ? "ie" : false ) );
		if (br == "ie") {
			txtarea.focus();
			var range = document.selection.createRange();
			range.moveStart ('character', -txtarea.value.length);
			strPos = range.text.length;
		} else if (br == "ff") {
			strPos = txtarea.selectionStart;
		}

		var front = txtvalue.substring(0, strPos);
		var back = txtvalue.substring(strPos, txtvalue.length);
		txtvalue = front + text + back;
		strPos = strPos + text.length;
    jqTxtarea.val(txtvalue);

		if (br == "ie") {
			txtarea.focus();
			var ieRange = document.selection.createRange();
			ieRange.moveStart ('character', -txtvalue.length);
			ieRange.moveStart ('character', strPos);
			ieRange.moveEnd ('character', 0);
			ieRange.select();
		} else if (br == "ff") {
			txtarea.selectionStart = strPos;
			txtarea.selectionEnd = strPos;
			txtarea.focus();
		}

		txtarea.scrollTop = scrollPos;
	}


  function setSelectionRange(input, selectionStart, selectionEnd) {
    console.log('setSelectionRange(input='+input+')');
  if (input.setSelectionRange) {
    console.log(' - 1');
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
      console.log(' - 2');
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

function setCaretToPos (input, pos) {
  setSelectionRange(input, pos, pos);
}


  /**
   * Return an object with the selection range or cursor position (if both have the same value)
   * @param {DOMElement} el A dom element of a textarea or input text.
   * @return {Object} reference Object with 2 properties (start and end) with the identifier of the location of the cursor and selected text.
   **/
  function getInputSelection(el) {
    console.log('getInputSelect(el='+el+')');
      var start = 0, end = 0, normalizedValue, range, textInputRange, len, endRange;

      if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
          console.log(' - get from selection');
          start = el.selectionStart;
          end = el.selectionEnd;
      } else {
          console.log('document.selection='+document.selection);
          range = document.selection.createRange();

          if (range && range.parentElement() == el) {
              len = el.value.length;
              normalizedValue = el.value.replace(/\r\n/g, "\n");

              // Create a working TextRange that lives only in the input
              textInputRange = el.createTextRange();
              textInputRange.moveToBookmark(range.getBookmark());

              // Check if the start and end of the selection are at the very end
              // of the input, since moveStart/moveEnd doesn't return what we want
              // in those cases
              endRange = el.createTextRange();
              endRange.collapse(false);

              if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                  start = end = len;
              } else {
                  start = -textInputRange.moveStart("character", -len);
                  start += normalizedValue.slice(0, start).split("\n").length - 1;

                  if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                      end = len;
                  } else {
                      end = -textInputRange.moveEnd("character", -len);
                      end += normalizedValue.slice(0, end).split("\n").length - 1;
                  }
              }
          }
      }

      return {
          start: start,
          end: end
      };
  }

function getItemTitle() {
  console.log('getItemTitle()');
  var name = $('#item-title-div').find('.item-title').html();
  var i = name.indexOf("<span ");
  if (i == 0) name = null;
  if (name) {
    i = name.indexOf('<div ');
    if (i != -1) name = name.substring(0,i);
  }
  console.log(' - name='+name);
  return name;
}

function editItemTitle(cb) {
  console.log('editItemTitle()');
  var t = $('#item-title-div').find('.item-title');
  t.find('.right-control').remove();
  console.log('found t='+t);
  var ph = t.find('.title-placeholder');
  if (ph) {
    console.log('Found placeholder so remove it');
    ph.remove();
  }
  t.attr('contenteditable',true);
  return;
  t.focus();
  placeCaretAtEnd(t.get(0));
  if (cb) {
    t.on('keydown', function (e) {
        if (e.keyCode == 13) {
          cb();
          return false;
        }
        return true;
    });
  }
  console.log(' - done');
}

function getEditControl(iconName,action) {
  var div = document.createElement('div');
  div.setAttribute('class','padded-container right-control');
  var btn = document.createElement('button');
  btn.setAttribute('class','mdl-button mdl-js-button mdl-button--icon');
  btn.innerHTML = '<i class="material-icons mdl-color-text--blue-grey-400">'+iconName+'</i>';
  btn.addEventListener('click',function() { onAction(action); });
  div.appendChild(btn);
  return $(div);
}

function showItemTitle(name) {
  var div = $('#item-title-div');
  var icon = 'edit';
  if (!name) {
    name = '<span onclick="onAction(\'edit:title\');" class="title-placeholder">add a title</span>';
    icon = 'add';
  }
  div.html('');
  var t = $(document.createElement('div'));
  t.addClass('padded-container item-title');
  t.html(name);
  getEditControl(icon,'edit:title').appendTo(t);
  t.appendTo(div);
}

function showItemMarkdown(newMd,oldMd) {
  var div = $('#item-markdown-div');
  var icon = 'edit';

  var md = newMd;
  if (!md) {
    md = '<span onclick="onAction(\'edit:markdown\');" class="markdown-placeholder">add a description/comment</span>';
    icon = 'add';
  }

  div.html('');
  var t = $(document.createElement('div'));
  t.addClass('padded-container item-markdown');
  t.html(md);
  getEditControl(icon,'edit:markdown').appendTo(t);
  t.appendTo(div);

  var msg = '-unknown-';
  if (newMd) {
      msg = oldMd ? ((oldMd == newMd) ? '' : 'description to be modified') : 'description to be added';
  }
  else {
      msg = oldMd ? 'description to be removed' : '';
  }
  t = $(document.createElement('div'));
  t.addClass('item-markdown-status');
  t.html(msg);
  t.appendTo(div);
}

function hideItemTitle() {
  $('#item-title-div').hide();
}


function getItemNameFromId(itemId) {
  var result = '';
  var addSpace = true;
  for (var i=0;i<itemId.length;i++) {
    var char = itemId.substring(i,i+1);
    if (i != 0 && char >= 'A' && char <= 'Z') result += ' ';
    result += char;
  }
  return result;
}

function getItemIdFromName(itemName) {
  var result = '';
  var upper = true;
  for (var i=0;i<itemName.length;i++) {
    var char = itemName.substring(i,i+1);
    var add = char != ' ' && char != '\n';
    if (add) {
      result += upper ? char.toUpperCase() : char.toLowerCase();
      upper = false;
    }
    else
      upper = true;
  }
  return result;
}
