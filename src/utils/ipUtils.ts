export const obtenerIpPublica = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error obteniendo IP:', error);
    return '0.0.0.0';
  }
};