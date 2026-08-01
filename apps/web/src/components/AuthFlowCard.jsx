export default function AuthFlowCard({ title, description, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fff8fb] via-[#fdf0f7] to-[#fce8f3] px-4 py-10 text-[#5b4153]">
      <section className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-7 shadow-xl">
        <div className="mb-6">
          <p className="text-sm font-bold tracking-wide text-[#df5f97]">
            Pumdoki
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#241a22]">{title}</h1>
          {description && (
            <p className="mt-2 text-sm leading-6 text-[#8c6d7f]">
              {description}
            </p>
          )}
        </div>
        {children}
      </section>
    </main>
  );
}
