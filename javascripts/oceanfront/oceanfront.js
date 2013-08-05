////////////////////////////////////////////////////////////////////
//                    OceanFront Framework
//                David Tatti | Lars Rustemeier
//
//  www.github.com/OceanDev/oceanfront
//  www.oceanframework.com
////////////////////////////////////////////////////////////////////


/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
  typeof _super[name] == "function" && fnTest.test(prop[name]) ?
  (function(name, fn){
    return function() {
      var tmp = this._super;

      // Add a new ._super() method that is the same method
      // but on the super-class
      this._super = _super[name];

      // The method only need to be bound temporarily, so we
      // remove it when we're done executing
      var ret = fn.apply(this, arguments);
      this._super = tmp;

      return ret;
    };
  })(name, prop[name]) :
    prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();

/*
 * htmlcanvas JavaScript Library v0.1
 *
 * Author: Lars Rustemeier 
 *
 * Exposes a recursive functionality to easily build local DOM trees in widgets programmatically
 * Example syntax for 2 nested div-nodes with each 1 set attribute:
 * var tree = html.div{(class:'div1-class'),
 *                    html.div{(id:'innerDiv')}};
 *
 * Date: Ons 26 Jan 2011 15:35:35 CET
 */
__stack = undefined;
var html = (function() {
  var tags = 
    ['canvas', 'datalist', 'nav', 'html','head','title','base','meta','link','style','script','noscript','body','div','p','h1','h2','h3','h4','h5','h6','ul','ol','li','dl','dt','dd','address','hr','pre','blockquote','ins','del','a','span','bdo','br','em','strong','dfn','code','samp','kbd','var','cite','abbr','acronym','q','sub','sup','tt','i','b','big','small','object','param','img','map','area','form','label','input','select','optgroup','option','textarea','fieldset','legend','button','table','caption','thead','tfoot','tbody','colgroup','col','tr','th','td','iframe'];
  var res = {};

  for(var i=0; i<tags.length; i++) {
    var tag = tags[i];
    res[tag] = (function(etag) { return function() {
          var elem = document.createElement(etag);
          var start = 0;
          if (arguments.length == 0)
            return elem;
          var arg0 = arguments[0];
          if (arg0.constructor == Object) {
            start = 1;
            for(var key in arg0) {
              if(arg0.hasOwnProperty(key)) {
                if(key === 'style') {
                  var arr = arg0[key].split(";");
                  for(var i=0;i<arr.length;i++) {
                    if(arr[i].length === 0)
                      continue;
                    var pair = arr[i].split(":");
                    var name = pair[0], val=pair[1];
                    //alert(name+":"+val);
                    try {
                      elem.style[name] = val;
                    }catch(e) { alert("OUCH!"); }
                  }
                }
                else
                  elem.setAttribute(key,arg0[key]);
              }
            }
          }
          for (var i = start; i < arguments.length; i++) {
            var arg = arguments[i];
            if(arg == undefined)
              throw "html canvas: undefined argument "+i+", for tag <"+etag+">";  
            if (arg.constructor == Array) {
              for (var j = 0; j < arg.length; j++) {
                elem.appendChild(arg[j]);
              }
            } else if (arg.constructor == String) {
              elem.appendChild(document.createTextNode(arg));
            } else {
              elem.appendChild(arg);
            }
          }
          return elem;
        }})(tag);
  }
  res.let = function(dict,fn) {
    return fn(dict);
  };
  res.block = function(fn) {
    return fn();  
  };
  res.append = function(elem1, elem2) {
    elem1.appendChild(elem2);
  };
  res.append_at = function(id, element) {
    document.getElementById(id).appendChild(element);
  };
  res.replace = function(parent, replacement) {
    if(parent.children.length >0)
      parent.removeChild(parent.children[0]); 
    this.append(parent, replacement);
  };
  res.find = function(id) {
    return document.getElementById(id);
  };
  res.time = function(target_id, thunk) {
    var start = (new Date).getTime();
    thunk();
    var diff = (new Date).getTime() - start;
    html.append_at(target_id, html.p({'class':'benchmark'},"Time taken: "+diff));
  };
  return res;
})();

/* Array convinience functions */

Array.prototype.remove = function(s) {
  for(var i=0;i<this.length;i++)
    if(s==this[i]) this.splice(i, 1);
};

Array.prototype.index = function(obj) {
  for(var i=0;i<this.length;i++)
    if(this[i] == obj)
      return i;
  return null;
};

Array.prototype.insert = function(i,obj) {
  this.splice(i,0,obj);
};

next_hash_id = 0;

function hash(obj) {
  if (obj == null) return null;
  if (obj.$H) return obj.$H;
  if (obj.__hash__) return obj.__hash__();
  if (obj.constructor == String || obj.constructor == Number || obj.constructor == Date) return obj;
  var id = next_hash_id++;
  obj.$H = id;
  return obj.$H;
}

function gdispatchEvent(evt) {
  var evt = evt || window.event;
  var listener;
  var curElem = this;
  while(curElem && !(listener = curElem.__listener)) {
    curElem = curElem.parentNode;
  }
  if(curElem && curElem.nodeType != 1)
    curElem = null;
  if(listener)
    DOM.dispatchEvent(evt, curElem, listener);
}

// HashFactory for handling baking, reading and reaction on URL for the application flow
// State driven applications are to let SEO crawler find their way with correct links, and let users bookmark important flow states
var HashFactoryBase = Class.extend({
  init: function() {
    //This object handles all the actual flows in application thru set hash bong states
    //Syntax in URL: exampleApp.se/appname#!state|data
    //Example: exampleApp.se/hotels#!product|london/hilton/123451
    var self = this;   

  },
  setURL: function(appState, obj) {
    if(console) console.warn("Did not override setURL in HashFactoryBase! Add your app logic in an override!");
  },
  parseURL: function() {
    if(console) console.warn("Did not override parseURL in HashFactoryBase! Add your app logic in an override!");
  },
  flowTo: function(appState) {
    if(console) console.warn("Did not override flowTo in HashFactoryBase! Add your app logic in override!");
  },
  goto: function(appState, obj) {
    // Flow logic for application
    if(console) console.warn("Did not override goto in HashFactoryBase! Add your app logic in override!");
  }
});


