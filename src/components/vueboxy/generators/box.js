export default {
  methods: {
    genContent () {
      const data = {
        'class': {
          'vbox-box__content': true
        }
      }

      return this.$createElement('div', data, [this.$slots.default])
    },

    genOverlay () {
      if (this.mode === 'output') return null

      const data = {
        'class': {
          'vbox-box__overlay': true,
          'vbox-box__overlay--hidden': !this.isSelectedSync || this.isTouching
        },
        ref: 'overlay'
      }

      return this.$createElement('div', data, [])
    },

    genResize () {
      const data = {
        'class': {
          'vbox-box__resize': true
        },
        'style': {
          'display': this.isSelectedSync ? '' : 'none'
        },
        ref: 'resize'
      }

      const defaultIcon = this.$createElement(
        'i',
        {
          'class': {
            'fa': true,
            'fa-chevron-right': true,
            'vbox-box__resize--rotate-45': true
          }
        },
        []
      )

      const resizeIcon = this.$slots.resize ? this.$slots.resize : defaultIcon

      return this.$createElement('div', data, [resizeIcon])
    }
  },

  render (h) {
    const data = {
      'class': this.classes,
      style: this.styles
    }

    return h('div', data, [this.genOverlay(), this.genContent(), this.genResize()])
  }
}
