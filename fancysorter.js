window.addEventListener ('load', function () {
 var entry_text_list = [
  ['cheese'    , 'yellow'],
  ['orange'    , 'orange'],
  ['monkey'    , 'brown'],
  ['shoe store', 'white'],
  ['bread'     , 'orange'],
  ['banana'    , 'yellow']
 ]
 var header_text = ["name", "color"]
 
 var mytable = make_table ({
  entry_text_list : entry_text_list,
  header_text     : header_text,
  parent          : document.body,
  prefix          : "mytable--"
 })
})

function make_table (init) {
 var entry_text_list   = init.entry_text_list
 var header_text       = init.header_text
 var parent            = init.parent
 var prefix            = init.prefix
 var precision_limit   = init.precision_limit || 1
 var check_if_attached = (typeof init.check_if_attached != "undefined") ? false : true
 var fancysorter = {}
 
 var table = document.createElement ('div')
 table.className = "mytable-table"
 parent.appendChild (table)
 
 var dom_header = document.createElement ('div')
 dom_header.className = 'mytable--header'
 table.appendChild (dom_header)
 
 var header_object_array = fancysorter.header_object_array = []
 header_text.forEach (function (data, i) {
  var dom_subentry = document.createElement ('div')
  dom_subentry.className = prefix + "header-subentry " + prefix + "header-subentry-" + (i + 1)
  header_object_array.push (dom_subentry)
  dom_subentry.innerHTML = header_text[i]
  dom_header.appendChild (dom_subentry)
 })
 
 var entry_wrapper = document.createElement ('div')
 entry_wrapper.className = 'mytable--entry_wrapper'
 table.appendChild (entry_wrapper)
 
 var entry_object_array = fancysorter.entry_object_array = []
 Array.prototype.slice.call(entry_text_list).forEach (function (data, i) {
  var dom_entry = document.createElement ('div')
  dom_entry.className = prefix + "entry"
  entry_object_array.push (dom_entry)
  entry_wrapper.appendChild (dom_entry)
  data.forEach (function (subdata, i) {
   var dom_subentry = document.createElement ('div')
   dom_subentry.className = prefix + "entry-subentry " + prefix + "entry-subentry-" + (i + 1)
   dom_subentry.innerHTML = subdata
   dom_entry.appendChild (dom_subentry)
  })
 })
 
 var line_height = init.line_height || getClientHeightFull(entry_object_array[0])
 
 entry_wrapper.style.height = (line_height * entry_text_list.length) + "px"
 entry_wrapper.style.display = "block"
 entry_wrapper.style.pointerEvents = "none"
 table.appendChild (entry_wrapper)
 
 header_object_array.forEach (function (subentry, i) {
  subentry.addEventListener ('click', function () {
   fancysorter.sortby (i)
  })
 })
 
 // Set initial top values.
 entry_object_array.forEach (function (entry, i) {
  entry.style.top = (i * line_height) + "px"
 })
 
 fancysorter.sortby = function (index) {
  if (fancysorter.running) clearInterval (fancysorter.interval_id)
  fancysorter.running = true
  
  var entry_list_ref = []
  entry_text_list.forEach (function (entry, i) {
   var entry_ref = {}
   entry_list_ref.push(entry_ref)
   entry_ref.data           = entry[index]
   entry_ref.original_index = i
  })
  
  // We need to find the new order here by looking at entry_list.
  entry_list_ref.sort (function (a, b) {
   if (a.data > b.data) return 1
   if (b.data > a.data) return -1
   return 0
  })
  
  var active_rows = {}
  entry_list_ref.forEach (function (entry_ref, i) {
   var index = entry_ref.original_index
   var item = entry_object_array[index]
   active_rows[index] = {
    dom_object       : entry_object_array[index],
    current_position : parseFloat(window.getComputedStyle(item).top),
    target_position  : i * line_height
   }
  })
  
  begin_mechanic ()
  
  function begin_mechanic () {
   fancysorter.interval_id = setInterval (mechanic, 15)
   
   function mechanic () {
    var finished = true
    for (var item_index in active_rows) {
     finished = false
     var item = active_rows[item_index]
     
     if ((check_if_attached) && (!isAttached (item.dom_object))) {delete (lm[item_index]); return}
        
     // Set the offset.
     item.dom_object.style.top = item.current_position + 'px'
     
     // Offset too big.
     if (item.current_position - item.target_position > precision_limit) {
      item.current_position -= (item.current_position - item.target_position) / line_height
      continue
     }
     
     // Offset too small.
     if (item.target_position - item.current_position > precision_limit) { 
      item.current_position += (item.target_position - item.current_position) / line_height
      continue
     }
     
     // Offset is perfect or nearly so.
     item.current_position = item.target_position
     delete (active_rows[item_index])
    }
    
    if (finished) {clearInterval (fancysorter.interval_id); fancysorter.running = false}
   }
  }
 }
 
 function isAttached (obj) {
  while (true) {
   obj = obj.parentNode
   if (obj == document.documentElement) return true
   if (obj == null) return false
  }
 }
    
 function getClientHeightFull (obj, init) {
  var style = window.getComputedStyle(obj)
  var box_sizing = (style.boxSizing != "") ? style.boxSizing : style.mozBoxSizing
  if (box_sizing != "border-box") {
   var padding_and_margin = 0
  } else {
   var padding_and_margin = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
  }
  if ((typeof init != "undefined") && (typeof init.margin != "undefined") && (init.margin == true)) {
   padding_and_margin += parseFloat(style.marginTop) + parseFloat(style.marginBottom)
  }
  return obj.clientHeight + padding_and_margin + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
 }
}
