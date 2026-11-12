export function BrandIcon({ size = 37 }) {
  return (
    <img
      className="brand-mark"
      src={`${import.meta.env.BASE_URL}favicon.svg`}
      width={size}
      height={size}
      alt=""
    />
  )
}
