export default {
  name: 'Toolbar',

  props: {
    canvas: {
      type: HTMLDivElement,
      default: function () {
        return null
      }
    },

    center: {
      type: Object,
      default: function () {
        return null
      }
    },

    offset: {
      type: Object,
      default: function () {
        return { x: 0, y: -120 }
      }
    },

    visible: {
      type: Boolean,
      default: false
    }
  },

  mounted () {
    this.mounted = true
    this.updatePosition()
  },

  data () {
    return {
      mounted: false,
      pos: { x: -1000, y: -1000 }
    }
  },

  watch: {
    center: function (val) {
      this.updatePosition()
    },

    offset: function (val) {
      this.updatePosition()
    }
  },

  methods: {
    updatePosition () {
      if (!this.center || !this.visible) this.moveOffScreen()
      else this.moveToTouch()
    },

    moveOffScreen () {
      this.pos = { x: -1000, y: -1000 }
    },

    moveToTouch () {
      const rect = this.$el.getBoundingClientRect()
      const x = this.pos.x + this.center.x + this.offset.x - rect.left
      const y = this.pos.y + this.center.y + this.offset.y - rect.top

      this.pos = { x, y }

      this.$nextTick(() => { this.makeAdjustments() })
    },

    makeAdjustments () {
      const rect = this.$el.getBoundingClientRect()
      const canvasRect = this.canvas.getBoundingClientRect()
      const scrollbar = 20
      const overEdgeRight = canvasRect.right < rect.right ? rect.right - canvasRect.right + scrollbar : 0

      this.pos = { x: this.pos.x - overEdgeRight, y: this.pos.y }
    }
  },

  render (h) {
    const data = {
      'class': {
        'vbox-toolbar': true
      },
      style: {
        'left': this.pos.x + 'px',
        'top': this.pos.y + 'px'
      }
    }

    return h('div', data, [this.$slots.default])
  }
}
