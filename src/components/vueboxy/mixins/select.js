import eventBus from '../eventBus'

export default {
  props: {
    isSelected: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      isSelectedSync: this.isSelected,
      deselectOtherBoxesHandler: () => {}
    }
  },

  watch: {
    isSelected: function (val) {
      if (val !== this.isSelectedSync) this.setSelected(val)
    }
  },

  beforeDestroy () {
    this.destroyDeselectOtherBoxes()
  },

  methods: {
    initSelect () {
      this.deselectOtherBoxesHandler = (el) => { if (el !== this.$el) this.setSelected(false) }
      eventBus.$on('deselectOtherBoxes', this.deselectOtherBoxesHandler)
    },

    destroyDeselectOtherBoxes () {
      eventBus.$off('deselectOtherBoxes', this.deselectOtherBoxesHandler)
    },

    setSelected (isSelected) {
      this.isSelectedSync = isSelected

      this.resolveDragResize() // <-- Was Erik here?
      this.deselectOtherBoxes()

      this.$emit('isSelected', isSelected)
    },

    resolveDragResize () {
      if (this.isSelectedSync) {
        this.enableDrag()
        this.enableResize()
      } else {
        this.disableDrag()
        this.disableResize()
      }
    },

    toggleTapSelection () {
      if (this.touchSync && this.touchSync.action === 'tap') this.setSelected(!this.isSelectedSync)
    },

    deselectOtherBoxes () {
      if (this.isSelectedSync) eventBus.$emit('deselectOtherBoxes', this.$el)
    },

    clearBrowserSelections () {
      if (!this.isTouching) return

      if (document.selection) {
        document.selection.empty()
      } else if (window.getSelection) {
        window.getSelection().removeAllRanges()
      }
    }
  }
}