// low level dom abstraction
var DOM = {
  // Constants
  ALIGN_LEFT:   "left",
  ALIGN_CENTER: "center",
  ALIGN_RIGHT:  "right",
  ALIGN_TOP:    "top",
  ALIGN_MIDDLE: "middle",
  ALIGN_BOTTOM: "bottom",

  // KEYMODS
  MODIFIER_ALT:   4,
  MODIFIER_CTRL:  2,
  MODIFIER_SHIFT: 1,


  dispatchEvent: function(event, element, listener) {
    listener.onBrowserEvent(event);
  },

  // Element creation
  // We want all the create methods to be explicit
  // The we do not expose a string based aspi like DOM.create('div')
  createElement:   function(tag) { return document.createElement(tag); },
  createText:      function(text) { return document.createTextNode(text); },
  createTextArea:  function() { return this.createElement('textarea'); },
  createDiv:       function() { return this.createElement('div'); },
  createSpan:      function() { return this.createElement('span'); },
  createAnchor:    function() { return this.createElement('a'); },
  createButton:    function() { return this.createElement('button'); },
  createForm:      function() { return this.createElement('form'); },
  createImage:     function() { return this.createElement('img'); },
  createImg:       function() { return this.createElement('img'); },
  createTable:     function() { return this.createElement('table'); },
  createTR:        function() { return this.createElement('tr'); },
  createTD:        function() { return this.createElement('td'); },
  createTBody:     function() { return this.createElement('tbody'); },
  createLabel:     function() { return this.createElement('label'); },
  createSelect:    function() { return this.createElement('select');  },
  createH1:    function() { return this.createElement('h1');  },
  createH2:    function() { return this.createElement('h2');  },
  createH3:    function() { return this.createElement('h3');  },
  createInputRadio:function(group) {
    var element = this.createElement("INPUT");
    element.type = 'radio';
    element.name = group;
    return element;
  },
  createInputElement: function(type) {
                        var e = this.createElement('input');
                        if(!$.browser.msie) {
                          e.type = type;
                        }
                        return e;
                      },
  createInputCheck: function() { return this.createInputElement('checkbox'); },
  createInputPassword: function() { return this.createInputElement('password'); },
  createIFrame: function() { return this.createElement('iframe');},

  // Attributes
  setAttribute: function(element, attribute, value) {
    element[attribute] = value;
  },
  getAttribute: function(element, attribute) {
                  return element[attribute];
                },
  // Style attributes
  setStyleAttribute: function(element, attribute, value) {
                       this.setAttribute(element.style,attribute,value);
                     },
  getStyleAttribute: function(element, attribute) {
                       return this.getAttribute(element.style,attribute);
                     },
  // Tree operations
  removeChild: function(parent, child) {
                 parent.removeChild(child);
               },
  insertChild: function(parent, element, index) {
                 var count = 0, child = parent.firstChild, before = null;
                 while (child) {
                   if (child.nodeType == 1) {
                     if (count == index) {
                       before = child;
                       break;
                     }
                     ++count;
                   }
                   child = child.nextSibling;
                 }
                 parent.insertBefore(element, before);
               },
  appendChild: function(parent, element) {
                 if(parent == null || element == null) {
                   if(console)
                     console.error("DOM.appendChild called with null value");
                 }
                 else {
                   parent.appendChild(element);
                 }
               },
  getChild: function(element,index) {
              var count = 0, child = element.firstChild;
              while (child) {
                var next = child.nextSibling;
                if (child.nodeType == 1) {
                  if (index == count)
                    return child;
                  ++count;
                }
                child = next;
              }
              return null;
            },
  getNextSibling: function(element) {
                    var sib = element.nextSibling;
                    while (sib && sib.nodeType != 1)
                      sib = sib.nextSibling;
                    return sib ? sib : null;
                  },
  getFirstChild: function(element) {
                   var child = element.firstChild;
                   while (child && child.nodeType != 1)
                     child = child.nextSibling;
                   return child ? child : null;
                 },
  getChildCount: function(element) {
                   var count = 0, child = element.firstChild;
                   while (child) {
                     if (child.nodeType == 1)
                       ++count;
                     child = child.nextSibling;
                   }
                   return count;
                 },
  getElementById: function(id) {
                    var elem = document.getElementById(id);
                    return elem ? elem : null;
                  },
  getParent: function(element) {
               var parent = element.parentNode;
               if(parent == null) {
                 return null;
               }
               if (parent.nodeType != 1)
                 parent = null;
               return parent ? parent : null;
             },
  insertListItem: function(select, item, value, index) {
                    var option = this.createElement("option");
                    this.setInnerText(option, item);
                    if(value != null)
                      this.setAttribute(option, "value", value);
                    if (index == -1)
                      this.appendChild(select, option);
                    else
                      this.insertChild(select, option, index);
                  },
  // Events
  eventPreventDefault: function(event) {
                         if(event.preventDefault)
                           event.preventDefault();
                       },
  addEventPreview: function(preview) {
                     // TODO
                   },
  removeEventPreview: function(preview) {
                        // TODO
                      },
  sinkEvents: function(element, bits) {
                element.__eventBits = bits;

                element.onclick       = (bits & 0x00001) ? gdispatchEvent : null;
                element.ondblclick    = (bits & 0x00002) ? gdispatchEvent : null;
                element.onmousedown   = (bits & 0x00004) ? gdispatchEvent : null;
                element.onmouseup     = (bits & 0x00008) ? gdispatchEvent : null;
                element.onmouseover   = (bits & 0x00010) ? gdispatchEvent : null;
                element.onmouseout    = (bits & 0x00020) ? gdispatchEvent : null;
                element.onmousemove   = (bits & 0x00040) ? gdispatchEvent : null;
                element.onkeydown     = (bits & 0x00080) ? gdispatchEvent : null;
                element.onkeypress    = (bits & 0x00100) ? gdispatchEvent : null;
                element.onkeyup       = (bits & 0x00200) ? gdispatchEvent : null;
                element.onchange      = (bits & 0x00400) ? gdispatchEvent : null;
                element.onfocus       = (bits & 0x00800) ? gdispatchEvent : null;
                element.onblur        = (bits & 0x01000) ? gdispatchEvent : null;
                element.onlosecapture = (bits & 0x02000) ? gdispatchEvent : null;
                element.onscroll      = (bits & 0x04000) ? gdispatchEvent : null;
                element.onload        = (bits & 0x08000) ? gdispatchEvent : null;
                element.onloadstart   = (bits & 0x08001) ? gdispatchEvent : null;
                element.onloadend     = (bits & 0x08001) ? gdispatchEvent : null;
                element.onerror       = (bits & 0x10000) ? gdispatchEvent : null;
                element.oncontextmenu = (bits & 0x20000) ? gdispatchEvent : null;
                element.onabort       = (bits & 0x11000) ? gdispatchEvent : null;
                element.onprogress    = (bits & 0x11001) ? gdispatchEvent : null;
                element.ondragstart   = (bits & 0x40000) ? gdispatchEvent : null;
                element.ondrag        = (bits & 0x40001) ? gdispatchEvent : null;
                element.ondragenter   = (bits & 0x40011) ? gdispatchEvent : null;
                element.ondragleave   = (bits & 0x40111) ? gdispatchEvent : null;
                element.ondragover    = (bits & 0x41111) ? gdispatchEvent : null;
                element.ondrop        = (bits & 0x40002) ? gdispatchEvent : null;
                element.ondragend     = (bits & 0x40012) ? gdispatchEvent : null;
                element.onsearch      = (bits & 0x50000) ? gdispatchEvent : null;
                element.onsubmit      = (bits & 0x60000) ? gdispatchEvent : null;
              },
  setEventListener: function(element, listener) {
                      element.__listener = listener;
                    },
  eventGetType: function(event) {
                  return event.type;
                },
  setIntStyleAttribute: function(element, attribute, value) {
                          element[attribute] = value;
                        },
  setInnerHTML: function(element, html) {
                  element.innerHTML = html;
                },
  getInnerHTML: function(element) {
                  var ret = element.innerHTML;
                  return (ret == null) ? null : ret;
                },
  setInnerText: function(element, text) {
                  if(element.firstChild) {
                    element.removeChild(element.firstChild);
                  }
                  element.appendChild(this.createText(text));
                },
  getInnerText: function(element) {
                  var text = '', child = element.firstChild;
                  while (child) {
                    if (child.nodeType == 1){
                      // 1 == Element node
                      text += DOM.getInnerText(child);
                    } else if (child.nodeValue) {
                      text += child.nodeValue;
                    }
                    child = child.nextSibling;
                  }
                  return text;
                },
  eventGetClientX: function(event) {
                     return event.clientX;
                   },
  eventGetClientY: function(event) {
                     return event.clientY;
                   },
  getAbsoluteLeft: function(element) {
                     var left = 0;
                     while (element) {
                       left += element.offsetLeft - element.scrollLeft;
                       element = element.offsetParent;
                     }
                     return left + document.body.scrollLeft;
                   },
  getAbsoluteTop: function(element) {
                    var top = 0;
                    while (element) {

                      top += element.offsetTop - element.scrollTop;
                      element = element.offsetParent;
                    }
                    return top + document.body.scrollTop;
                  },

  compare: function(element1, element2) {
             return element1 == element2;
           },

  /* style names */

  setStyleName: function(element, style) {
                  this.setAttribute(element, 'className', style);
                },

  getStyleName: function(element) {
                  return this.getAttribute(element, 'className');
                },

  removeStyleName: function(element, style) {
                     var names = this.getStyleNames(element);
                     names.remove(style);
                     this.setStyleName(element, names.join(' '));
                   },

  addStyleName: function(element, style){
                  var curr_style = this.getStyleName(element);
                  var names = this.getStyleNames(element);
                  if(names.index(style) == null) {
                    if(curr_style.length == 0 || names.length == 0)
                      this.setStyleName(element, style);
                    else
                      this.setStyleName(element, curr_style + " " + style);
                  }
                },

  getStyleNames: function(element) {
                   return this.getStyleName(element).split(' ');
                 },

  // FOCUS

  blur: function(elem) {
          elem.blur();
        },

  createFocusable: function() {
                     var e = $doc.createElement("DIV");
                     e.tabIndex = 0;
                     return e;
                   },

  focus: function(element) {
           element.focus();
         },

  getTabIndex: function(element) {
                 return element.tabIndex;
               },

  setAccessKey: function(element, key) {
                  element.accessKey = key;
                },

  setTabIndex: function(element, index) {
                 element.tabIndex = index;
               },

  getKeyboardModifiers: function(event) {
                          var shift = 0;
                          var ctrl = 0;
                          var alt = 0;

                          if (DOM.eventGetShiftKey(event))
                            shift = DOM.MODIFIER_SHIFT;

                          if(DOM.eventGetCtrlKey(event))
                            ctrl = DOM.MODIFIER_CTRL;

                          if(DOM.eventGetAltKey(event))
                            alt = DOM.MODIFIER_ALT;

                          return shift | ctrl | alt;
                        },

  eventCancelBubble: function(evt, cancel) {
                       evt.cancelBubble = cancel;
                     },

  eventGetAltKey: function(evt) {
                    return evt.altKey;
                  },

  eventGetButton: function(evt) {
                    return evt.button;
                  },

  eventGetClientX: function(evt) {
                     return evt.clientX;
                   },

  eventGetClientY: function(evt) {
                     return evt.clientY;
                   },

  eventGetCtrlKey: function(evt) {
                     return evt.ctrlKey;
                   },

  eventGetFromElement: function(evt) {
                         return evt.fromElement ? evt.fromElement : null;
                       },

  eventGetKeyCode: function(evt) {
                     return evt.which ? evt.which : evt.keyCode;
                   },

  eventGetRepeat: function(evt) {
                    return evt.repeat;
                  },

  eventGetScreenX: function(evt) {
                     return evt.screenX;
                   },

  eventGetScreenY: function(evt) {
                     return evt.screenY;
                   },

  eventGetShiftKey: function(evt) {
                      return evt.shiftKey;
                    },

  eventGetTarget: function(evt) {
                    return evt.target ? evt.target : evt.srcElement;
                  },

  eventGetToElement: function(evt) {
                       return evt.relatedTarget ? evt.relatedTarget : null;
                     },

  eventGetType: function(event) {
                  return event.type;
                },

  eventGetTypeInt: function(event) {
                     switch (event.type) {
                       case "blur": return 0x01000;
                       case "change": return 0x00400;
                       case "click": return 0x00001;
                       case "dblclick": return 0x00002;
                       case "focus": return 0x00800;
                       case "keydown": return 0x00080;
                       case "keypress": return 0x00100;
                       case "keyup": return 0x00200;
                       case "load": return 0x08000;
                       case "losecapture": return 0x02000;
                       case "mousedown": return 0x00004;
                       case "mousemove": return 0x00040;
                       case "mouseout": return 0x00020;
                       case "mouseover": return 0x00010;
                       case "mouseup": return 0x00008;
                       case "scroll": return 0x04000;
                       case "error": return 0x10000;
                       case "contextmenu": return 0x20000;
                       case "abort": return 0x11000;
                       case "progress": return 0x11001;
                       case "loadend": return 0x08001;
                       case "loadstart": return 0x08011;
                       case "dragstart": return 0x40000;
                       case "drag": return 0x40001;
                       case "dragenter": return 0x40011;
                       case "dragleave": return 0x40111;
                       case "dragover": return 0x41111;
                       case "drop": return 0x40002;
                       case "dragend": return 0x40012;
                       case "search": return 0x50000;
                       case "submit": return 0x60000;
                     }
                   },

  eventGetTypeString: function(event) {
                        return DOM.eventGetType(event);
                      },

  eventSetKeyCode: function(evt, key) {
                     evt.keyCode = key;
                   },

  eventToString: function(evt) {
                   return evt.toString();
                 },

  iframeGetSrc: function(elem) {
                  return elem.src;
                },
  // getPageScroll() by quirksmode.com
  getPageScroll: function() {
                   var xScroll, yScroll;
                   if (self.pageYOffset) {
                     yScroll = self.pageYOffset;
                     xScroll = self.pageXOffset;
                   } else if (document.documentElement && document.documentElement.scrollTop) {
                     yScroll = document.documentElement.scrollTop;
                     xScroll = document.documentElement.scrollLeft;
                   } else if (document.body) {// all other Explorers
                     yScroll = document.body.scrollTop;
                     xScroll = document.body.scrollLeft;
                   }
                   return [xScroll,yScroll];
                 },
  // Adapted from getPageSize() by quirksmode.com
  getPageHeight: function () {
                   var windowHeight;
                     if (self.innerHeight) { // all except Explorer
                       windowHeight = self.innerHeight;
                     } else if (document.documentElement && document.documentElement.clientHeight) {
                       windowHeight = document.documentElement.clientHeight;
                     } else if (document.body) { // other Explorers
                       windowHeight = document.body.clientHeight;
                     }
                   return windowHeight;
                 }
};

var Window = {

  getClientHeight: function() {
                     if (window.innerHeight)
                       return window.innerHeight;
                     else
                       return document.body.clientHeight;
                   },

  getClientWidth: function() {
                    if (window.innerWidth)
                      return window.innerWidth;
                    else
                      return document.body.clientWidth;
                  }
};

var Event = {
  BUTTON_LEFT:    1,
  BUTTON_MIDDLE:  4,
  BUTTON_RIGHT:   2,

  ONBLUR:         0x01000,
  ONCHANGE:       0x00400,
  ONCLICK:        0x00001,
  ONCONTEXTMENU:  0x20000,
  ONDBLCLICK:     0x00002,
  ONERROR:        0x10000,
  ONABORT:        0x11000,
  ONPROGRESS:     0x11001, 
  ONFOCUS:        0x00800,
  ONKEYDOWN:      0x00080,
  ONKEYPRESS:     0x00100,
  ONKEYUP:        0x00200,
  ONLOAD:         0x08000,
  ONLOADEND:      0x08001,
  ONLOADSTART:    0x08011,  
  ONLOSECAPTURE:  0x02000,
  ONMOUSEDOWN:    0x00004,
  ONMOUSEMOVE:    0x00040,
  ONMOUSEOUT:     0x00020,
  ONMOUSEOVER:    0x00010,
  ONMOUSEUP:      0x00008,
  ONSCROLL:       0x04000,
  ONDRAGSTART:    0x40000,
  ONDRAG:         0x40001,
  ONDRAGENTER:    0x40011,
  ONDRAGLEAVE:    0x40111,
  ONDRAGOVER:     0x41111,
  ONDROP:         0x40002,
  ONDRAGEND:      0x40012,
  ONSEARCH:       0x50000,
  ONSUBMIT:       0x60000, 

  FOCUSEVENTS:    0x01800, // ONFOCUS | ONBLUR,
  KEYEVENTS:      0x00380, // ONKEYDOWN | ONKEYPRESS | ONKEYUP
  MOUSEEVENTS:    0x0007C // ONMOUSEDOWN | ONMOUSEUP | ONMOUSEMOVE | ONMOUSEOVER | ONMOUSEOUT
};

