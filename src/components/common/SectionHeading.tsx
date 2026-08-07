type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  titleClassName?: string
  descriptionClassName?: string
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  titleClassName = '',
  descriptionClassName = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'mx-auto text-center' : ''

  return (
    <div className={`${alignClass} max-w-3xl`}>
      <p className="text-sm font-semibold tracking-[0.2em] uppercase text-rose-500">
        {eyebrow}
      </p>

      <h2
        className={`mt-3 text-4xl font-black text-slate-950 ${titleClassName}`}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={`mt-4 text-base leading-7 text-slate-600 ${descriptionClassName}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default SectionHeading