/**
 * Speech-to-Text Service — Web Speech API Wrapper
 * Works in Chrome, Edge. Falls back gracefully if unsupported.
 */

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null

export function isSTTSupported() {
  return !!SpeechRecognition
}

/**
 * Create an STT session
 * @returns {{ start, stop, abort, onInterim, onFinal, onError, onEnd }}
 */
export function createSTTSession() {
  if (!SpeechRecognition) {
    return {
      start: () => console.warn('STT not supported'),
      stop: () => {},
      abort: () => {},
      onInterim: () => {},
      onFinal: () => {},
      onError: () => {},
      onEnd: () => {},
    }
  }

  const recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = true
  recognition.lang = 'en-US'
  recognition.maxAlternatives = 1

  let interimCallback = () => {}
  let finalCallback = () => {}
  let errorCallback = () => {}
  let endCallback = () => {}

  recognition.onresult = (event) => {
    let interim = ''
    let final = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        final += transcript
      } else {
        interim += transcript
      }
    }

    if (interim) interimCallback(interim)
    if (final) finalCallback(final)
  }

  recognition.onerror = (event) => {
    // 'no-speech' and 'aborted' are not real errors
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      errorCallback(event.error)
    }
  }

  recognition.onend = () => {
    endCallback()
  }

  return {
    start: () => {
      try { recognition.start() } catch (e) { /* already started */ }
    },
    stop: () => {
      try { recognition.stop() } catch (e) {}
    },
    abort: () => {
      try { recognition.abort() } catch (e) {}
    },
    onInterim: (cb) => { interimCallback = cb },
    onFinal: (cb) => { finalCallback = cb },
    onError: (cb) => { errorCallback = cb },
    onEnd: (cb) => { endCallback = cb },
  }
}
