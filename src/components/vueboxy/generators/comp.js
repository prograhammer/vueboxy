export default {
  methods: {
    genBox () {
      const data = {
        ref: 'box',
        props: {
          touch: this.box.touch,
          pos: this.box.pos,
          disableTouch: true,
          visible: this.visible
        },
        on: {
          visible: (visible) => { this.visible = visible }
        }
      }

      return this.$createElement('box', data, [this.$scopedSlots.comp()])
    },

    genCompImage () {
      const data = {
        'class': {
          'vbox-comp__image': true
        }
      }

      return this.$createElement('div', data, [this.$slots.compImage || this.$scopedSlots.comp()])
    },

    genOverlay () {
      const data = {
        'class': {
          'vbox-box__overlay': true,
          'vbox-box__overlay--hidden': !this.isSelectedSync || this.isTouching
        },
        ref: 'overlay'
      }

      return this.$createElement('div', data, [])
    }
  },

  render (h) {
    const data = {
      'class': {
        'vbox-comp': true
      }
    }

    return h('div', data, [this.genOverlay(), this.genBox(), this.genCompImage()])
  }
}
