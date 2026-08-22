// Yassena Campo — nó transmissor (sensor de campo)
// Placa: Heltec WiFi LoRa 32 V3 (ESP32-S3 + rádio SX1262)
//
// O QUE ESSE CÓDIGO FAZ
// Lê um valor (por enquanto, um valor de teste simulado — troque pela
// leitura real do seu sensor quando definir qual vai usar) e envia por
// LoRa pro nó receptor/gateway a cada 30 segundos.
//
// COMO INSTALAR
// 1. Arduino IDE → Preferências → "URLs adicionais de gerenciadores de
//    placas" → adicione: https://espressif.github.io/arduino-esp32/package_esp32_index.json
// 2. Ferramentas → Placa → Gerenciador de Placas → instale "esp32" (Espressif Systems)
// 3. Selecione a placa "Heltec WiFi LoRa 32(V3)"
// 4. Sketch → Incluir biblioteca → Gerenciar bibliotecas → instale "RadioLib" (por jgromes)
// 5. Ajuste NODE_ID e LORA_FREQUENCY abaixo, depois faça upload
//
// IMPORTANTE: cada transmissor que você instalar precisa de um NODE_ID
// diferente, e o receptor precisa saber qual device_id/api_key do app
// corresponde a cada NODE_ID (isso é configurado no código do receptor).

#include <RadioLib.h>

// Pinos do rádio LoRa no Heltec WiFi LoRa 32 V3
#define LORA_NSS   8
#define LORA_DIO1  14
#define LORA_RST   12
#define LORA_BUSY  13

// 915.0 = Brasil/EUA (ISM 915MHz) · use 868.0 na Europa · confira a
// legislação de RF da sua região antes de operar
#define LORA_FREQUENCY 915.0

// Identificador único deste nó — troque para cada transmissor instalado
#define NODE_ID 1

// Intervalo entre envios (ms) — mais frequente gasta mais bateria
#define SEND_INTERVAL_MS 30000

SX1262 radio = new Module(LORA_NSS, LORA_DIO1, LORA_RST, LORA_BUSY);

struct __attribute__((packed)) SensorPacket {
  uint32_t nodeId;
  float value;
};

void setup() {
  Serial.begin(115200);
  delay(1000);

  int state = radio.begin(LORA_FREQUENCY);
  if (state != RADIOLIB_ERR_NONE) {
    Serial.printf("Falha ao iniciar o rádio LoRa: %d\n", state);
    while (true) delay(1000);
  }

  radio.setOutputPower(17);
  radio.setSpreadingFactor(9);
  radio.setBandwidth(125.0);
  radio.setCodingRate(7);
  radio.setSyncWord(0x12); // precisa ser IGUAL no transmissor e no receptor

  Serial.printf("Transmissor pronto — nó %d\n", NODE_ID);
}

float lerSensor() {
  // TODO: troque isto pela leitura real do seu sensor, por exemplo:
  //   return analogRead(4) * (100.0 / 4095.0); // umidade do solo em %
  return random(200, 800) / 10.0; // valor de teste, só pra validar a comunicação
}

void loop() {
  SensorPacket packet;
  packet.nodeId = NODE_ID;
  packet.value = lerSensor();

  int state = radio.transmit((uint8_t*)&packet, sizeof(packet));
  if (state == RADIOLIB_ERR_NONE) {
    Serial.printf("Enviado: nó %lu, valor %.1f\n", (unsigned long)packet.nodeId, packet.value);
  } else {
    Serial.printf("Falha ao enviar: %d\n", state);
  }

  delay(SEND_INTERVAL_MS);
}
