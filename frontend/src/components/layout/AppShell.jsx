import AppHeader from "./AppHeader";

export default function AppShell({
  children,
  footer,
}) {
  return (
    <main
      className="
        flex
        min-h-0
        justify-center
        overflow-hidden
        bg-[#e6e6e6]
        px-3
        py-3

        sm:px-4
        sm:py-4

        lg:px-6
        lg:py-2

        xl:px-8
      "
    >
      <section
        className="
          flex
          h-[calc(100vh-16px)]
          w-full
          flex-col
          overflow-hidden
          rounded-[12px]
          border-2
          border-[#f3a3a3]
          bg-white
          shadow-md

          max-w-[390px]
          sm:max-w-[640px]
          md:max-w-[900px]
          lg:max-w-[1180px]
          xl:max-w-[1280px]
          2xl:max-w-[1400px]

          lg:border-0
          lg:shadow-none
        "
      >
        <AppHeader />

        {/* CONTENIDO DE CADA PAGE */}
        {children}

        {/* FOOTER CONFIGURABLE */}
        {footer}
      </section>
    </main>
  );
}