var NotificationCenter = Class.extend({
  init: function() {
    this.notificationListeners = {};
  },
  postNotification: function(notificationType, source) {
    var l = this.notificationListeners[notificationType];
    for(var i=0; i<l.length; i++) {
      if(l[i]['on'+notificationType]) {
        l[i]['on'+notificationType](source);
      } else { 
        l[i](source);
      }
    }
  },
  addListener: function(notificationType, listener) {
    if(this.notificationListeners[notificationType] == undefined) {
      this.notificationListeners[notificationType] = [];
    }
    this.notificationListeners[notificationType].push(listener);
  }
});

window.nc = new NotificationCenter();

var UIObject = Class.extend({
  init: function() {
    //this.__element = DOM.createDiv();
    this.__element = null;
  },
  getElement: function() {
    return this.__element;
  },
  setElement: function(element) {
    this.__element = element;
    return this;
  },
  setAttr: function(name, value) {
    // Attributes on the DOM node reference object
    DOM.setAttribute(this.getElement(), name, value);
  },
  setAttributes: function(hash) {
    // Physical DOM node attributes
    if(typeof hash === "object") {
      for(var obj in hash) {
        $(this.getElement()).attr(obj, hash[obj]);
      }
    }
  },
  attach: function() {
    DOM.setEventListener(this.getElement(), this);
  },
  onBrowserEvent: function(event) {
    // alert('unhandled event: '+DOM.eventGetType(event));
  },
  adoptTo: function(parent) {
    //DOM.insertChild(parent,this.getElement(),-1);
    DOM.appendChild(parent,this.getElement());
  },
  adoptToId: function(parent_id) {
    this.adoptTo(document.getElementById(parent_id));
  },
  setStyle: function(name,value) {
    DOM.setStyleAttribute(this.getElement(),name,value);
    return this;
  },
  getStyle: function(name) {
    return DOM.getStyleAttribute(this.getElement(),name);
  },

  removeStyleName: function(style) {
    DOM.removeStyleName(this.getElement(), style);
  },

  addStyleName: function(style) {
    DOM.addStyleName(this.getElement(), style);
  },

  setPrimaryStyleName: function(style) {
    this.setStyleName(this.getElement(), style, false);
  },
  setStyleName: function(element,style,add) {
    if(style == null) {
      style = element;
      element = this.getElement();
    }
    if(add == false)
      DOM.setStyleName(element, style);
    else
      DOM.addStyleName(element, style);
  },

  getStyleName: function() {
    return DOM.getStyleName(this.getElement());
  },
  setWidth: function(width) {
    this.setStyle('width',width);
    return this;
  },
  setHeight: function(height) {
    this.setStyle('height',height);
    return this;
  },
  setSize: function(width, height) {
    this.setWidth(width);
    this.setHeight(height);
  },
  getWidth: function() {
    return this.getStyle('width');
  },
  getHeight: function(height) {
    return this.getStyle('height');
  },
  getAbsoluteLeft: function() {
    return DOM.getAbsoluteLeft(this.getElement());
  },
  getAbsoluteTop: function() {
    return DOM.getAbsoluteTop(this.getElement());
  },
  setTitle: function(title) {
    DOM.setAttribute(this.getElement(), "title", title);
  },
  isVisible: function() {
    return this.getStyle('display') != 'none';
  },
  setVisible: function(bool) {
    if (bool)
      this.setStyle('display','');
    else
      this.setStyle('display','none');
  },
  sinkEvents: function(bits) {
    DOM.sinkEvents(this.getElement(), bits);
  },
  setZindex: function(index) {
    DOM.setIntStyleAttribute(this.getElement(),'zIndex',index);
    return this;
  }
});


var Widget = UIObject.extend({
  init: function() {
    this._super();
    this.attached = false;
    this.parent = null;
  },
  getParent: function() {
    return this.parent;
  },
  setParent: function(parent) {
    var oldparent = this.parent;
    this.parent = parent;
    if(parent == null) {
      if((oldparent != null) && (oldparent.attached))
	this.onDetach();
    }
    else if (parent.attached) {
      this.onAttach();
    }
  },
  removeFromParent: function() {
    if(this.parent && this.parent['remove'])
      this.parent.remove(this);
  },
  getId: function() {
    return DOM.getAttribute(this.getElement(),'id');
  },
  setId: function(id) {
    DOM.setAttribute(this.getElement(), 'id', id);
    return this;
  },
  setLayoutData: function(data) {
    this.layoutData = data;
  },
  getLayoutData: function() {
    return this.layoutData;
  },
  onLoad: function() {
    // pass
  },
  doDetachChildren: function() {
    // pass
  },
  doAttachChildren: function() {
    // pass
  },
  isAttached: function() {
    return this.attached;
  },
  onAttach: function() {
    if(this.isAttached())
      return;
    this.attached = true;
    DOM.setEventListener(this.getElement(), this);
    this.doAttachChildren();
    this.onLoad();
  },
  onDetach: function() {
    if(!this.isAttached())
      return;
    this.doDetachChildren();
    this.attached = false;
    DOM.setEventListener(this.getElement(), null);
  }

});

var Panel = Widget.extend({
  init: function() {
    this._super();
    this.children = [];
  },
  clear: function() {
    for (var i = 0; i < this.children.length; i++) {
      // Physical detach
      var elem = this.children[i].getElement();
      DOM.removeChild(DOM.getParent(elem), elem);
      // Logical detach
      this.children[i].setParent(null);
      delete this.children[i];
    }
    this.children = [];
    return true;
  },
  doDetachChildren: function() {
    for(var i=0; i<this.children.length; i++)
      this.children[i].onDetach();
  },
  doAttachChildren: function() {
    for(var i=0; i<this.children.length; i++)
      this.children[i].onAttach();
  },
  orphan: function(widget) {
    widget.setParent(null);
  },
  disown: function(widget) {
    if(widget.getParent() != this)
      console.error("widget is not a child of this panel");
    else {
      var element = widget.getElement();
      widget.setParent(null);
      var parentElement = DOM.getParent(element);
      if (parentElement)
        DOM.removeChild(parentElement, element);
    }
  },
  adopt:function(widget, container, beforeIndex) {
    if(container) {
      widget.removeFromParent();
      if(beforeIndex === 0 && container.firstChild) {
        container.insertBefore(widget.getElement(), container.firstChild);
      } else {
        DOM.appendChild(container, widget.getElement());
      }
    }
    widget.setParent(this);
  }
});

var FocusWidget = Widget.extend({
  init: function(element) {
    this._super();
    this.setElement(element);
    this.clickListeners = [];
    this.focusListeners = [];
    this.mousedownListeners = [];
    this.mouseupListeners = [];
    this.mousemoveListeners = [];
    this.keyboardListeners = [];
    this.changeListeners = [];
    this.sinkEvents(Event.ONCLICK|Event.FOCUSEVENTS|Event.KEYEVENTS|Event.CHANGE|Event.ONMOUSEDOWN|Event.ONMOUSEUP|Event.ONMOUSEMOVE);
  },
  addChangeListener: function(listener) {
    this.changeListeners.push(listener);
    return this;
  },
  addClickListener: function(listener) {
    this.clickListeners.push(listener);
    return this;
  },
  addFocusListener: function(listener) {
    this.focusListeners.push(listener);
    return this;
  },
  addKeyboardListener: function(listener) {
    this.keyboardListeners.push(listener);
    return this;
  },
  addMouseDownListener: function(listener) {
    this.mousedownListeners.push(listener);
    return this;
  },
  addMouseUpListener: function(listener) {
    this.mouseupListeners.push(listener);
    return this;
  },
  addMouseMoveListener: function(listener) {
    this.mousemoveListeners.push(listener);
    return this;
  },
  onBrowserEvent: function(event) {
    var type = DOM.eventGetType(event);
    if (type == 'click') {
      for (var i = 0; i < this.clickListeners.length; i++) {
        this.clickListeners[i](this, event);
      }
    }
    else if (type == 'blur' || type == 'focus') {
      for (var i = 0; i < this.focusListeners.length; i++) {
        this.focusListeners[i](this, event);
      }
    }
    else if (type == 'keydown' || type == 'keypress' || type == 'keyup') {
      for (var i = 0; i < this.keyboardListeners.length; i++) {
        this.keyboardListeners[i](this, event);
      }
    }
    else if (type == 'change') {
      for (var i = 0; i < this.changeListeners.length; i++) {
        this.changeListeners[i](this, event);
      }
    }
    else if (type == 'mousedown') {
      for (var i = 0; i < this.mousedownListeners.length; i++) {
        this.mousedownListeners[i](this, event);
      }
    }
    else if (type == 'mouseup') {
      for (var i = 0; i < this.mouseupListeners.length; i++) {
        this.mouseupListeners[i](this, event);
      }
    }
    else if (type == 'mousemove') {
      for (var i = 0; i < this.mousemoveListeners.length; i++) {
        this.mousemoveListeners[i](this, event);
      }
    }
  }
});

var SimplePanel = Panel.extend({
  init: function(element) {
    this._super();
    if(!element) {
      element = DOM.createDiv();
    }
    this.setElement(element);
    this.setStyleName('gwt-SimplePanel');
  },
  add: function(widget) {
    if(this.getWidget()){
      console.error("Simple panel only supports one child");
      return;
    }
    this.setWidget(widget);
  },
  remove: function(widget) {
    this.orphan(widget);
    this.getContainerElement().removeChild(widget.getElement());
  	this.children = [];
  },
  getContainerElement: function() {
    return this.getElement();
  },
  getWidget: function() {
    if(this.children.length > 0)
      return this.children[0];
    else
      return null;
  },
  setWidget: function(widget) {
    if(this.getWidget() == widget)
      return;
    if (this.getWidget())
      this.remove(this.getWidget());
    if(widget) {
      this.adopt(widget, this.getContainerElement());
      this.children[0] = widget;
    }
  }
});

var ComplexPanel = Panel.extend({
  init: function() {
    this._super();
  },
  addFirst: function(widget) {
    this.insert(widget, this.getElement(), 0);
  },
  add: function(widget, container) {
    this.insert(widget, container, this.children.length);
  },
  getChildren: function() {
    return this.children;
  },
  insert: function(widget, container, beforeIndex){
    if(widget.getParent() == this)
      return;

    this.adopt(widget, container, beforeIndex);
    this.children.insert(beforeIndex,widget);
  },
  remove: function(widget) {
    this.disown(widget);
    this.children.remove(widget);
    return true;
  }
});

var EventObject = Class.extend({
  init: function(source) {
    this.source = source;
  },
  getSource: function() {
    return this.source;
  }
});

var CellPanel = ComplexPanel.extend({
  init: function() {
    this._super();
    this.table = DOM.createTable();
    this.body = DOM.createTBody();
    this.spacing = null;
    this.padding = null;
    DOM.appendChild(this.table, this.body);
    this.setElement(this.table);
  },
  getTable: function() {
    return this.table;
  },
  getBody: function() {
    return this.body;
  },
  getSpacing: function() {
    return this.spacing;
  },
  getPadding:function() {
    return this.padding;
  },
  getWidgetTd: function(widget) {
    if(widget.getParent() != this)
      return null;
    return DOM.getParent(widget.getElement());
  },
  setBorderWidth: function(width) {
    DOM.setAttribute(this.table, 'border', width);
  },
  setCellHeight: function(widget, height) {
    var td = DOM.getParent(widget.getElement());
    DOM.setAttribute(td, 'height', height);
  },
  setCellHorizontalAlignment: function(widget, align) {
    var td = this.getWidgetTd(widget);
    if (td != null)
      DOM.setAttribute(td, 'align', align);
  },
  setCellVerticalAlignment: function(widget, align) {
    var td = this.getWidgetTd(widget);
    if(td != null)
      DOM.setStyleAttribute(td, 'verticalAlign', align);
  },
  setCellWidth: function(widget, width) {
    var td = DOM.getParent(widget.getElement());
    DOM.setAttribute(td, 'width', width);
  },
  setSpacing: function(spacing) {
    this.spacing = spacing;
    DOM.setAttribute(this.table, 'cellSpacing', spacing);
  },
  setPadding: function(padding) {
    this.padding = padding;
    DOM.setAttribute(this.table, 'cellPadding', padding);
  }
});

