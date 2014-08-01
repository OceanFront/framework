var CMSObject = Widget.extend({
  init: function(cmsobj, wordwrap) {
    this._super();
    this.setWordWrap(wordwrap);
    if(!this.getElement()) {this.setElement(DOM.createDiv()); }
    this.obj = cmsobj;
    this.mouseupListeners = [];
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

        //TEMP hack before SSL termination is in place:
        config["OCEAN_CMS_CLIENT_URL"] = config["OCEAN_CMS_CLIENT_URL"].replace("https", "http").replace("cms", "cms-lb");
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

var TextButton = Label.extend({
  init: function(cmsobj, fn) {
    this._super(cmsobj);
    
    if(Object.prototype.toString.call( cmsobj ) === '[object Array]') {
      this.setElement(html.div({'class':'clickable textButton'}, cmsobj[0]) );
    } else {
      DOM.setInnerText(this.getElement(), cmsobj);
    }
    this.setupCMSObj();

    if(fn) {
      this.addOnMouseUpListener(fn);
    }
  }
});

var HTMLText = Label.extend({
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

var Text = Label.extend({
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

var Image = Label.extend({
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

var SpriteSheet = Label.extend({
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

var SpriteSheetLink = Label.extend({
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

var Markdown = Label.extend({
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

var Link = Label.extend({
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

var Header1 = Label.extend({
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

var Header2 = Label.extend({
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

var Header3 = Label.extend({
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