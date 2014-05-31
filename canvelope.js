var canvelope;

(function() {

  var options, calculator, frameCount = 0,
    fpsLogTime = new Date(),
    fps = 60;

  canvelope = {
    enhance: function(canvas) {
      return new EnhancedCanvas2D(canvas);
    }
  };

  options = {
    showFPS: true
  };

  calculator = {
    convertToSize: function(property, value, ec2dEl) {

      if (typeof value === 'number') return value;

      if (typeof value === 'string') {
        if (value.indexOf('px') == value.length - 2) {
          return Number(value.substring(0, value.length - 2));
        }
        if (value.indexOf('%') == value.length - 1) {
          if (ec2dEl) {
            var p = property == 'width' ? 'width' : property == 'height' ? 'height' :
              property == 'left' ? 'width' : property == 'top' ? 'height' : null;
            if (p) {
              var parent = ec2dEl.parent ? ec2dEl.parent : ec2dEl.container;
              return Number(value.substring(0, value.length - 1)) / 100 *
                calculator.convertToSize(p, parent.style[p], parent);
            }
          }
        }
      }

      return NaN;
    }
  };

  function EnhancedCanvas2D(canvas) {

    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext('2d');
    this.elements = [];
    this.onFrame();
  }

  function EnhancedCanvas2DElement(type) {
    this.left = 0;
    this.top = 0;
    this.parent = undefined;
    this.id = undefined;
    this.type = (type ? type : 'RECTANGLE').toUpperCase();
    this.style = {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      background: 'rgba(0,0,0,0.7)',
      border_width: 1,
      border_color: 'rgba(0,0,0,1)',
      border_style: 'solid',
      rotation: 0,
      opacity: 1,
      scale: 1
    };
    this.container = undefined;
    this.children = [];
  }

  // Functions for creating elements
  EnhancedCanvas2D.prototype.createElement = function(type, style) {
    var newElement = new EnhancedCanvas2DElement(type);
    for (var key in style) newElement.style[key] = style[key];
    newElement.container = this;
    this.elements.push(newElement);
    return newElement;
  };

  EnhancedCanvas2DElement.prototype.createElement = function(type, style) {
    var newElement = new EnhancedCanvas2DElement(type);
    for (var key in style) newElement.style[key] = style[key];
    newElement.container = this.container;
    newElement.parent = this;
    this.children.push(newElement);
    return newElement;
  };

  // Animation Loop
  EnhancedCanvas2D.prototype.onFrame = function() {
    var _this = this,
      frameTime = new Date();
    clearTimeout(this.loop_timeout);
    this.wipe();
    this.allElements(function(element) {
      _this.drawElement(element)
    });
    frameCount++;
    if (true) {
      var timeDiff = frameTime - fpsLogTime;
      if (timeDiff >= 500) {
        fps = 500 / timeDiff * frameCount * 2;
        frameCount = 0;
        fpsLogTime = frameTime;
      }
    }
    this.context.fillStyle = 'red';
    this.context.fillText('FPS: ' + fps.toFixed(1) + ' [' + (fps >= 45 ? 'GOOD' : fps >= 25 ? 'AVERAGE' : 'POOR') + ']', 25, 25);
    this.loop_timeout = setTimeout(function() {
      _this.onFrame()
    }, 1000 / 60);
  };

  EnhancedCanvas2D.prototype.drawElement = function(element) {

    var style = element.getCalculatedStyle();

    // Save the current context
    this.context.save();

    this.buildPreContext(element);

    this.context.globalAlpha = style.opacity;
    this.context.translate(style.left, style.top);

    this.context.rotate(style.rotation * Math.PI / 180);

    // Set the background
    this.context.fillStyle = style.background;

    // Set the border/line color
    this.context.strokeStyle = style.border_color;

    // Set the border/line width
    this.context.lineWidth = style.border_width;

    switch (element.type) {
      case 'CIRCLE':
        {
          this.context.beginPath();
          this.context.arc(style.width / 2, style.width / 2, style.width / 2, 0, 2 * Math.PI);
          this.context.fill();
          this.context.stroke();
          break;
        }
      default:
        {
          this.context.fillRect(-style.width / 2, -style.height / 2, style.width, style.height);
          this.context.strokeRect(-style.width / 2, -style.height / 2, style.width, style.height);
          break;
        }
    }

    // Restore the context
    this.context.restore();
  };

  EnhancedCanvas2D.prototype.buildPreContext = function(element) {
    var parents = [];

    (function findParents(element) {
      if (element.parent) {
        parents.unshift(element.parent);
        findParents(element.parent);
      }
    })(element);

    for (var i = 0; i < parents.length; i++) {
      var parent = parents[i],
        style = parent.getCalculatedStyle();

      this.context.translate(style.left, style.top);
      this.context.rotate(style.rotation * Math.PI / 180);
    }

  };

  EnhancedCanvas2D.prototype.eachElement = function(callback) {
    for (var i = 0; i < this.elements.length; i++)
      callback(this.elements[i], i);
  };

  EnhancedCanvas2D.prototype.allElements = function(callback) {
    for (var i = 0; i < this.elements.length; i++) {
      callback(this.elements[i], i);
      findChildren(this.elements[i]);
    }

    function findChildren(element) {
      for (var i = 0; i < element.children.length; i++) {
        callback(element.children[i], i);
        findChildren(element.children[i]);
      }
    }
  };

  EnhancedCanvas2D.prototype.wipe = function() {
    this.context.clearRect(0, 0, this.width, this.height);
  };

  EnhancedCanvas2DElement.prototype.animate = function(property, value, duration, callback) {
    var _this = this;
    callback = callback ? callback : duration ? duration : value;
    duration = typeof duration == 'number' ? duration : typeof value == 'number' ? value : 300;
    var framesToAnimate = Math.round(duration / 1000 * 60 + 1);
    var propertyCount = 0,
      currentPropertyCount = 0;


    if (typeof property === 'string') {
      property = {
        property: value
      };
    }
    for (var key in property) {
      propertyCount++;
    }
    for (var key in property) {
      var currentValue = _this.style[key];
      var changePerFrame = (property[key] - currentValue) / framesToAnimate;
      currentPropertyCount++;

      for (var frame = 0; frame < framesToAnimate; frame++) {
        positionOnFrame(key, changePerFrame, frame + 1, propertyCount);
      }
    }


    function positionOnFrame(property, change, frame) {
      setTimeout(function() {
        var totalChange = change * framesToAnimate;
        var animationFactor = frame / framesToAnimate;
        var aChange = totalChange * 0.9 / framesToAnimate;
        var bChange = totalChange * 0.1 / framesToAnimate;
        //change = animationFactor >
        _this.style[property] += change;
        if (frame == framesToAnimate && currentPropertyCount == propertyCount && typeof callback === 'function') {
          callback.call(_this);
        }
      }, 1000 / 60 * frame);
    }
  };

  EnhancedCanvas2DElement.prototype.offset = function() {
    if (!this.parent) return {
      left: this.style.left,
      top: this.style.top
    };
    return {
      left: this.style.left + this.parent.offset().left,
      top: this.style.top + this.parent.offset().top
    }
  };

  EnhancedCanvas2DElement.prototype.getCalculatedStyle = function() {
    var result = {};
    for (var key in this.style) {
      result[key] = this.style[key];
    }
    if (this.parent) {
      result.opacity = result.opacity * this.parent.getCalculatedStyle().opacity;
      result.scale = result.scale * this.parent.getCalculatedStyle().scale;
      result.width = calculator.convertToSize('width', result.width, this);
      result.height = calculator.convertToSize('height', result.height, this);
      result.left = calculator.convertToSize('left', result.left, this);
      result.top = calculator.convertToSize('top', result.top, this);
    }
    return result;
  };

})();