var ButtonBase = FocusWidget.extend({
  init: function(element) {
    this._super(element);
  },
  getText: function() {
    return DOM.setInnerText(this.getElement());
  },
  setText: function(text) {
    DOM.setInnerText(this.getElement(), text);
  },
  getHTML: function() {
    return DOM.setInnerHTML(this.getElement());
  },
  setHTML: function(html) {
    DOM.setInnerHTML(this.getElement(), html);
  }
});

var TextBoxBase = FocusWidget.extend({
  init: function(element) {
    this._super(element);
    this.changeListeners = [];
    this.searchListeners = [];
    this.sinkEvents(Event.ONCHANGE|Event.ONCLICK|Event.FOCUSEVENTS|Event.KEYEVENTS|Event.ONSEARCH);
  },
  addChangeListener: function(listener) {
    this.changeListeners.push(listener);
  },
  addSearchListener: function(listener) {
    this.searchListeners.push(listener);
  },
  getCursorPos: function() {
    try {
      return this.getElement().selectionStart;
    } catch(e) {
      return 0;
    }
  },
  getSelectionLength: function() {
    try {
      var element = this.getElement();
      return element.selectionEnd - element.selectionStart;
    } catch(e) {
      return 0;
    }
  },
  getName: function() {
    return DOM.getAttribute(this.getElement(), 'name');
  },
  setName: function(name) {
    DOM.setAttribute(this.getElement(), 'name', name);
  },
  getText:function() {
    return DOM.getAttribute(this.getElement(),"value");
  },
  setText:function(text) {
    return DOM.setAttribute(this.getElement(),"value",text);
  },
  getSelectedText: function() {
    var start = this.getCursorPos();
    var length = this.getSelectionLength();
    var text = this.getText();
    return text.substring(start,start+length);
  },
  selectAll: function() {
    var length = this.getText().length;
    if(length > 0)
      this.setSelectionRange(0,length);
  },
  setSelectionRange:function(start,length) {
    this.getElement().setSelectionRange(start,start+length);
  },
  onBrowserEvent: function(event) {
	 var type = event.type;
	 if(type == 'change') {
  		for (var i = 0; i < this.changeListeners.length; i++) {
  			var listener = this.changeListeners[i];
  			if (listener.onChange)
    				listener.onChange(this,event);
  			else
    				listener(this, event);
    		}
  	} else if(type == 'search') {
      for (var i = 0; i < this.searchListeners.length; i++) {
          this.searchListeners[i](this, event);
        }
    } else {
    		this._super(event);
  	}
  }
});

var ValidationBoxBase = TextBoxBase.extend({
  init: function(element, validationFn) {
    this._super(element);
    this.getElement().widget = this;
    if(validationFn) {
      this.validationFn = validationFn;
    }
  },
  setForm: function(form) {
    // FormGrid.setWidget checks for this method (setForm) to exist, to determine if this object is counted as a validation object or not

    // Save pointer to the form that owns this Validation object
    this.form = form;
  },
  clear: function() {
    // Clear everything including validation
  },
  validate: function(showBubble) {
    // We can only show Bubble if we got a form pointer
    if(this.validationFn && this.form) {
      var valid = this.validationFn();
      if(!valid) {
        // Show error and supply form pointer so we can use it's bubble
        if(showBubble) {
          this.form.showErrorOnWidget(this);
        }
      } else {
        // Hide bubble because we know we wanted to show bubble for this object if there were errors
        // and this means we can safely hide it also without messing with other inputs showing it
        this.form.clearBubbleOnWidget(this);
      }
      return valid;
    } else if (this.validationFn && !this.form) {
      // Just validate since this object doesn't belong to a form, and cant show any bubble either
      return this.validationFn();
    } else {
      return false;
    }
  }
});

var TextBox = ValidationBoxBase.extend({
  init: function(fn) {
    this._super(DOM.createInputElement('text'), fn);
  }
});

var SearchBox = ValidationBoxBase.extend({
  init: function(fn) {
    this._super(DOM.createInputElement('search'), fn);
  }
});

var FileBox = ValidationBoxBase.extend({
  init: function(fn) {
    this._super(DOM.createInputElement('file'), fn);
  }
});

var AbsolutePanel = ComplexPanel.extend({
  init: function() {
    this._super();
    this.setElement(DOM.createDiv());
    DOM.setStyleAttribute(this.getElement(), 'position', 'relative');
    DOM.setStyleAttribute(this.getElement(), 'overflow', 'hidden');
    this.setStyleName('gwt-AbsolutePanel');
  },
  add: function(widget, left, top) {
    this._super(widget, this.getElement());
    if (left != null)
      this.setWidgetPosition(widget, left, top);
  },
  setWidgetPosition: function(widget, left, top) {
    this.checkWidgetParent(widget);
    var h = widget.getElement();
    if((left == -1) && (top == -1)) {
      DOM.setStyleAttribute(h, 'left', '');
      DOM.setStyleAttribute(h, 'top', '');
      DOM.setStyleAttribute(h, 'position' ,'static');
    }
    else {
      DOM.setStyleAttribute(h, 'position', 'absolute');
      DOM.setStyleAttribute(h, 'left', left + 'px');
      DOM.setStyleAttribute(h, 'top', top + 'px');
    }
  },
  getWidgetLeft: function(widget) {
    this.checkWidgetParent(widget);
    return DOM.getIntAttribute(widget.getElement(), 'offsetLeft');
  },
  getWidgetTop: function(widget) {
    this.checkWidgetParent(widget);
    return DOM.getIntAttribute(widget.getElement(), 'offsetTop');
  },
  checkWidgetParent: function(widget) {
    if(widget.getParent() != this)
      console.error("Widget must be a child of this panel");
  }
});

var CheckBox = ButtonBase.extend({
  init: function(text, asHTML) {
    this._super(DOM.createSpan());
    if(text != null) {
      this.initElement(DOM.createInputCheck());
      if(asHTML)
	       this.setHTML(text);
      else
	       this.setText(text);
    }
    this.validationObject = true;
  },
  initElement: function(element) {
    this.inputElement = element;
    this.labelElement = DOM.createLabel();
    DOM.sinkEvents(this.inputElement, Event.FOCUSEVENTS | Event.ONCLICK);
    DOM.appendChild(this.getElement(), this.inputElement);
    DOM.appendChild(this.getElement(), this.labelElement);
  },
  attach: function() {
    DOM.setEventListener(this.inputElement, this);
  },
  getText: function() {
    return DOM.getInnerText(this.labelElement);
  },
  setText: function(text) {
    DOM.setInnerText(this.labelElement,text);
  },
  getHTML: function() {
    return DOM.getInnerHTML(this.labelElement);
  },
  setHTML: function(html) {
    DOM.setInnerHTML(this.labelElement,html);
  },
  setWordWrap: function(wrap) {
    var style = 'normal';
    if(!wrap)
      style = 'nowrap';
    DOM.setStyleAttribute(this.getElement(), 'whiteSpace', style);

  }
});

var CellFormatter = Class.extend({
  init: function(outer) {
    this.outer = outer;
  },
  addStyleName: function(row, column, styleName) {
    this.outer.prepareCell(row, column);
    this.outer.setStyleName(this.getElement(row, column), styleName, true);
  },
  getElement: function(row, column) {
    this.outer.checkCellBounds(row, column);
    return DOM.getChild(this.outer.rowFormatter.getRow(this.outer.getBodyElement(), row), column);
  },
  getStyleName: function(row, column) {
    return DOM.getAttribute(this.getElement(row, column), "className");
  },
  isVisible: function(row, column) {
    var element = this.getElement(row, column);
    return this.outer.isVisible(element);
  },
  removeStyleName: function(row, column, styleName) {
    this.outer.checkCellBounds(row, column);
    this.outer.setStyleName(this.getElement(row, column), styleName, False);
  },
  setAlignment: function(row, column, hAlign, vAlign) {
    this.setHorizontalAlignment(row, column, hAlign);
    this.setVerticalAlignment(row, column, vAlign);
  },
  setWidth: function(row, column, width) {
    this.outer.prepareCell(row, column);
    DOM.setStyleAttribute(this.getCellElement(this.outer.getBodyElement(), row, column), "width", width);
  },
  setHeight: function(row, column, height) {
    this.outer.prepareCell(row, column);
    var element = this.getCellElement(this.outer.getBodyElement(), row, column);
    DOM.setStyleAttribute(element, "height", height);
  },
  setHorizontalAlignment: function(row, column, align) {
    this.outer.prepareCell(row, column);
    var element = this.getCellElement(this.outer.getBodyElement(), row, column);
    DOM.setAttribute(element, "align", align);
  },
  setStyleName: function(row, column, styleName) {
    this.outer.prepareCell(row, column);
    this.setAttr(row, column, "className", styleName);
  },
  setVerticalAlignment: function(row, column, align) {
    this.outer.prepareCell(row, column);
    DOM.setStyleAttribute(this.getCellElement(this.outer.getBodyElement(), row, column), "verticalAlign", align);
  },
  setVisible: function(row, column, visible) {
    var element = this.ensureElement(row, column);
    this.outer.setVisible(element, visible);
  },
  setWordWrap: function(row, column, wrap) {
    this.outer.prepareCell(row, column);
    if(wrap)
      wrap_str = "";
    else
      wrap_str = "nowrap";
    DOM.setStyleAttribute(this.getElement(row, column), "whiteSpace", wrap_str);
  },
  getCellElement: function(table, row, col) {
    var out = table.rows[row].cells[col];
    return (out == null ? null : out);
  },
  getRawElement: function(row, column) {
    return this.getCellElement(this.outer.getBodyElement(), row, column);
  },
  ensureElement: function(row, column) {
    this.outer.prepareCell(row, column);
    return DOM.getChild(this.outer.rowFormatter.ensureElement(row), column);
  },
  getStyleAttr: function(row, column, attr) {
    var element = this.getElement(row, column);
    return DOM.getStyleAttribute(element, attr);
  },
  setStyleAttr: function(row, column, attrName, value) {
    var element = this.getElement(row, column);
    DOM.setStyleAttribute(element, attrName, value);
  },
  getAttr: function(row, column, attr) {
    var element = this.getElement(row, column);
    return DOM.getAttribute(element, attr);
  },
  setAttr: function(row, column, attrName, value) {
    var element = this.getElement(row, column);
    DOM.setAttribute(element, attrName, value);
  }
});

