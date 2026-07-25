export default async (req, res) => {
  const { reqHandler } = await import('../dist/angular-SSR-vercel/server/server.mjs');
  return reqHandler(req, res);
};
