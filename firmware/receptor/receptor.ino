// Yassena Campo — nó receptor (gateway)
// Placa: Heltec WiFi LoRa 32 V3 (ESP32-S3 + rádio SX1262)
//
// O QUE ESSE CÓDIGO FAZ
// Fica escutando pacotes LoRa vindos dos transmissores de campo; ao
// receber um, procura a qual dispositivo do app aquele nó corresponde
// e envia a leitura pra nuvem via Wi-Fi (endpoint "swift-api" no
// Supabase) — dali o app atualiza sozinho, em tempo real.
//
// COMO INSTALAR
// Mesmos passos do transmissor (veja firmware/transmissor/transmissor.ino):
// placa "Heltec WiFi LoRa 32(V3)" + biblioteca "RadioLib".
//
// ANTES DE FAZER UPLOAD, PREENCHA:
// 1. WIFI_SSID / WIFI_PASSWORD — rede Wi-Fi com internet, perto de onde
//    o gateway vai ficar instalado.
// 2. INGEST_URL — já vem preenchido com o endereço da função publicada
//    no Supabase; confira se bate com o que aparece no app.
// 3. A lista `devices[]` — pra cada sensor cadastrado no app, copie o
//    device_id e a api_key da tela "Ajustes → toque no dispositivo →
//    Integração RF" e associe ao NODE_ID configurado no transmissor
//    correspondente.

#include <RadioLib.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Pinos do rádio LoRa no Heltec WiFi LoRa 32 V3
#define LORA_NSS   8
#define LORA_DIO1  14
#define LORA_RST   12
#define LORA_BUSY  13

// Precisa bater com o valor usado no(s) transmissor(es)
#define LORA_FREQUENCY 915.0

const char* WIFI_SSID = "SUA_REDE_WIFI";
const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";
const char* INGEST_URL = "https://zhosevuqogmhirlsvyhe.supabase.co/functions/v1/swift-api";

struct DeviceCredential {
  uint32_t nodeId;      // precisa bater com o NODE_ID configurado no transmissor
  const char* deviceId; // copiado da tela "Integração RF" do dispositivo no app
  const char* apiKey;   // idem
};

DeviceCredential devices[] = {
  { 1, "COLE_AQUI_O_DEVICE_ID_DO_SENSOR_1", "COLE_AQUI_A_API_KEY_DO_SENSOR_1" },
  // { 2, "device_id do sensor 2", "api_key do sensor 2" },
};

SX1262 radio = new Module(LORA_NSS, LORA_DIO1, LORA_RST, LORA_BUSY);

struct __attribute__((packed)) SensorPacket {
  uint32_t nodeId;
  float value;
};

volatile bool packetReceived = false;

void setFlag() {
  packetReceived = true;
}

void conectarWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" conectado!");
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  conectarWifi();

  int state = radio.begin(LORA_FREQUENCY);
  if (state != RADIOLIB_ERR_NONE) {
    Serial.printf("Falha ao iniciar o rádio LoRa: %d\n", state);
    while (true) delay(1000);
  }
  radio.setSpreadingFactor(9);
  radio.setBandwidth(125.0);
  radio.setCodingRate(7);
  radio.setSyncWord(0x12);

  radio.setDio1Action(setFlag);
  radio.startReceive();
  Serial.println("Gateway pronto, aguardando nós...");
}

DeviceCredential* buscarDispositivo(uint32_t nodeId) {
  for (auto& d : devices) {
    if (d.nodeId == nodeId) return &d;
  }
  return nullptr;
}

void enviarParaNuvem(DeviceCredential* device, float value) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Sem Wi-Fi, leitura descartada.");
    return;
  }

  HTTPClient http;
  http.begin(INGEST_URL);
  http.addHeader("Content-Type", "application/json");

  String body = String("{\"device_id\":\"") + device->deviceId +
                "\",\"api_key\":\"" + device->apiKey +
                "\",\"value\":" + String(value, 2) +
                ",\"reading\":\"" + String(value, 1) + "\"}";

  int httpCode = http.POST(body);
  Serial.printf("Envio pra nuvem: HTTP %d\n", httpCode);
  http.end();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    conectarWifi();
  }

  if (packetReceived) {
    packetReceived = false;

    SensorPacket packet;
    int state = radio.readData((uint8_t*)&packet, sizeof(packet));

    if (state == RADIOLIB_ERR_NONE) {
      Serial.printf("Recebido: nó %lu, valor %.1f (RSSI %.1f dBm)\n",
                     (unsigned long)packet.nodeId, packet.value, radio.getRSSI());

      DeviceCredential* device = buscarDispositivo(packet.nodeId);
      if (device) {
        enviarParaNuvem(device, packet.value);
      } else {
        Serial.printf("Nó %lu não cadastrado no gateway.\n", (unsigned long)packet.nodeId);
      }
    } else {
      Serial.printf("Falha ao ler pacote recebido: %d\n", state);
    }

    radio.startReceive();
  }
}
