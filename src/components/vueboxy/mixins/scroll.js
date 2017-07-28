export default {
  data () {
    return {
      scrollTimer: null,
      scrollSpeed: 2,
      scrollFactor: 2,
      scrollEdge: 50,
      scrollDimensions: {
        canvas: {
          height: null,
          width: null
        },
        window: {
          height: null,
          width: null
        }
      }
    }
  },

  methods: {
    touchScroll () {
      clearTimeout(this.scrollTimer)
      if (this.isTouching && this.scroll()) this.scrollTimer = setTimeout(() => { this.touchScroll() }, this.scrollSpeed)
    },

    scroll () {
      this.initScroll()

      const windowWasScrolled = this.scrollWindow()
      const canvasWasScrolled = this.scrollCanvas()

      return windowWasScrolled || canvasWasScrolled
    },

    initScroll () {
      if (this.scrollTimer) return // <-- Scrolling already started.

      this.scrollDimensions = {
        canvas: {
          width: this.canvas ? this.canvas.scrollWidth : 0,
          height: this.canvas ? this.canvas.scrollHeight : 0
        },
        window: {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight
        }
      }
    },

    scrollCanvas () {
      if (!this.canvas) return false

      const rect = this.canvas.getBoundingClientRect()

      return this.updateScroll({
        el: this.canvas,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        scroll: this.scrollDimensions.canvas
      })
    },

    scrollWindow () {
      return this.updateScroll({
        el: document.body,
        left: 0,
        right: window.innerWidth,
        top: 0,
        bottom: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight,
        scroll: this.scrollDimensions.window
      })
    },

    updateScroll (c) {
      let wasScrolled = false

      if (this.touchSync.x - this.scrollEdge < c.left) {
        wasScrolled = true
        c.el.scrollLeft -= this.scrollFactor
      }
      if (this.touchSync.y - this.scrollEdge < c.top) {
        wasScrolled = true
        c.el.scrollTop -= this.scrollFactor
      }
      if (this.touchSync.x + this.scrollEdge > c.right && c.el.scrollLeft + c.width + this.scrollFactor <= c.scroll.width) {
        wasScrolled = true
        c.el.scrollLeft += this.scrollFactor
      }
      if (this.touchSync.y + this.scrollEdge > c.bottom && c.el.scrollTop + c.height + this.scrollFactor <= c.scroll.height) {
        wasScrolled = true
        c.el.scrollTop += this.scrollFactor
      }

      return wasScrolled
    }
  }
}
