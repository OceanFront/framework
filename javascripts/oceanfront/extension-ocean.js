/**
 * Ocean API Extensio module and convenience Classes
 *
 * @module extension-ocean
 */

var CMSObject = Widget.extend({
  init: function(cmsobj, wordwrap) {
    /*
    *   cmsobject is the returned object from config js file according to
    *   [res, context, key, app];
    *   res is the actual CMS content, rest is self explanitory
    */
    this._super();
    if(!this.getElement()) {this.setElement(DOM.createDiv()); }
    this.obj = cmsobj;
    this.mouseupListeners = [];
    this.setWordWrap(wordwrap);
  },
  setupCMSObj: function() {
    // Set up event handling here since most classes that extend CMSObject change the Element
    // So doing this in the init would remove, and replace, the element and therefore the set up listeners on the first element
    this.sinkEvents(Event.ONMOUSEUP);
    //Flag set in common.js
    if(window.CMSAdminMode) {
      var self = this;
      this.addStyleName("clickable");

      if(typeof this.obj === "string" && (this.obj.search("<em>") > -1)) {
        var tmp = this.obj.split("(")[1].split(")")[0].split("/");
        this.obj = [];
        this.obj[0] = null;
        this.obj[1] = tmp[0];
        this.obj[2] = tmp[1];
        this.obj[3] = tmp[2];
      }
      this.setStyleName("clickable");
      this.addOnMouseUpListener(function(event){

        var appname = (self.obj[3] !== undefined && self.obj[3] !== 'undefined') ? self.obj[3] : config["APP_NAME"];

        // Open on correct domain
        var domain = "";
        if(config && config.OCEAN_API_URL) {
          // Use master environment to share cms
          domain = config.OCEAN_API_URL.replace("api", "admin") + '/cms/#';
        } else {
          domain = 'http://localhost:3005/cms/#';
        }

        window.open(domain + '/' + appname + '/' + self.obj[1] + '/' + self.obj[2] + '/' + config["LOCALE"] + '/' + self.usage);
      });
    }
  },
  addOnMouseUpListener: function(listener) {
    this.mouseupListeners.push(listener);
    return this;
  },
  onBrowserEvent: function(event) {
    var type = event.type;
    if(type == 'mouseup') {
      for(var i=0; i<this.mouseupListeners.length; i++) {
        this.mouseupListeners[i](this, event);      
      }
    }
  },
  getText: function() {
    return DOM.getInnerText(this.getElement());
  },
  setText: function(text) {
    if(!text)
      text = "";
    DOM.setInnerText(this.getElement(),text);
    return this;
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

var CMSPanelObject = FlowPanel.extend({
  init: function(cmsobj, wordwrap) {
    /*
    *   cmsobject is the returned object from config js file according to
    *   [res, context, key, app];
    *   res is the actual CMS content, rest is self explanitory
    */
    this._super();
    if(!this.getElement()) {this.setElement(DOM.createDiv()); }
    this.obj = cmsobj;
    this.mouseupListeners = [];
    this.setWordWrap(wordwrap);
  },
  setupCMSObj: function() {
    // Set up event handling here since most classes that extend CMSObject change the Element
    // So doing this in the init would remove, and replace, the element and therefore the set up listeners on the first element
    this.sinkEvents(Event.ONMOUSEUP);
    //Flag set in common.js
    if(window.CMSAdminMode) {
      var self = this;
      this.addStyleName("clickable");

      if(typeof this.obj === "string" && (this.obj.search("<em>") > -1)) {
        var tmp = this.obj.split("(")[1].split(")")[0].split("/");
        this.obj = [];
        this.obj[0] = null;
        this.obj[1] = tmp[0];
        this.obj[2] = tmp[1];
        this.obj[3] = tmp[2];
      }
      this.setStyleName("clickable");
      this.addOnMouseUpListener(function(event){

        var appname = (self.obj[3] !== undefined && self.obj[3] !== 'undefined') ? self.obj[3] : config["APP_NAME"];

        // Open on correct domain
        var domain = "";
        if(config && config.OCEAN_API_URL) {
          // Use master environment to share cms
          domain = config.OCEAN_API_URL.replace("api", "admin") + '/cms/#';
        } else {
          domain = 'http://localhost:3005/cms/#';
        }

        window.open(domain + '/' + appname + '/' + self.obj[1] + '/' + self.obj[2] + '/' + config["LOCALE"] + '/' + self.usage);
      });
    }
  },
  addOnMouseUpListener: function(listener) {
    this.mouseupListeners.push(listener);
    return this;
  },
  onBrowserEvent: function(event) {
    var type = event.type;
    if(type == 'mouseup') {
      for(var i=0; i<this.mouseupListeners.length; i++) {
        this.mouseupListeners[i](this, event);      
      }
    }
  },
  getText: function() {
    return DOM.getInnerText(this.getElement());
  },
  setText: function(text) {
    if(!text)
      text = "";
    DOM.setInnerText(this.getElement(),text);
    return this;
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

var ImageButton = CMSObject.extend({
  init: function(cmstext, cmsobj, fn) {
    this._super();
    if(!this.getElement()) {this.setElement(DOM.createDiv()); }
    this.obj = cmstext;
    this.obj_normal = cmsobj
    this.mouseupListeners = [];

    // Allow cmstext to be = "" if no text is desired
    if(Object.prototype.toString.call( cmstext ) === '[object Array]'  && 
       Object.prototype.toString.call( cmsobj ) === '[object Array]') {

      var node = html.div({'class':'clickable textButton'}, cmstext[0]);
      DOM.setStyleAttribute(node,'background-image','url("'+cmsobj[0]+'")');

      this.setElement(node);
    } else if(typeof cmstext === "string"  && 
      Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      var node = html.div({'class':'clickable textButton'}, cmstext);
      DOM.setStyleAttribute(node,'background-image','url("'+cmsobj[0]+'")');

      this.setElement(node);
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }

    this.setupCMSObj();

    if(fn) {
      this.addOnMouseUpListener(fn);
    }
  },
  setupCMSObj: function() {
    // Set up event handling here since most classes that extend CMSObject change the Element
    // So doing this in the init would remove, and replace, the element and therefore the set up listeners on the first element
    this.sinkEvents(Event.ONMOUSEUP);
    //Flag set in common.js
    if(window.CMSAdminMode) {
      var self = this;
      this.addStyleName("clickable");

      // Show only 1 of the <em> tags out of 4

      if(typeof this.obj === "string" && (this.obj.search("<em>") > -1)) {
        var tmp = this.obj.split("(")[1].split(")")[0].split("/");
        this.obj = [];
        this.obj[0] = null;
        this.obj[1] = tmp[0];
        this.obj[2] = tmp[1];
        this.obj[3] = tmp[2];
      }
      if(typeof this.obj_normal === "string" && (this.obj_normal.search("<em>") > -1)) {
        var tmp = this.obj_normal.split("(")[1].split(")")[0].split("/");
        this.obj_normal = [];
        this.obj_normal[0] = null;
        this.obj_normal[1] = tmp[0];
        this.obj_normal[2] = tmp[1];
        this.obj_normal[3] = tmp[2];
      }

      this.setStyleName("clickable");
      this.addOnMouseUpListener(function(event){
        // Open window for each cms object

        // Open on correct domain
        var domain = "";
        if(config && config.OCEAN_API_URL) {
          // Use master environment to share cms
          domain = config.OCEAN_API_URL.replace("api", "admin") + '/cms/#';
        } else {
          domain = 'http://localhost:3005/cms/#';
        }

        // Text
        var appname = (self.obj[3] !== undefined && self.obj[3] !== 'undefined') ? self.obj[3] : config["APP_NAME"];
        window.open(domain + '/' + appname + '/' + self.obj[1] + '/' + self.obj[2] + '/' + config["LOCALE"] + '/' + "text");

        // Image for normal
        var appname = (self.obj_normal[3] !== undefined && self.obj_normal[3] !== 'undefined') ? self.obj_normal[3] : config["APP_NAME"];
        window.open(domain + '/' + appname + '/' + self.obj_normal[1] + '/' + self.obj_normal[2] + '/' + config["LOCALE"] + '/' + "image");
      });
    }
  }
});

var TextButton = CMSObject.extend({
  init: function(cmsobj, fn) {
    this._super(cmsobj);
    
    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setElement(html.div({'class':'clickable textButton'}, cmsobj[0]) );
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();

    if(fn) {
      this.addOnMouseUpListener(fn);
    }
  }
});

var HTMLText = CMSObject.extend({
  init: function(cmsobj, wordwrap) {
    this._super(cmsobj, wordwrap);
    
    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setText(cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(),cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();
  },
  getText: function() {
    // Override
    return DOM.getInnerHTML(this.getElement());
  },
  setText: function(text) {
    // Override
    if(!text)
      text = "";
    DOM.setInnerHTML(this.getElement(),text);
    return this;
  },
  replaceText: function(text) {
    // Override
    DOM.setInnerHTML(this.getElement(), text);
  }
});

var Text = CMSObject.extend({
  init: function(cmsobj, wordwrap) {
    this._super(cmsobj, wordwrap);
    
    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setText(cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(),cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();
  }
});

var Image = CMSObject.extend({
  init: function(cmsobj) {
    this._super(cmsobj);

    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setElement(html.img({'src':cmsobj[0]}));
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'image';
    this.setupCMSObj();
  }
});

var BackgroundImage = CMSPanelObject.extend({
  init: function(cmsobj) {
    this._super(cmsobj);

    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      var node = html.div({});
      DOM.setStyleAttribute(node,'background-image','url("'+cmsobj[0]+'")');
      this.setElement(node);
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'image';
    this.setupCMSObj();
  }
});

var SpriteSheet = CMSObject.extend({
  init: function(cmsobj) {
    this._super(cmsobj);

    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setElement(html.div({}));
      $(this.getElement()).css('background-image', 'url(' + cmsobj[0] + ')');
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'image';
    this.setupCMSObj();
  }
});

var SpriteSheetLink = CMSObject.extend({
  init: function(cmsobj) {
    this._super(cmsobj);

    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setElement(html.a({}));
      $(this.getElement()).css('background-image', 'url(' + cmsobj[0] + ')');
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'image';
    this.setupCMSObj();
  }
});

var Markdown = CMSObject.extend({
  init: function(cmsobj) {
    this._super(cmsobj, true);

    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      DOM.setInnerHTML(this.getElement(), cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.usage = 'markdown';
    this.setupCMSObj();
  }
});

var Link = CMSObject.extend({
  init: function(htmlobj) {
    this._super(htmlobj);
    
    //obj in this case is supposed to be a complete html a-tag in string format that we convert to a node
    if(Object.prototype.toString.call( htmlobj ) === '[object Array]') {
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

var Header1 = CMSObject.extend({
  init: function(cmsobj) {
    this._super(cmsobj);
    this.setElement(DOM.createH1());
    
    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setText(cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(),cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();
  }
});

var Header2 = CMSObject.extend({
  init: function(cmsobj) {
    this._super(cmsobj);
    this.setElement(DOM.createH2());

    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setText(cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(),cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();
  }
});

var Header3 = CMSObject.extend({
  init: function(cmsobj) {
    this._super(cmsobj);
    this.setElement(DOM.createH3());
    
    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setText(cmsobj[0]);
    } else {
      DOM.setInnerText(this.getElement(),cmsobj);
    }
    this.usage = 'text';
    this.setupCMSObj();
  }
});


var HTML = CMSObject.extend({
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

var PAPIBase = Class.extend({
  init: function() {},
  apiCall: function(link, data, method, success_callback, error_callback, extra_headers, extras) {
    var self = this;

    // detect IE CORS transport
    if($.browser.msie && ($.browser.version < 9)) {
      // detect IE CORS transport for IE older than v9 (IE10 started with XMLHttpRequest)
      if(console) console.log("IE detected. Changing XDomainRequest object");
      if ('XDomainRequest' in window && window.XDomainRequest !== null) {
        // override default jQuery transport
        jQuery.ajaxSettings.xhr = function() {
            try { return new XDomainRequest(); }
            catch(e) { }
        };
        // also, override the support check
        jQuery.support.cors = true;
      }
    }

    if(data) {
      $.ajax(link, {
        headers: extra_headers,
        type: method,
        /*url: link,*/
        crossDomain: true,
        dataType: "json",
        contentType: "application/json; utf-8",
        data: JSON.stringify(data),
        cache: true,
        success: function(res, code, xhr) {
          self.pre_success(res, code, xhr);
          success_callback(res, extras, xhr);
        },
        error: function(xhr, textStatus, errorThrown) {
          self.pre_error(xhr, textStatus, errorThrown);
          if(error_callback) {error_callback(new APIError(xhr));}
        }
      });
    } else {
      $.ajax(link, {
        headers: extra_headers,
        type: method,
        /*url: link,*/
        crossDomain: true,
        dataType: "json",
        contentType: "application/json; utf-8",
        cache: true,
        success: function(res, code, xhr) {
          self.pre_success(res, code, xhr);
          success_callback(res, extras, xhr);
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
  }
});

var APIError = Class.extend({
  init: function(xhr) {
    var self = this;
    this.xhr = xhr;
  },
  getStatus: function() {
    return this.xhr.status;
  },
  getErrorText: function() {
    if(this.getStatus() == 500) {
      return this.getStatusText();
    } else if(this.getStatus() == 503) {
      return this.getStatusText();
    } else {
      var error_obj = JSON.parse(this.xhr.responseText);
      var text = "";
      for(var key in error_obj) {
        // Each value is a Array with errors in the key-subject
        // Aggregate them with line break
        for (var i = 0; i < error_obj[key].length; i++) {
          if(error_obj[key][i] === "can't be blank") {
            // Need to include key which says what can't be blank
            text += key + " " + error_obj[key][i] + "\n";
          } else {
            text += error_obj[key][i] + "\n";
          }
        }
      }
      return text;
    }
  },
  getStatusText: function() {
    return this.xhr.statusText;
  },
  getXHRObject: function() {
    return this.xhr;
  }
});