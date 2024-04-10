export const isTokenExpired = (token: string) => {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const poppedPart = parts.pop();
    if (poppedPart) {
      return poppedPart.split(";").shift();
    }
  }
};
