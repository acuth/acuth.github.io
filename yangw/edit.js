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

function getItemTitle() {
  console.log('getTitleValeu()');
  var name = $('#item-title-div').find('.item-title').html();
  var i = name.indexOf('<div ');
  if (i != -1) name = name.substring(0,i);
  console.log(' - name='+name);
  return name;
}

function editItemTitle() {
  console.log('editItemTitle()');
  var t = $('#item-title-div').find('.item-title');
  t.find('.right-control').remove();
  console.log('found t='+t);
  var ph = t.find('.title-placeholder');
  if (ph) {
    console.log('Found placeholder so remove it');
    ph.remove();
  }
  t.attr('contenteditable',true).focus();
  placeCaretAtEnd(t.get(0));
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
    name = '<span class="title-placeholder">add a title</span>';
    icon = 'add';
  }
  div.html('');
  var t = $(document.createElement('div'));
  t.addClass('padded-container item-title');
  t.html(name);
  getEditControl(icon,'edit:title').appendTo(t);
  t.appendTo(div);
}

function hideItemTitle() {
  $('#item-title-div').hide();
}
