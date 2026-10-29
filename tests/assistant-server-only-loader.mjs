// Unit-test harness only: Next.js resolves this marker itself in the real server build.
export function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only")
    return { url: "data:text/javascript,export{}", shortCircuit: true };
  return nextResolve(specifier, context);
}
