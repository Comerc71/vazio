// Fica escutando atualizações de posição e vai guardando a leitura mais precisa
// (menor "accuracy") até atingir uma precisão boa ou o tempo limite acabar.
// Precisão de poucos metros só é possível com GPS de hardware (celular, ao ar
// livre) — notebooks sem GPS dependem de Wi-Fi/IP e ficam na casa de dezenas
// a centenas de metros, independentemente do código.
export function watchBestPosition({ onUpdate, onError, goodAccuracy = 8, timeoutMs = 15000 }) {
  if (!navigator.geolocation) {
    onError();
    return () => {};
  }

  let best = null;
  let watchId = null;
  let timeoutId = null;

  const stop = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (timeoutId !== null) clearTimeout(timeoutId);
    watchId = null;
    timeoutId = null;
  };

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      if (!best || accuracy < best.accuracy) {
        best = { lat: latitude, lon: longitude, accuracy };
        onUpdate(best);
      }
      if (accuracy <= goodAccuracy) stop();
    },
    () => {
      onError();
      stop();
    },
    { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
  );

  timeoutId = setTimeout(stop, timeoutMs);
  return stop;
}
