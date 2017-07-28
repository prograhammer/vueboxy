// See https://stackoverflow.com/a/44612374/1110941
function cloneDeep (o) {
  let newO
  let i

  if (typeof o !== 'object') return o

  if (!o) return o

  if (Object.prototype.toString.apply(o) === '[object Array]') {
    newO = []
    for (i = 0; i < o.length; i += 1) {
      newO[i] = cloneDeep(o[i])
    }
    return newO
  }

  newO = {}
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = cloneDeep(o[i])
    }
  }
  return newO
}

function debounce (func, threshold, execAsap) {
  var timeout

  return function debounced () {
    var obj = this
    var args = arguments

    function delayed () {
      if (!execAsap) func.apply(obj, args)
      timeout = null
    }

    if (timeout) clearTimeout(timeout)
    else if (execAsap) func.apply(obj, args)

    timeout = setTimeout(delayed, threshold || 100)
  }
}

export { cloneDeep, debounce }
