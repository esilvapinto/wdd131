const temperature = 8;
const windSpeed = 12;

function calcularSensacaoTermica(temp, velocidadeVento) {
  return (
    13.12 +
    0.6215 * temp -
    11.37 * velocidadeVento ** 0.16 +
    0.3965 * temp * velocidadeVento ** 0.16
  );
}

const windChillElement = document.querySelector("#wind-chill");

if (temperature <= 10 && windSpeed > 4.8) {
  const windChill = calcularSensacaoTermica(temperature, windSpeed);

  windChillElement.textContent = `${windChill.toFixed(1)} °C`;
} else {
  windChillElement.textContent = "N/A";
}

document.querySelector("#current-year").textContent = new Date().getFullYear();

document.querySelector("#last-modified").textContent =
  `Última modificação: ${document.lastModified}`;
