import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { primeVideo } from './Hero.jsx'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const AVATAR_VIDEO = '/videos/figurinet-cartoon.mp4'

const PILLARS = [
  {
    label: 'Design & Direction Artistique',
    detail:
      "Des interfaces modernes, claires et pensées pour la conversion. Nous retirons le superflu pour concevoir des parcours utilisateurs intuitifs, où votre identité visuelle capte immédiatement l'attention.",
  },
  {
    label: 'Motion Design & 3D',
    detail:
      "Le mouvement au service de l'impact. Nous intégrons des animations et des éléments 3D pour donner de la profondeur à votre site, dynamiser l'expérience utilisateur, sans jamais sacrifier la vitesse de chargement.",
  },
  {
    label: 'Développement Web',
    detail:
      "L'exigence technique avant tout. Nous développons des sites rapides, sécurisés et optimisés. Du code propre, des livraisons rapides et une communication transparente de la maquette jusqu'à la mise en ligne.",
  },
]

export default function Story() {
  const scope = useRef(null)
  const avatarRef = useRef(null)
  const avatarCanvasRef = useRef(null)
  const bgVideoRef = useRef(null)

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!reducedMotion) {
        gsap.utils.toArray('[data-story]').forEach((block, i) => {
          gsap.from(block, {
            y: 48,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power4.out',
            delay: (i % 3) * 0.08,
            scrollTrigger: {
              trigger: block,
              start: 'top 85%',
            },
          })
        })
      }

      /*
        Smart preloading: both Studio videos start at preload="metadata"
        (cheap first paint), then upgrade to a full fetch as the user scrolls
        within ~half a viewport of the section — well before the curtain
        clears, so scrubbing never waits on the network. The existing
        onloadedmetadata handlers re-sync currentTime after load().
      */
      ScrollTrigger.create({
        trigger: scope.current,
        start: 'top 130%',
        once: true,
        onEnter: () => {
          ;[bgVideoRef.current, avatarRef.current].forEach((v) => {
            if (v && v.preload !== 'auto') {
              v.preload = 'auto'
              v.load()
            }
          })
        },
      })

      /*
        ONE synchronized scrub timeline for the whole Studio scene — the
        stem continuation video AND the avatar turntable ride the same
        ScrollTrigger, so the avatar's rotation begins at the exact scroll
        position where the stem starts moving, with identical scrub lag.

        Timing — strict section isolation: range 'top top' → 'bottom top'
        means everything is frozen until the section fully owns the viewport
        (the curtain 100% cleared). During the transit, both videos hold
        their arrival frames: the stem at frame 0 (the hero's own final
        frame, keeping the weld pixel-identical) and the avatar completely
        still on his forward-facing pose. No idle drift — true stillness.

        Each video keeps its own proxy + seek coalescing (park targets while
        the decoder is mid-seek, land the freshest on 'seeked') + metadata
        re-sync. Proxy tweens make the scrub smoothing real.
      */
      const bgProxy = { p: 0 }
      const avProxy = { p: 0 }
      let bgPendingSeek = null
      let avPendingSeek = null
      // Touch devices decode-seek more slowly — a coarser epsilon halves the
      // number of seeks issued during flick-scrolling, trading imperceptible
      // frame granularity for fluidity.
      /*
        Same 24 fps frame-grid snapping as the hero (see Hero.jsx applySeek):
        on a fine pointer, seeking finer than one frame only queues decodes
        that return the frame already on screen. Coarse pointers keep their
        existing 1/15 epsilon and un-snapped target — untouched.
      */
      const COARSE = window.matchMedia('(pointer: coarse)').matches
      const FPS = 24
      const seekEps = COARSE ? 1 / 15 : 1 / (FPS * 2)
      const makeApply = (ref, proxyObj, setPending) => () => {
        const video = ref.current
        if (!video || !video.duration) return
        const raw = proxyObj.p * video.duration
        const target = COARSE
          ? raw
          : Math.min(Math.round(raw * FPS) / FPS, video.duration)
        if (video.seeking) {
          setPending(target)
        } else if (Math.abs(video.currentTime - target) > seekEps) {
          video.currentTime = target
        }
      }
      const applyBgSeek = makeApply(bgVideoRef, bgProxy, (t) => { bgPendingSeek = t })
      const applyAvSeek = makeApply(avatarRef, avProxy, (t) => { avPendingSeek = t })

      /*
        Avatar alpha keying: the turntable footage has a near-neutral light
        studio backdrop baked in. Each time the (hidden) video lands on a
        frame, it is drawn to the visible canvas and backdrop pixels — low
        channel spread (grey) and bright — get alpha 0, with a soft ramp so
        edges feather instead of aliasing. Result: a fully OPAQUE character
        silhouette on true transparency — he occludes the daisy behind him,
        while everything around his outline stays visible. No blend modes
        involved, so no stacking-context fragility.

        NOW ON THE GPU — with two hard-won lessons baked in.

        The 2D-canvas version ran a 547k-pixel JS loop bracketed by
        getImageData/putImageData per decoded frame, ~4-15ms on the main
        thread inside onseeked, mid-scroll. That was the desktop judder. The
        WebGL path runs the SAME algorithm with the same thresholds (mn>130,
        spread 16→30 ramp) as a fragment shader: one texImage2D and one draw
        call per frame, ~0.03ms, pixels never return to the CPU.

        LESSON 1 — the first WebGL version shipped with premultipliedAlpha:
        false and rendered an OPAQUE WHITE box on a real iPhone. The drawing
        buffer was verified pixel-exact by readPixels, but readPixels sees
        the buffer, not the screen: iOS Safari composited that buffer as if
        it were opaque. So the shader now outputs PREMULTIPLIED alpha
        (rgb*a, a) on a default-attributes context — the composite path
        every browser exercises constantly — which is mathematically the
        same blend as putImageData's un-premultiplied data
        (src*a + dst*(1-a) either way).

        LESSON 2 — never promise a fallback you cannot deliver. A canvas is
        permanently bound to its first getContext type, so "try webgl on the
        visible canvas, fall back to 2d" was a lie: after a webgl context
        exists, getContext('2d') returns null and the fallback paints
        nothing. The pipeline is therefore PROVEN on a throwaway canvas
        first — real shader, real video frame, readPixels on a backdrop
        corner that must come back keyed — and only a fully validated
        pipeline is allowed to claim the visible canvas.

        And the belt over those braces: coarse-pointer devices (every phone)
        never enter the GL path at all. They run keyAvatar2D — the exact
        code that was proven on the user's own iPhone for weeks. Its cost
        was never the phone's bottleneck (the trackpad's seek rate was); the
        judder this rewrite fixes is a fine-pointer problem, so the GL path
        is a fine-pointer path.
      */
      const AVATAR_FRAG = `
        precision mediump float;
        varying vec2 v_uv;
        uniform sampler2D u_tex;
        void main() {
          vec4 c = texture2D(u_tex, v_uv);
          float mx = max(c.r, max(c.g, c.b)) * 255.0;
          float mn = min(c.r, min(c.g, c.b)) * 255.0;
          float spread = mx - mn;
          float a = 1.0;
          if (mn > 130.0) {
            if (spread < 16.0) a = 0.0;
            else if (spread < 30.0) a = (spread - 16.0) / 14.0;
          }
          gl_FragColor = vec4(c.rgb * a, a);
        }`
      const AVATAR_VERT = `
        attribute vec2 a_pos;
        varying vec2 v_uv;
        void main() {
          v_uv = a_pos * 0.5 + 0.5;
          gl_Position = vec4(a_pos, 0.0, 1.0);
        }`
      const FINE_POINTER = window.matchMedia(
        '(hover: hover) and (pointer: fine)',
      ).matches
      // Builds the whole pipeline on a given canvas. Returns {gl} or null.
      const buildGL = (canvas) => {
        const gl = canvas.getContext('webgl', { antialias: false })
        if (!gl) return null
        const mk = (type, src) => {
          const s = gl.createShader(type)
          gl.shaderSource(s, src)
          gl.compileShader(s)
          return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
        }
        const vs = mk(gl.VERTEX_SHADER, AVATAR_VERT)
        const fs = mk(gl.FRAGMENT_SHADER, AVATAR_FRAG)
        if (!vs || !fs) return null
        const prog = gl.createProgram()
        gl.attachShader(prog, vs)
        gl.attachShader(prog, fs)
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
        gl.useProgram(prog)
        const buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW,
        )
        const loc = gl.getAttribLocation(prog, 'a_pos')
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
        const tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        // Video frames arrive top-row-first; flip so the quad's uv origin
        // (bottom-left) shows the image upright.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        return { gl }
      }
      /*
        End-to-end proof on a throwaway canvas: upload the REAL current
        video frame, run the REAL shader, then read a corner block that is
        pure studio backdrop in every frame of the turntable. Keyed, its
        alpha must be ~0; anything bright there means some link in the
        chain (context, upload from this video element, shader, alpha
        buffer) is broken on this browser — so the visible canvas is never
        touched by GL and the 2D path keeps working.
      */
      const probeGL = (video) => {
        try {
          const c = document.createElement('canvas')
          c.width = 64
          c.height = 64
          const built = buildGL(c)
          if (!built) return false
          const { gl } = built
          gl.viewport(0, 0, 64, 64)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
          if (gl.getError() !== gl.NO_ERROR) return false
          const px = new Uint8Array(8 * 8 * 4)
          gl.readPixels(0, 0, 8, 8, gl.RGBA, gl.UNSIGNED_BYTE, px)
          let alphaSum = 0
          for (let i = 3; i < px.length; i += 4) alphaSum += px[i]
          return alphaSum / 64 < 64 // corner must be keyed out
        } catch {
          return false
        }
      }
      // Lazily initialised: null = not tried yet, false = 2D path forever.
      let glState = null
      const initAvatarGL = (canvas, video) => {
        if (!FINE_POINTER) return false
        if (!probeGL(video)) return false
        const built = buildGL(canvas)
        if (!built) return false
        // A lost context invalidates every object above — back to "not
        // tried" so the next frame re-probes on the restored context.
        canvas.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          glState = null
        })
        canvas.addEventListener('webglcontextrestored', () => {
          glState = null
          renderAvatarFrame()
        })
        return built
      }
      // The original CPU path, kept verbatim as the fallback.
      const keyAvatar2D = (video, canvas, kw, kh) => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(video, 0, 0, kw, kh)
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = frame.data
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i]
          const g = d[i + 1]
          const b = d[i + 2]
          const mx = r > g ? (r > b ? r : b) : g > b ? g : b
          const mn = r < g ? (r < b ? r : b) : g < b ? g : b
          const spread = mx - mn
          if (mn > 130) {
            if (spread < 16) d[i + 3] = 0
            else if (spread < 30) d[i + 3] = Math.round(((spread - 16) / 14) * 255)
          }
        }
        ctx.putImageData(frame, 0, 0)
      }
      const renderAvatarFrame = () => {
        const video = avatarRef.current
        const canvas = avatarCanvasRef.current
        if (!video || !canvas || video.readyState < 2 || !video.videoWidth) return
        // The canvas displays at ~224-320px wide; keying the native frame at
        // more than 640px costs upload/fill for pixels no one ever sees.
        const kw = Math.min(video.videoWidth, 640)
        const kh = Math.round((video.videoHeight / video.videoWidth) * kw)
        if (canvas.width !== kw || canvas.height !== kh) {
          canvas.width = kw
          canvas.height = kh
        }
        if (glState === null) glState = initAvatarGL(canvas, video)
        if (glState) {
          const { gl } = glState
          if (gl.isContextLost()) {
            glState = null
            return
          }
          gl.viewport(0, 0, kw, kh)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        } else {
          keyAvatar2D(video, canvas, kw, kh)
        }
      }

      gsap
        .timeline({
          scrollTrigger: {
            trigger: scope.current,
            start: 'top top',
            end: 'bottom top',
            /*
              GATED, and this gate is load-bearing: unlike Hero's, THIS
              ScrollTrigger is not inside a mobile/desktop branch — it is the
              one Story runs at every width, phones included. Writing a bare
              0.1 here would silently retune real iOS, which is settled and
              must not move. Fine pointers get the responsive 0.1; coarse
              pointers keep the 0.5 they ship with today.

              (Coarse-vs-fine is Story's own existing predicate — deliberately
              NOT Hero's MOBILE_NO_PIN, which is the wider narrow||coarse||
              no-hover pin test. Two disagreeing definitions of "mobile" in
              one file is how this kind of thing rots.)
            */
            scrub: COARSE ? 0.5 : 0.1,
            invalidateOnRefresh: true,
          },
        })
        .to(bgProxy, { p: 1, ease: 'none', onUpdate: applyBgSeek }, 0)
        .to(avProxy, { p: 1, ease: 'none', onUpdate: applyAvSeek }, 0)

      // Property assignments (not addEventListener) stay idempotent across
      // StrictMode re-runs.
      /*
        iOS: a never-played <video> paints nothing once you seek it (see
        primeVideo in Hero.jsx). Both Studio videos are scrub-driven, so both
        must be primed — at load and on the first user gesture.
      */
      const primeAll = () => {
        primeVideo(bgVideoRef.current)
        primeVideo(avatarRef.current)
        applyBgSeek()
        applyAvSeek()
        renderAvatarFrame()
      }
      primeVideo(bgVideoRef.current)
      primeVideo(avatarRef.current)
      window.addEventListener('touchstart', primeAll, { once: true, passive: true })
      window.addEventListener('pointerdown', primeAll, { once: true, passive: true })

      if (bgVideoRef.current) {
        bgVideoRef.current.onloadedmetadata = applyBgSeek
        bgVideoRef.current.onloadeddata = () => primeVideo(bgVideoRef.current)
        if (bgVideoRef.current.readyState >= 1) applyBgSeek()
        bgVideoRef.current.onseeked = (e) => {
          if (bgPendingSeek !== null) {
            const t = bgPendingSeek
            bgPendingSeek = null
            e.target.currentTime = t
          }
        }
      }
      if (avatarRef.current) {
        avatarRef.current.onloadedmetadata = applyAvSeek
        avatarRef.current.onloadeddata = (e) => {
          primeVideo(e.target)
          renderAvatarFrame()
        }
        if (avatarRef.current.readyState >= 1) applyAvSeek()
        if (avatarRef.current.readyState >= 2) renderAvatarFrame()
        avatarRef.current.onseeked = (e) => {
          renderAvatarFrame()
          if (avPendingSeek !== null) {
            const t = avPendingSeek
            avPendingSeek = null
            e.target.currentTime = t
          }
        }
      }

      /*
        This file had NO cleanup at all, so the two primeAll listeners were
        never removed — the same leak as Hero's primeOnGesture, and worse here
        because primeAll closes over BOTH proxies: a stale copy snaps the stem
        AND the avatar to frame 0 and forces a full alpha-key pass over the
        avatar's 640x856 canvas. useGSAP honours a returned function (gsap
        Context.add pushes it onto the revert list), so this does run.
      */
      return () => {
        window.removeEventListener('touchstart', primeAll)
        window.removeEventListener('pointerdown', primeAll)
      }
    },
    { scope },
  )

  return (
    /*
      Background picks up the hero video's closing tone: the new cut ends on
      warm golden-cream light (avg #ddc093, ≈ #e2caa4 on screen under the
      hero's cream/20 wash), so the section starts there and settles into the
      site cream by two-thirds down — a seamless handoff from the pin release.
      (The avatar's multiply blend stays seamless on any light backdrop.)
    */
    <section
      id="studio"
      ref={scope}
      className="relative overflow-hidden bg-linear-to-b from-[#e2caa4] via-[#eddfc2] via-30% to-cream to-65% px-6 py-28 md:px-10 md:py-40"
    >
      {/*
        Background continuation video: the same daisy scene the hero ends on,
        now in full golden light with a drifting petal (first frame #d9c09d ≈
        the hero cut's closing #ddc093), looping quietly behind the content.
        The gradient on the section itself remains as the paint-under while
        the video loads. Overlays: a cream wash for text legibility, a
        bottom fade into cream to hand off to Projets, and the hero's grain
        for texture continuity. The content grid after this layer paints
        above it by DOM order — deliberately NO z-index on the grid, which
        would trap the avatar's mix-blend-multiply.
      */}
      {/*
        Welded background: clip-path on this container clips its FIXED child
        to the section, and the fixed child renders the continuation video
        full-viewport with the hero's exact cover math + cream/20 wash — so
        at the seam, hero and story paint the same frame aligned to the same
        viewport and the boundary vanishes. Scrolling scrubs the camera tilt.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        data-zone="story-bg-weld"
        style={{ clipPath: 'inset(0)' }}
      >
        <div className="fixed inset-0">
          {/* Mobile backdrop + video framing: EXACT copies of the hero's
              fixed-layer classes — identical geometry on both sides of the
              curtain is what keeps the weld pixel-registered on phones. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-b from-[#d0ccc0] via-[#d5d0c2] to-[#cfc9ba] lg:hidden"
          />
          <video
            ref={bgVideoRef}
            src="/videos/background-stem-pan.mp4"
            poster="/videos/poster-story.jpg"
            muted
            playsInline
            preload="metadata"
            className="absolute bottom-0 left-[-20vw] w-[185vw] max-w-none [mask-image:linear-gradient(to_top,black_72%,transparent_100%)] md:left-[-8vw] md:w-[160vw] lg:static lg:h-full lg:w-full lg:object-cover lg:object-center lg:[mask-image:none]"
          />
          <div className="absolute inset-0 bg-cream/20" />
          {/*
            WHY THESE TWO LAYERS LIVE INSIDE THE FIXED CHILD — this is the
            "one single canvas" fix.

            The seam is a horizontal line that travels up the screen: above it
            the hero's fixed plate paints, below it this one. The two videos
            were already welded pixel-for-pixel, but the GRADING on either
            side was not the same, and that is what betrayed the cut:

              • the gold glow and the grain used to sit OUTSIDE this fixed
                child, on section-relative divs. Section-relative means they
                scroll with the section, so a grain texture was sliding
                upward across a video nailed to the viewport. Sliding grain
                against static grain is the single most visible "two blocks
                overlapping" cue there is.
              • the glow was also anchored differently (at 12% 0% of the
                SECTION, versus 78% 8% of the VIEWPORT on the hero side), so
                the two halves of the same image were lit differently.

            Moved in here they are viewport-anchored and byte-identical to the
            hero's, so the grain tiles line up across the seam and the light
            is continuous. Keep this stack an exact mirror of the hero's.
          */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(90% 70% at 78% 8%, rgba(217, 151, 30, 0.12), transparent 55%), radial-gradient(70% 60% at 12% 92%, rgba(217, 151, 30, 0.08), transparent 60%)',
            }}
          />
          <div className="grain absolute inset-0" />
        </div>
        {/*
          The only layers that remain section-relative are these two cream
          washes, and they are safe precisely because both start at
          `from-transparent` at the section's top edge: their contribution AT
          the seam is exactly zero, so they cannot draw a step there. They
          earn their keep further down — legibility behind the body copy, and
          the fade that hands off to Projets.
        */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-cream/15 via-20% to-cream/15" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent from-55% to-cream" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-16 gap-y-16 md:grid-cols-12">
        {/* Left — the 3D avatar in the strict foreground (z-10, safe now:
            no blend modes in play), alpha-keyed onto true transparency: the
            hidden <video> feeds renderAvatarFrame, and the canvas shows a
            fully opaque character silhouette that occludes the daisy behind
            him while his surroundings stay transparent. No card, no fill,
            no border. */}
        <div className="relative z-10 md:col-span-4">
          {/* Phones: perfectly centered (the figure's own mx-auto inside the
              symmetric px-6 gutters does it — no offset classes). He briefly
              travelled -20.6vw to stand on the daisy's shifted disc, but the
              centred composition won out over that alignment.
              md:mt-24 is the tablet/desktop position, untouched. */}
          <div className="md:mt-24">
            <figure
              data-media
              className="mx-auto aspect-[3/4] w-56 border-0 bg-transparent md:w-full md:max-w-xs"
            >
              <video
                ref={avatarRef}
                src={AVATAR_VIDEO}
                muted
                playsInline
                preload="metadata"
                className="hidden"
              />
              <canvas
                ref={avatarCanvasRef}
                className="h-full w-full object-cover"
              />
            </figure>
            <p
              data-story
              className="mt-6 flex items-center justify-center gap-3 text-xs tracking-widest text-ink/60"
            >
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              Lorenzo <span className="text-accent">—</span> REMY
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
            </p>
          </div>
        </div>

        {/* Right — story & vision */}
        <div className="md:col-span-7 md:col-start-6">
          <p
            data-story
            className="flex items-center gap-3 text-xs uppercase tracking-widest text-ink/60"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            L'approche
          </p>

          <h2
            data-story
            className="font-display mt-6 text-[clamp(1.875rem,9vw,2.75rem)] font-medium leading-tight tracking-hero md:text-5xl lg:text-6xl"
          >
            L'art d'aller à{' '}
            <span className="underline decoration-accent decoration-2 underline-offset-8">
              l'essentiel
            </span>
            .
          </h2>

          <div className="mt-10 max-w-xl space-y-6 text-base leading-relaxed text-ink/80 md:text-lg">
            <p data-story>
              Sur Internet, le trop-plein d'informations tue le message.
              L'attention des utilisateurs est devenue rare. La
              «&nbsp;Césure&nbsp;», c'est ce temps d'arrêt, cette respiration
              visuelle qui permet à votre marque de se démarquer et d'être
              comprise instantanément.
            </p>
            <p data-story>
              Le Studio Césure, dirigé par Lorenzo Remy, est né d'une
              conviction simple&nbsp;: un design performant ne consiste pas à
              surcharger l'écran, mais à faire des choix justes. Nous
              concevons des sites web et des expériences interactives avec une
              approche directe et sans détours. Pas de bla-bla ni de concepts
              abstraits&nbsp;: nous mettons notre maîtrise technique (3D,
              motion design, développement front-end) au service de vos
              objectifs.
            </p>
            <p data-story>
              Notre promesse est concrète&nbsp;: livrer des interfaces
              élégantes, des animations fluides et un code robuste, le tout
              avec une vraie rigueur sur le respect des délais.
            </p>
          </div>

          {/* Full-sentence expertise entries: title row, then the pitch in
              sentence case underneath — the old uppercase keyword column
              could not carry three-line descriptions. */}
          <p
            data-story
            className="mt-16 flex items-center gap-3 text-xs uppercase tracking-widest text-ink/60"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            L'expertise
          </p>
          <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
            {PILLARS.map((pillar, i) => (
              <li key={pillar.label} data-story className="group py-6">
                <h3 className="font-display text-xl font-medium tracking-tight transition-[color,transform] duration-300 ease-out group-hover:text-accent md:text-2xl md:group-hover:translate-x-1.5">
                  <span className="mr-3 align-middle text-xs text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {pillar.label}
                </h3>
                <p className="mt-3 max-w-xl pl-0 text-sm leading-relaxed text-ink/70 md:pl-8 md:text-base">
                  {pillar.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
