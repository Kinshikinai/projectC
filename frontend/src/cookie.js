function getAccessToken() {
  return document.cookie.split(';')[0].split('=')[1];
}

export { getAccessToken };