var HTMLTable = Panel.extend({
  init: function() {
    this._super();
    this.cellFormatter = new CellFormatter(this);
    this.rowFormatter = new RowFormatter(this);
    this.tableListeners = [];
    this.widgetMap = {};
    this.tableElement = DOM.createTable();
    this.bodyElement = DOM.createTBody();
    DOM.appendChild(this.tableElement, this.bodyElement);
    this.setElement(this.tableElement);
    this.sinkEvents(Event.ONCLICK|Event.ONKEYPRESS|Event.ONFOCUS|Event.ONBLUR|Event.ONMOUSEOVER);
  },
  onBrowserEvent: function(event) {
  	var type = DOM.eventGetType(event);
    //IE fix if
    event.target = (event.target) ? event.target : event.srcElement;
    if(type === 'click' || type === 'keypress' || type === 'focus' || type === 'blur' || type === 'mouseover') {
      DOM.eventCancelBubble(event,true);
      for(var i=0; i<this.tableListeners.length; i++) {
        this.tableListeners[i](this,event);
      }
    }
  }, 
  internalClearCell: function(td) {
    var maybeChild = DOM.getFirstChild(td);
    var widget = null;
    if(maybeChild != null)
      widget = this.getWidget(maybeChild);
    if(widget != null) {
      this.removeWidget(widget);
      return true;
    }
    DOM.setInnerHTML(td,'');
    return false;
  },
  cleanCell: function(row,col) {
    var td = this.cellFormatter.getRawElement(row,col);
    this.internalClearCell(td);
    return td;
  },
  getWidget: function(elem) {
  	var widget_hash = DOM.getAttribute(elem, '__hash');
  	return this.widgetMap[widget_hash];
  },
  removeWidget: function(widget) {
    if (widget.getParent() != this) {
      return false;
    }
    this.orphan(widget);
    // Physical detach.
    var elem = widget.getElement();
    DOM.removeChild(DOM.getParent(elem), elem);
    // Logical detach.
    var key = DOM.getAttribute(elem, '__hash');
    delete this.widgetMap[key];
    return true;
  },
  setWidget: function(row,col,widget) {
    this.prepareCell(row,col);
    if(widget == null)
      return;
    widget.removeFromParent();
    var td = this.cleanCell(row,col);
    var widget_hash = hash(widget);
    var element = widget.getElement();
    DOM.setAttribute(element, "__hash", widget_hash);
    this.widgetMap[widget_hash] = widget;
    this.adopt(widget, td);
  },
  prepareCell: function(row,col) {
    // pass
  },
  prepareRow: function(row) {
    // pass
  },
  getBodyElement: function() {
    return this.bodyElement;
  },
  setBorderWidth: function(width) {
    DOM.setAttribute(this.tableElement, "border", width);
  },
  getCellFormatter: function() {
    return this.cellFormatter;
  },
  getRowFormatter: function() {
    return this.rowFormatter;
  },
  setCellPadding: function(padding) {
    DOM.setAttribute(this.tableElement, "cellPadding", padding);
  },
  setCellSpacing: function(spacing) {
    DOM.setAttribute(this.tableElement, "cellSpacing", spacing);
  },
  addTableListener: function(listener) {
    this.tableListeners.push(listener);
  },
  getDOMCellCount: function(element, row) {
    if (row == null)
      return this.getDOMCellCountImpl(this.getBodyElement(), element);
    return this.getDOMCellCountImpl(element, row);
  },
  getDOMCellCountImpl: function(element, row) {
    return element.rows[row].cells.length;
  },
  getDOMRowCount: function(element) {
    if (element == null)
      element = this.getBodyElement();
    return element.rows.length;
  },
  insertRow: function() {
    var tr = DOM.createTR();
    DOM.insertChild(this.getBodyElement(), tr, -1);
    return tr;
  },
  getRow: function(rownum) {
    return this.bodyElement.rows[rownum];
  },
  createCell: function() {
    return DOM.createTD();
  },
  checkRowBounds: function(row) {
    // todo
  },
  insertCell: function(row,col) {
    var tr = this.rowFormatter.getRow(this.getBodyElement(), row);
    var td = this.createCell();
    DOM.insertChild(tr, td, -1);
    return td;
  },
  getEventTargetCell: function(event) {
	return DOM.eventGetTarget(event);
  },
  getEventTargetWidget: function(event) {
    var hash = DOM.getAttribute(this.getEventTargetCell(event),"__hash");
    return this.widgetMap[hash];
  } 
});

var Hidden = Widget.extend({
  init: function(name, value) {
    this._super();
    var element = DOM.createElement('input');
    this.setElement(element);
    DOM.setAttribute(element, 'type', 'hidden');
    if(name)
      this.setName(name);
    if(value)
      this.setValue(value);
  },
  getDefaultValue: function() {
    return DOM.getAttribute(this.getElement(), 'defaultValue');
  },
  getName: function() {
    return DOM.getAttribute(this.getElement(), 'name');
  },
  getValue: function() {
    return DOM.getAttribute(this.getElement(), 'value');
  },
  setDefaultValue: function(defaultValue) {
    DOM.setAttribute(this.getElement(), 'defaultValue', defaultValue);
  },
  setName: function(name) {
    if (!name) {
      console.error('name can not be null!');
    } else if(name.length == 0) {
      console.error('name can not be empty');
    }
    else {
      DOM.setAttribute(this.getElement(), 'name', name);
    }
  },
  setValue: function(value) {
    DOM.setAttribute(this.getElement(), 'value', value);
  }
});

var CMSObject = Widget.extend({
  init: function(cmsobj) {
    this._super();
    if(!this.getElement()) {this.setElement(DOM.createDiv()); }
    this.clickListeners = [];
    this.obj = cmsobj;
  },
  setupCMSObj: function() {
    //Flag set in common.js
    if(window.CMSAdminMode) {
      var self = this;
      this.sinkEvents(Event.ONCLICK);
      this.addStyleName("clickable");

      if(typeof this.obj === "string") {
        var tmp = this.obj.split("(")[1].split(")")[0].split("/");
        this.obj = [];
        this.obj[0] = null;
        this.obj[1] = tmp[0];
        this.obj[2] = tmp[1];
        this.obj[3] = tmp[2];
      }
      this.sinkEvents(Event.ONCLICK);
      this.setStyleName("clickable");
      this.addClickListener(function(event){

        //TEMP hack before SSL termination is in place:
        config["OCEAN_CMS_CLIENT_URL"] = config["OCEAN_CMS_CLIENT_URL"].replace("https", "http").replace("cms", "cms-lb");
        var appname = (self.obj[3] !== undefined && self.obj[3] !== 'undefined') ? self.obj[3] : config["APP_NAME"];
        window.open('http://localhost:3005/cms/#/' + appname + '/' + self.obj[1] + '/' + self.obj[2] + '/' + config["LOCALE"] + '/' + self.usage);
      });
    }
  },
  addClickListener: function(listener) {
    this.clickListeners.push(listener);
  },
  onBrowserEvent: function(event) {
    var type = event.type;
    if(type == 'click') {
      for(var i=0; i<this.clickListeners.length; i++) {
        var listener = this.clickListeners[i];
        if(listener.onClick) {
          listener.onClick(event);
        } else {
          listener(event);
        }
      }
    }
  },
 });

var Label = CMSObject.extend({
  init: function(cmsobj, wordwrap) {
    this._super(cmsobj);
    this.setWordWrap(wordwrap);
  },
  getText: function() {
    return DOM.getInnerText(this.getElement());
  },
  setText: function(text) {
    DOM.setInnerText(this.getElement(),text);
  },
  replaceText: function(text) {
    DOM.setInnerHTML(this.getElement(), text);
  },
  setWordWrap: function(wrap) {
    var style = 'normal';
    if(!wrap)
      style = 'nowrap';
    DOM.setStyleAttribute(this.getElement(), 'whiteSpace', style);

  },
  getHorizontalAlignment: function() {
    return this.horizontalAlign;
  },
  setHorizontalAlignment: function(align) {
    this.horizontalAlign = align;
    DOM.setStyleAttribute(this.getElement(), 'textAlign', align);
  }
});

