"use strict";

function fixTouchEvent(evt) {
  evt.clientX = evt.clientX || evt.touches[0].clientX || evt.targetTouches[0].clientX || evt.touches[0].pageX;
  evt.clientY = evt.clientY || evt.touches[0].clientY || evt.targetTouches[0].clientY || evt.touches[0].pageY;
}


module.exports = {

  mixins: [
    require("react-onclickoutside")
  ],

  handleClickOutside: function(evt) {
    if(this.state.repositioning) {
      this.endReposition();
      this.endRepositionTouch();
    }
  },

  getInitialState: function() {
    var stayactive = false;
    if (typeof this.props.stayactive !== "undefined") {
      stayactive = !!this.props.stayactive;
    }

    return {
      activated: false,
      active: false,
      stayactive: stayactive,
      x: this.props.x || 0,
      y: this.props.y || 0,
      xMark: 0,
      yMark: 0,
      xDiff: 0,
      yDiff: 0
    };
  },

  componentWillMount: function() {
    var activated = false;
    if (typeof this.props.activated !== "undefined") {
      activated = !!this.props.activated;
    }
    if(activated) this.setState({ activated: activated});
  },

  componentWillUnmount: function() {
    this.stopListening();
  },

  toggle: function(evt) {
    this.setState({
      activated: !this.state.activated
    });
  },

  /**
   * MOUSE EVENT HANDLING
   */

  startReposition: function(evt) {
    evt.stopPropagation();
    if (this.state.activated) {

      document.dispatchEvent (new CustomEvent("app:log", {detail: { msg: "mouse start"}}));

      this.setState({
        active: true,
        xMark: evt.clientX,
        yMark: evt.clientY,
        xDiff: 0,
        yDiff: 0
      });
      this.listenForRepositioning();
    }
  },

  listenForRepositioning: function() {
    document.addEventListener("mousemove", this.reposition);
    document.addEventListener("mouseup",   this.endReposition);
  },

  reposition: function(evt) {
    evt.stopPropagation();
    if(this.state.active) {

      document.dispatchEvent (new CustomEvent("app:log", {detail: { msg: "mouse move"}}));

      this.setState({
        xDiff: evt.clientX - this.state.xMark,
        yDiff: evt.clientY - this.state.yMark
      }, function() {
        if (this.handleTransform) {
          this.handleTransform();
        }
      });
    }
  },

  endReposition: function(evt) {
    evt.stopPropagation();
    if(this.state.active) {

      document.dispatchEvent (new CustomEvent("app:log", {detail: { msg: "mouse end"}}));

      this.setState({
        active: false,
        x: this.state.x + this.state.xDiff,
        y: this.state.y + this.state.yDiff,
        xDiff: 0,
        yDiff: 0
      });
      this.stopListening();
      if (this.handleTransformEnd) {
        this.handleTransformEnd();
      }
    }
  },

  stopListening: function() {
    document.removeEventListener("mousemove", this.reposition);
    document.removeEventListener("mouseup",   this.endReposition);
  },


  /**
   * TOUCH EVENT HANDLING
   */

  startRepositionTouch: function(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.state.activated) {
      fixTouchEvent(evt);

      document.dispatchEvent (new CustomEvent("app:log", {detail: { msg: "touch start"}}));
      this.markLastTouchEvent;
      this.checkTouchEnd();

      this.setState({
        active: true,
        xMark: evt.clientX,
        yMark: evt.clientY,
        xDiff: 0,
        yDiff: 0
      });
      this.listenForRepositioningTouch();
    }
  },

  markLastTouchEvent: function() {
    this.markLastTouchEvent = parseInt((new Date()).getTime(), 10);
  },

  checkTouchEnd: function() {
    var now = parseInt((new Date()).getTime(), 10);
    if (now - this.markLastTouchEvent > 200) {
      this.endRepositionTouch();
    } else {
      setTimeout(this.checkTouchEnd.bind(this), 200);
    }
  },

  listenForRepositioningTouch: function() {
    document.addEventListener("touchmove", this.repositionTouch);
    document.addEventListener("touchend",  this.endRepositionTouch);
  },

  repositionTouch: function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.markLastTouchEvent();

    if(this.state.active) {
      fixTouchEvent(evt);

      document.dispatchEvent (new CustomEvent("app:log", {detail: { msg: "touch move"}}));

      this.setState({
        xDiff: evt.clientX - this.state.xMark,
        yDiff: evt.clientY - this.state.yMark
      }, function() {
        if (this.handleTransform) {
          this.handleTransform();
        }
      });
    }
  },

  endRepositionTouch: function() {
    if(this.state.active) {

      document.dispatchEvent (new CustomEvent("app:log", {detail: { msg: "touch end"}}));

      this.setState({
        active: false,
        x: this.state.x + this.state.xDiff,
        y: this.state.y + this.state.yDiff,
        xDiff: 0,
        yDiff: 0
      });
      this.stopListeningTouch();
      if (this.handleTransformEnd) {
        this.handleTransformEnd();
      }
    }
  },

  stopListeningTouch: function() {
    document.removeEventListener("touchmove", this.repositionTouch);
    document.removeEventListener("touchend",  this.endRepositionTouch);
    document.removeEventListener("touchcancel",  this.endRepositionTouch);
  }
};
