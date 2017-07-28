<template lang="pug">
  .comp-duck
    img.comp-duck__image(src="../../../assets/images/duck.png" style="min-width:120px;")
</template>

<script>
export default {
  name: 'CompDuck',

  /**
   * Props the parent can use to manipulate this component.
   * Note: Components themselves should not mutate their own props.
   */
  props: {
    'x': {
      type: Number
    },
    'y': {
      type: Number
    }
  },

  data () {
    return {

    }
  },

  /**
   * When component is mounted.
   */
  mounted () {
  },

  watch: {

  },

  methods: {

  }
}
</script>
