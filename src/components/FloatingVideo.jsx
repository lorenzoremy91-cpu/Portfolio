/*
  Seamless video element for footage with a light studio background baked in —
  a plain <video> would read as a box. mix-blend-multiply + a brightness lift
  pushes the gray backdrop to near-white (which multiplies away against light
  surfaces), and a feathered mask dissolves the remaining edges.

  IMPORTANT: no ancestor between this element and the surface it must blend
  into may create a stacking context (z-index, transform, filter, isolation…),
  or the multiply gets trapped and the box reappears.
*/
export default function FloatingVideo({
  src,
  maskClass,
  className,
  videoClassName = 'brightness-110',
  videoRef,
  autoPlay = true,
  loop = true,
}) {
  return (
    <figure data-media className={`overflow-hidden border-0 bg-transparent ${className}`}>
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted
        loop={loop}
        playsInline
        preload="auto"
        className={`h-full w-full object-cover mix-blend-multiply ${maskClass} ${videoClassName}`}
      />
    </figure>
  )
}
