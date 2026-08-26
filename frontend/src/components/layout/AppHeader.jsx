export default function AppHeader() {
  return (
    <header
      className="
        shrink-0
        border-b-4
        border-white
        bg-[#b8b8b8]
      "
    >
      <div
        className="
          grid
          grid-cols-[1fr_1px_1fr]
          items-center
          px-4
          py-3

          lg:px-8
          xl:px-10
        "
      >
        {/* LOGO */}
        <div className="text-center">
          <h1
            className="
              font-extrabold
              leading-none
              text-black

              text-[20px]
              md:text-[30px]
              lg:text-[32px]
              xl:text-[40px]
            "
          >
            LINGUAI
          </h1>

          <p
            className="
              font-extrabold
              leading-none
              text-red-600

              text-[18px]
              md:text-[20px]
              lg:text-[20px]
              xl:text-[30px]
            "
          >
            UV
          </p>
        </div>

        {/* SEPARADOR */}
        <div className="h-full bg-white" />

        {/* SUBTÍTULO */}
        <p
          className="
            text-center
            font-bold
            leading-tight
            text-black

            text-[15px]
            md:text-[20px]
            lg:text-[20px]
            xl:text-[30px]
          "
        >
          Univalle&apos;s AI tutor for
          learning English
        </p>
      </div>
    </header>
  );
}