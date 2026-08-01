const boundaries = [
  {
    label: "Public product",
    value: "No admin route or navigation",
  },
  {
    label: "Authorization",
    value: "Backend ADMIN permissions remain required",
  },
  {
    label: "Production access",
    value: "MFA or SSO and restricted hosting required",
  },
];

export default function App() {
  return (
    <main className="operations-shell">
      <section className="operations-card" aria-labelledby="operations-title">
        <div className="brand-mark" aria-hidden="true">
          P
        </div>
        <p className="eyebrow">Private workspace</p>
        <h1 id="operations-title">Pumdoki Operations</h1>
        <p className="lede">
          The independent operations application boundary is ready. Operational
          workflows remain disabled until Phase 11 security and audit controls
          are implemented.
        </p>

        <dl className="boundary-list">
          {boundaries.map((item) => (
            <div className="boundary-row" key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <p className="notice" role="status">
          Do not deploy this shell to a public origin.
        </p>
      </section>
    </main>
  );
}
