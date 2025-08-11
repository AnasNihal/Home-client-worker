// src/components/AboutSection.jsx

function ListItem({ bg, text, textColor }) {
  return (
    <li className="flex items-center gap-4">
      <span
        className="rounded-full w-9 h-9 flex items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className={`text-[18px] font-semibold ${textColor}`}>{text}</span>
    </li>
  );
}

export default function AboutSection() {
  return (
    <section className="w-full pb-20 bg-light_green px-8 py-20">
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-y-12 lg:gap-x-32 place-items-center py-20">
        {/* LEFT COLUMN: Overlapping Images */}
        <div className="relative w-[500px] h-[550px] flex-shrink-0">
          {/* First image */}
          <img
            src="https://images.pexels.com/photos/4239148/pexels-photo-4239148.jpeg?auto=compress&w=800&q=80"
            alt=""
            className="rounded-xl shadow-xl w-[380px] h-[450px] object-cover absolute top-0 left-0 z-10"
          />
          {/* Second image */}
          <img
            src="https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&w=800&q=80"
            alt=""
            className="rounded-xl shadow-lg w-[380px] h-[450px] object-cover absolute bottom-[-40px] right-[-60px] z-20"
          />
        </div>

        {/* RIGHT COLUMN: Content */}
        <div className="w-full flex flex-col justify-center">
          <p className="text-[15px] font-semibold tracking-wide text-primary uppercase mb-4">
            About company
          </p>
          <h2 className="text-5xl font-bold text-primary mb-7 leading-tight">
            To make clean, healthy<br />spaces accessible
          </h2>
          <p className="text-gray-600 text-lg mb-10">
            We're a team of passionate, vetted cleaning professionals dedicated
            to delivering spotless, fresh spaces with a personal touch. Whether
            it's a cozy apartment or a bustling office.
          </p>
          <ul className="space-y-6 mb-10">
            <ListItem
              bg="#FFEC43"
              text="Trained & background-checked staff"
              textColor="text-primary"
            />
            <ListItem
              bg="#1E5F4B"
              text="Customized cleaning plans"
              textColor="text-primary"
            />
            <ListItem
              bg="#AED656"
              text="Punctual and reliable service"
              textColor="text-primary"
            />
          </ul>
          <a
            href="https://olton.framer.website/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-white rounded-full font-medium text-sm hover:text-yellow bg-green transition-colors"
            style={{ padding: "6px 14px", width: "fit-content" }}
          >
            <svg
              className="w-4 h-4 -ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            About US
          </a>
        </div>
      </div>
    </section>
  );
}