var Text = Label.extend({
  init: function(cmsobj, wordwrap) {
    this._super(cmsobj, wordwrap);
    
    if(typeof cmsobj === "object") {
      this.setText(cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(),cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();
  }
});

var Image = Label.extend({
  init: function(cmsobj) {
    this._super(cmsobj);

    if(typeof cmsobj === "object") {
      this.setElement(html.img({'src':cmsobj[0].replace('https','http')}));
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'image';
    this.setupCMSObj();
  }
});

var SpriteSheet = Label.extend({
  init: function(cmsobj) {
    this._super(cmsobj);

    if(typeof cmsobj === "object") {
      this.setElement(html.div({}));
      $(this.getElement()).css('background-image', 'url(' + cmsobj[0].replace('https','http') + ')');
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'image';
    this.setupCMSObj();
  }
});

var SpriteSheetLink = Label.extend({
  init: function(cmsobj) {
    this._super(cmsobj);

    if(typeof cmsobj === "object") {
      this.setElement(html.a({}));
      $(this.getElement()).css('background-image', 'url(' + cmsobj[0].replace('https','http') + ')');
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'image';
    this.setupCMSObj();
  }
});

var Markdown = Label.extend({
  init: function(cmsobj) {
    this._super(cmsobj, true);

    if(typeof cmsobj === "object") {
      DOM.setInnerHTML(this.getElement(), cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'markdown';
    this.setupCMSObj();
  }
});

var Link = Label.extend({
  init: function(htmlobj) {
    this._super(htmlobj);
    
    //obj in this case is supposed to be a complete html a-tag in string format that we convert to a node
    if(typeof htmlobj === "object") {
      this.setElement($(htmlobj[0])[0]);
    } else {
      var tmp = DOM.createDiv();
      DOM.setInnerText(tmp,htmlobj);
      this.setElement(tmp);
    }
    this.usage = 'link';
    this.setupCMSObj();
  }
});

var Header1 = Label.extend({
  init: function(cmsobj) {
    this._super(cmsobj);
    this.setElement(DOM.createH1());
    
    if(typeof cmsobj === "object") {
      this.setText(cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(),cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();
  }
});

var Header2 = Label.extend({
  init: function(cmsobj) {
    this._super(cmsobj);
    this.setElement(DOM.createH2());

    if(typeof cmsobj === "object") {
      this.setText(cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(),cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();
  }
});

var Header3 = Label.extend({
  init: function(cmsobj) {
    this._super(cmsobj);
    this.setElement(DOM.createH3());
    
    if(typeof cmsobj === "object") {
      this.setText(cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(),cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();
  }
});


var HTML = Label.extend({
  init: function(html, wordwrap) {
    if(wordwrap == null)
      wordwrap = true;
    this._super();
    this.setElement(DOM.createDiv());
    this.sinkEvents(Event.ONCLICK|Event.MOUSEEVENTS);
    if(html)
      this.setHTML(html);
    this.setWordWrap(wordwrap);
  },
  getHTML: function() {
    return DOM.getInnerHTML(this.getElement());
  },
  setHTML: function(html) {
    DOM.setInnerHTML(this.getElement(), html);
  }
});

var FlowPanel = ComplexPanel.extend({
  init: function() {
    this._super();
    this.setElement(DOM.createDiv());
    //this.setStyleName('gwt-FlowPanel');
  },
  add: function(widget) {
    this._super(widget, this.getElement());
  },
  getWidget: function(index) {
    return this.children[index];
  },
  getWidgetCount: function() {
    return this.children.length;
  },
  getWidgetIndex: function(widget) {
    return this.children.index(widget);
  }
});

var ValidationGroup = FlowPanel.extend({
  init: function(validationFn) {
    this._super();
    this.getElement().widget = this;
    if(validationFn) {
      this.validationFn = validationFn;
    }
    // Array of all validation objects in this group in order they are added
    this.group = [];
  },
  add: function(widget) {
    this._super(widget, this.getElement());

    // If a validation object save it's reference
    if(widget.validationObject) {
      this.group.push(widget);
    }
  },
  setForm: function(form) {
    // FormGrid.setWidget checks for this method (setForm) to exist, to determine if this object is counted as a validation object or not

    // Save pointer to the form that owns this Validation object
    this.form = form;
  },
  clear: function() {
    // Clear everything including validation
  },
  validate: function(showBubble) {
    // We can only show Bubble if we got a form pointer
    if(this.validationFn && this.form) {
      var valid = this.validationFn();
      if(!valid) {
        // Show error and supply form pointer so we can use it's bubble
        if(showBubble) {
          this.form.showErrorOnWidget(this);
        }
      } else {
        // Hide bubble because we know we wanted to show bubble for this object if there were errors
        // and this means we can safely hide it also without messing with other inputs showing it
        this.form.clearBubbleOnWidget(this);
      }
      return valid;
    } else if (this.validationFn && !this.form) {
      // Just validate since this object doesn't belong to a form, and cant show any bubble either
      return this.validationFn();
    } else {
      return false;
    }
  }
});

var FocusPanel = FlowPanel.extend({
  init: function() {
    this._super();
    this.clickListeners = [];
    this.focusListeners = [];
    this.keyboardListeners = [];
    this.sinkEvents(Event.ONCLICK|Event.FOCUSEVENTS|Event.KEYEVENTS);
  },
  addClickListener: function(listener) {
    this.clickListeners.push(listener);
    return this;
  },
  addFocusListener: function(listener) {
    this.focusListeners.push(listener);
    return this;
  },
  addKeyboardListener: function(listener) {
    this.keyboardListeners.push(listener);
    return this;
  },
  onBrowserEvent: function(event) {
    var type = DOM.eventGetType(event);
    if (type == 'click') {
      for (var i = 0; i < this.clickListeners.length; i++) {
        this.clickListeners[i](this, event);
      }
    }
    else if (type == 'blur' || type == 'focus') {
      for (var i = 0; i < this.focusListeners.length; i++) {
        this.focusListeners[i](this, event);
      }
    }
    else if (type == 'keydown' || type == 'keypress' || type == 'keyup') {
      for (var i = 0; i < this.keyboardListeners.length; i++) {
        this.keyboardListeners[i](this, event);
      }
    }
  }
});

var VerticalPanel = CellPanel.extend({
  init: function() {
    this._super();
    this.hAlign = DOM.ALIGN_LEFT;
    this.vAlign = DOM.ALIGN_TOP;
    DOM.setAttribute(this.getTable(), 'cellSpacing', '0');
    DOM.setAttribute(this.getTable(), 'cellPadding', '0');
  },
  add: function(widget) {
    this.insert(widget, this.getWidgetCount());
  },
  getHorizontalAlignment: function() {
    return this.hAlign ;
  },
  getVerticalAlignment: function() {
    return this.vAlign;
  },
  getWidget: function(index) {
    return this.children[index];
  },
  getWidgetCount: function() {
    return this.children.length;
  },
  getWidgetIndex: function(child) {
    return this.children.index(child);
  },
  setWidget: function(index, widget) {
    var existing = this.getWidget(index);
    if (existing)
      this.remove(widget, index);
    this.insert(widget, index);
  },
  insert: function(widget, beforeIndex) {
    widget.removeFromParent();
    var tr = DOM.createTR();
    var td = DOM.createTD();
    DOM.insertChild(this.getBody(), tr, beforeIndex);
    DOM.appendChild(tr, td);
    this._super(widget, td, beforeIndex);
    this.setCellHorizontalAlignment(widget, this.hAlign);
    this.setCellVerticalAlignment(widget,this.vAlign);
  },
  remove: function(widget) {
    // TODO
  },
  setHorizontalAlignment: function(align) {
    this.hAlign = align;
  },
  setVerticalAlignment: function(align) {
    this.vAlign = align;
  }
});

var ScrollPanel = SimplePanel.extend({
  init: function(child) {
    this._super();
    this.scrollListeners = [];
    this.setAlwaysShowScrollBars(false);
    this.sinkEvents(Event.ONSCROLL);
    if(child)
      this.setWidget(child);
  },
  addScrollListener: function(listener) {
    this.scrollListeners.push(listener);
  },
  ensureVisible: function(item) {
    var scroll = this.getElement();
    var element = item.getElement();
    this.ensureVisibleImpl(scroll, element);
  },
  getScrollPosition: function() {
    return DOM.getAttribute(this.getElement(), 'scrollTop');
  },
  getHorizontalScrollPosition: function() {
    return DOM.getAttribute(this.getElement(), 'scrollLeft');
  },
  onBrowserEvent: function(event) {
    var type = event.type;
    if(type == 'scroll') {
      for(var i=0; i<this.scrollListeners.length; i++)
	this.scrollListeners[i].onScroll(this, this.getHorizontalScrollPosition(), this.getScrollPosition());
    }
  },
  setAlwaysShowScrollBars: function(alwaysShow) {
    var value = 'scroll';
    if(!alwaysShow)
      value = 'auto';
    DOM.setStyleAttribute(this.getElement(), 'overflow', value);
  },
  setScrollPosition: function(position) {
    DOM.setAttribute(this.getElement(), 'scrollTop', position);
  },
  setHorizontalScrollPosition: function(position) {
    DOM.setAttribute(this.getElement(), 'scrollLeft', position);
  },
  ensureVisibleImpl: function(scroll, element) {
    if (!e)
      return;
    var item = element;
    var realOffset = 0;
    while (item && (item != scroll)) {
      realOffset += item.offsetTop;
      item = item.offsetParent;
    }
    scroll.scrollTop = realOffset - scroll.offsetHeight / 2;
  }
});

var TextArea = TextBoxBase.extend({
  init: function() {
    this._super(DOM.createTextArea());
    this.setStyleName('wtr-TextArea');
  },
  getCharacterWidth: function() {
    return DOM.getAttribute(this.getElement(), 'cols');
  },
  getVisibleLines: function() {
    return DOM.getAttribute(this.getElement(), 'rows');
  },
  setVisibleLines: function(lines) {
    DOM.setAttribute(this.getElement(), 'rows', lines);
  },
  setCharacterWidth: function(width) {
    DOM.setAttribute(this.getElement(), 'cols', width);
  }
});

var $wnd = window;
var $doc = $wnd.document;

var RootPanel = AbsolutePanel.extend({
  init: function(element) {
    this._super();
    if(!element)
		  element = this.getBodyElement();
  	else if(typeof(element) === 'string')
  		element = DOM.getElementById(element);
    this.setElement(element);
    this.onAttach();
  },
  getBodyElement: function() {
    return $doc.body;
  }
});

var RadioButton = CheckBox.extend({
  init: function(group, label, asHTML) {
    this._super();
    this.initElement(DOM.createInputRadio(group));
    this.setStyleName('gwt-RadioButton');
    if(label != null) {
      if (asHTML == true)
      	this.setHTML(label);
      else
      	this.setText(label);
    }
    this.validationObject = true;
  }
});

var ListBox = FocusWidget.extend({
  init: function() {
    this._super(DOM.createSelect());
    this.changeListeners = [];
    this.sinkEvents(Event.ONCHANGE);
    this.validationObject = true;
  },
  addChangeListener: function(listener) {
    this.changeListeners.push(listener);
  },
  getSelectedIndex: function() {
    return DOM.getAttribute(this.getElement(), "selectedIndex");
  },
  getValue: function(index) {
    var option = DOM.getChild(this.getElement(), index);
    return DOM.getAttribute(option, "value");
  },
  getSelectedValue: function() {
    var index = this.getSelectedIndex();
    return this.getValue(index);
  },
  getVisibleItemCount: function() {
    return DOM.getAttribute(this.getElement(), "size");
  },
  setVisibleItemCount: function(count) {
    DOM.setAttribute(this.getElement(), "size", count);
  },
  insertItem: function(item, value, index) {
    DOM.insertListItem(this.getElement(), item, value, index);
  },
  addItem: function(item, value) {
    DOM.insertListItem(this.getElement(), item, value, -1);
  },
  onBrowserEvent: function(event) {
    if(event.type == 'change') {
      for (var i = 0; i < this.changeListeners.length; i++) {
	var listener = this.changeListeners[i];
	if (listener.onChange)
	  listener.onChange(this,event);
	else
	  listener(this, event);
      }
    }
  }
});

var HorizontalPanel = CellPanel.extend({
  init: function() {
    this._super();
    this.hAlign = DOM.ALIGN_LEFT;
    this.vAlign = DOM.ALIGN_TOP;

    this.tableRow = DOM.createTR();
    DOM.appendChild(this.getBody(), this.tableRow);

    DOM.setAttribute(this.getTable(), 'cellSpacing', '0');
    DOM.setAttribute(this.getTable(), 'cellPadding', '0');
  },
  add: function(widget) {
    this.insert(widget, this.getWidgetCount());
  },
  getHorizontalAlignment: function() {
    return this.hAlign;
  },
  getVerticalAlignment: function() {
    return this.vAlign;
  },
  getWidget: function(index) {
    return this.children[index];
  },
  getWidgetCount: function() {
    return this.children.length;
  },
  getWidgetIndex: function(child) {
    return this.children.index(child);
  },
  setWidget: function(index, widget) {
    var existing = this.getWidget(index);
    if (existing)
      this.remove(widget, index);
    this.insert(widget, index);
  },
  insert: function(widget, beforeIndex) {
    widget.removeFromParent();
    var td = DOM.createTD();
    DOM.insertChild(this.tableRow, td, beforeIndex);
    this._super(widget, td, beforeIndex);
    this.setCellHorizontalAlignment(widget, this.hAlign);
    this.setCellVerticalAlignment(widget,this.vAlign);
  },
  remove: function(widget) {
    // TODO
  },
  setHorizontalAlignment: function(align) {
    this.hAlign = align;
  },
  setVerticalAlignment: function(align) {
    this.vAlign = align;
  }
});

var IFrame = Widget.extend({
  init: function(url) {
    this._super();
    this.setElement(DOM.createIFrame());
    if(url)
      this.setURL(url);
  },
  getURL: function() {
    return DOM.getAttribute(this.getElement(),'src');
  },
  setURL: function(url) {
    DOM.setAttribute(this.getElement(),'src',url);
    return this;
  }
});

var FlexCellFormatter = CellFormatter.extend({
  init: function(outer) {
    this._super(outer);
  },

  getColSpan: function(row, column) {
    return DOM.getAttribute(this.getElement(row, column), "colSpan");
  },

  getRowSpan: function(row, column) {
    return DOM.getAttribute(this.getElement(row, column), "rowSpan");
  },

  setColSpan: function(row, column, colSpan) {
    DOM.setAttribute(this.ensureElement(row, column), "colSpan", colSpan);
  },

  setRowSpan: function(row, column, rowSpan) {
    DOM.setAttribute(this.ensureElement(row, column), "rowSpan", rowSpan);
  }

});

var PasswordTextBox = TextBoxBase.extend({
  init: function() {
    this._super(DOM.createInputPassword());
    this.setStyleName('wtr-PasswordTextBox');
  }
});

var LazyPanel = SimplePanel.extend({
	/* 
		override createWidget in subclasses 
	*/
	ensureWidget: function() {
		var widget = this.getWidget();
		if(widget == undefined) {
			widget = this.createWidget();
			this.setWidget(widget);	
		}
	},
	setVisible:function(bool) {
		if(bool) {
			this.ensureWidget();
		}
		this._super(bool);
	}
});

var Grid = HTMLTable.extend({
  init: function(rows, cols) {
    this._super();
    //this.numCols = 0
    //this.numRows = 0
    this.create(rows,cols);
    this.setStyleName('gwt-Grid');
  },
  createCell: function() {
    var td = this._super();
    DOM.setInnerHTML(td, "&nbsp");
    return td;
  },
  create: function(rows,cols) {
    for(var i=0; i<rows; i++) {
      this.insertRow(i);
      for(var j=0; j<cols; j++) {
        this.insertCell(i,j);
      }
    }
  },
  setHeader: function(pos, name) {
    var label = new Label(name);
    label.setStyleName("table-header");
    this.setWidget(0, pos, label);
  }
});

var RowFormatter = Class.extend({
  init: function(outer) {
    this.outer = outer;
  },

  addStyleName: function(row, styleName) {
    this.outer.setStyleName(this.ensureElement(row), styleName, True);
  },

  getElement: function(row) {
    this.outer.checkRowBounds(row);
    return this.getRow(this.outer.getBodyElement(), row);
  },

  getStyleName: function(row) {
    return DOM.getAttribute(this.getElement(row), "className");
  },

  isVisible: function(row) {
    var element = this.getElement(row);
    return this.outer.isVisible(element);
  },
  removeStyleName: function(row, styleName) {
    this.outer.setStyleName(this.getElement(row), styleName, false);
  },

  setStyleName: function(row, styleName) {
    var elem = this.ensureElement(row);
    DOM.setAttribute(elem, "className", styleName);
  },

  setVerticalAlign: function(row, align) {
    DOM.setStyleAttribute(this.ensureElement(row), "verticalAlign", align);
  },

  setVisible: function(row, visible) {
    var element = this.ensureElement(row);
    this.outer.setVisible(element, visible);
  },

  ensureElement: function(row) {
    this.outer.prepareRow(row);
    return this.getRow(this.outer.getBodyElement(), row);
  },

  getRow: function(element, row) {
    return element.rows[row];
  },

  setStyleAttr: function(row, attrName, value) {
    var element = this.ensureElement(row);
    DOM.setStyleAttribute(element, attrName, value);
  },

  setAttr: function(row, attrName, value) {
    var element = this.ensureElement(row);
    DOM.setAttribute(element, attrName, value);
  }
});

var HTMLPanel_uid = 0;

var HTMLPanel = ComplexPanel.extend({
  init: function(html) {
    this._super();
    this.setElement(DOM.createDiv());
    DOM.setInnerHTML(this.getElement(), html);
  },
  add: function(widget, id) {
    var element = this.getElementById(this.getElement(), id);
    if(element)
      this._super(widget, element);
  },
  createUniqueId: function() {
    HTMLPanel_uid += 1;
    return "HTMLPanel_"+HTMLPanel_uid;
  },
  getElementById: function(element, id) {
    var element_id = DOM.getAttribute(element, "id");
    if((element_id != null) && (element_id == id))
      return element;
    var child = DOM.getFirstChild(element);
    while(child != null) {
      var ret = this.getElementById(child, id);
      if(ret != null)
	return ret;
      child = DOM.getNextSibling(child);
    }
    return null;
  }
});

var DeckPanel = ComplexPanel.extend({
  init: function() {
    this._super();
    this.visibleWidget = null;
    this.setElement(DOM.createDiv());
    this.setStyleName('gwt-DeckPanel');
  },
  add: function(widget) {
    this.insert(widget, this.getWidgetCount());
  },
  getVisibleWidget: function() {
    return this.getWidgetIndex(this.visibleWidget);
  },
  getWidget: function(index) {
    return this.children[index];
  },
  getWidgetCount: function() {
    return this.children.length;
  },
  getWidgetIndex: function(child) {
    return this.children.index(child);
  },
  insert: function(widget, beforeIndex) {
    if((beforeIndex < 0) || (beforeIndex > this.getWidgetCount()))
      return;
    this._super(widget, this.getElement(), beforeIndex);
    var child = widget.getElement();
    //DOM.setStyleAttribute(child, 'width', '100%');
    //DOM.setStyleAttribute(child, 'height', '100%');
    widget.setVisible(false);
  },
  remove: function(widget) {
    if(!this._super(widget))
      return;
    if(this.visibleWidget == widget)
      this.visibleWidget = null;
    return true;
  },
  showWidget: function(index) {
    this.checkIndex(index);
    if(this.visibleWidget != null)
      this.visibleWidget.setVisible(false);
    this.visibleWidget = this.getWidget(index);
    this.visibleWidget.setVisible(true);
  },
  fadeToWidget: function(index) {
  	// TEMPFIX:
    /*
    .browser deprecated in jquery 1.9 and above.
    This is to encourage feature checks rather than browser
    TODO: Make tests with IE and make proper changes if it still has problems animating smoothly
  	if($.browser.msie) {
  		this.showWidget(index);
  		return;
  	}
    */
    this.checkIndex(index);
  	var self = this;
    if(this.visibleWidget != null) {
  		if(this.visibleWidget === self.getWidget(index))
  			return;
  		$(this.visibleWidget.getElement(),self.getElement()).fadeOut(200,function() {
  			self.visibleWidget.setVisible(false);
  			self.visibleWidget = self.getWidget(index);
        self.visibleWidget.setVisible(true);
  			$(self.visibleWidget.getElement(),self.getElement()).fadeIn(200,function() {
        			
  			});
  		});
  	} else {
  		this.visibleWidget = this.getWidget(index);
  		this.visibleWidget.setVisible(true);
  		$(this.visibleWidget.getElement()).fadeIn(200);
  	}
  },
  checkIndex: function(index) {
    if((index < 0) || (index >= this.getWidgetCount()))
      console.error('Deckpanel#checkIndex bad index');
  }
});

var Button = ButtonBase.extend({
  init: function(html, listener) {
    this._super(DOM.createButton());
    this.setHTML(html);
    if(listener)
      this.addClickListener(listener);
    this.setStyleName('gwt-Button');
  }
});

var WImage = Widget.extend({
  init: function(url) {
    this._super();
    this.clickListeners = [];
    this.loadListeners = [];
    this.mouseListeners = [];
    this.setElement(DOM.createImage());
    this.sinkEvents(Event.ONCLICK | Event.MOUSEEVENTS | Event.ONLOAD | Event.ONERROR);
    if(url) this.setUrl(url);
  },
  reload: function() {
    var url = this.getUrl();
    var sp = url.split("#");
    this.setUrl(sp[0]+ '#' + (new Date()).getTime());
  },
  getUrl: function() {
    return DOM.getAttribute(this.getElement(), "src");
  },
  setUrl: function(url) {
    DOM.setAttribute(this.getElement(), "src", url);
  },
  addClickListener: function(listener) {
    this.clickListeners.push(listener);
  },
  addLoadListener: function(listener) {
    this.loadListeners.push(listener);
  },
  addMouseListener: function(listener) {
    this.mouseListeners.push(listener);
  },
  onBrowserEvent: function(event) {
    var type = event.type;
    if (type == 'click') {
      for (var i = 0; i < this.clickListeners.length; i++) {
      	var listener = this.clickListeners[i];
      	if (listener.onLoad)
      	  listener.onClick(this,event);
      	else
      	  listener(this, event);
      }
    }
    else if (type == 'mousedown' || type == 'mouseup' || type == 'mousemove' || type == 'mouseover' || type == 'mouseout') {
      for (var i = 0; i < this.mouseListeners.length; i++) {
      	var listener = this.mouseListeners[i];
      	listener(this, event);
      }
    }
    else if (type == 'load') {
      for (var i = 0; i < this.loadListeners.length; i++) {
      	var listener = this.loadListeners[i];
      	if (listener.onLoad)
      	  listener.onLoad(this,event);
      	else
      	  listener(this, event);
      }
    }
    else if (type == 'error') {
      for (var i = 0; i < this.loadListeners.length; i++) {
      	var listener = this.loadListeners[i];
      	if (listener.onError)
      	  listener.onError(this,event);
      	else
      	  listener(this, event);
      }
    }
  }
});

var PAPIBase = Class.extend({
  init: function() {},
  api_domain: function() {
    return config.OCEAN_API_URL;
  },
  api_version: function(key) {
    switch(key) {
      case "texts_version": 
        return config.API_VERSIONS.texts || config.API_VERSIONS._default
        break;
      case "media_version": 
        return config.API_VERSIONS.media || config.API_VERSIONS._default
        break;
      default: 
        return config.API_VERSIONS._default;
    }
  },
  apiCall: function(link, data, method, success_callback, error_callback) {
    var self = this;
    
    // Quick fix until SSL certs are on place to substitute the wrong domain
    link = link.replace("https", "http").replace("api.", "lb.");

    // Use custom token (user login) first, otherwise clients initial token
    var token = "";
    if($.cookie("user-login")) {
      if(typeof $.cookie("user-login") === "string") {
        token = JSON.parse($.cookie("user-login")).token;
      } else if(typeof $.cookie("user-login") === "object") {
        token = $.cookie("user-login").token;
      }
      
    } else {
      token = config.INITIAL_API_TOKEN;
      if(console) console.warn("Used applications auth token!!");
    }

    // Add extra headers specified in data hash
    var headers_list = {"Accept": "application/json",
              "X-API-Token": token
              };
    if(data && data.headers && typeof data.headers === "object") {
      for(var obj in data.headers) {
        headers_list[obj] = data.headers[obj];
      }
    }

    // detect IE CORS transport
    if($.browser.msie) {
      // detect IE CORS transport
      if ('XDomainRequest' in window && window.XDomainRequest !== null) {
        // override default jQuery transport
        jQuery.ajaxSettings.xhr = function() {
            try { return new XDomainRequest(); }
            catch(e) { }
        };
        // also, override the support check
        jQuery.support.cors = true;
      }
      //Specials for IE to simulate PUT
      if(method === "PUT") {
        link += '?_method=PUT';
        link += '&_x-api-token=' + config.INITIAL_API_TOKEN;
        method = "POST";
      }
    }
    if(data) {
      $.ajax(link, {
        headers: headers_list,
        type: method,
        /*url: link,*/
        crossDomain: true,
        dataType: "json",
        contentType: "application/json; utf-8",
        data: JSON.stringify(data),
        cache: true,
        success: function(res, code, xhr) {
          self.pre_success(res, code, xhr);
          success_callback(res);
        },
        error: function(xhr, textStatus, errorThrown) {
          self.pre_error(xhr, textStatus, errorThrown);
          if(error_callback) {error_callback(new APIError(xhr));}
        }
      });
    } else {
      $.ajax(link, {
        headers: headers_list,
        type: method,
        /*url: link,*/
        crossDomain: true,
        dataType: "json",
        contentType: "application/json; utf-8",
        cache: true,
        success: function(res, code, xhr) {
          self.pre_success(res, code, xhr);
          success_callback(res);
        },
        error: function(xhr, textStatus, errorThrown) {
          self.pre_error(xhr, textStatus, errorThrown);
          if(error_callback) {error_callback(new APIError(xhr));}
        }
      });
    }
  },
  pre_success: function(res, code, xhr) {
    //if(console) console.log(xhr.status + " " + xhr.statusText);
    //if(console) console.log(code);
    //if(console) console.log(xhr);
  },
  pre_error: function(xhr, textStatus, errorThrown) {
    if(console) console.log(xhr.status + " " + xhr.statusText);
    if(console) console.log(xhr);
    //if (console) console.log(textStatus);
    //if (console) console.log(errorThrown);
    if(xhr.status == 419) {
      // Need to refresh authentication token

      // Clear cookie first since LoginView check if it's valid
      $.cookie("user-login", null, "/");
      if(window.mainFlow) {
        // Login view
        window.mainFlow.fadeToWidget(0);
      }
    }
  },
  save: function(link, data, success, error) {
    this.apiCall(link, data, "PUT", success, error);
  },
  delete: function(link, success, error) {
    this.apiCall(link, null, "DELETE", success, error);
  },
  get: function(data_or_link, success, error) {
    var link = "";
    link = this.construct_link(data_or_link, true);

    PAPI.apiCall(link, null, "GET", success, error);
  },
  create: function(data, success, error) {

    var link = "";
    link = this.construct_link(data, false);
    PAPI.apiCall(link, data, "POST", success, error);
  }
});

var APIError = Class.extend({
  init: function(xhr) {
    var self = this;
    this.xhr = xhr;
    if(xhr.responseText !== "" || xhr.responseText !== undefined) {
          var response = JSON.parse(xhr.responseText);
          if(response._api_error) {
            self.errorText = response._api_error;
          } else {
            self.errorText = null;
          }
        } else {
          if(console) console.log("Didnt recieve understandable response text!");
        }
  },
  getStatus: function() {
    return this.xhr.status;
  },
  getErrorText: function() {
    return this.errorText;
  },
  getXHRObject: function() {
    return this.xhr;
  }
});

var MenuPane = FlowPanel.extend({
  init: function() {
    this._super();
    this.setElement(this.render());
    this.setPrimaryStyleName('gwt-MenuPane');
    this.menuItems = {};
    this.defaultMenuItemName = null;
    this.currentActiveItem = null;
  },
  clearActive: function(allBut) {
    $.each(this.children, function(i, ea)  {
      if(ea.active)
        ea.setActive(false);
    }); 
  },
  setActive: function(id) {
    var item = this.getMenuItemById(id);
    if(item && item.onClick) {
      item.onClick();
      this.currentActiveItem = item;
    } else {
      if(console) console.warn("Could not find any MenuItem to activate!");
    }
  },
  setActiveSubMenu: function(id) {
    if(this.currentActiveItem && this.currentActiveItem.getSubMenu) {
      var submenu = this.currentActiveItem.getSubMenu();
      submenu.setActive(id);
    } else {
      if(console) console.warn("No current active Item, couldn't set any active submenu item");
    }
  },
  getMenuItemById: function(id) {
    if(this.menuItems[id])
      return this.menuItems[id]; 
    else
      return this.defaultMenuItemName;
  },
  add: function(widget) {
    this._super(widget, this.getElement());
    // Set first added MenuItem as default
    if(this.defaultMenuItemName === null)
      this.defaultMenuItemName = widget;
    this.menuItems[widget.id] = widget;
  },
  render: function() {
    return html.ul({});
  }
});

var MenuItemBase = FocusWidget.extend({
  init: function(name,action,href, id) {
    this.href = href; // type: [[state1, state2, ..], obj];
    this.name = name;
    this.id = id;
    this.action = action;
    this._super(this.render());
    this.active = false;
    var self = this;
    this.addClickListener(function(evt) { self.onClick(evt); });
    if (action)
      this.addClickListener(action);
  },
  onClick: function(evt) {
    if(!this.active) {
      this.parent.clearActive();
      this.setActive(true);
    }
    if(!evt && this.action) {
      // manually trigger, so trigger action for complete click cycle
      this.action();
    }
  },
  setActive: function(bool) {
    this.active = bool;
    if(this.active) {
      DOM.addStyleName(this.getElement(), "active");
    }
    else
      DOM.removeStyleName(this.getElement(), "active");
  },
  render: function() {
    // subclass resp
  }
});

var MenuItem = MenuItemBase.extend({
  init: function(stylename, name, flowCommand, id, fn) {
    // flowCommand type: [[state1, state2, ..], obj];
    this._super(name, fn, flowCommand, id);
    this.subMenu = null;
    this.setStyleName(stylename);
    this.setStyleName('btn clickable');
  },
  setSubMenu: function(menu) {
    this.subMenu = menu;
  },
  getSubMenu: function() {
    return this.subMenu;
  },
  render: function() {
    return html.li({'id':"menu-item-"+this.id.toLowerCase()},
        html.a({'class':'btntxt', 'href':this.href}, this.name));
  }
});

var FormGrid = Grid.extend({
  init: function(rows, cols) {
    this._super(rows, cols);
    // Wrap the grid with a physical Form node
    this.form = html.form({});
    DOM.appendChild(this.form, this.tableElement);
    this.setElement(this.form);

    // Setup default listeners behavior
    this.submitListeners = [];
    this.sinkEvents(Event.ONSUBMIT|Event.ONCLICK);
    this.addSubmitListener(function(that, e) {
      // Prevent default submit behavior for Forms
      e.preventDefault();
    });

    // Create initial default group of validation objects
    this.validationObjects = [];

    this.render();
  },
  addOnSave: function(fn) {
    // Add onSave function to be executed whenever the whole form is valid
    this.onSaveFn = fn;
  },
  addOnCancel: function(fn) {
    // Add onCancel function to be executed whenever the Cancel button is pressed
    this.onCancelFn = fn;
  },
  addSubmitListener: function(listener) {
    this.submitListeners.push(listener);
    return this;
  },
  onBrowserEvent: function(event) {
    this._super(event);
    var type = DOM.eventGetType(event);
    if (type == 'submit') {
      for (var i = 0; i < this.submitListeners.length; i++) {
        this.submitListeners[i](this, event);
      }
    }
  },
  clearAll: function() {
    // Clear both errors, focus and values
    var inputs = $('input', this.getElement());
    for(var i=0; i<inputs.length; i++) {
      $(inputs[i]).val("");
    }
    this.clearErrors();
  },
  clearErrors: function() {
    this.bubble.hide();
  },
  showErrorOnWidget: function(widget) {
    // Reset bubble if already shown
    if(!this.bubble.isHidden())
      this.bubble.hide();
    this.bubble.showErrorOnWidget(widget);
    this.lastValidatedObject = widget;
    // Force focus on ValidationObject
    widget.getElement().focus();
  },
  clearBubbleOnWidget: function(widget) {
    this.bubble.hide(widget);
  },
  validateForm: function() {
    // Get all type of Validation objects and assemble a list (array) of the ones with error
    var errorInputs = [];

    for(var i=0; i<this.validationObjects.length; i++) {
      if(!this.validationObjects[i].validate()) {
        errorInputs.push(this.validationObjects[i]);
      }
    }
    // Show bubble on first error and return false
    if(errorInputs[0]) {
      this.showErrorOnWidget(errorInputs[0]);
      return false;
    } else {
      // No error found
      return true;
    }
  },
  setWidget: function(row,col,widget) {
    this._super(row,col,widget);
    // Check if object is a validation object, thus contains a setForm function
    if(widget.setForm) {
      // Save this form pointer for the widget so it can call for messagge bubble
      widget.setForm(this);
      this.validationObjects.push(widget);
    } else if($('button', widget.getElement()).length > 0) {
      // Check if widget is a container for buttons or a button, thus validation buttons
      // Make their cell span over all columns for centering
      $(widget.getElement().parentElement).attr('colspan', "100");
      // Get table row, parent is cell
      var tr = widget.getElement().parentElement.parentElement;
      // Remove all child cells except with colspan on
      for(var i=0;i<tr.childNodes.length;i++) {
        if($(tr.childNodes[i]).attr('colspan')) {
          return;
        } else {
          DOM.removeChild(tr, tr.childNodes[i]);
        }
      }
    }
  },
  render: function() {
    var self = this;

    // Create and attach a MessageBubble for this Form to use when showing errors and/or success
    this.bubble = new MessageBubble(this);
    DOM.appendChild(this.getElement(), this.bubble.getElement());

    // Setup basic evaluation behavior logic for the form and it's underlying valuation objects
    this.addTableListener(function(form, event) {
      var target = event.target;
      if(event.type === 'focus' && target.nodeName !== 'BUTTON') {
        if(form.currentBlurItem && target.nodeName === 'INPUT') {
          // Take care of Blured objects that should evaluate
          // Blur event is not used because it fires before anything else and makes it impossible to NOT validate when needed as below

          // Evaluate simulate blurobject and act if its valid
          if(form.currentBlurItem.validate(true)) {
            // If the Blured element evaluates, iterate forward to next focus element
            form.currentBlurItem = target.widget;
          }
        } else {
          // Here we dont have previous form.currentBlurItem, meaning the form is fresh and usually
          // one element got autofocus firing focus event upon show of form.
          form.currentBlurItem = target.widget;
        }
        
      } else if(event.type === 'click' && $(target).attr('name') === 'save') {
        // Validate whole form because user wants to submit/save it
        if(form.validateForm()) {
          self.onSaveFn(form, event);
        } else {
          // Not valid form
          console.log("Not valid form");
        }
      } else if(event.type === 'click' && $(target).attr('name') === 'cancel') {
        // No validation since user want to Cancel
        self.onCancelFn(form,event);
      }
    });
  }
});

var MessageBubble = FlowPanel.extend({
  init: function(form) {
    this._super();
    this.setStyleName("message-bubble");
    this.render();
    this.form = form;
    this.currentWidget = null;
    $(this.getElement()).css("display", "none");
  },
  showErrorOnWidget: function(widget) {
    var self = this;
    if(!widget.getElement()) {
      console.warn("Tried to show message bubble without supplying a element to show for!!");
      return;
    }
    // Position Bubble to element and make it visible
    this._positionBubble(widget);

    // Animate Bubble
    // With animation keyframe it's always played when you set display:block
    // Add replay of animation here if you want to if bubble already is shown (aka same error on same input continously)

  },
  _positionBubble: function(widget) {
    var self = this;
    var element = widget.getElement();
    var height = $(element).height();
    var itemOffset = $(element).offset();
    var formOffset = $(this.form.getElement()).offset();
    // This if-statement is just to not show bubble if everything is zero. And that happens in rare cases
    // when Blur/Focus fires on the grid when it's going between visible/not visible
    if(!(itemOffset.top === 0 && itemOffset.left === 0 && formOffset.top === 0 && formOffset.left === 0)) {

      // Position bubble correctly to widget
      this.setText($(element).attr('errormessage'));
      $(this.getElement()).css('top', itemOffset.top - formOffset.top + height + 5);
      $(this.getElement()).css('left', itemOffset.left - formOffset.left);
      $(this.getElement()).css('display', 'block');
      this.currentWidget = widget;

      var hideTimer = setTimeout(function() {
        self.hide();
      }, 4000);
    }
  },
  isHidden: function() {
    return $(this.getElement()).css('display') === "none" ? true : false;
  },
  hide: function(widget) {
    if(widget) {
      if(widget == this.currentWidget) {
        $(this.getElement()).css("display", "none");
      }
    } else {
      $(this.getElement()).css("display", "none");
    }
  },
  setText: function(text) {
    this.label.setText(text);
  },
  render: function() {
    this.label = new Label("", true);
    var arrow = new SimplePanel();
    
    arrow.setStyleName("message-bubble-arrow");
    this.label.setStyleName("message-bubble-text");

    this.add(arrow);
    this.add(this.label);
  }
});

var WidgetLoader = Widget.extend({
  init: function() {
    this._super();
    this.setElement(this.render());
    this.setStyleName("widget-loader");
    this.setStyle('display', 'none');

    this.parentWidth = null;
    this.parentHeight = null;
  },
  adaptSize: function() {
    // Calculate if there is a fixed height on parent, then use that
    var parentheight = $(this.getElement().parentElement).height();
    var parentwidth = $(this.getElement().parentElement).width();
    if(parentheight === 0)
      parentheight = '100%';
    
    // Expand height to fill parent
    $(this.getElement()).height(parentheight);
    // Position spinner
    if(typeof parentheight === "number") {
      $('img', this.getElement()).css('top', parseInt(parentheight/2 - 20));
    } else {
      $('img', this.getElement()).css('top', '45%');
    }
    if(typeof parentwidth === "number" && parentwidth > 0) {
      $('img', this.getElement()).css('left', parseInt(parentwidth/2 - 20));
    } else {
      $('img', this.getElement()).css('left', '40%');
    }

    this.parentWidth = parentwidth;
    this.parentHeight = parentheight;
  },
  show: function(adapt) {
    if(adapt || !this.parentHeight && !this.parentWidth) {
      // Basically only adapt first time
      this.adaptSize();
    }
    // Start animation and finish with showing Loader
    $('img', this.getElement()).css('-webkit-animation-play-state', 'running');
    $(this.getElement()).css('display', 'block');
  },
  hide: function() {
    $(this.getElement()).css('display', 'none');
    $('img', this.getElement()).css('-webkit-animation-play-state', 'paused');
  },
  render: function() {
    return html.div({},
            html.img({'class':'widget-loader-spinner','src':'../images/loader.png'}));
  }
});
