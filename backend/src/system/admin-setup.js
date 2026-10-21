const configuredLink = () => String(process.env.REGISTER_ADMIN_LINK || '').trim();

export function configuredAdminSetupToken() {
  const setupLink = configuredLink();
  if (!setupLink) return '';
  try {
    const url = new URL(setupLink, process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3005}`);
    return url.searchParams.get('setup') || url.searchParams.get('token') || setupLink;
  } catch {
    return setupLink;
  }
}

export function getAdminSetupLink() {
  const setupLink = configuredLink();
  if (!setupLink) return null;

  const frontendUrl = process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL || 'http://localhost:8080';
  try {
    const frontend = new URL(frontendUrl);
    const configuredUrl = new URL(setupLink, frontend);
    const token = configuredUrl.searchParams.get('setup')
      || configuredUrl.searchParams.get('token')
      || setupLink;
    const linkBase = configuredUrl.searchParams.has('setup') || configuredUrl.searchParams.has('token')
      ? configuredUrl
      : frontend;
    const setupUrl = new URL('/go', linkBase);
    setupUrl.searchParams.set('setup', token);
    return setupUrl.href;
  } catch {
    return null;
  }
}
