export default function Form(){
  return (
    <section className="w-full bg-light_green py-12 sm:py-16 md:py-20 px-4 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <p className="text-gray-500 text-center text-xs font-semibold uppercase tracking-widest mb-2">
          Get a free quote
        </p>
        <h2 className="font-semibold text-xl sm:text-2xl md:text-4xl text-center mb-8 md:mb-10 xl:mb-16 text-[#232826] leading-tight">
          Book your any kind of<br className="hidden sm:block" />
          <span className="sm:hidden">cleaning schedule</span>
          <span className="hidden sm:inline">cleaning schedule</span>
        </h2>
        
        {/* RESPONSIVE CONTAINER */}
        <div className="max-w-6xl mx-auto">
          
          {/* MOBILE ONLY: Stacked Layout */}
          <div className="block sm:hidden space-y-6">
            {/* Video Section - Mobile */}
            <div className="w-full flex justify-center">
              <div className="w-full max-w-sm overflow-hidden rounded-xl shadow-sm bg-white">
                <video
                  className="object-cover w-full h-48 rounded-xl"
                  autoPlay
                  muted
                  loop
                  controls
                  poster="https://images.pexels.com/photos/4239095/pexels-photo-4239095.jpeg?auto=compress&w=800&q=60"
                >
                  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Form Section - Mobile */}
            <div className="w-full flex justify-center">
              <form className="w-full max-w-sm bg-white rounded-2xl shadow-md px-4 py-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-800 text-sm">Full name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-800 text-sm">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@framer.com"
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-800 text-sm">Select Date</label>
                    <input
                      type="date"
                      required
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-800 text-sm">City</label>
                    <div className="relative">
                      <select
                        required
                        className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 w-full appearance-none text-sm"
                        defaultValue=""
                      >
                        <option value="" disabled>Select city</option>
                        <option value="New York">New York</option>
                        <option value="Los Angeles">Los Angeles</option>
                        <option value="San Francisco">San Francisco</option>
                        <option value="Other">Other</option>
                      </select>
                      <svg className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
                          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 font-medium text-gray-800 block text-sm">Message</label>
                  <textarea
                    required
                    placeholder="E.g. Text here"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center bg-yellow text-primary rounded-full font-semibold text-sm px-6 py-3 transition-colors hover:bg-[#FFE042] shadow"
                >
                  <span className="mr-2">Get A Quote</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* TABLET (Regular iPad): Enhanced Stacked Layout */}
          <div className="hidden sm:block lg:hidden space-y-8 md:space-y-10">
            {/* Video Section - Regular Tablet */}
            <div className="w-full flex justify-center">
              <div className="w-full max-w-3xl md:max-w-4xl overflow-hidden rounded-xl shadow-sm bg-white">
                <video
                  className="object-cover w-full h-64 md:h-80 rounded-xl"
                  autoPlay
                  muted
                  loop
                  controls
                  poster="https://images.pexels.com/photos/4239095/pexels-photo-4239095.jpeg?auto=compress&w=800&q=60"
                >
                  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Form Section - Regular Tablet */}
            <div className="w-full flex justify-center">
              <form className="w-full max-w-3xl md:max-w-4xl bg-white rounded-2xl shadow-md px-6 md:px-8 py-8 md:py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                  <div className="flex flex-col">
                    <label className="mb-2 md:mb-3 font-medium text-gray-800 text-sm md:text-base">Full name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      className="px-4 md:px-5 py-3 md:py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 md:mb-3 font-medium text-gray-800 text-sm md:text-base">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@framer.com"
                      className="px-4 md:px-5 py-3 md:py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 md:mb-3 font-medium text-gray-800 text-sm md:text-base">Select Date</label>
                    <input
                      type="date"
                      required
                      className="px-4 md:px-5 py-3 md:py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 md:mb-3 font-medium text-gray-800 text-sm md:text-base">City</label>
                    <div className="relative">
                      <select
                        required
                        className="px-4 md:px-5 py-3 md:py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 w-full appearance-none text-sm md:text-base"
                        defaultValue=""
                      >
                        <option value="" disabled>Select city</option>
                        <option value="New York">New York</option>
                        <option value="Los Angeles">Los Angeles</option>
                        <option value="San Francisco">San Francisco</option>
                        <option value="Other">Other</option>
                      </select>
                      <svg className="w-4 h-4 md:w-5 md:h-5 absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
                          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mb-6 md:mb-8">
                  <label className="mb-2 md:mb-3 font-medium text-gray-800 block text-sm md:text-base">Message</label>
                  <textarea
                    required
                    placeholder="E.g. Text here"
                    className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] md:min-h-[120px] resize-none text-sm md:text-base"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-yellow text-primary rounded-full font-semibold text-sm md:text-base px-8 md:px-10 py-3 md:py-4 transition-colors hover:bg-[#FFE042] shadow"
                >
                  <span className="mr-2">Get A Quote</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* LARGE TABLETS/IPAD PRO: Optimized Stacked Layout */}
          <div className="hidden lg:block xl:hidden space-y-12">
            {/* Video Section - iPad Pro */}
            <div className="w-full flex justify-center">
              <div className="w-full max-w-5xl overflow-hidden rounded-xl shadow-sm bg-white">
                <video
                  className="object-cover w-full h-96 rounded-xl"
                  autoPlay
                  muted
                  loop
                  controls
                  poster="https://images.pexels.com/photos/4239095/pexels-photo-4239095.jpeg?auto=compress&w=800&q=60"
                >
                  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Form Section - iPad Pro (3 Columns) */}
            <div className="w-full flex justify-center">
              <form className="w-full max-w-5xl bg-white rounded-2xl shadow-md px-12 py-12">
                
                {/* First Row - 3 Columns */}
                <div className="grid grid-cols-3 gap-8 mb-8">
                  <div className="flex flex-col">
                    <label className="mb-3 font-medium text-gray-800 text-base">Full name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      className="px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-3 font-medium text-gray-800 text-base">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@framer.com"
                      className="px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-3 font-medium text-gray-800 text-base">Select Date</label>
                    <input
                      type="date"
                      required
                      className="px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    />
                  </div>
                </div>

                {/* Second Row - City */}
                <div className="grid grid-cols-3 gap-8 mb-8">
                  <div className="flex flex-col">
                    <label className="mb-3 font-medium text-gray-800 text-base">City</label>
                    <div className="relative">
                      <select
                        required
                        className="px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 w-full appearance-none text-base"
                        defaultValue=""
                      >
                        <option value="" disabled>Select city</option>
                        <option value="New York">New York</option>
                        <option value="Los Angeles">Los Angeles</option>
                        <option value="San Francisco">San Francisco</option>
                        <option value="Other">Other</option>
                      </select>
                      <svg className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
                          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="col-span-2"></div> {/* Empty space */}
                </div>

                {/* Message Field - Full Width */}
                <div className="mb-8">
                  <label className="mb-3 font-medium text-gray-800 block text-base">Message</label>
                  <textarea
                    required
                    placeholder="E.g. Text here"
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px] resize-none text-base"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-yellow text-primary rounded-full font-semibold text-lg px-12 py-4 transition-colors hover:bg-[#FFE042] shadow"
                >
                  <span className="mr-2">Get A Quote</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* DESKTOP: Side by Side Layout */}
          <div className="hidden xl:grid xl:grid-cols-2 gap-8 items-center" style={{ minHeight: '70vh' }}>
            {/* LEFT: Video */}
            <div className="w-full h-full flex items-center max-w-xl mx-auto">
              <div className="w-full h-full overflow-hidden rounded-xl shadow-sm bg-white flex items-center justify-center min-h-[320px]">
                <video
                  className="object-cover w-full h-full rounded-xl"
                  autoPlay
                  muted
                  loop
                  controls
                  poster="https://images.pexels.com/photos/4239095/pexels-photo-4239095.jpeg?auto=compress&w=800&q=60"
                >
                  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* RIGHT: FORM */}
            <div className="w-full flex justify-center items-center">
              <form className="w-full max-w-lg bg-white rounded-2xl shadow-md px-6 py-12 space-y-8 flex flex-col min-h-[440px]">
                <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                  <div className="flex flex-col flex-1">
                    <label className="mb-2 font-medium text-gray-800">Full name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      className="px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="mb-2 font-medium text-gray-800">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@framer.com"
                      className="px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                  <div className="flex flex-col flex-1">
                    <label className="mb-2 font-medium text-gray-800">Select Date</label>
                    <input
                      type="date"
                      required
                      placeholder="dd/mm/yyyy"
                      className="px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="mb-2 font-medium text-gray-800">City</label>
                    <div className="relative">
                      <select
                        required
                        className="px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 w-full appearance-none"
                        defaultValue=""
                      >
                        <option value="" disabled>Select city</option>
                        <option value="New York">New York</option>
                        <option value="Los Angeles">Los Angeles</option>
                        <option value="San Francisco">San Francisco</option>
                        <option value="Other">Other</option>
                      </select>
                      <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
                          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-2 font-medium text-gray-800 block">Message</label>
                  <textarea
                    required
                    placeholder="E.g. Text here"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 inline-flex items-center bg-yellow text-primary rounded-full font-semibold text-base px-8 py-4 transition-colors hover:bg-[#FFE042] shadow self-start"
                >
                  <span className="mr-2">Get A Quote</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
