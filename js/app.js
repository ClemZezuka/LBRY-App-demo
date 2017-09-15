(function(){

    'use strict';


    /**
     *  Dispatcher
     *  Managing events.
     */
    function Dispatcher() {}

    Dispatcher.prototype._listeners = {};

    Dispatcher.prototype.on = function(name,callback) {
        if (this._listeners[name] === undefined) {
            this._listeners[name] = [];
        }
        this._listeners[name].push(callback);
    };

    Dispatcher.prototype.emit = function(name) {
        if (this._listeners[name] === undefined) {
            return;
        }
        for (var i = 0, n = this._listeners[name].length; i < n; i++) {
            this._listeners[name][i].call(self);
        }
    };


    /**
     *  App
     *  Driving application.
     */
    function App(api,parameters) {
        this._elem = window;
        this._html = document.getElementsByTagName('html')[0];
        this._body = document.body;
        this._elem.addEventListener('load',this._onLoad.bind(this),false);
    }

    App.prototype._onLoad = function() {
        this._createClasses();
        this._bindEvents();
    };

    App.prototype._createClasses = function() {
        this._menu = new Menu();
        this._header = new Header();
        this._container = new Container();
        this._overlay = new Overlay();
        this._sliders = [];
        Array.prototype.slice.call(this._body.getElementsByClassName('row'),0).forEach(function(row){
            this._sliders.push(new Slider(row));
        },this);
    };

    App.prototype._bindEvents = function() {
        this._header.on('onMenu',this._onMenu.bind(this));
        this._menu.on('onClose',this._onClose.bind(this));
        this._overlay.on('onOverlay',this._onClose.bind(this));
        this._elem.addEventListener('resize',this._onResize.bind(this),false);
    };

    App.prototype._onMenu = function() {
        TweenLite.set([this._html,this._body],{overflow:'hidden'});
        this._menu.move();
        this._header.move();
        this._container.move();
        this._overlay.show();
    };

    App.prototype._onClose = function() {
        TweenLite.set([this._html,this._body],{overflow:'auto'});
        this._menu.back();
        this._header.back();
        this._container.back();
        this._overlay.hide();
    };

    App.prototype._onResize = function() {
        this._sliders.forEach(function(slider){
            slider.setup();
        });
    };


    /**
     *  Menu
     */
    function Menu() {
        this._elem = document.getElementsByClassName('menu')[0];
        this._close = this._elem.getElementsByClassName('close')[0];
        this._lines = Array.prototype.slice.call(this._elem.getElementsByTagName('path'),0);
        this._items = Array.prototype.slice.call(this._elem.getElementsByTagName('li'),0);
        this._coords = [
            {x1:12,y1:12,x2:12,y2:12},
            {x1:12,y1:12,x2:12,y2:12}
        ];
        this._line = this._elem.getElementsByClassName('help')[0].children[0];
        this._help = this._elem.getElementsByClassName('help')[0].children[1];
        this._isAnimated = false;

        this._setup();
        this._bindEvents();
    }

    Menu.prototype = Object.create(Dispatcher.prototype);

    Menu.prototype._setup = function() {
        this._isAnimated = false;
        this._coords = [
            {x1:12,y1:12,x2:12,y2:12},
            {x1:12,y1:12,x2:12,y2:12}
        ];
        this._onUpdate();
        this._items.forEach(function(item,i){
            var y = (i+1)*10;
            TweenLite.set(item,{autoAlpha:0,y:y});
        });
        TweenLite.set(this._line,{width:0,x:-10});
        TweenLite.set(this._help,{autoAlpha:0,x:-10});
    };

    Menu.prototype._bindEvents = function() {
        var click = 'ontouchstart'  in window ? 'touchstart':'click';
        this._close.addEventListener('mouseenter',this._onOver.bind(this),false);
        this._close.addEventListener('mouseleave',this._onOut.bind(this),false);
        this._close.addEventListener(click,this._onClick.bind(this),false);
    };

    Menu.prototype._onOver = function() {
        this._isAnimated = true;
        TweenMax.to(this._close,1,{rotation:-270,ease:Quint.easeOut,onComplete:function(){
            this._isAnimated = false;
            TweenLite.set(this._close,{rotation:0});
        },onCompleteScope:this});
    };

    Menu.prototype._onOut = function() {
        if (this._isAnimated) {
            return;
        }
        TweenLite.set(this._close,{rotation:0});
    };

    Menu.prototype._onClick = function() {
        this._isAnimated = true;
        this.emit('onClose');
    };

    Menu.prototype._onUpdate = function() {
        this._lines.forEach(function(line,i){
            line.setAttribute('d','M '+this._coords[i].x1+' '+this._coords[i].y1+' L '+this._coords[i].x2+' '+this._coords[i].y2);
        },this);
    };

    Menu.prototype.move = function() {
        TweenMax.to(this._elem,0.7,{left:0,boxShadow:'0px 0px 50px 0px rgba(0,0,0,0.15)',ease:Quint.easeOut});
        TweenMax.to(this._coords[0],1,{x1:0,y1:0,x2:24,y2:24,delay:0.1,ease:Expo.easeInOut,onUpdate:this._onUpdate,onUpdateScope:this});
        TweenMax.to(this._coords[1],0.85,{x1:0,y1:24,x2:24,y2:0,delay:0.3,ease:Expo.easeInOut,onUpdate:this._onUpdate,onUpdateScope:this});
        TweenMax.staggerTo(this._items,0.5,{y:0,autoAlpha:1,ease:Quint.easeOut,delay:0.25},0.1);
        TweenMax.to(this._line,0.8,{x:0,width:40,ease:Quint.easeIn,delay:0.2});
        TweenMax.to(this._help,0.6,{x:0,autoAlpha:1,ease:Quint.easeIn,delay:0.4});
    };

    Menu.prototype.back = function() {
        TweenMax.to(this._elem,0.4,{left:'-50%',boxShadow:'0px 0px 50px 0px rgba(0,0,0,0)',ease:Quint.easeOut,onComplete:this._setup,onCompleteScope:this});
    };


    /**
     *  Header
     */
    function Header() {
        this._elem = document.getElementsByTagName('header')[0];
        this._cta = this._elem.getElementsByClassName('to-menu')[0];

        this._bindEvents();
    }

    Header.prototype = Object.create(Dispatcher.prototype);

    Header.prototype._bindEvents = function() {
        var click = 'ontouchstart'  in window ? 'touchstart':'click';
        this._cta.addEventListener(click,this._onClick.bind(this),false);
    };

    Header.prototype._onClick = function() {
        this.emit('onMenu');
    };

    Header.prototype.move = function() {
        TweenMax.to(this._elem,0.8,{left:'50%',autoAlpha:0.25,ease:Quint.easeOut});
    };

    Header.prototype.back = function() {
        TweenMax.to(this._elem,0.5,{left:0,autoAlpha:1,ease:Quint.easeOut});
    };


    /**
     *  Container
     */
    function Container() {
        this._elem = document.getElementsByClassName('container')[0];
    }

    Container.prototype.move = function() {
        TweenMax.to(this._elem,0.8,{left:'50%',autoAlpha:0.25,ease:Quint.easeOut});
    };

    Container.prototype.back = function() {
        TweenMax.to(this._elem,0.5,{left:0,autoAlpha:1,ease:Quint.easeOut});
    };


    /**
     *  Overlay
     */
    function Overlay() {
        this._elem = document.getElementsByClassName('overlay')[0];

        this._bindEvents();
    }

    Overlay.prototype = Object.create(Dispatcher.prototype);

    Overlay.prototype._bindEvents = function() {
        var click = 'ontouchstart'  in window ? 'touchstart':'click';
        this._elem.addEventListener(click,this._onClick.bind(this),false);
    };

    Overlay.prototype._onClick = function() {
        this.emit('onOverlay');
    };

    Overlay.prototype.show = function() {
        TweenMax.to(this._elem,0.8,{autoAlpha:1,ease:Quint.easeOut});
    };

    Overlay.prototype.hide = function() {
        TweenMax.to(this._elem,0.5,{autoAlpha:0,ease:Quint.easeOut});
    };


    /**
     *  Slider
     */
    function Slider(elem) {
        this._elem = elem;
        this._prev = this._elem.getElementsByClassName('prev')[0];
        this._next = this._elem.getElementsByClassName('next')[0];
        this._cursor = this._elem.getElementsByClassName('nav-status')[0].firstChild;
        this._container = this._elem.getElementsByClassName('slider')[0];
        this._inner = this._container.getElementsByClassName('inner')[0];
        this._items = Array.prototype.slice.call(this._inner.children,0);

        this.setup();
        this._bindEvents();
    }

    Slider.prototype.setup = function() {
        var padding = parseFloat(window.getComputedStyle(this._elem.parentNode.parentNode,null).getPropertyValue('padding-left'));
        var size = window.innerWidth - padding;
        var width = this._items[0].offsetWidth + parseFloat(window.getComputedStyle(this._items[0],null).getPropertyValue('margin-left'));
        var visibleElements = Math.floor(size/width);
        var total = width*this._items.length;

        this._isAnimated = false;
        this._size = width * visibleElements;
        this._index = 0;
        this._length = Math.floor(this._items.length/visibleElements);
        this._percent = ((width * visibleElements)/total)*100;
        this._visibled = visibleElements;

        TweenLite.set(this._inner,{x:0,width:total+width});
        TweenLite.set(this._prev,{x:-this._prev.offsetWidth});
        TweenLite.set(this._next,{x:0});
        TweenLite.set(this._cursor.parentNode,{display:'block'});
        TweenLite.set(this._cursor,{width:this._percent+'%',left:0});

        if (this._index === this._length) {
            TweenLite.set(this._next,{x:this._next.offsetWidth});
            TweenLite.set(this._cursor.parentNode,{display:'none'});
        }
    };

    Slider.prototype._bindEvents = function() {
        var click = 'ontouchstart'  in window ? 'touchstart':'click';
        this._prev.addEventListener(click,this._onPrev.bind(this),false);
        this._next.addEventListener(click,this._onNext.bind(this),false);
    };

    Slider.prototype._onPrev = function() {
        if (this._index === 0 || this._isAnimated) {
            return;
        }
        var oldIndex = this._index;
        this._isAnimated = true;
        this._index--;
        this._move(oldIndex);
    };

    Slider.prototype._onNext = function() {
        if (this._index === this._length || this._isAnimated) {
            return;
        } 
        var oldIndex = this._index;
        this._isAnimated = true;
        this._index++;
        this._move(oldIndex);
    };

    Slider.prototype._move = function(oldIndex) {
        var diff = this._index - oldIndex;
        var left = this._percent * this._index;
        var width = this._index !== this._length ? this._percent:100 - (this._percent*this._index);
        var x = this._size * this._index;
        

        if (diff > 0) {
            var sliced = this._items.slice(this._visibled*this._index,this._items._length);
                sliced.forEach(function(item,i){
                    TweenLite.set(item,{x:16*Math.pow(i,2)});
                });
        } else {
            var sliced = this._items.slice(0,this._visibled*oldIndex);
                sliced.reverse();
                sliced.forEach(function(item,i){
                    TweenLite.set(item,{x:-(16*Math.pow(i,2))});
                });
        }

        if (this._index === 0) {
            TweenMax.to(this._prev,0.4,{x:-this._prev.offsetWidth,ease:Quint.easeOut});
        }
        if (this._index === this._length) {
            TweenMax.to(this._next,0.4,{x:this._next.offsetWidth,ease:Quint.easeOut});
        }
        if (this._index > 0 && this._index < this._length) {
            TweenMax.to(this._prev,0.4,{x:0,ease:Quint.easeOut});
            TweenMax.to(this._next,0.4,{x:0,ease:Quint.easeOut});
        }

        TweenMax.to(sliced,1,{x:0,ease:Quint.easeOut});
        TweenMax.to(this._cursor,1.2,{left:left+'%',width:width+'%',ease:Quint.easeInOut});
        TweenMax.to(this._inner,1.2,{x:-x,ease:Quint.easeInOut,onComplete:this._onComplete,onCompleteScope:this});
    };

    Slider.prototype._onComplete = function() {
        this._isAnimated = false;
    };


    // Let's start :)
    var app = new App();

})();
