export default function TopSection({
  title,
  subtitle,
  children,
  height = 'h-[500px]' // default to 500px height
}) {
  return (
    <section
      className={`
        relative
        bg-green
        ${height}
        flex flex-col
        items-center
        justify-center
        px-6
        text-center
        overflow-hidden
      `}
    >
      {/* Background decorative image */}
      <img
        src="https://framerusercontent.com/images/Ezao0OeUHLZxc3chdzOYuWgjXwQ.png"
        alt="Decorative"
        className="
          hidden
          md:block
          absolute
          right-0
          top-0
          h-full
          w-auto
          scale-150
          translate-x-[-25%]
          pointer-events-none
          select-none
          opacity-80
        "
        style={{ zIndex: 1 }}
      />
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {subtitle && (
          <p className="text-sm tracking-widest text-yellow uppercase mb-4">
            {subtitle}
          </p>
        )}
        {title && (
          <h1 className="text-white mb-3 text-[2.8rem] md:text-[3rem] leading-snug tracking-tight">
            {title}
          </h1>
        )}
        {children}
      </div>
    </section>
  );
}
